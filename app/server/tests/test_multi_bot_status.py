"""
Tests for Multi-Bot Status API Endpoint
=======================================
Unit tests for the multi-bot status endpoint and BotStatusTracker methods.
"""

import pytest
from fastapi.testclient import TestClient

from core.bot_controller import BotController
from core.bot_status import bot_status_tracker
from core.data_models import AllBotsStatusResponse
from server import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def reset_tracker():
    """Reset the bot status tracker and controller to default state before each test."""
    # Reset the bot controller singleton
    BotController._instance = None

    # Store original bots
    original_bots = bot_status_tracker._bots.copy()

    # Clear bots for clean test state
    bot_status_tracker._bots = {}
    bot_status_tracker._bots_last_updated = None

    yield

    # Restore original bots after test
    bot_status_tracker._bots = original_bots
    BotController._instance = None


class TestAllBotsStatusEndpoint:
    """Test cases for GET /api/bots/status endpoint."""

    def test_all_bots_status_returns_empty_list(self, client, reset_tracker):
        """Test that all bots status returns empty list when no bots registered."""
        response = client.get("/api/bots/status")

        assert response.status_code == 200
        data = response.json()
        assert data["bots"] == []
        assert data["count"] == 0
        assert data["last_updated"] is not None

    def test_all_bots_status_returns_registered_bots(self, client, reset_tracker):
        """Test that all bots status returns registered bots."""
        # Register some test bots
        bot_status_tracker.register_bot("bot_1", "Test Bot 1", "EURUSD")
        bot_status_tracker.register_bot("bot_2", "Test Bot 2", "GBPJPY")

        response = client.get("/api/bots/status")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        assert len(data["bots"]) == 2

        bot_ids = [bot["id"] for bot in data["bots"]]
        assert "bot_1" in bot_ids
        assert "bot_2" in bot_ids

    def test_all_bots_status_response_structure(self, client, reset_tracker):
        """Test that all bots status response has correct structure."""
        bot_status_tracker.register_bot("bot_test", "Test Bot", "EURUSD", "Test Strategy")

        response = client.get("/api/bots/status")

        assert response.status_code == 200
        data = response.json()

        # Check top-level structure
        assert "bots" in data
        assert "count" in data
        assert "last_updated" in data

        # Check bot instance structure
        bot = data["bots"][0]
        expected_fields = [
            "id",
            "name",
            "status",
            "currency_pair",
            "current_pnl",
            "open_position",
            "last_activity",
            "strategy_name",
            "error_message",
        ]
        for field in expected_fields:
            assert field in bot, f"Missing field: {field}"


