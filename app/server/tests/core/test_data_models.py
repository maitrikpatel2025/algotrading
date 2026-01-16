"""
Tests for Pydantic Data Models
==============================
Unit tests for the data models module.
"""

import pytest
from datetime import datetime

from core.data_models import (
    HealthCheckResponse,
    HeadlineItem,
    HeadlinesResponse,
    TradingOptionsResponse,
    OptionItem,
    TechnicalsResponse,
    PriceDataResponse,
    TradeRequest,
    TradeResponse,
    ErrorResponse,
)


class TestHealthCheckResponse:
    """Test cases for HealthCheckResponse model."""
    
    def test_health_check_ok_status(self):
        """Test creating a healthy response."""
        response = HealthCheckResponse(
            status="ok",
            uptime_seconds=100.5
        )
        
        assert response.status == "ok"
        assert response.uptime_seconds == 100.5
        assert response.version == "1.0.0"
    
    def test_health_check_error_status(self):
        """Test creating an error response."""
        response = HealthCheckResponse(
            status="error",
            database_connected=False
        )
        
        assert response.status == "error"
        assert response.database_connected is False
    
    def test_health_check_default_values(self):
        """Test default values."""
        response = HealthCheckResponse(status="ok")
        
        assert response.service == "forex-trading-api"
        assert response.version == "1.0.0"


class TestHeadlinesModels:
    """Test cases for headline-related models."""
    
    def test_headline_item_creation(self):
        """Test creating a headline item."""
        item = HeadlineItem(
            headline="USD rises on strong jobs data",
            link="https://example.com/article"
        )
        
        assert item.headline == "USD rises on strong jobs data"
        assert item.link == "https://example.com/article"
    
    def test_headlines_response_with_items(self):
        """Test headlines response with data."""
        items = [
            HeadlineItem(headline="News 1", link="http://link1.com"),
            HeadlineItem(headline="News 2", link="http://link2.com"),
        ]
        
        response = HeadlinesResponse(
            headlines=items,
            count=2
        )
        
        assert len(response.headlines) == 2
        assert response.count == 2
        assert response.error is None
    
    def test_headlines_response_with_error(self):
        """Test headlines response with error."""
        response = HeadlinesResponse(
            headlines=[],
            count=0,
            error="Failed to fetch"
        )
        
        assert response.error == "Failed to fetch"
        assert len(response.headlines) == 0


class TestTradingOptionsResponse:
    """Test cases for trading options model."""
    
    def test_option_item_creation(self):
        """Test creating an option item."""
        item = OptionItem(key="EUR_USD", text="EUR/USD", value="EUR_USD")
        
        assert item.key == "EUR_USD"
        assert item.text == "EUR/USD"
        assert item.value == "EUR_USD"
    
    def test_trading_options_response(self):
        """Test trading options response."""
        pairs = [
            OptionItem(key="EUR_USD", text="EUR_USD", value="EUR_USD"),
            OptionItem(key="GBP_USD", text="GBP_USD", value="GBP_USD"),
        ]
        granularities = [
            OptionItem(key="H1", text="H1", value="H1"),
            OptionItem(key="D", text="D", value="D"),
        ]
        
        response = TradingOptionsResponse(
            pairs=pairs,
            granularities=granularities
        )
        
        assert len(response.pairs) == 2
        assert len(response.granularities) == 2


class TestPriceDataResponse:
    """Test cases for price data model."""
    
    def test_price_data_creation(self):
        """Test creating price data response."""
        response = PriceDataResponse(
            time=["2024-01-01 10:00", "2024-01-01 11:00"],
            mid_o=[1.1000, 1.1005],
            mid_h=[1.1010, 1.1015],
            mid_l=[1.0990, 1.0995],
            mid_c=[1.1005, 1.1010],
            candle_count=2
        )
        
        assert len(response.time) == 2
        assert response.candle_count == 2
        assert response.mid_o[0] == 1.1000
    
    def test_price_data_empty(self):
        """Test empty price data response."""
        response = PriceDataResponse()
        
        assert response.time == []
        assert response.candle_count == 0


class TestTradeModels:
    """Test cases for trade-related models."""
    
    def test_trade_request_buy(self):
        """Test creating a buy trade request."""
        request = TradeRequest(
            pair="EURUSD",
            amount=10000,
            direction="buy",
            stop_loss=1.0950,
            take_profit=1.1050
        )
        
        assert request.pair == "EURUSD"
        assert request.direction == "buy"
        assert request.amount == 10000
    
    def test_trade_request_sell(self):
        """Test creating a sell trade request."""
        request = TradeRequest(
            pair="GBPUSD",
            amount=5000,
            direction="sell"
        )
        
        assert request.direction == "sell"
        assert request.stop_loss is None
        assert request.take_profit is None
    
    def test_trade_response_success(self):
        """Test successful trade response."""
        response = TradeResponse(
            trade_id=12345,
            success=True,
            message="Trade placed successfully"
        )
        
        assert response.success is True
        assert response.trade_id == 12345
    
    def test_trade_response_failure(self):
        """Test failed trade response."""
        response = TradeResponse(
            success=False,
            message="Trade rejected",
            error="Insufficient margin"
        )
        
        assert response.success is False
        assert response.error == "Insufficient margin"


class TestErrorResponse:
    """Test cases for error response model."""
    
    def test_error_response_creation(self):
        """Test creating an error response."""
        response = ErrorResponse(
            detail="Resource not found",
            error_code="NOT_FOUND"
        )
        
        assert response.detail == "Resource not found"
        assert response.error_code == "NOT_FOUND"
        assert response.timestamp is not None
