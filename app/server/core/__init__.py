"""Core module for Forex Trading API."""

from .openfx_api import OpenFxApi
from .constants import SELL, BUY, NONE, TIMEFRAMES, DIRECTION_MAP
from .data_models import (
    HealthCheckResponse,
    AccountSummaryResponse,
    HeadlineItem,
    HeadlinesResponse,
    TradingOptionsResponse,
    TechnicalsResponse,
    PriceDataResponse,
    TradeRequest,
    TradeResponse,
    ErrorResponse,
)

__all__ = [
    # API Client
    "OpenFxApi",
    # Constants
    "SELL",
    "BUY", 
    "NONE",
    "TIMEFRAMES",
    "DIRECTION_MAP",
    # Data Models
    "HealthCheckResponse",
    "AccountSummaryResponse",
    "HeadlineItem",
    "HeadlinesResponse",
    "TradingOptionsResponse",
    "TechnicalsResponse",
    "PriceDataResponse",
    "TradeRequest",
    "TradeResponse",
    "ErrorResponse",
]