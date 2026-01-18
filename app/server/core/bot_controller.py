"""
Bot Controller
==============
Singleton class to manage trading bot subprocess lifecycle.
Handles starting, stopping, and monitoring the bot process.
"""

import logging
import os
import signal
import subprocess
import time
from datetime import datetime
from pathlib import Path
from threading import Lock
from typing import Literal, Optional

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
            logger.warning(
                f"[BOT_CONTROLLER] Bot process {self._pid} is no longer running"
            )
            self._cleanup_after_stop()
            return False

        return True

    def get_status(self) -> dict:
        """Get current bot controller status."""
        # Verify process is still running
        is_actually_running = self.is_running()

        return {
            "status": self._status if is_actually_running or self._status in ["stopped", "starting", "stopping"] else "stopped",
            "pid": self._pid if is_actually_running else None,
            "started_at": self._started_at.isoformat() if self._started_at and is_actually_running else None,
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
                            f"[BOT_CONTROLLER] Bot didn't stop gracefully, sending SIGKILL"
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


# Global singleton instance
bot_controller = BotController()
