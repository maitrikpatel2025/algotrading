"""
Tests for Bot Control API Endpoints
===================================
Unit tests for the bot control endpoints (start/stop/restart).
"""

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from core.bot_controller import BotController
from core.bot_status import bot_status_tracker
from server import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def reset_bot_state():
    """Reset bot controller and status tracker before each test."""
    # Reset the controller singleton
    BotController._instance = None

    # Reset status tracker
    bot_status_tracker.set_stopped()
    bot_status_tracker._signals_today = 0
    bot_status_tracker._trades_today = 0
    bot_status_tracker._error_message = None
    bot_status_tracker._pid = None

    yield

    # Cleanup after test
    BotController._instance = None
    bot_status_tracker.set_stopped()


class TestBotStartEndpoint:
    """Test cases for POST /api/bot/start endpoint."""

    def test_start_bot_returns_200_on_success(self, client, reset_bot_state):
        """Test that POST /api/bot/start returns 200 when bot starts successfully."""
        with patch("server.bot_controller") as mock_controller:
            mock_controller.start_bot.return_value = {
                "success": True,
                "message": "Bot started successfully with PID 12345",
                "status": "running",
                "pid": 12345,
            }

            response = client.post("/api/bot/start")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["status"] == "running"
        assert data["pid"] == 12345
        assert "successfully" in data["message"].lower()

    def test_start_bot_returns_409_when_already_running(self, client, reset_bot_state):
        """Test that POST /api/bot/start returns 409 when bot is already running."""
        with patch("server.bot_controller") as mock_controller:
            mock_controller.start_bot.return_value = {
                "success": False,
                "message": "Bot is already running",
                "status": "running",
                "pid": 12345,
                "error": "conflict",
            }

            response = client.post("/api/bot/start")

        assert response.status_code == 409
        assert "already running" in response.json()["detail"].lower()

    def test_start_bot_with_configuration(self, client, reset_bot_state):
        """Test that POST /api/bot/start accepts configuration parameters."""
        with patch("server.bot_controller") as mock_controller:
            mock_controller.start_bot.return_value = {
                "success": True,
                "message": "Bot started successfully",
                "status": "running",
                "pid": 12345,
            }

            response = client.post("/api/bot/start", json={
                "strategy": "Bollinger Bands Strategy",
                "pairs": ["EURUSD", "GBPJPY"],
                "timeframe": "H1"
            })

        assert response.status_code == 200
        mock_controller.start_bot.assert_called_once_with(
            strategy="Bollinger Bands Strategy",
            pairs=["EURUSD", "GBPJPY"],
            timeframe="H1"
        )

    def test_start_bot_with_no_body(self, client, reset_bot_state):
        """Test that POST /api/bot/start works with no request body."""
        with patch("server.bot_controller") as mock_controller:
            mock_controller.start_bot.return_value = {
                "success": True,
                "message": "Bot started successfully",
                "status": "running",
                "pid": 12345,
            }

            response = client.post("/api/bot/start")

        assert response.status_code == 200

    def test_start_bot_returns_500_on_internal_error(self, client, reset_bot_state):
        """Test that POST /api/bot/start returns 500 on internal error."""
        with patch("server.bot_controller") as mock_controller:
            mock_controller.start_bot.return_value = {
                "success": False,
                "message": "Failed to start bot: uv command not found",
                "status": "stopped",
                "error": "not_found",
            }

            response = client.post("/api/bot/start")

        assert response.status_code == 500


class TestBotStopEndpoint:
    """Test cases for POST /api/bot/stop endpoint."""

    def test_stop_bot_returns_200_on_success(self, client, reset_bot_state):
        """Test that POST /api/bot/stop returns 200 when bot stops successfully."""
        with patch("server.bot_controller") as mock_controller:
            mock_controller.stop_bot.return_value = {
                "success": True,
                "message": "Bot stopped successfully",
                "status": "stopped",
            }

            response = client.post("/api/bot/stop")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["status"] == "stopped"
        assert "successfully" in data["message"].lower()

    def test_stop_bot_returns_400_when_not_running(self, client, reset_bot_state):
        """Test that POST /api/bot/stop returns 400 when bot is not running."""
        with patch("server.bot_controller") as mock_controller:
            mock_controller.stop_bot.return_value = {
                "success": False,
                "message": "Bot is not running",
                "status": "stopped",
                "error": "not_running",
            }

            response = client.post("/api/bot/stop")

        assert response.status_code == 400
        assert "not running" in response.json()["detail"].lower()

    def test_stop_bot_returns_500_on_internal_error(self, client, reset_bot_state):
        """Test that POST /api/bot/stop returns 500 on internal error."""
        with patch("server.bot_controller") as mock_controller:
            mock_controller.stop_bot.return_value = {
                "success": False,
                "message": "Failed to stop bot: Permission denied",
                "status": "running",
                "error": "internal_error",
            }

            response = client.post("/api/bot/stop")

        assert response.status_code == 500


