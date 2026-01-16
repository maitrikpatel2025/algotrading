"""
Pydantic Data Models
====================
Request and response models for the Forex Trading API.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime


# =============================================================================
# Health Check Models
# =============================================================================

class HealthCheckResponse(BaseModel):
    """Health check response model."""
    status: Literal["ok", "error"]
    service: str = "forex-trading-api"
    version: str = "1.0.0"
    uptime_seconds: Optional[float] = None
    database_connected: Optional[bool] = None


# =============================================================================
# Account Models
# =============================================================================

class AccountSummaryResponse(BaseModel):
    """Trading account summary response."""
    balance: Optional[float] = None
    margin_used: Optional[float] = None
    margin_available: Optional[float] = None
    unrealized_pl: Optional[float] = None
    currency: Optional[str] = None
    raw_data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


# =============================================================================
# Headlines Models
# =============================================================================

class HeadlineItem(BaseModel):
    """Single headline item."""
    headline: str
    link: str


class HeadlinesResponse(BaseModel):
    """Market headlines response."""
    headlines: List[HeadlineItem] = []
    count: int = 0
    error: Optional[str] = None


# =============================================================================
# Trading Options Models
# =============================================================================

class OptionItem(BaseModel):
    """Single option item for dropdowns."""
    key: str
    text: str
    value: str


class TradingOptionsResponse(BaseModel):
    """Available trading options response."""
    pairs: List[OptionItem] = []
    granularities: List[OptionItem] = []
    error: Optional[str] = None


# =============================================================================
# Technical Analysis Models
# =============================================================================

class TechnicalIndicator(BaseModel):
    """Technical indicator data."""
    name: str
    value: Any
    signal: Optional[str] = None


class TechnicalsResponse(BaseModel):
    """Technical analysis response."""
    pair_name: Optional[str] = None
    time_frame: Optional[int] = None
    ti_buy: Optional[str] = None
    ti_sell: Optional[str] = None
    ma_buy: Optional[str] = None
    ma_sell: Optional[str] = None
    pivot: Optional[str] = None
    S1: Optional[str] = None
    S2: Optional[str] = None
    S3: Optional[str] = None
    R1: Optional[str] = None
    R2: Optional[str] = None
    R3: Optional[str] = None
    percent_bullish: Optional[str] = None
    percent_bearish: Optional[str] = None
    updated: Optional[datetime] = None
    error: Optional[str] = None


# =============================================================================
# Price Data Models
# =============================================================================

class CandleData(BaseModel):
    """Single candle data."""
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: Optional[float] = None


class PriceDataResponse(BaseModel):
    """Price/candlestick data response."""
    time: List[str] = []
    mid_o: List[float] = Field(default=[], description="Open prices")
    mid_h: List[float] = Field(default=[], description="High prices")
    mid_l: List[float] = Field(default=[], description="Low prices")
    mid_c: List[float] = Field(default=[], description="Close prices")
    candle_count: int = 0
    error: Optional[str] = None


# =============================================================================
# Instrument Models
# =============================================================================

class InstrumentInfo(BaseModel):
    """Trading instrument information."""
    symbol: str
    precision: int
    trade_amount_step: int
    pip_location: float
    display_name: str


class InstrumentsResponse(BaseModel):
    """Available instruments response."""
    instruments: List[InstrumentInfo] = []
    count: int = 0
    error: Optional[str] = None


# =============================================================================
# Trade Models
# =============================================================================

class TradeInfo(BaseModel):
    """Open trade information."""
    id: int
    instrument: str
    price: float
    initial_amount: int
    unrealized_pl: float
    margin_used: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None


class OpenTradesResponse(BaseModel):
    """Open trades response."""
    trades: List[TradeInfo] = []
    count: int = 0
    error: Optional[str] = None


class TradeRequest(BaseModel):
    """Trade placement request."""
    pair: str
    amount: int
    direction: Literal["buy", "sell"]
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None


class TradeResponse(BaseModel):
    """Trade placement response."""
    trade_id: Optional[int] = None
    success: bool = False
    message: str = ""
    error: Optional[str] = None


# =============================================================================
# Error Models
# =============================================================================

class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str
    error_code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
