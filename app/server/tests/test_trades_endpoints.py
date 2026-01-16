"""
Tests for Trades API Endpoints
==============================
Unit tests for the open trades and trade history endpoints.
"""

from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from server import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


class TestOpenTradesEndpoint:
    """Test cases for GET /api/trades/open endpoint."""

    def test_open_trades_success_with_trades(self, client):
        """Test successful response with open trades."""
        mock_trades = [
            MagicMock(
                id=1,
                instrument="EURUSD",
                price=1.1050,
                initialAmount=10000,
                unrealizedPL=25.50,
                marginUsed=100.0,
                stop_loss=1.1000,
                take_profit=1.1100
            ),
            MagicMock(
                id=2,
                instrument="GBPUSD",
                price=1.2500,
                initialAmount=-5000,
                unrealizedPL=-10.0,
                marginUsed=50.0,
                stop_loss=0,
                take_profit=0
            ),
        ]

        with patch('server.api.get_open_trades', return_value=mock_trades):
            response = client.get("/api/trades/open")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        assert len(data["trades"]) == 2
        assert data["trades"][0]["instrument"] == "EURUSD"
        assert data["trades"][0]["unrealized_pl"] == 25.50
        assert data["error"] is None

    def test_open_trades_success_empty(self, client):
        """Test successful response with no open trades."""
        with patch('server.api.get_open_trades', return_value=[]):
            response = client.get("/api/trades/open")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert len(data["trades"]) == 0
        assert data["error"] is None

    def test_open_trades_api_returns_none(self, client):
        """Test response when API returns None."""
        with patch('server.api.get_open_trades', return_value=None):
            response = client.get("/api/trades/open")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert len(data["trades"]) == 0
        assert data["error"] == "Failed to fetch open trades"

    def test_open_trades_exception_handling(self, client):
        """Test error handling when an exception occurs."""
        with patch('server.api.get_open_trades', side_effect=Exception("Connection error")):
            response = client.get("/api/trades/open")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert len(data["trades"]) == 0
        assert "Connection error" in data["error"]


class TestTradeHistoryEndpoint:
    """Test cases for GET /api/trades/history endpoint."""

    def test_trade_history_returns_empty_with_message(self, client):
        """Test trade history endpoint returns empty response with message."""
        response = client.get("/api/trades/history")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert len(data["trades"]) == 0
        assert data["message"] is not None
        assert "not available" in data["message"].lower()
        assert data["error"] is None

    def test_trade_history_response_structure(self, client):
        """Test trade history response has correct structure."""
        response = client.get("/api/trades/history")

        assert response.status_code == 200
        data = response.json()
        assert "trades" in data
        assert "count" in data
        assert "message" in data
        assert "error" in data
        assert isinstance(data["trades"], list)
        assert isinstance(data["count"], int)
