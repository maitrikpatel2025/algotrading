"""
Bot Status Tracker
==================
Singleton class to manage and track trading bot status.
Integrates with BotController for process-based status tracking.
Supports multiple bot instances for the Bot Status Grid feature.
"""

import json
import logging
import uuid
from datetime import datetime
from pathlib import Path
from threading import Lock
from typing import Dict, List, Literal, Optional

from .data_models import (
    ActiveStrategy,
    AllBotsStatusResponse,
    BotInstance,
    BotStatusResponse,
    MonitoredPair,
)

logger = logging.getLogger(__name__)

# Lazy import to avoid circular dependency
_bot_controller = None


def _get_bot_controller():
    """Get the bot controller instance (lazy import to avoid circular dependency)."""
    global _bot_controller
    if _bot_controller is None:
        from .bot_controller import bot_controller

        _bot_controller = bot_controller
    return _bot_controller


class BotStatusTracker:
    """Singleton class to track trading bot operational status."""

    _instance: Optional["BotStatusTracker"] = None
    _lock: Lock = Lock()

    def __new__(cls) -> "BotStatusTracker":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self._status: Literal["running", "stopped", "paused", "error", "starting", "stopping"] = (
            "stopped"
        )
        self._started_at: Optional[datetime] = None
        self._last_heartbeat: Optional[datetime] = None
        self._last_signal_time: Optional[datetime] = None
        self._last_signal_pair: Optional[str] = None
        self._last_signal_type: Optional[str] = None
        self._monitored_pairs: List[MonitoredPair] = []
        self._active_strategy: Optional[ActiveStrategy] = None
        self._signals_today: int = 0
        self._trades_today: int = 0
        self._error_message: Optional[str] = None
        self._pid: Optional[int] = None

        # Multi-bot support
        self._bots: Dict[str, BotInstance] = {}
        self._bots_last_updated: Optional[datetime] = None

        # Load monitored pairs from bot settings
        self._load_monitored_pairs_from_config()

        # Initialize default bot instances from config
        self._initialize_default_bots()

        self._initialized = True
        logger.info("[BOT_STATUS] BotStatusTracker initialized")

    def _load_monitored_pairs_from_config(self) -> None:
        """Load monitored pairs from bot configuration file."""
        try:
            # Try to find settings.json relative to the server directory
            settings_paths = [
                Path(__file__).parent.parent.parent / "bot" / "config" / "settings.json",
                Path("app/bot/config/settings.json"),
            ]

            for settings_path in settings_paths:
                if settings_path.exists():
                    with open(settings_path, "r") as f:
                        config = json.load(f)

                    pairs_config = config.get("pairs", {})
                    self._monitored_pairs = [
                        MonitoredPair(
                            symbol=symbol,
                            timeframe="H1",  # Default timeframe
                            is_active=True,
                        )
                        for symbol in pairs_config.keys()
                    ]
                    logger.info(
                        f"[BOT_STATUS] Loaded {len(self._monitored_pairs)} monitored pairs from config"
                    )
                    return

            logger.warning("[BOT_STATUS] Bot settings.json not found, using empty pairs list")
        except Exception as e:
            logger.error(f"[BOT_STATUS] Error loading monitored pairs from config: {e}")

    def _initialize_default_bots(self) -> None:
        """Initialize default bot instances from bot configuration file."""
        try:
            # Try to find settings.json relative to the server directory
            settings_paths = [
                Path(__file__).parent.parent.parent / "bot" / "config" / "settings.json",
                Path("app/bot/config/settings.json"),
            ]

            for settings_path in settings_paths:
                if settings_path.exists():
                    with open(settings_path, "r") as f:
                        config = json.load(f)

                    pairs_config = config.get("pairs", {})

                    # Create a bot instance for each configured pair
                    for symbol, pair_config in pairs_config.items():
                        bot_id = f"bot_{symbol.lower()}"
                        bot_name = f"{symbol} Bot"

                        self._bots[bot_id] = BotInstance(
                            id=bot_id,
                            name=bot_name,
                            status="stopped",
                            currency_pair=symbol,
                            current_pnl=None,
                            open_position=None,
                            last_activity=None,
                            strategy_name="Bollinger Bands Strategy",
                            error_message=None,
                        )

                    # Add some demo bots for showcase purposes if only 1 pair configured
                    if len(self._bots) < 3:
                        demo_pairs = [
                            ("EURUSD", "EUR_USD Bot", "running", 245.50),
                            ("GBPUSD", "GBP_USD Bot", "paused", -32.10),
                            ("USDJPY", "USD_JPY Bot", "error", 0.0),
                        ]
                        for pair, name, status, pnl in demo_pairs:
                            bot_id = f"bot_{pair.lower()}"
                            if bot_id not in self._bots:
                                self._bots[bot_id] = BotInstance(
                                    id=bot_id,
                                    name=name,
                                    status=status,
                                    currency_pair=pair,
                                    current_pnl=pnl,
                                    open_position={"side": "long", "amount": 10000}
                                    if status == "running"
                                    else None,
                                    last_activity=datetime.now() if status != "stopped" else None,
                                    strategy_name="Bollinger Bands Strategy",
                                    error_message="Connection timeout" if status == "error" else None,
                                )

                    self._bots_last_updated = datetime.now()
                    logger.info(
                        f"[BOT_STATUS] Initialized {len(self._bots)} bot instances from config"
                    )
                    return

            # If no config found, create demo bots
            self._create_demo_bots()

        except Exception as e:
            logger.error(f"[BOT_STATUS] Error initializing bot instances: {e}")
            self._create_demo_bots()

    def _create_demo_bots(self) -> None:
        """Create demo bot instances for development/testing."""
        demo_bots = [
            ("bot_eurusd", "EUR_USD Bot", "running", "EURUSD", 245.50, {"side": "long", "amount": 10000}),
            ("bot_gbpusd", "GBP_USD Bot", "paused", "GBPUSD", -32.10, None),
            ("bot_usdjpy", "USD_JPY Bot", "stopped", "USDJPY", 0.0, None),
            ("bot_gbpjpy", "GBP_JPY Bot", "error", "GBPJPY", -150.25, None),
        ]

        for bot_id, name, status, pair, pnl, position in demo_bots:
            self._bots[bot_id] = BotInstance(
                id=bot_id,
                name=name,
                status=status,
                currency_pair=pair,
                current_pnl=pnl,
                open_position=position,
                last_activity=datetime.now() if status in ("running", "paused") else None,
                strategy_name="Bollinger Bands Strategy",
                error_message="Connection timeout" if status == "error" else None,
            )

        self._bots_last_updated = datetime.now()
        logger.info(f"[BOT_STATUS] Created {len(self._bots)} demo bot instances")

    def get_status(self) -> BotStatusResponse:
        """Get current bot status as a response model."""
        # Check process status from BotController
        controller = _get_bot_controller()
        controller_status = controller.get_status()

        # Determine effective status - controller status takes precedence for process state
        effective_status = self._status
        pid = self._pid
        can_start = True
        can_stop = False

        if controller_status["status"] in ["running", "starting", "stopping"]:
            effective_status = controller_status["status"]
            pid = controller_status["pid"]
            can_start = controller_status["can_start"]
            can_stop = controller_status["can_stop"]
        elif controller_status["status"] == "stopped" and self._status == "running":
            # Process died unexpectedly - update our status
            self._status = "stopped"
            self._started_at = None
            self._pid = None
            effective_status = "stopped"

        return BotStatusResponse(
            status=effective_status,
            started_at=self._started_at,
            uptime_seconds=self.calculate_uptime(),
            last_heartbeat=self._last_heartbeat,
            last_signal_time=self._last_signal_time,
            last_signal_pair=self._last_signal_pair,
            last_signal_type=self._last_signal_type,
            monitored_pairs=self._monitored_pairs,
            active_strategy=self._active_strategy,
            signals_today=self._signals_today,
            trades_today=self._trades_today,
            error_message=self._error_message,
            pid=pid,
            can_start=can_start,
            can_stop=can_stop,
        )

    def set_running(self, strategy_name: str, strategy_description: str) -> None:
        """Set bot status to running with active strategy."""
        self._status = "running"
        self._started_at = datetime.now()
        self._error_message = None
        self._active_strategy = ActiveStrategy(
            name=strategy_name,
            description=strategy_description,
        )
        self.record_heartbeat()
        logger.info(f"[BOT_STATUS] Bot set to running with strategy: {strategy_name}")

    def set_stopped(self) -> None:
        """Set bot status to stopped."""
        self._status = "stopped"
        self._started_at = None
        self._active_strategy = None
        self._error_message = None
        logger.info("[BOT_STATUS] Bot set to stopped")

    def set_paused(self) -> None:
        """Set bot status to paused."""
        self._status = "paused"
        self._error_message = None
        logger.info("[BOT_STATUS] Bot set to paused")

    def set_starting(self) -> None:
        """Set bot status to starting (transitional state)."""
        self._status = "starting"
        self._error_message = None
        logger.info("[BOT_STATUS] Bot set to starting")

    def set_stopping(self) -> None:
        """Set bot status to stopping (transitional state)."""
        self._status = "stopping"
        self._error_message = None
        logger.info("[BOT_STATUS] Bot set to stopping")

    def set_error(self, message: str) -> None:
        """Set bot status to error with message."""
        self._status = "error"
        self._error_message = message
        logger.error(f"[BOT_STATUS] Bot set to error: {message}")

    def record_heartbeat(self) -> None:
        """Update last heartbeat timestamp."""
        self._last_heartbeat = datetime.now()

    def record_signal(self, pair: str, signal_type: str) -> None:
        """Record a new signal and increment daily counter."""
        self._last_signal_time = datetime.now()
        self._last_signal_pair = pair
        self._last_signal_type = signal_type
        self._signals_today += 1
        logger.info(f"[BOT_STATUS] Signal recorded: {signal_type} on {pair}")

    def record_trade(self) -> None:
        """Increment trades today counter."""
        self._trades_today += 1
        logger.info(f"[BOT_STATUS] Trade recorded, total today: {self._trades_today}")

    def set_monitored_pairs(self, pairs: List[MonitoredPair]) -> None:
        """Update the list of monitored pairs."""
        self._monitored_pairs = pairs
        logger.info(f"[BOT_STATUS] Monitored pairs updated: {len(pairs)} pairs")

    def reset_daily_counters(self) -> None:
        """Reset daily counters (signals_today, trades_today)."""
        self._signals_today = 0
        self._trades_today = 0
        logger.info("[BOT_STATUS] Daily counters reset")

    def calculate_uptime(self) -> Optional[float]:
        """Calculate uptime in seconds from started_at."""
        if self._started_at is None or self._status != "running":
            return None
        return (datetime.now() - self._started_at).total_seconds()

    # =========================================================================
    # Multi-Bot Methods
    # =========================================================================

    def get_all_bots(self) -> AllBotsStatusResponse:
        """Get status of all registered bot instances."""
        self._bots_last_updated = datetime.now()
        return AllBotsStatusResponse(
            bots=list(self._bots.values()),
            count=len(self._bots),
            last_updated=self._bots_last_updated,
        )

    def register_bot(
        self,
        bot_id: str,
        name: str,
        currency_pair: str,
        strategy_name: Optional[str] = None,
    ) -> BotInstance:
        """Register a new bot instance."""
        bot = BotInstance(
            id=bot_id,
            name=name,
            status="stopped",
            currency_pair=currency_pair,
            current_pnl=None,
            open_position=None,
            last_activity=None,
            strategy_name=strategy_name or "Bollinger Bands Strategy",
            error_message=None,
        )
        self._bots[bot_id] = bot
        self._bots_last_updated = datetime.now()
        logger.info(f"[BOT_STATUS] Registered bot: {name} ({bot_id})")
        return bot

    def update_bot_status(
        self,
        bot_id: str,
        status: Literal["running", "paused", "stopped", "error"],
        error_message: Optional[str] = None,
    ) -> Optional[BotInstance]:
        """Update the status of a bot instance."""
        if bot_id not in self._bots:
            logger.warning(f"[BOT_STATUS] Bot not found: {bot_id}")
            return None

        bot = self._bots[bot_id]
        bot.status = status
        bot.last_activity = datetime.now()
        bot.error_message = error_message if status == "error" else None
        self._bots_last_updated = datetime.now()
        logger.info(f"[BOT_STATUS] Updated bot {bot_id} status to: {status}")
        return bot

    def update_bot_pnl(self, bot_id: str, pnl: float) -> Optional[BotInstance]:
        """Update the current P/L of a bot instance."""
        if bot_id not in self._bots:
            logger.warning(f"[BOT_STATUS] Bot not found: {bot_id}")
            return None

        bot = self._bots[bot_id]
        bot.current_pnl = pnl
        bot.last_activity = datetime.now()
        self._bots_last_updated = datetime.now()
        logger.info(f"[BOT_STATUS] Updated bot {bot_id} P/L to: {pnl}")
        return bot

    def update_bot_position(
        self, bot_id: str, position: Optional[Dict]
    ) -> Optional[BotInstance]:
        """Update the open position of a bot instance."""
        if bot_id not in self._bots:
            logger.warning(f"[BOT_STATUS] Bot not found: {bot_id}")
            return None

        bot = self._bots[bot_id]
        bot.open_position = position
        bot.last_activity = datetime.now()
        self._bots_last_updated = datetime.now()
        logger.info(f"[BOT_STATUS] Updated bot {bot_id} position")
        return bot

    def get_bot(self, bot_id: str) -> Optional[BotInstance]:
        """Get a specific bot instance by ID."""
        return self._bots.get(bot_id)

    def remove_bot(self, bot_id: str) -> bool:
        """Remove a bot instance."""
        if bot_id in self._bots:
            del self._bots[bot_id]
            self._bots_last_updated = datetime.now()
            logger.info(f"[BOT_STATUS] Removed bot: {bot_id}")
            return True
        return False


# Global singleton instance
bot_status_tracker = BotStatusTracker()
