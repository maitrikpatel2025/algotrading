"""
Tests for Bot Controller
========================
Unit tests for the BotController class that manages bot subprocess lifecycle.
"""

import os
import signal
import time
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from core.bot_controller import BotController


@pytest.fixture
def controller():
    """Create a fresh BotController instance for testing."""
    # Reset the singleton
    BotController._instance = None

    # Create a new instance
    instance = BotController()

    # Use a test-specific lock file path
    instance.LOCK_FILE_PATH = Path("/tmp/test_bot.lock")

    yield instance

    # Cleanup
    instance._cleanup_lock()
    if instance._pid and instance._is_pid_running(instance._pid):
        try:
            os.kill(instance._pid, signal.SIGKILL)
        except ProcessLookupError:
            pass

    # Reset singleton for other tests
    BotController._instance = None


@pytest.fixture
def mock_subprocess():
    """Mock subprocess.Popen for testing without actually starting processes."""
    with patch("core.bot_controller.subprocess.Popen") as mock_popen:
        mock_process = MagicMock()
        mock_process.pid = 12345
        mock_process.poll.return_value = None  # Process is running
        mock_popen.return_value = mock_process
        yield mock_popen, mock_process


class TestBotControllerSingleton:
    """Test cases for BotController singleton behavior."""

    def test_controller_is_singleton(self):
        """Test that BotController is a singleton."""
        # Reset singleton first
        BotController._instance = None

        controller1 = BotController()
        controller2 = BotController()

        assert controller1 is controller2

        # Cleanup
        BotController._instance = None


class TestBotControllerStatus:
    """Test cases for BotController status methods."""

    def test_get_status_when_stopped(self, controller):
        """Test get_status returns correct values when bot is stopped."""
        status = controller.get_status()

        assert status["status"] == "stopped"
        assert status["pid"] is None
        assert status["started_at"] is None
        assert status["can_start"] is True
        assert status["can_stop"] is False

    def test_is_running_returns_false_when_stopped(self, controller):
        """Test is_running returns False when no bot is running."""
        assert controller.is_running() is False


class TestBotControllerStart:
    """Test cases for starting the bot."""

    def test_start_bot_success(self, controller, mock_subprocess):
        """Test starting bot successfully when not running."""
        mock_popen, mock_process = mock_subprocess

        with patch.object(controller, "_is_pid_running", return_value=True):
            result = controller.start_bot()

        assert result["success"] is True
        assert result["status"] == "running"
        assert result["pid"] == 12345
        assert "successfully" in result["message"].lower()

    def test_start_bot_creates_lock_file(self, controller, mock_subprocess):
        """Test that starting bot creates lock file."""
        mock_popen, mock_process = mock_subprocess

        with patch.object(controller, "_is_pid_running", return_value=True):
            controller.start_bot()

        assert controller.LOCK_FILE_PATH.exists()

        # Verify lock file contains correct PID
        with open(controller.LOCK_FILE_PATH, "r") as f:
            stored_pid = int(f.read().strip())
        assert stored_pid == 12345

    def test_start_bot_fails_when_already_running(self, controller, mock_subprocess):
        """Test starting bot fails with conflict when already running."""
        mock_popen, mock_process = mock_subprocess

        # Start the bot first
        with patch.object(controller, "_is_pid_running", return_value=True):
            controller.start_bot()

            # Try to start again
            result = controller.start_bot()

        assert result["success"] is False
        assert result["error"] == "conflict"
        assert "already running" in result["message"].lower()

    def test_start_bot_with_configuration(self, controller, mock_subprocess):
        """Test starting bot with custom configuration."""
        mock_popen, mock_process = mock_subprocess

        with patch.object(controller, "_is_pid_running", return_value=True):
            result = controller.start_bot(
                strategy="Test Strategy",
                pairs=["EURUSD", "GBPJPY"],
                timeframe="H1"
            )

        assert result["success"] is True
        # Configuration is passed but currently ignored (for future use)


