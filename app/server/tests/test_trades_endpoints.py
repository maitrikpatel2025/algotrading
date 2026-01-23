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
                take_profit=1.1100,
            ),
            MagicMock(
                id=2,
                instrument="GBPUSD",
                price=1.2500,
                initialAmount=-5000,
                unrealizedPL=-10.0,
                marginUsed=50.0,
                stop_loss=0,
                take_profit=0,
            ),
        ]

        with patch("server.api.get_open_trades", return_value=mock_trades):
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
        with patch("server.api.get_open_trades", return_value=[]):
            response = client.get("/api/trades/open")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert len(data["trades"]) == 0
        assert data["error"] is None

    def test_open_trades_api_returns_none(self, client):
        """Test response when API returns None."""
        with patch("server.api.get_open_trades", return_value=None):
            response = client.get("/api/trades/open")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert len(data["trades"]) == 0
        assert data["error"] == "Failed to fetch open trades"

    def test_open_trades_exception_handling(self, client):
        """Test error handling when an exception occurs."""
        with patch("server.api.get_open_trades", side_effect=Exception("Connection error")):
            response = client.get("/api/trades/open")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert len(data["trades"]) == 0
        assert "Connection error" in data["error"]


class TestTradeHistoryEndpoint:
    """Test cases for GET /api/trades/history endpoint."""

    def test_trade_history_success_with_trades(self, client):
        """Test successful response with trade history from FXOpen API."""
        mock_history = {
            "IsLastReport": True,
            "TotalReports": 2,
            "LastId": "abc123",
            "Records": [
                {
                    "Id": "record1",
                    "TransactionType": "OrderFilled",
                    "TransactionReason": "ClientRequest",
                    "TransactionTimestamp": 1704153600000,
                    "Symbol": "EURUSD",
                    "TradeId": 769002,
                    "TradeSide": "Buy",
                    "TradeType": "Market",
                    "TradeAmount": 10000,
                    "TradePrice": 1.1050,
                    "PositionClosePrice": 1.1100,
                    "BalanceMovement": 50.0,
                    "Commission": -2.5,
                    "Swap": -1.0,
                },
                {
                    "Id": "record2",
                    "TransactionType": "OrderFilled",
                    "TransactionReason": "ClientRequest",
                    "TransactionTimestamp": 1704067200000,
                    "Symbol": "GBPUSD",
                    "TradeId": 769003,
                    "TradeSide": "Sell",
                    "TradeType": "Market",
                    "TradeAmount": 5000,
                    "TradePrice": 1.2500,
                    "PositionClosePrice": 1.2450,
                    "BalanceMovement": 25.0,
                },
            ],
        }

        with patch("server.api.get_trade_history", return_value=mock_history):
            response = client.get("/api/trades/history")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        assert len(data["trades"]) == 2
        assert data["trades"][0]["instrument"] == "EURUSD"
        assert data["trades"][0]["side"] == "Buy"
        assert data["trades"][0]["realized_pl"] == 50.0
        assert data["error"] is None

    def test_trade_history_success_empty(self, client):
        """Test successful response with no trade history."""
        mock_history = {"IsLastReport": True, "TotalReports": 0, "LastId": None, "Records": []}

        with patch("server.api.get_trade_history", return_value=mock_history):
            response = client.get("/api/trades/history")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert len(data["trades"]) == 0
        assert "0 trade history records" in data["message"]

    def test_trade_history_api_returns_none(self, client):
        """Test response when API returns None."""
        with patch("server.api.get_trade_history", return_value=None):
            response = client.get("/api/trades/history")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert len(data["trades"]) == 0
        assert "Unable to fetch" in data["message"]

    def test_trade_history_with_custom_timestamps(self, client):
        """Test trade history with custom timestamp range."""
        mock_history = {
            "IsLastReport": True,
            "TotalReports": 1,
            "Records": [
                {
                    "Id": "record1",
                    "TransactionType": "OrderFilled",
                    "TransactionTimestamp": 1704153600000,
                    "Symbol": "EURUSD",
                    "TradeId": 769002,
                    "TradeSide": "Buy",
                    "TradeType": "Market",
                    "TradeAmount": 10000,
                    "TradePrice": 1.1050,
                }
            ],
        }

        with patch("server.api.get_trade_history", return_value=mock_history):
            response = client.get(
                "/api/trades/history?timestamp_from=1704067200000&timestamp_to=1704153600000"
            )

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 1
        assert len(data["trades"]) == 1

    def test_trade_history_exception_handling(self, client):
        """Test error handling when an exception occurs."""
        with patch("server.api.get_trade_history", side_effect=Exception("Connection error")):
            response = client.get("/api/trades/history")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert len(data["trades"]) == 0
        assert "Connection error" in data["error"]

    def test_trade_history_response_structure(self, client):
        """Test trade history response has correct structure."""
        mock_history = {"Records": []}
        with patch("server.api.get_trade_history", return_value=mock_history):
            response = client.get("/api/trades/history")

        assert response.status_code == 200
        data = response.json()
        assert "trades" in data
        assert "count" in data
        assert "message" in data
        assert "error" in data
        assert isinstance(data["trades"], list)
        assert isinstance(data["count"], int)
