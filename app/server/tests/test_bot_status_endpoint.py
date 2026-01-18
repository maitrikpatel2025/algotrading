"""
Tests for Bot Status API Endpoint
=================================
Unit tests for the trading bot status endpoint.
"""

from datetime import datetime
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from core.bot_status import BotStatusTracker, bot_status_tracker
from core.data_models import ActiveStrategy, MonitoredPair
from server import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def reset_tracker():
    """Reset the bot status tracker to default state before each test."""
    bot_status_tracker.set_stopped()
    bot_status_tracker._signals_today = 0
    bot_status_tracker._trades_today = 0
    bot_status_tracker._last_signal_time = None
    bot_status_tracker._last_signal_pair = None
    bot_status_tracker._last_signal_type = None
    bot_status_tracker._error_message = None
    yield
    # Cleanup after test
    bot_status_tracker.set_stopped()


class TestBotStatusEndpoint:
    """Test cases for GET /api/bot/status endpoint."""

    def test_bot_status_returns_default_stopped_state(self, client, reset_tracker):
        """Test that bot status returns stopped state by default."""
        response = client.get("/api/bot/status")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "stopped"
        assert data["started_at"] is None
        assert data["uptime_seconds"] is None
        assert data["signals_today"] == 0
        assert data["trades_today"] == 0
        assert data["error_message"] is None

    def test_bot_status_running_state(self, client, reset_tracker):
        """Test bot status when bot is running."""
        bot_status_tracker.set_running("Test Strategy", "A test trading strategy")

        response = client.get("/api/bot/status")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert data["started_at"] is not None
        assert data["uptime_seconds"] is not None
        assert data["uptime_seconds"] >= 0
        assert data["active_strategy"] is not None
        assert data["active_strategy"]["name"] == "Test Strategy"
        assert data["active_strategy"]["description"] == "A test trading strategy"

    def test_bot_status_paused_state(self, client, reset_tracker):
        """Test bot status when bot is paused."""
        bot_status_tracker.set_running("Test Strategy", "A test strategy")
        bot_status_tracker.set_paused()

        response = client.get("/api/bot/status")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "paused"
        assert data["error_message"] is None

    def test_bot_status_error_state(self, client, reset_tracker):
        """Test bot status when bot is in error state."""
        error_msg = "Connection to exchange lost"
        bot_status_tracker.set_error(error_msg)

        response = client.get("/api/bot/status")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "error"
        assert data["error_message"] == error_msg

    def test_bot_status_with_monitored_pairs(self, client, reset_tracker):
        """Test bot status includes monitored pairs."""
        pairs = [
            MonitoredPair(symbol="EURUSD", timeframe="H1", is_active=True),
            MonitoredPair(symbol="GBPJPY", timeframe="M15", is_active=True),
        ]
        bot_status_tracker.set_monitored_pairs(pairs)

        response = client.get("/api/bot/status")

        assert response.status_code == 200
        data = response.json()
        assert len(data["monitored_pairs"]) == 2
        assert data["monitored_pairs"][0]["symbol"] == "EURUSD"
        assert data["monitored_pairs"][0]["timeframe"] == "H1"
        assert data["monitored_pairs"][1]["symbol"] == "GBPJPY"

    def test_bot_status_with_active_strategy(self, client, reset_tracker):
        """Test bot status includes active strategy details."""
        bot_status_tracker.set_running(
            "Bollinger Bands Strategy",
            "Mean reversion strategy using Bollinger Bands"
        )

        response = client.get("/api/bot/status")

        assert response.status_code == 200
        data = response.json()
        assert data["active_strategy"] is not None
        assert data["active_strategy"]["name"] == "Bollinger Bands Strategy"
        assert "Bollinger Bands" in data["active_strategy"]["description"]

    def test_bot_status_uptime_calculation(self, client, reset_tracker):
        """Test that uptime is calculated correctly."""
        bot_status_tracker.set_running("Test", "Test strategy")

        # First request
        response1 = client.get("/api/bot/status")
        uptime1 = response1.json()["uptime_seconds"]

        # Small delay (implicit in test execution)
        response2 = client.get("/api/bot/status")
        uptime2 = response2.json()["uptime_seconds"]

        assert uptime1 is not None
        assert uptime2 is not None
        assert uptime2 >= uptime1

    def test_bot_status_signal_recording(self, client, reset_tracker):
        """Test that signals are recorded correctly."""
        bot_status_tracker.set_running("Test", "Test")
        bot_status_tracker.record_signal("EURUSD", "BUY")
        bot_status_tracker.record_signal("GBPJPY", "SELL")

        response = client.get("/api/bot/status")

        assert response.status_code == 200
        data = response.json()
        assert data["signals_today"] == 2
        assert data["last_signal_pair"] == "GBPJPY"
        assert data["last_signal_type"] == "SELL"
        assert data["last_signal_time"] is not None

    def test_bot_status_trade_recording(self, client, reset_tracker):
        """Test that trades are recorded correctly."""
        bot_status_tracker.record_trade()
        bot_status_tracker.record_trade()
        bot_status_tracker.record_trade()

        response = client.get("/api/bot/status")

        assert response.status_code == 200
        data = response.json()
        assert data["trades_today"] == 3

    def test_bot_status_daily_counter_reset(self, client, reset_tracker):
        """Test that daily counters can be reset."""
        bot_status_tracker.record_signal("EURUSD", "BUY")
        bot_status_tracker.record_trade()

        # Verify counts
        response1 = client.get("/api/bot/status")
        assert response1.json()["signals_today"] == 1
        assert response1.json()["trades_today"] == 1

        # Reset counters
        bot_status_tracker.reset_daily_counters()

        response2 = client.get("/api/bot/status")
        assert response2.json()["signals_today"] == 0
        assert response2.json()["trades_today"] == 0

    def test_bot_status_response_structure(self, client, reset_tracker):
        """Test that bot status response has correct structure."""
        response = client.get("/api/bot/status")

        assert response.status_code == 200
        data = response.json()

        # Check all expected fields are present
        expected_fields = [
            "status",
            "started_at",
            "uptime_seconds",
            "last_heartbeat",
            "last_signal_time",
            "last_signal_pair",
            "last_signal_type",
            "monitored_pairs",
            "active_strategy",
            "signals_today",
            "trades_today",
            "error_message",
        ]

        for field in expected_fields:
            assert field in data, f"Missing field: {field}"

        # Check types
        assert isinstance(data["status"], str)
        assert isinstance(data["monitored_pairs"], list)
        assert isinstance(data["signals_today"], int)
        assert isinstance(data["trades_today"], int)

    def test_bot_status_heartbeat_recording(self, client, reset_tracker):
        """Test that heartbeat is recorded."""
        bot_status_tracker.set_running("Test", "Test")

        response = client.get("/api/bot/status")

        assert response.status_code == 200
        data = response.json()
        assert data["last_heartbeat"] is not None


class TestBotStatusTrackerSingleton:
    """Test cases for BotStatusTracker singleton behavior."""

    def test_tracker_is_singleton(self):
        """Test that BotStatusTracker is a singleton."""
        tracker1 = BotStatusTracker()
        tracker2 = BotStatusTracker()

        assert tracker1 is tracker2

    def test_tracker_global_instance(self):
        """Test that global bot_status_tracker is same instance."""
        tracker = BotStatusTracker()
        assert tracker is bot_status_tracker
