"""
WebSocket Manager for FX Open API
==================================
Manages WebSocket connections to FX Open API for real-time price streaming.
Handles authentication, subscription management, and automatic reconnection.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional

import websockets
from websockets.client import WebSocketClientProtocol

from config.settings import API_ID, API_KEY, API_SECRET

logger = logging.getLogger(__name__)

# WebSocket connection settings
MAX_RETRIES = 10
INITIAL_BACKOFF = 1  # seconds
MAX_BACKOFF = 300  # 5 minutes
HEARTBEAT_INTERVAL = 30  # seconds


class WebSocketManager:
    """
    Manages WebSocket connections to FX Open API.

    Features:
    - Authentication with API credentials
    - Symbol subscription management
    - Automatic reconnection with exponential backoff
    - Message parsing and tick data extraction
    - Heartbeat/ping-pong for connection monitoring
    """

    def __init__(
        self,
        ws_url: str = "wss://marginalttdemowebapi.fxopen.net/api/v2/websocket",
        on_tick: Optional[Callable[[Dict[str, Any]], None]] = None,
        on_error: Optional[Callable[[Exception], None]] = None,
    ):
        """
        Initialize WebSocket manager.

        Args:
            ws_url: WebSocket endpoint URL
            on_tick: Callback function for tick data (receives tick dict)
            on_error: Callback function for errors (receives exception)
        """
        self.ws_url = ws_url
        self.on_tick = on_tick
        self.on_error = on_error

        self.websocket: Optional[WebSocketClientProtocol] = None
        self.is_connected = False
        self.is_authenticated = False
        self.subscribed_symbols: List[str] = []

        self.retry_count = 0
        self.current_backoff = INITIAL_BACKOFF

        self._should_reconnect = True
        self._heartbeat_task: Optional[asyncio.Task] = None
        self._receive_task: Optional[asyncio.Task] = None

    async def connect(self) -> bool:
        """
        Establish WebSocket connection to FX Open API.

        Returns:
            True if connection successful, False otherwise
        """
        try:
            logger.info(f"Connecting to WebSocket: {self.ws_url}")
            self.websocket = await websockets.connect(
                self.ws_url, ping_interval=20, ping_timeout=10
            )
            self.is_connected = True
            logger.info("WebSocket connection established")

            # Start heartbeat and message receiving tasks
            self._heartbeat_task = asyncio.create_task(self._heartbeat_loop())
            self._receive_task = asyncio.create_task(self._receive_loop())

            return True

        except Exception as e:
            logger.error(f"WebSocket connection failed: {e}")
            if self.on_error:
                self.on_error(e)
            return False

    async def authenticate(self) -> bool:
        """
        Authenticate with FX Open API using credentials.

        Returns:
            True if authentication successful, False otherwise
        """
        if not self.is_connected or not self.websocket:
            logger.error("Cannot authenticate: not connected")
            return False

        try:
            auth_message = {"type": "login", "id": API_ID, "key": API_KEY, "secret": API_SECRET}

            logger.info("Sending authentication message")
            await self.websocket.send(json.dumps(auth_message))

            # Wait for authentication response
            response = await asyncio.wait_for(self.websocket.recv(), timeout=10)
            response_data = json.loads(response)

            if response_data.get("type") == "login_success":
                self.is_authenticated = True
                logger.info("WebSocket authentication successful")
                self.retry_count = 0  # Reset retry count on success
                self.current_backoff = INITIAL_BACKOFF
                return True
            else:
                logger.error(f"Authentication failed: {response_data}")
                return False

        except asyncio.TimeoutError:
            logger.error("Authentication timeout")
            return False
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            if self.on_error:
                self.on_error(e)
            return False

    async def subscribe(self, symbol: str) -> bool:
        """
        Subscribe to price updates for a symbol.

        Args:
            symbol: Trading pair symbol (e.g., "EURUSD", "GBPJPY")

        Returns:
            True if subscription successful, False otherwise
        """
        if not self.is_authenticated or not self.websocket:
            logger.error(f"Cannot subscribe to {symbol}: not authenticated")
            return False

        try:
            # Remove underscore if present (API expects 6-char symbols)
            symbol = symbol.replace("_", "")

            subscribe_message = {"type": "subscribe", "symbol": symbol}

            logger.info(f"Subscribing to {symbol}")
            await self.websocket.send(json.dumps(subscribe_message))

            if symbol not in self.subscribed_symbols:
                self.subscribed_symbols.append(symbol)

            return True

        except Exception as e:
            logger.error(f"Subscription error for {symbol}: {e}")
            if self.on_error:
                self.on_error(e)
            return False

    async def unsubscribe(self, symbol: str) -> bool:
        """
        Unsubscribe from price updates for a symbol.

        Args:
            symbol: Trading pair symbol

        Returns:
            True if unsubscription successful, False otherwise
        """
        if not self.is_authenticated or not self.websocket:
            logger.error(f"Cannot unsubscribe from {symbol}: not authenticated")
            return False

        try:
            symbol = symbol.replace("_", "")

            unsubscribe_message = {"type": "unsubscribe", "symbol": symbol}

            logger.info(f"Unsubscribing from {symbol}")
            await self.websocket.send(json.dumps(unsubscribe_message))

            if symbol in self.subscribed_symbols:
                self.subscribed_symbols.remove(symbol)

            return True

        except Exception as e:
            logger.error(f"Unsubscription error for {symbol}: {e}")
            return False

    async def disconnect(self) -> None:
        """
        Disconnect WebSocket gracefully.
        """
        logger.info("Disconnecting WebSocket")
        self._should_reconnect = False

        # Cancel background tasks
        if self._heartbeat_task:
            self._heartbeat_task.cancel()
        if self._receive_task:
            self._receive_task.cancel()

        # Close WebSocket connection
        if self.websocket:
            try:
                await self.websocket.close()
            except Exception as e:
                logger.error(f"Error closing WebSocket: {e}")

        self.is_connected = False
        self.is_authenticated = False
        self.subscribed_symbols = []
        logger.info("WebSocket disconnected")

    async def _receive_loop(self) -> None:
        """
        Continuously receive and process messages from WebSocket.
        """
        try:
            while self.is_connected and self.websocket:
                try:
                    message = await self.websocket.recv()
                    await self._process_message(message)
                except websockets.exceptions.ConnectionClosed:
                    logger.warning("WebSocket connection closed")
                    await self._handle_reconnect()
                    break
                except Exception as e:
                    logger.error(f"Error receiving message: {e}")
                    if self.on_error:
                        self.on_error(e)
        except asyncio.CancelledError:
            logger.debug("Receive loop cancelled")

    async def _process_message(self, message: str) -> None:
        """
        Parse and process incoming WebSocket message.

        Args:
            message: Raw message string from WebSocket
        """
        try:
            data = json.loads(message)
            message_type = data.get("type")

            if message_type == "tick":
                # Extract tick data
                tick = {
                    "symbol": data.get("symbol"),
                    "timestamp": data.get("timestamp", datetime.utcnow().isoformat()),
                    "bid": data.get("bid"),
                    "ask": data.get("ask"),
                    "mid": (data.get("bid", 0) + data.get("ask", 0)) / 2
                    if data.get("bid") and data.get("ask")
                    else None,
                    "volume": data.get("volume", 0),
                }

                # Call tick callback
                if self.on_tick:
                    self.on_tick(tick)

            elif message_type == "pong":
                logger.debug("Received pong")
            elif message_type == "error":
                logger.error(f"WebSocket error message: {data.get('message')}")
            else:
                logger.debug(f"Received message type: {message_type}")

        except json.JSONDecodeError:
            logger.error(f"Invalid JSON message: {message}")
        except Exception as e:
            logger.error(f"Error processing message: {e}")

    async def _heartbeat_loop(self) -> None:
        """
        Send periodic heartbeat/ping messages to keep connection alive.
        """
        try:
            while self.is_connected and self.websocket:
                try:
                    await asyncio.sleep(HEARTBEAT_INTERVAL)
                    if self.websocket:
                        ping_message = {"type": "ping"}
                        await self.websocket.send(json.dumps(ping_message))
                        logger.debug("Sent heartbeat ping")
                except Exception as e:
                    logger.error(f"Heartbeat error: {e}")
        except asyncio.CancelledError:
            logger.debug("Heartbeat loop cancelled")

    async def _handle_reconnect(self) -> None:
        """
        Handle reconnection with exponential backoff.
        """
        if not self._should_reconnect:
            return

        self.is_connected = False
        self.is_authenticated = False

        while self._should_reconnect and self.retry_count < MAX_RETRIES:
            self.retry_count += 1
            wait_time = min(self.current_backoff * (2 ** (self.retry_count - 1)), MAX_BACKOFF)

            logger.info(f"Reconnecting in {wait_time}s (attempt {self.retry_count}/{MAX_RETRIES})")
            await asyncio.sleep(wait_time)

            # Attempt reconnection
            if await self.connect():
                if await self.authenticate():
                    # Re-subscribe to previous symbols
                    for symbol in self.subscribed_symbols.copy():
                        await self.subscribe(symbol)

                    logger.info("Reconnection successful")
                    return

        logger.error(f"Max reconnection attempts ({MAX_RETRIES}) reached")

    def get_connection_state(self) -> Dict[str, Any]:
        """
        Get current connection state information.

        Returns:
            Dictionary with connection state details
        """
        return {
            "connected": self.is_connected,
            "authenticated": self.is_authenticated,
            "subscribed_symbols": self.subscribed_symbols.copy(),
            "retry_count": self.retry_count,
        }
