"""
Constants for Forex Trading API
================================
Defines trading constants and configuration values.
"""

# =============================================================================
# Trading Direction Constants
# =============================================================================

SELL = -1
BUY = 1
NONE = 0

# Direction string mappings
DIRECTION_MAP = {
    BUY: "Buy",
    SELL: "Sell",
    NONE: "None"
}

# =============================================================================
# Timeframe Constants (in seconds)
# =============================================================================

TIMEFRAMES = {
    "M1": 60,
    "M5": 300,
    "M15": 900,
    "M30": 1800,
    "H1": 3600,
    "H4": 14400,
    "D": 86400,
    "W": 604800,
}

# =============================================================================
# API Configuration
# =============================================================================

# Rate limiting
API_THROTTLE_TIME = 0.3  # seconds between API calls

# Default candle count
DEFAULT_CANDLE_COUNT = 100

# =============================================================================
# Database Configuration
# =============================================================================

DB_NAME = "forex_learning"
INSTRUMENTS_COLLECTION = "forex_instruments"
CALENDAR_COLLECTION = "forex_calendar"
SAMPLE_COLLECTION = "forex_sample"

# =============================================================================
# Supported Currency Pairs
# =============================================================================

MAJOR_PAIRS = [
    "EURUSD", "GBPUSD", "USDJPY", "USDCHF",
    "AUDUSD", "USDCAD", "NZDUSD"
]

CROSS_PAIRS = [
    "EURGBP", "EURJPY", "EURCHF", "EURAUD", "EURCAD", "EURNZD",
    "GBPJPY", "GBPCHF", "GBPAUD", "GBPCAD", "GBPNZD",
    "CHFJPY", "CADJPY", "AUDJPY", "NZDJPY",
    "AUDCAD", "AUDCHF", "AUDNZD",
    "CADCHF", "NZDCAD", "NZDCHF"
]

ALL_PAIRS = MAJOR_PAIRS + CROSS_PAIRS
