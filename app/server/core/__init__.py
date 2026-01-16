"""Core module for Forex Trading API."""

from .constants import BUY, DIRECTION_MAP, NONE, SELL, TIMEFRAMES
from .data_models import (
    AccountSummaryResponse,
    ErrorResponse,
    HeadlineItem,
    HeadlinesResponse,
    HealthCheckResponse,
    PriceDataResponse,
    TechnicalsResponse,
    TradeRequest,
    TradeResponse,
    TradingOptionsResponse,
)
from .openfx_api import OpenFxApi

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
