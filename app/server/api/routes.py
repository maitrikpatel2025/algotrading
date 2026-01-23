"""
API Routes
==========
Flask route definitions for the trading API.
"""

from typing import Any, Dict, List, Optional

from config import settings

# Human-readable display labels for timeframe codes
GRANULARITY_LABELS: Dict[str, str] = {
    "M1": "1 Min",
    "M5": "5 Min",
    "M15": "15 Min",
    "M30": "30 Min",
    "H1": "1 Hour",
    "H4": "4 Hour",
    "D": "1 Day",
    "W1": "1 Week",
}

# =============================================================================
# Pair Category Definitions
# =============================================================================

# Major pairs: Most liquid, involve USD and major currencies
MAJOR_PAIRS: List[str] = [
    "EUR_USD",
    "GBP_USD",
    "USD_JPY",
    "USD_CHF",
    "AUD_USD",
    "USD_CAD",
    "NZD_USD",
]

# Exotic currency codes (currencies with lower liquidity)
EXOTIC_CURRENCIES: List[str] = ["ZAR", "TRY", "MXN", "PLN", "SEK", "SGD", "DKK", "NOK", "BTC"]


def get_pair_category(pair: str) -> str:
    """
    Determine the category for a currency pair.

    Args:
        pair: Currency pair (e.g., 'EUR_USD')

    Returns:
        Category string: 'Major', 'Minor', or 'Exotic'
    """
    if pair in MAJOR_PAIRS:
        return "Major"

    # Check if either currency in the pair is exotic
    currencies = pair.split("_")
    for currency in currencies:
        if currency in EXOTIC_CURRENCIES:
            return "Exotic"

    # Cross pairs without USD are minors
    return "Minor"


def make_option(key: str, text: str = None, category: Optional[str] = None) -> Dict[str, Any]:
    """
    Create an option dictionary for frontend select dropdowns.

    Args:
        key: Option key/value
        text: Display text (defaults to key if not provided)
        category: Optional category for grouping (e.g., 'Major', 'Minor', 'Exotic')

    Returns:
        Dictionary with key, text, value, and optional category fields
    """
    option = {"key": key, "text": text or key, "value": key}
    if category is not None:
        option["category"] = category
    return option


def get_options() -> Dict[str, Any]:
    """
    Get available trading options (pairs and timeframes) for the frontend.

    Returns:
        Dictionary with granularities and pairs lists (pairs include category)
    """
    pairs = sorted(settings.INVESTING_COM_PAIRS.keys())

    return {
        "granularities": [
            make_option(g, GRANULARITY_LABELS.get(g, g)) for g in settings.TFS.keys()
        ],
        "pairs": [make_option(p, category=get_pair_category(p)) for p in pairs],
    }