class TestBotRestartEndpoint:
    """Test cases for POST /api/bot/restart endpoint."""

    def test_restart_bot_returns_200_on_success(self, client, reset_bot_state):
        """Test that POST /api/bot/restart returns 200 on successful restart."""
        with patch("server.bot_controller") as mock_controller:
            mock_controller.restart_bot.return_value = {
                "success": True,
                "message": "Bot restarted successfully",
                "status": "running",
                "pid": 12346,
            }

            response = client.post("/api/bot/restart")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["status"] == "running"
        assert data["pid"] == 12346

    def test_restart_bot_with_configuration(self, client, reset_bot_state):
        """Test that POST /api/bot/restart accepts configuration parameters."""
        with patch("server.bot_controller") as mock_controller:
            mock_controller.restart_bot.return_value = {
                "success": True,
                "message": "Bot restarted successfully",
                "status": "running",
                "pid": 12346,
            }

            response = client.post("/api/bot/restart", json={
                "strategy": "New Strategy",
                "pairs": ["USDJPY"],
                "timeframe": "M15"
            })

        assert response.status_code == 200
        mock_controller.restart_bot.assert_called_once_with(
            strategy="New Strategy",
            pairs=["USDJPY"],
            timeframe="M15"
        )

    def test_restart_bot_returns_500_on_failure(self, client, reset_bot_state):
        """Test that POST /api/bot/restart returns 500 on failure."""
        with patch("server.bot_controller") as mock_controller:
            mock_controller.restart_bot.return_value = {
                "success": False,
                "message": "Failed to restart bot",
                "status": "error",
                "error": "internal_error",
            }

            response = client.post("/api/bot/restart")

        assert response.status_code == 500


class TestBotControlResponseStructure:
    """Test cases for verifying response structure."""

    def test_start_response_structure(self, client, reset_bot_state):
        """Test that start endpoint returns correct response structure."""
        with patch("server.bot_controller") as mock_controller:
            mock_controller.start_bot.return_value = {
                "success": True,
                "message": "Bot started",
                "status": "running",
                "pid": 12345,
            }

            response = client.post("/api/bot/start")

        data = response.json()
        assert "success" in data
        assert "message" in data
        assert "status" in data
        assert isinstance(data["success"], bool)
        assert isinstance(data["message"], str)
        assert isinstance(data["status"], str)

    def test_stop_response_structure(self, client, reset_bot_state):
        """Test that stop endpoint returns correct response structure."""
        with patch("server.bot_controller") as mock_controller:
            mock_controller.stop_bot.return_value = {
                "success": True,
                "message": "Bot stopped",
                "status": "stopped",
            }

            response = client.post("/api/bot/stop")

        data = response.json()
        assert "success" in data
        assert "message" in data
        assert "status" in data

    def test_restart_response_structure(self, client, reset_bot_state):
        """Test that restart endpoint returns correct response structure."""
        with patch("server.bot_controller") as mock_controller:
            mock_controller.restart_bot.return_value = {
                "success": True,
                "message": "Bot restarted",
                "status": "running",
                "pid": 12345,
            }

            response = client.post("/api/bot/restart")

        data = response.json()
        assert "success" in data
        assert "message" in data
        assert "status" in data


class TestBotStatusIntegration:
    """Test cases for bot status integration with control endpoints."""

    def test_start_updates_bot_status_tracker(self, client, reset_bot_state):
        """Test that successful start updates the bot status tracker."""
        with patch("server.bot_controller") as mock_controller:
            mock_controller.start_bot.return_value = {
                "success": True,
                "message": "Bot started",
                "status": "running",
                "pid": 12345,
            }

            client.post("/api/bot/start", json={
                "strategy": "Test Strategy"
            })

        # Check that status tracker was updated
        assert bot_status_tracker._status == "running"
        assert bot_status_tracker._active_strategy is not None
        assert bot_status_tracker._active_strategy.name == "Test Strategy"

    def test_stop_updates_bot_status_tracker(self, client, reset_bot_state):
        """Test that successful stop updates the bot status tracker."""
        # First set to running
        bot_status_tracker.set_running("Test", "Test strategy")

        with patch("server.bot_controller") as mock_controller:
            mock_controller.stop_bot.return_value = {
                "success": True,
                "message": "Bot stopped",
                "status": "stopped",
            }

            client.post("/api/bot/stop")

        # Check that status tracker was updated
        assert bot_status_tracker._status == "stopped"
        assert bot_status_tracker._active_strategy is None
