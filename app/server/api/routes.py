"""
API Routes
==========
Flask route definitions for the trading API.
"""

from typing import Any, Dict

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
    "W1": "1 Week"
}


def make_option(key: str, text: str = None) -> Dict[str, str]:
    """
    Create an option dictionary for frontend select dropdowns.

    Args:
        key: Option key/value
        text: Display text (defaults to key if not provided)

    Returns:
        Dictionary with key, text, and value fields
    """
    return {'key': key, 'text': text or key, 'value': key}


def get_options() -> Dict[str, Any]:
    """
    Get available trading options (pairs and timeframes) for the frontend.

    Returns:
        Dictionary with granularities and pairs lists
    """
    pairs = sorted(settings.INVESTING_COM_PAIRS.keys())

    return {
        'granularities': [
            make_option(g, GRANULARITY_LABELS.get(g, g))
            for g in settings.TFS.keys()
        ],
        'pairs': [make_option(p) for p in pairs]
    }
