"""
Server Configuration Settings
=============================
Contains all configuration constants, API credentials, and trading pairs.
Uses pydantic-settings for environment variable management.
"""

import os
from pathlib import Path
from typing import Dict

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    # Load .env from server directory
    env_path = Path(__file__).resolve().parent.parent / '.env'
    load_dotenv(env_path)
except ImportError:
    pass  # python-dotenv not installed, using system env vars only

# =============================================================================
# OpenFX API Configuration
# =============================================================================

OPENFX_URL = os.getenv("OPENFX_URL", "https://marginalttdemowebapi.fxopen.net/api/v2")

# API Credentials - Use environment variables in production!
API_ID = os.getenv("OPENFX_API_ID", "xxx")
API_KEY = os.getenv("OPENFX_API_KEY", "xxx")
API_SECRET = os.getenv("OPENFX_API_SECRET", "xxx")

SECURE_HEADER = {
    "Authorization": f"Basic {API_ID}:{API_KEY}:{API_SECRET}",
    "Content-Type": "application/json",
    "Accept": "application/json",
}

# =============================================================================
# Database Configuration (Supabase)
# =============================================================================

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# =============================================================================
# Trading Constants
# =============================================================================

SELL = -1
BUY = 1
NONE = 0

# =============================================================================
# Timeframes (in seconds)
# =============================================================================

TFS: Dict[str, int] = {
    "M1": 60,
    "M5": 300,
    "M15": 900,
    "M30": 1800,
    "H1": 3600,
    "H4": 14400,
    "D": 86400,
    "W1": 604800
}

# =============================================================================
# Investing.com Pair Mappings
# =============================================================================

INVESTING_COM_PAIRS: Dict[str, Dict] = {
    "EUR_USD": {"pair": "EUR_USD", "pair_id": 1},
    "GBP_USD": {"pair": "GBP_USD", "pair_id": 2},
    "USD_JPY": {"pair": "USD_JPY", "pair_id": 3},
    "USD_CHF": {"pair": "USD_CHF", "pair_id": 4},
    "AUD_USD": {"pair": "AUD_USD", "pair_id": 5},
    "EUR_GBP": {"pair": "EUR_GBP", "pair_id": 6},
    "USD_CAD": {"pair": "USD_CAD", "pair_id": 7},
    "NZD_USD": {"pair": "NZD_USD", "pair_id": 8},
    "EUR_JPY": {"pair": "EUR_JPY", "pair_id": 9},
    "EUR_CHF": {"pair": "EUR_CHF", "pair_id": 10},
    "GBP_JPY": {"pair": "GBP_JPY", "pair_id": 11},
    "GBP_CHF": {"pair": "GBP_CHF", "pair_id": 12},
    "CHF_JPY": {"pair": "CHF_JPY", "pair_id": 13},
    "CAD_CHF": {"pair": "CAD_CHF", "pair_id": 14},
    "EUR_AUD": {"pair": "EUR_AUD", "pair_id": 15},
    "EUR_CAD": {"pair": "EUR_CAD", "pair_id": 16},
    "USD_ZAR": {"pair": "USD_ZAR", "pair_id": 17},
    "USD_TRY": {"pair": "USD_TRY", "pair_id": 18},
    "EUR_NOK": {"pair": "EUR_NOK", "pair_id": 37},
    "BTC_NZD": {"pair": "BTC_NZD", "pair_id": 38},
    "USD_MXN": {"pair": "USD_MXN", "pair_id": 39},
    "USD_PLN": {"pair": "USD_PLN", "pair_id": 40},
    "USD_SEK": {"pair": "USD_SEK", "pair_id": 41},
    "USD_SGD": {"pair": "USD_SGD", "pair_id": 42},
    "USD_DKK": {"pair": "USD_DKK", "pair_id": 43},
    "EUR_DKK": {"pair": "EUR_DKK", "pair_id": 44},
    "EUR_PLN": {"pair": "EUR_PLN", "pair_id": 46},
    "AUD_CAD": {"pair": "AUD_CAD", "pair_id": 47},
    "AUD_CHF": {"pair": "AUD_CHF", "pair_id": 48},
    "AUD_JPY": {"pair": "AUD_JPY", "pair_id": 49},
    "AUD_NZD": {"pair": "AUD_NZD", "pair_id": 50},
    "CAD_JPY": {"pair": "CAD_JPY", "pair_id": 51},
    "EUR_NZD": {"pair": "EUR_NZD", "pair_id": 52},
    "GBP_AUD": {"pair": "GBP_AUD", "pair_id": 53},
    "GBP_CAD": {"pair": "GBP_CAD", "pair_id": 54},
    "GBP_NZD": {"pair": "GBP_NZD", "pair_id": 55},
    "NZD_CAD": {"pair": "NZD_CAD", "pair_id": 56},
    "NZD_CHF": {"pair": "NZD_CHF", "pair_id": 57},
    "NZD_JPY": {"pair": "NZD_JPY", "pair_id": 58},
    "USD_NOK": {"pair": "USD_NOK", "pair_id": 59},
}

# =============================================================================
# FastAPI Server Configuration
# =============================================================================

API_DEBUG = os.getenv("API_DEBUG", "True").lower() == "true"
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", 8000))

# Mock Data Configuration - Enable to use mock price data when API is unavailable
USE_MOCK_DATA = os.getenv("USE_MOCK_DATA", "true").lower() == "true"

# CORS Configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