class TestBotControllerStop:
    """Test cases for stopping the bot."""

    def test_stop_bot_when_not_running(self, controller):
        """Test stopping bot when not running returns error."""
        result = controller.stop_bot()

        assert result["success"] is False
        assert result["error"] == "not_running"
        assert "not running" in result["message"].lower()

    def test_stop_bot_success(self, controller, mock_subprocess):
        """Test stopping bot gracefully."""
        mock_popen, mock_process = mock_subprocess

        # Start the bot first
        with patch.object(controller, "_is_pid_running", return_value=True):
            controller.start_bot()

        # Stop the bot
        with patch.object(controller, "_is_pid_running", side_effect=[True, False, False]):
            with patch("core.bot_controller.os.kill") as mock_kill:
                with patch("core.bot_controller.time.sleep"):
                    with patch("core.bot_controller.time.time", side_effect=[0, 0, 10]):
                        result = controller.stop_bot()

        assert result["success"] is True
        assert result["status"] == "stopped"
        mock_kill.assert_called_with(12345, signal.SIGTERM)

    def test_stop_bot_force_kill(self, controller, mock_subprocess):
        """Test stopping bot with force flag uses SIGKILL."""
        mock_popen, mock_process = mock_subprocess

        # Start the bot first
        with patch.object(controller, "_is_pid_running", return_value=True):
            controller.start_bot()

        # Force stop the bot
        with patch.object(controller, "_is_pid_running", side_effect=[True, False]):
            with patch("core.bot_controller.os.kill") as mock_kill:
                result = controller.stop_bot(force=True)

        assert result["success"] is True
        mock_kill.assert_called_with(12345, signal.SIGKILL)

    def test_stop_bot_removes_lock_file(self, controller, mock_subprocess):
        """Test that stopping bot removes lock file."""
        mock_popen, mock_process = mock_subprocess

        # Start the bot first
        with patch.object(controller, "_is_pid_running", return_value=True):
            controller.start_bot()

        assert controller.LOCK_FILE_PATH.exists()

        # Stop the bot
        with patch.object(controller, "_is_pid_running", side_effect=[True, False, False]):
            with patch("core.bot_controller.os.kill"):
                with patch("core.bot_controller.time.sleep"):
                    with patch("core.bot_controller.time.time", side_effect=[0, 0, 10]):
                        controller.stop_bot()

        assert not controller.LOCK_FILE_PATH.exists()


class TestBotControllerRestart:
    """Test cases for restarting the bot."""

    def test_restart_bot_when_running(self, controller, mock_subprocess):
        """Test restarting bot when already running."""
        mock_popen, mock_process = mock_subprocess

        # Start the bot first
        with patch.object(controller, "_is_pid_running", return_value=True):
            controller.start_bot()

        # Restart - need to handle multiple calls to _is_pid_running
        # 1. is_running() check in restart_bot
        # 2. is_running() check in stop_bot
        # 3. loop check in stop_bot (process stopped)
        # 4. _is_pid_running check after SIGTERM (process stopped)
        # 5. is_running() check before start_bot
        # 6. _is_pid_running check in start_bot success
        is_running_sequence = [
            True,   # is_running() in restart_bot
            True,   # is_running() in stop_bot
            False,  # loop check after SIGTERM - process is stopped
            False,  # is_running() before start (but already stopped via cleanup)
            True,   # after starting new process
        ]
        with patch.object(controller, "_is_pid_running", side_effect=is_running_sequence):
            with patch("core.bot_controller.os.kill"):
                with patch("core.bot_controller.time.sleep"):
                    with patch("core.bot_controller.time.time", side_effect=[0, 0, 10]):
                        result = controller.restart_bot()

        assert result["success"] is True
        assert "restart" in result["message"].lower()

    def test_restart_bot_when_not_running(self, controller, mock_subprocess):
        """Test restarting bot when not running just starts it."""
        mock_popen, mock_process = mock_subprocess

        with patch.object(controller, "_is_pid_running", return_value=True):
            result = controller.restart_bot()

        assert result["success"] is True
        # Should start since it wasn't running


class TestBotControllerLockFile:
    """Test cases for lock file handling."""

    def test_stale_lock_cleanup(self, controller):
        """Test that stale lock files are cleaned up."""
        # Create a stale lock file with non-existent PID
        controller.LOCK_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(controller.LOCK_FILE_PATH, "w") as f:
            f.write("99999999")  # Non-existent PID

        # Check stale lock
        controller._check_stale_lock()

        # Lock file should be removed
        assert not controller.LOCK_FILE_PATH.exists()

    def test_recover_running_process(self, controller):
        """Test recovering state from lock file with running process."""
        # Get current process PID (which is running)
        current_pid = os.getpid()

        # Create lock file with current PID
        controller.LOCK_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(controller.LOCK_FILE_PATH, "w") as f:
            f.write(str(current_pid))

        # Check stale lock - should recover state
        controller._check_stale_lock()

        assert controller._pid == current_pid
        assert controller._status == "running"

        # Cleanup
        controller._cleanup_lock()
        controller._pid = None
        controller._status = "stopped"


class TestBotControllerHealthCheck:
    """Test cases for bot health checking."""

    def test_check_health_when_stopped(self, controller):
        """Test health check returns False when stopped."""
        assert controller.check_health() is False

    def test_check_health_when_running(self, controller, mock_subprocess):
        """Test health check returns True when running."""
        mock_popen, mock_process = mock_subprocess

        with patch.object(controller, "_is_pid_running", return_value=True):
            controller.start_bot()
            assert controller.check_health() is True

    def test_check_health_detects_crashed_process(self, controller, mock_subprocess):
        """Test health check detects when process has crashed."""
        mock_popen, mock_process = mock_subprocess
        mock_process.poll.return_value = 1  # Process has terminated

        with patch.object(controller, "_is_pid_running", return_value=True):
            controller.start_bot()

        with patch.object(controller, "_is_pid_running", return_value=False):
            # Health check should detect crash and clean up
            assert controller.check_health() is False
            assert controller._status == "stopped"
