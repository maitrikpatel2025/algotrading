"""
Tests for Trades API Endpoints
==============================
Unit tests for the open trades and trade history endpoints.
"""

from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from server import app


def create_mock_price(name, bid, ask):
    """Helper to create mock price objects with proper name attribute."""
    mock = MagicMock()
    mock.name = name
    mock.bid = bid
    mock.ask = ask
    return mock


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


class TestOpenTradesEndpoint:
    """Test cases for GET /api/trades/open endpoint."""

    def test_open_trades_success_with_trades(self, client):
        """Test successful response with open trades including enhanced fields."""
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
                side="Buy",
                open_time=datetime(2024, 1, 15, 10, 30, 0),
                comment="TestBot",
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
                side="Sell",
                open_time=datetime(2024, 1, 15, 9, 0, 0),
                comment="",
            ),
        ]

        mock_prices = [
            create_mock_price("EURUSD", 1.1060, 1.1062),
            create_mock_price("GBPUSD", 1.2490, 1.2492),
        ]

        with patch("server.api.get_open_trades", return_value=mock_trades):
            with patch("server.api.get_prices", return_value=mock_prices):
                response = client.get("/api/trades/open")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        assert len(data["trades"]) == 2
        assert data["trades"][0]["instrument"] == "EURUSD"
        assert data["trades"][0]["unrealized_pl"] == 25.50
        # Check enhanced fields
        assert data["trades"][0]["current_price"] == 1.1060  # bid for long
        assert data["trades"][0]["pips_pl"] == 10.0  # (1.1060 - 1.1050) * 10000
        assert data["trades"][0]["bot_name"] == "TestBot"
        assert data["trades"][0]["duration_seconds"] is not None
        assert data["error"] is None

    def test_open_trades_success_empty(self, client):
        """Test successful response with no open trades."""
        with patch("server.api.get_open_trades", return_value=[]):
            with patch("server.api.get_prices", return_value=[]):
                response = client.get("/api/trades/open")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert len(data["trades"]) == 0
        assert data["error"] is None

    def test_open_trades_with_jpy_pair(self, client):
        """Test P/L pips calculation for JPY pairs (pip at 0.01)."""
        mock_trades = [
            MagicMock(
                id=1,
                instrument="USDJPY",
                price=149.50,
                initialAmount=10000,
                unrealizedPL=50.0,
                marginUsed=100.0,
                stop_loss=149.00,
                take_profit=150.00,
                side="Buy",
                open_time=datetime(2024, 1, 15, 10, 0, 0),
                comment="",
            ),
        ]

        mock_prices = [create_mock_price("USDJPY", 149.70, 149.72)]

        with patch("server.api.get_open_trades", return_value=mock_trades):
            with patch("server.api.get_prices", return_value=mock_prices):
                response = client.get("/api/trades/open")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 1
        # For JPY pairs, pip = 0.01, so (149.70 - 149.50) * 100 = 20 pips
        assert data["trades"][0]["pips_pl"] == 20.0

    def test_open_trades_without_current_prices(self, client):
        """Test response when current prices are unavailable."""
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
                side="Buy",
                open_time=datetime(2024, 1, 15, 10, 0, 0),
                comment="",
            ),
        ]

        with patch("server.api.get_open_trades", return_value=mock_trades):
            with patch("server.api.get_prices", return_value=None):
                response = client.get("/api/trades/open")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 1
        # current_price and pips_pl should be None when prices unavailable
        assert data["trades"][0]["current_price"] is None
        assert data["trades"][0]["pips_pl"] is None

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


class TestCloseTradeEndpoint:
    """Test cases for POST /api/trades/{trade_id}/close endpoint."""

    def test_close_trade_success(self, client):
        """Test successful trade close."""
        mock_trade = MagicMock(
            id=1,
            instrument="EURUSD",
            price=1.1050,
            initialAmount=10000,
            unrealizedPL=25.50,
            marginUsed=100.0,
            side="Buy",
        )

        mock_prices = [create_mock_price("EURUSD", 1.1070, 1.1072)]

        with patch("server.api.get_open_trade", return_value=mock_trade):
            with patch("server.api.get_prices", return_value=mock_prices):
                with patch("server.api.close_trade", return_value=True):
                    response = client.post("/api/trades/1/close")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["trade_id"] == 1
        assert data["closed_price"] == 1.1070  # bid for long position
        assert data["realized_pl"] == 25.50
        assert "successfully" in data["message"]
        assert data["error"] is None

    def test_close_trade_not_found(self, client):
        """Test close trade when trade doesn't exist."""
        with patch("server.api.get_open_trade", return_value=None):
            response = client.post("/api/trades/999/close")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["trade_id"] == 999
        assert "not found" in data["message"]
        assert data["error"] is not None

    def test_close_trade_broker_rejection(self, client):
        """Test close trade when broker rejects the request."""
        mock_trade = MagicMock(
            id=1,
            instrument="EURUSD",
            price=1.1050,
            initialAmount=10000,
            unrealizedPL=25.50,
            marginUsed=100.0,
            side="Buy",
        )

        mock_prices = [create_mock_price("EURUSD", 1.1070, 1.1072)]

        with patch("server.api.get_open_trade", return_value=mock_trade):
            with patch("server.api.get_prices", return_value=mock_prices):
                with patch("server.api.close_trade", return_value=False):
                    response = client.post("/api/trades/1/close")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["trade_id"] == 1
        assert "Failed" in data["message"]
        assert "rejected" in data["error"]

    def test_close_trade_exception_handling(self, client):
        """Test error handling when an exception occurs during close."""
        with patch("server.api.get_open_trade", side_effect=Exception("Connection error")):
            response = client.post("/api/trades/1/close")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["trade_id"] == 1
        assert "Connection error" in data["error"]

    def test_close_short_position(self, client):
        """Test closing a short position uses ask price."""
        mock_trade = MagicMock(
            id=2,
            instrument="GBPUSD",
            price=1.2500,
            initialAmount=-5000,  # Negative for short
            unrealizedPL=15.0,
            marginUsed=50.0,
            side="Sell",
        )

        mock_prices = [create_mock_price("GBPUSD", 1.2480, 1.2482)]

        with patch("server.api.get_open_trade", return_value=mock_trade):
            with patch("server.api.get_prices", return_value=mock_prices):
                with patch("server.api.close_trade", return_value=True):
                    response = client.post("/api/trades/2/close")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["closed_price"] == 1.2482  # ask for short position
