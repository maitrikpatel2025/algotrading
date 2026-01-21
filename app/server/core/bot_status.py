"""
Bot Status Tracker
==================
Singleton class to manage and track trading bot status.
Integrates with BotController for process-based status tracking.
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from threading import Lock
from typing import List, Literal, Optional

from .data_models import ActiveStrategy, BotStatusResponse, MonitoredPair

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

        self._status: Literal["running", "stopped", "paused", "error", "starting", "stopping"] = "stopped"
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

        # Load monitored pairs from bot settings
        self._load_monitored_pairs_from_config()

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


# Global singleton instance
bot_status_tracker = BotStatusTracker()
