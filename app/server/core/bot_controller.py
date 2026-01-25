"""
Bot Controller
==============
Singleton class to manage trading bot subprocess lifecycle.
Handles starting, stopping, pausing, resuming, and monitoring the bot process.
Extended with pre-start validation, enhanced stop options, and emergency stop.
"""

import json
import logging
import os
import signal
import subprocess
import time
from datetime import datetime
from pathlib import Path
from threading import Lock
from typing import List, Literal, Optional

from .data_models import (
    EmergencyStopAction,
    EmergencyStopResponse,
    PreStartChecklistItem,
    PreStartChecklistResponse,
    StopOption,
)

logger = logging.getLogger(__name__)


class BotController:
    """
    Singleton class to control the trading bot subprocess.

    Features:
    - Subprocess lifecycle management (start/stop/restart)
    - PID tracking and lock file mechanism
    - Graceful shutdown with SIGTERM followed by SIGKILL timeout
    - Thread-safe access via singleton pattern
    """

    _instance: Optional["BotController"] = None
    _lock: Lock = Lock()

    # Configuration
    LOCK_FILE_PATH = Path(__file__).parent.parent / ".bot.lock"
    BOT_DIR = Path(__file__).parent.parent.parent / "bot"
    LOG_DIR = Path(__file__).parent.parent / "logs"
    GRACEFUL_SHUTDOWN_TIMEOUT = 5  # seconds
    HEARTBEAT_INTERVAL = 30  # seconds

    def __new__(cls) -> "BotController":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self._process: Optional[subprocess.Popen] = None
        self._pid: Optional[int] = None
        self._started_at: Optional[datetime] = None
        self._status: Literal["running", "stopped", "starting", "stopping"] = "stopped"

        # Ensure log directory exists
        self.LOG_DIR.mkdir(parents=True, exist_ok=True)

        # Check for stale lock file on startup
        self._check_stale_lock()

        self._initialized = True
        logger.info("[BOT_CONTROLLER] BotController initialized")

    def _check_stale_lock(self) -> None:
        """Check for and clean up stale lock file from crashed process."""
        if self.LOCK_FILE_PATH.exists():
            try:
                with open(self.LOCK_FILE_PATH, "r") as f:
                    stored_pid = int(f.read().strip())

                # Check if process is actually running
                if not self._is_pid_running(stored_pid):
                    logger.warning(
                        f"[BOT_CONTROLLER] Found stale lock file with PID {stored_pid}, cleaning up"
                    )
                    self._cleanup_lock()
                else:
                    # Process is running, recover state
                    self._pid = stored_pid
                    self._status = "running"
                    logger.info(
                        f"[BOT_CONTROLLER] Recovered running bot process with PID {stored_pid}"
                    )
            except (ValueError, IOError) as e:
                logger.error(f"[BOT_CONTROLLER] Error reading lock file: {e}")
                self._cleanup_lock()

    def _is_pid_running(self, pid: int) -> bool:
        """Check if a process with given PID is running."""
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False

    def _create_lock(self, pid: int) -> None:
        """Create lock file with PID."""
        try:
            with open(self.LOCK_FILE_PATH, "w") as f:
                f.write(str(pid))
            logger.info(f"[BOT_CONTROLLER] Created lock file with PID {pid}")
        except IOError as e:
            logger.error(f"[BOT_CONTROLLER] Failed to create lock file: {e}")

    def _cleanup_lock(self) -> None:
        """Remove lock file."""
        try:
            if self.LOCK_FILE_PATH.exists():
                self.LOCK_FILE_PATH.unlink()
                logger.info("[BOT_CONTROLLER] Lock file removed")
        except IOError as e:
            logger.error(f"[BOT_CONTROLLER] Failed to remove lock file: {e}")

    def is_running(self) -> bool:
        """Check if bot process is currently running."""
        if self._pid is None:
            return False

        if not self._is_pid_running(self._pid):
            # Process died unexpectedly
            logger.warning(f"[BOT_CONTROLLER] Bot process {self._pid} is no longer running")
            self._cleanup_after_stop()
            return False

        return True

    def get_status(self) -> dict:
        """Get current bot controller status."""
        # Verify process is still running
        is_actually_running = self.is_running()

        return {
            "status": self._status
            if is_actually_running or self._status in ["stopped", "starting", "stopping"]
            else "stopped",
            "pid": self._pid if is_actually_running else None,
            "started_at": self._started_at.isoformat()
            if self._started_at and is_actually_running
            else None,
            "can_start": self._status == "stopped" and not is_actually_running,
            "can_stop": self._status == "running" and is_actually_running,
        }

    def start_bot(
        self,
        strategy: Optional[str] = None,
        pairs: Optional[list] = None,
        timeframe: Optional[str] = None,
    ) -> dict:
        """
        Start the trading bot subprocess.

        Args:
            strategy: Optional strategy name (for future use)
            pairs: Optional list of trading pairs (for future use)
            timeframe: Optional timeframe (for future use)

        Returns:
            dict with success status, message, and PID
        """
        with self._lock:
            # Check if already running
            if self.is_running():
                return {
                    "success": False,
                    "message": "Bot is already running",
                    "status": "running",
                    "pid": self._pid,
                    "error": "conflict",
                }

            # Check for stale lock
            if self.LOCK_FILE_PATH.exists():
                self._check_stale_lock()
                if self.is_running():
                    return {
                        "success": False,
                        "message": "Bot is already running",
                        "status": "running",
                        "pid": self._pid,
                        "error": "conflict",
                    }

            self._status = "starting"
            logger.info("[BOT_CONTROLLER] Starting bot...")

            try:
                # Prepare environment
                env = os.environ.copy()
                server_dir = Path(__file__).parent.parent
                env["PYTHONPATH"] = f"{server_dir}:{env.get('PYTHONPATH', '')}"

                # Prepare log files
                stdout_log = self.LOG_DIR / "bot_stdout.log"
                stderr_log = self.LOG_DIR / "bot_stderr.log"

                # Open log files
                stdout_file = open(stdout_log, "a")
                stderr_file = open(stderr_log, "a")

                # Start bot process using uv run
                self._process = subprocess.Popen(
                    ["uv", "run", "python", "run.py"],
                    cwd=str(self.BOT_DIR),
                    env=env,
                    stdout=stdout_file,
                    stderr=stderr_file,
                    start_new_session=True,  # Detach from parent process group
                )

                self._pid = self._process.pid
                self._started_at = datetime.now()
                self._status = "running"

                # Create lock file
                self._create_lock(self._pid)

                logger.info(f"[BOT_CONTROLLER] Bot started with PID {self._pid}")

                return {
                    "success": True,
                    "message": f"Bot started successfully with PID {self._pid}",
                    "status": "running",
                    "pid": self._pid,
                }

            except FileNotFoundError as e:
                self._status = "stopped"
                error_msg = f"Failed to start bot: uv command not found - {e}"
                logger.error(f"[BOT_CONTROLLER] {error_msg}")
                return {
                    "success": False,
                    "message": error_msg,
                    "status": "stopped",
                    "error": "not_found",
                }
            except Exception as e:
                self._status = "stopped"
                error_msg = f"Failed to start bot: {e}"
                logger.error(f"[BOT_CONTROLLER] {error_msg}")
                return {
                    "success": False,
                    "message": error_msg,
                    "status": "stopped",
                    "error": "internal_error",
                }

    def stop_bot(self, force: bool = False) -> dict:
        """
        Stop the trading bot subprocess.

        Args:
            force: If True, use SIGKILL immediately instead of graceful shutdown

        Returns:
            dict with success status and message
        """
        with self._lock:
            if not self.is_running():
                return {
                    "success": False,
                    "message": "Bot is not running",
                    "status": "stopped",
                    "error": "not_running",
                }

            self._status = "stopping"
            logger.info(f"[BOT_CONTROLLER] Stopping bot (PID: {self._pid})...")

            try:
                if force:
                    # Force kill immediately
                    os.kill(self._pid, signal.SIGKILL)
                    logger.info(f"[BOT_CONTROLLER] Sent SIGKILL to PID {self._pid}")
                else:
                    # Try graceful shutdown first
                    os.kill(self._pid, signal.SIGTERM)
                    logger.info(f"[BOT_CONTROLLER] Sent SIGTERM to PID {self._pid}")

                    # Wait for graceful shutdown
                    start_time = time.time()
                    while time.time() - start_time < self.GRACEFUL_SHUTDOWN_TIMEOUT:
                        if not self._is_pid_running(self._pid):
                            break
                        time.sleep(0.5)

                    # If still running, force kill
                    if self._is_pid_running(self._pid):
                        logger.warning(
                            "[BOT_CONTROLLER] Bot didn't stop gracefully, sending SIGKILL"
                        )
                        os.kill(self._pid, signal.SIGKILL)
                        time.sleep(0.5)

                self._cleanup_after_stop()

                logger.info("[BOT_CONTROLLER] Bot stopped successfully")
                return {
                    "success": True,
                    "message": "Bot stopped successfully",
                    "status": "stopped",
                }

            except ProcessLookupError:
                # Process already dead
                self._cleanup_after_stop()
                return {
                    "success": True,
                    "message": "Bot was already stopped",
                    "status": "stopped",
                }
            except Exception as e:
                error_msg = f"Failed to stop bot: {e}"
                logger.error(f"[BOT_CONTROLLER] {error_msg}")
                return {
                    "success": False,
                    "message": error_msg,
                    "status": self._status,
                    "error": "internal_error",
                }

    def _cleanup_after_stop(self) -> None:
        """Clean up state after bot stops."""
        self._process = None
        self._pid = None
        self._started_at = None
        self._status = "stopped"
        self._cleanup_lock()

    def restart_bot(
        self,
        strategy: Optional[str] = None,
        pairs: Optional[list] = None,
        timeframe: Optional[str] = None,
    ) -> dict:
        """
        Restart the trading bot (stop + start).

        Args:
            strategy: Optional strategy name
            pairs: Optional list of trading pairs
            timeframe: Optional timeframe

        Returns:
            dict with success status and message
        """
        logger.info("[BOT_CONTROLLER] Restarting bot...")

        # Stop if running
        if self.is_running():
            stop_result = self.stop_bot()
            if not stop_result["success"]:
                return {
                    "success": False,
                    "message": f"Failed to stop bot during restart: {stop_result['message']}",
                    "status": stop_result["status"],
                    "error": stop_result.get("error"),
                }
            # Wait a moment after stopping
            time.sleep(1)

        # Start the bot
        start_result = self.start_bot(strategy=strategy, pairs=pairs, timeframe=timeframe)

        if start_result["success"]:
            start_result["message"] = "Bot restarted successfully"

        return start_result

    def check_health(self) -> bool:
        """
        Check if the bot process is healthy.

        Returns:
            True if bot is running and healthy, False otherwise
        """
        if not self.is_running():
            return False

        # Check if process is still responsive
        try:
            if self._process and self._process.poll() is not None:
                # Process has terminated
                logger.warning("[BOT_CONTROLLER] Bot process has terminated")
                self._cleanup_after_stop()
                return False
        except Exception:
            pass

        return True

    # =========================================================================
    # Pre-Start Validation
    # =========================================================================

    def validate_pre_start(self) -> PreStartChecklistResponse:
        """
        Validate pre-start checklist before starting the bot.

        Checks:
        1. Strategy assigned - verify bot config has active strategy
        2. Risk parameters configured - verify trading pairs have settings
        3. Broker connected - test API connectivity

        Returns:
            PreStartChecklistResponse with checklist items and can_start flag
        """
        items: List[PreStartChecklistItem] = []
        all_passed = True

        # Check 1: Strategy assigned
        strategy_check = self._check_strategy_assigned()
        items.append(strategy_check)
        if strategy_check.status == "failed":
            all_passed = False

        # Check 2: Risk parameters configured
        risk_check = self._check_risk_parameters()
        items.append(risk_check)
        if risk_check.status == "failed":
            all_passed = False

        # Check 3: Broker connected
        broker_check = self._check_broker_connectivity()
        items.append(broker_check)
        if broker_check.status == "failed":
            all_passed = False

        message = "All checks passed" if all_passed else "Some checks failed"
        if all_passed and any(item.status == "warning" for item in items):
            message = "All critical checks passed (with warnings)"

        return PreStartChecklistResponse(
            items=items,
            can_start=all_passed,
            message=message,
        )

    def _check_strategy_assigned(self) -> PreStartChecklistItem:
        """Check if a strategy is assigned to the bot."""
        try:
            # Check bot config for strategy
            settings_paths = [
                self.BOT_DIR / "config" / "settings.json",
                Path("app/bot/config/settings.json"),
            ]

            for settings_path in settings_paths:
                if settings_path.exists():
                    with open(settings_path, "r") as f:
                        config = json.load(f)

                    strategy = config.get("strategy", {})
                    if strategy.get("name"):
                        return PreStartChecklistItem(
                            name="Strategy assigned",
                            status="passed",
                            message=f"Strategy: {strategy.get('name')}",
                        )
                    else:
                        return PreStartChecklistItem(
                            name="Strategy assigned",
                            status="failed",
                            message="No strategy configured in settings",
                        )

            # Default strategy if no config file
            return PreStartChecklistItem(
                name="Strategy assigned",
                status="passed",
                message="Using default Bollinger Bands Strategy",
            )

        except Exception as e:
            logger.error(f"[BOT_CONTROLLER] Strategy check error: {e}")
            return PreStartChecklistItem(
                name="Strategy assigned",
                status="warning",
                message=f"Could not verify strategy: {str(e)}",
            )

    def _check_risk_parameters(self) -> PreStartChecklistItem:
        """Check if risk parameters are configured for trading pairs."""
        try:
            settings_paths = [
                self.BOT_DIR / "config" / "settings.json",
                Path("app/bot/config/settings.json"),
            ]

            for settings_path in settings_paths:
                if settings_path.exists():
                    with open(settings_path, "r") as f:
                        config = json.load(f)

                    pairs_config = config.get("pairs", {})
                    if pairs_config:
                        pair_count = len(pairs_config)
                        # Check if pairs have risk settings
                        pairs_with_risk = sum(
                            1 for p in pairs_config.values()
                            if p.get("risk") or p.get("stop_loss") or p.get("take_profit")
                        )
                        if pairs_with_risk > 0:
                            return PreStartChecklistItem(
                                name="Risk parameters set",
                                status="passed",
                                message=f"{pair_count} pairs configured with risk parameters",
                            )
                        else:
                            return PreStartChecklistItem(
                                name="Risk parameters set",
                                status="warning",
                                message=f"{pair_count} pairs configured (using default risk)",
                            )
                    else:
                        return PreStartChecklistItem(
                            name="Risk parameters set",
                            status="failed",
                            message="No trading pairs configured",
                        )

            return PreStartChecklistItem(
                name="Risk parameters set",
                status="warning",
                message="Using default configuration",
            )

        except Exception as e:
            logger.error(f"[BOT_CONTROLLER] Risk check error: {e}")
            return PreStartChecklistItem(
                name="Risk parameters set",
                status="warning",
                message=f"Could not verify risk parameters: {str(e)}",
            )

    def _check_broker_connectivity(self) -> PreStartChecklistItem:
        """Check broker API connectivity."""
        try:
            # Import and test API connectivity
            from .openfx_api import OpenFxApi

            api = OpenFxApi()
            account = api.get_account_summary()

            if account and account.get("Balance") is not None:
                balance = account.get("Balance", 0)
                return PreStartChecklistItem(
                    name="Broker connected",
                    status="passed",
                    message=f"Connected (Balance: ${balance:,.2f})",
                )
            else:
                return PreStartChecklistItem(
                    name="Broker connected",
                    status="failed",
                    message="Could not retrieve account data",
                )

        except Exception as e:
            logger.error(f"[BOT_CONTROLLER] Broker check error: {e}")
            return PreStartChecklistItem(
                name="Broker connected",
                status="failed",
                message=f"Connection failed: {str(e)}",
            )

    # =========================================================================
    # Pause/Resume Functionality
    # =========================================================================

    def pause_bot(self, duration_minutes: Optional[int] = None) -> dict:
        """
        Pause the trading bot.

        The bot process continues running but stops opening new positions.
        Existing positions are still managed (SL/TP remain active).

        Args:
            duration_minutes: Optional pause duration. None means indefinite.

        Returns:
            dict with success status, paused_at, and resume_at
        """
        if not self.is_running():
            return {
                "success": False,
                "message": "Bot is not running",
                "error": "not_running",
            }

        try:
            # Send SIGUSR1 to pause trading signals
            # Note: The bot process needs to handle this signal
            os.kill(self._pid, signal.SIGUSR1)
            logger.info(f"[BOT_CONTROLLER] Sent SIGUSR1 (pause) to PID {self._pid}")

            # Update status tracker
            from .bot_status import bot_status_tracker
            pause_info = bot_status_tracker.set_paused(duration_minutes)

            message = "Bot paused"
            if duration_minutes:
                message = f"Bot paused for {duration_minutes} minutes"

            return {
                "success": True,
                "paused_at": pause_info["paused_at"],
                "resume_at": pause_info["resume_at"],
                "message": message,
            }

        except ProcessLookupError:
            self._cleanup_after_stop()
            return {
                "success": False,
                "message": "Bot process not found",
                "error": "not_found",
            }
        except Exception as e:
            logger.error(f"[BOT_CONTROLLER] Pause error: {e}")
            return {
                "success": False,
                "message": f"Failed to pause bot: {e}",
                "error": "internal_error",
            }

    def resume_bot(self) -> dict:
        """
        Resume the trading bot from paused state.

        Returns:
            dict with success status and resumed_at
        """
        from .bot_status import bot_status_tracker

        if not self.is_running():
            return {
                "success": False,
                "message": "Bot is not running",
                "error": "not_running",
            }

        pause_info = bot_status_tracker.get_pause_info()
        if not pause_info["is_paused"]:
            return {
                "success": False,
                "message": "Bot is not paused",
                "error": "not_paused",
            }

        try:
            # Send SIGUSR2 to resume trading signals
            os.kill(self._pid, signal.SIGUSR2)
            logger.info(f"[BOT_CONTROLLER] Sent SIGUSR2 (resume) to PID {self._pid}")

            resume_info = bot_status_tracker.set_resumed()

            return {
                "success": True,
                "resumed_at": resume_info["resumed_at"],
                "message": "Bot resumed",
            }

        except ProcessLookupError:
            self._cleanup_after_stop()
            return {
                "success": False,
                "message": "Bot process not found",
                "error": "not_found",
            }
        except Exception as e:
            logger.error(f"[BOT_CONTROLLER] Resume error: {e}")
            return {
                "success": False,
                "message": f"Failed to resume bot: {e}",
                "error": "internal_error",
            }

    # =========================================================================
    # Enhanced Stop Options
    # =========================================================================

    def stop_bot_with_options(self, stop_option: StopOption = StopOption.KEEP_POSITIONS) -> dict:
        """
        Stop the trading bot with enhanced options.

        Args:
            stop_option: How to handle open positions
                - CLOSE_ALL: Close all positions at market price
                - KEEP_POSITIONS: Leave positions for manual management
                - WAIT_FOR_CLOSE: Stop after current position closes

        Returns:
            dict with success, positions_closed, final_pnl, message
        """
        positions_closed = 0
        final_pnl = 0.0

        if not self.is_running():
            return {
                "success": False,
                "message": "Bot is not running",
                "status": "stopped",
                "positions_closed": 0,
                "final_pnl": None,
                "error": "not_running",
            }

        try:
            if stop_option == StopOption.CLOSE_ALL:
                # Close all positions before stopping
                close_result = self._close_all_positions()
                positions_closed = close_result.get("count", 0)
                final_pnl = close_result.get("total_pnl", 0.0)
                logger.info(
                    f"[BOT_CONTROLLER] Closed {positions_closed} positions, "
                    f"total P/L: ${final_pnl:.2f}"
                )

            elif stop_option == StopOption.WAIT_FOR_CLOSE:
                # Set status to stopping - bot will stop after position closes
                from .bot_status import bot_status_tracker
                bot_status_tracker.set_stopping()

                return {
                    "success": True,
                    "message": "Bot will stop after current position closes",
                    "status": "stopping",
                    "positions_closed": 0,
                    "final_pnl": None,
                }

            # Stop the bot process
            stop_result = self.stop_bot()

            if stop_result["success"]:
                return {
                    "success": True,
                    "message": self._get_stop_message(stop_option, positions_closed, final_pnl),
                    "status": "stopped",
                    "positions_closed": positions_closed,
                    "final_pnl": final_pnl if positions_closed > 0 else None,
                }
            else:
                return {
                    "success": False,
                    "message": stop_result["message"],
                    "status": stop_result.get("status", "error"),
                    "positions_closed": positions_closed,
                    "final_pnl": final_pnl if positions_closed > 0 else None,
                    "error": stop_result.get("error"),
                }

        except Exception as e:
            logger.error(f"[BOT_CONTROLLER] Stop with options error: {e}")
            return {
                "success": False,
                "message": f"Failed to stop bot: {e}",
                "status": "error",
                "positions_closed": positions_closed,
                "final_pnl": final_pnl if positions_closed > 0 else None,
                "error": "internal_error",
            }

    def _close_all_positions(self) -> dict:
        """Close all open positions at market price."""
        try:
            from .openfx_api import OpenFxApi

            api = OpenFxApi()
            trades = api.get_open_trades()

            if not trades:
                return {"count": 0, "total_pnl": 0.0}

            total_pnl = 0.0
            closed_count = 0

            for trade in trades:
                try:
                    success = api.close_trade(trade.id)
                    if success:
                        closed_count += 1
                        total_pnl += trade.unrealizedPL or 0.0
                        logger.info(f"[BOT_CONTROLLER] Closed trade {trade.id}")
                except Exception as e:
                    logger.error(f"[BOT_CONTROLLER] Failed to close trade {trade.id}: {e}")

            return {"count": closed_count, "total_pnl": total_pnl}

        except Exception as e:
            logger.error(f"[BOT_CONTROLLER] Close all positions error: {e}")
            return {"count": 0, "total_pnl": 0.0}

    def _get_stop_message(
        self, stop_option: StopOption, positions_closed: int, final_pnl: float
    ) -> str:
        """Generate stop message based on option and results."""
        if stop_option == StopOption.CLOSE_ALL:
            if positions_closed > 0:
                pnl_str = f"+${final_pnl:.2f}" if final_pnl >= 0 else f"-${abs(final_pnl):.2f}"
                return f"Bot stopped, {positions_closed} positions closed ({pnl_str})"
            return "Bot stopped, no open positions"
        elif stop_option == StopOption.KEEP_POSITIONS:
            return "Bot stopped, positions left for manual management"
        else:
            return "Bot stopped"

    # =========================================================================
    # Emergency Stop
    # =========================================================================

    def emergency_stop_all(self) -> EmergencyStopResponse:
        """
        Emergency stop - immediately stop all bots and close all positions.

        This is a panic button that:
        1. Sends SIGKILL to all running bot processes immediately
        2. Closes all open positions at market price
        3. Logs all actions taken

        Returns:
            EmergencyStopResponse with detailed summary
        """
        actions: List[EmergencyStopAction] = []
        bots_stopped = 0
        positions_closed = 0
        total_pnl = 0.0

        logger.warning("[BOT_CONTROLLER] EMERGENCY STOP initiated")

        # Step 1: Force kill bot process
        if self.is_running():
            try:
                os.kill(self._pid, signal.SIGKILL)
                self._cleanup_after_stop()
                bots_stopped += 1
                actions.append(EmergencyStopAction(
                    action="Force stop bot",
                    target=f"PID {self._pid}",
                    result="success",
                    details="Bot process terminated with SIGKILL",
                ))
                logger.info(f"[BOT_CONTROLLER] Emergency: Killed bot PID {self._pid}")
            except ProcessLookupError:
                self._cleanup_after_stop()
                actions.append(EmergencyStopAction(
                    action="Force stop bot",
                    target=f"PID {self._pid}",
                    result="success",
                    details="Bot process was already stopped",
                ))
            except Exception as e:
                actions.append(EmergencyStopAction(
                    action="Force stop bot",
                    target=f"PID {self._pid}",
                    result="failed",
                    details=str(e),
                ))
                logger.error(f"[BOT_CONTROLLER] Emergency: Failed to kill bot: {e}")

        # Step 2: Update all bot instances in status tracker
        try:
            from .bot_status import bot_status_tracker
            bot_status_tracker.set_stopped()

            # Update all multi-bot instances
            all_bots = bot_status_tracker.get_all_bots()
            for bot in all_bots.bots:
                if bot.status in ["running", "paused"]:
                    bot_status_tracker.update_bot_status(bot.id, "stopped")
                    bots_stopped += 1
                    actions.append(EmergencyStopAction(
                        action="Stop bot instance",
                        target=bot.name,
                        result="success",
                        details="Bot status updated to stopped",
                    ))
        except Exception as e:
            logger.error(f"[BOT_CONTROLLER] Emergency: Failed to update bot status: {e}")
            actions.append(EmergencyStopAction(
                action="Update bot status",
                target="All bots",
                result="failed",
                details=str(e),
            ))

        # Step 3: Close all open positions
        try:
            from .openfx_api import OpenFxApi

            api = OpenFxApi()
            trades = api.get_open_trades()

            if trades:
                for trade in trades:
                    try:
                        success = api.close_trade(trade.id)
                        if success:
                            positions_closed += 1
                            pnl = trade.unrealizedPL or 0.0
                            total_pnl += pnl
                            pnl_str = f"${pnl:.2f}" if pnl >= 0 else f"-${abs(pnl):.2f}"
                            actions.append(EmergencyStopAction(
                                action="Close position",
                                target=f"{trade.instrument} (ID: {trade.id})",
                                result="success",
                                details=f"P/L: {pnl_str}",
                            ))
                            logger.info(
                                f"[BOT_CONTROLLER] Emergency: Closed {trade.instrument} "
                                f"position {trade.id}"
                            )
                        else:
                            actions.append(EmergencyStopAction(
                                action="Close position",
                                target=f"{trade.instrument} (ID: {trade.id})",
                                result="failed",
                                details="Broker rejected close request",
                            ))
                    except Exception as e:
                        actions.append(EmergencyStopAction(
                            action="Close position",
                            target=f"{trade.instrument} (ID: {trade.id})",
                            result="failed",
                            details=str(e),
                        ))
                        logger.error(
                            f"[BOT_CONTROLLER] Emergency: Failed to close {trade.id}: {e}"
                        )
            else:
                actions.append(EmergencyStopAction(
                    action="Close positions",
                    target="All positions",
                    result="success",
                    details="No open positions to close",
                ))

        except Exception as e:
            logger.error(f"[BOT_CONTROLLER] Emergency: Failed to close positions: {e}")
            actions.append(EmergencyStopAction(
                action="Close positions",
                target="All positions",
                result="failed",
                details=str(e),
            ))

        # Generate summary message
        pnl_str = f"${total_pnl:.2f}" if total_pnl >= 0 else f"-${abs(total_pnl):.2f}"
        message = f"Emergency stop complete: {bots_stopped} bots stopped, {positions_closed} positions closed"
        if positions_closed > 0:
            message += f" (P/L: {pnl_str})"

        logger.warning(f"[BOT_CONTROLLER] {message}")

        return EmergencyStopResponse(
            success=True,
            bots_stopped=bots_stopped,
            positions_closed=positions_closed,
            total_pnl_realized=total_pnl if positions_closed > 0 else None,
            actions=actions,
            message=message,
        )


# Global singleton instance
bot_controller = BotController()