class TestBotStatusTrackerMultiBotMethods:
    """Test cases for BotStatusTracker multi-bot methods."""

    def test_register_bot(self, reset_tracker):
        """Test registering a new bot."""
        bot = bot_status_tracker.register_bot("bot_new", "New Bot", "EURUSD", "My Strategy")

        assert bot.id == "bot_new"
        assert bot.name == "New Bot"
        assert bot.currency_pair == "EURUSD"
        assert bot.strategy_name == "My Strategy"
        assert bot.status == "stopped"
        assert bot.current_pnl is None
        assert bot.open_position is None

    def test_register_bot_default_strategy(self, reset_tracker):
        """Test registering a bot with default strategy."""
        bot = bot_status_tracker.register_bot("bot_default", "Default Bot", "GBPUSD")

        assert bot.strategy_name == "Bollinger Bands Strategy"

    def test_get_all_bots(self, reset_tracker):
        """Test getting all bots."""
        bot_status_tracker.register_bot("bot_a", "Bot A", "EURUSD")
        bot_status_tracker.register_bot("bot_b", "Bot B", "GBPJPY")

        result = bot_status_tracker.get_all_bots()

        assert isinstance(result, AllBotsStatusResponse)
        assert result.count == 2
        assert len(result.bots) == 2
        assert result.last_updated is not None

    def test_update_bot_status(self, reset_tracker):
        """Test updating bot status."""
        bot_status_tracker.register_bot("bot_status_test", "Status Test", "EURUSD")

        # Update to running
        updated = bot_status_tracker.update_bot_status("bot_status_test", "running")
        assert updated is not None
        assert updated.status == "running"
        assert updated.error_message is None

        # Update to error with message
        updated = bot_status_tracker.update_bot_status(
            "bot_status_test", "error", "Connection failed"
        )
        assert updated.status == "error"
        assert updated.error_message == "Connection failed"

    def test_update_bot_status_nonexistent(self, reset_tracker):
        """Test updating status of nonexistent bot returns None."""
        result = bot_status_tracker.update_bot_status("nonexistent", "running")
        assert result is None

    def test_update_bot_pnl(self, reset_tracker):
        """Test updating bot P/L."""
        bot_status_tracker.register_bot("bot_pnl_test", "PNL Test", "EURUSD")

        updated = bot_status_tracker.update_bot_pnl("bot_pnl_test", 150.75)

        assert updated is not None
        assert updated.current_pnl == 150.75
        assert updated.last_activity is not None

    def test_update_bot_pnl_negative(self, reset_tracker):
        """Test updating bot P/L with negative value."""
        bot_status_tracker.register_bot("bot_pnl_neg", "PNL Neg", "EURUSD")

        updated = bot_status_tracker.update_bot_pnl("bot_pnl_neg", -50.25)

        assert updated.current_pnl == -50.25

    def test_update_bot_pnl_nonexistent(self, reset_tracker):
        """Test updating P/L of nonexistent bot returns None."""
        result = bot_status_tracker.update_bot_pnl("nonexistent", 100.0)
        assert result is None

    def test_update_bot_position(self, reset_tracker):
        """Test updating bot position."""
        bot_status_tracker.register_bot("bot_pos_test", "Position Test", "EURUSD")
        position = {"side": "long", "amount": 10000, "entry_price": 1.0850}

        updated = bot_status_tracker.update_bot_position("bot_pos_test", position)

        assert updated is not None
        assert updated.open_position == position
        assert updated.last_activity is not None

    def test_update_bot_position_clear(self, reset_tracker):
        """Test clearing bot position."""
        bot_status_tracker.register_bot("bot_pos_clear", "Position Clear", "EURUSD")
        bot_status_tracker.update_bot_position(
            "bot_pos_clear", {"side": "long", "amount": 10000}
        )

        # Clear position
        updated = bot_status_tracker.update_bot_position("bot_pos_clear", None)

        assert updated.open_position is None

    def test_update_bot_position_nonexistent(self, reset_tracker):
        """Test updating position of nonexistent bot returns None."""
        result = bot_status_tracker.update_bot_position("nonexistent", {"side": "long"})
        assert result is None

    def test_get_bot(self, reset_tracker):
        """Test getting a specific bot."""
        bot_status_tracker.register_bot("bot_get", "Get Bot", "EURUSD")

        bot = bot_status_tracker.get_bot("bot_get")

        assert bot is not None
        assert bot.id == "bot_get"
        assert bot.name == "Get Bot"

    def test_get_bot_nonexistent(self, reset_tracker):
        """Test getting nonexistent bot returns None."""
        bot = bot_status_tracker.get_bot("nonexistent")
        assert bot is None

    def test_remove_bot(self, reset_tracker):
        """Test removing a bot."""
        bot_status_tracker.register_bot("bot_remove", "Remove Bot", "EURUSD")
        assert bot_status_tracker.get_bot("bot_remove") is not None

        result = bot_status_tracker.remove_bot("bot_remove")

        assert result is True
        assert bot_status_tracker.get_bot("bot_remove") is None

    def test_remove_bot_nonexistent(self, reset_tracker):
        """Test removing nonexistent bot returns False."""
        result = bot_status_tracker.remove_bot("nonexistent")
        assert result is False


class TestMultiBotStatusIntegration:
    """Integration tests for multi-bot functionality."""

    def test_full_bot_lifecycle(self, client, reset_tracker):
        """Test complete bot lifecycle through API."""
        # Register bots
        bot_status_tracker.register_bot("bot_lifecycle", "Lifecycle Bot", "EURUSD")

        # Check initial state
        response = client.get("/api/bots/status")
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 1
        bot = data["bots"][0]
        assert bot["status"] == "stopped"
        assert bot["current_pnl"] is None

        # Update to running
        bot_status_tracker.update_bot_status("bot_lifecycle", "running")

        # Update P/L
        bot_status_tracker.update_bot_pnl("bot_lifecycle", 100.50)

        # Update position
        bot_status_tracker.update_bot_position(
            "bot_lifecycle", {"side": "long", "amount": 5000}
        )

        # Verify updates
        response = client.get("/api/bots/status")
        data = response.json()
        bot = data["bots"][0]
        assert bot["status"] == "running"
        assert bot["current_pnl"] == 100.50
        assert bot["open_position"]["side"] == "long"

    def test_multiple_bots_different_statuses(self, client, reset_tracker):
        """Test multiple bots with different statuses."""
        # Register bots with different statuses
        bot_status_tracker.register_bot("bot_running", "Running Bot", "EURUSD")
        bot_status_tracker.register_bot("bot_paused", "Paused Bot", "GBPJPY")
        bot_status_tracker.register_bot("bot_stopped", "Stopped Bot", "USDJPY")
        bot_status_tracker.register_bot("bot_error", "Error Bot", "AUDUSD")

        bot_status_tracker.update_bot_status("bot_running", "running")
        bot_status_tracker.update_bot_status("bot_paused", "paused")
        bot_status_tracker.update_bot_status("bot_error", "error", "API connection lost")

        response = client.get("/api/bots/status")
        data = response.json()

        assert data["count"] == 4

        # Create a dict for easier assertion
        bots_by_id = {bot["id"]: bot for bot in data["bots"]}

        assert bots_by_id["bot_running"]["status"] == "running"
        assert bots_by_id["bot_paused"]["status"] == "paused"
        assert bots_by_id["bot_stopped"]["status"] == "stopped"
        assert bots_by_id["bot_error"]["status"] == "error"
        assert bots_by_id["bot_error"]["error_message"] == "API connection lost"
