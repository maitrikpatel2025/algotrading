"""
API Routes
==========
Flask route definitions for the trading API.
"""

from typing import Dict, Any

from config import settings


def make_option(key: str) -> Dict[str, str]:
    """
    Create an option dictionary for frontend select dropdowns.
    
    Args:
        key: Option key/value/text
        
    Returns:
        Dictionary with key, text, and value fields
    """
    return {'key': key, 'text': key, 'value': key}


def get_options() -> Dict[str, Any]:
    """
    Get available trading options (pairs and timeframes) for the frontend.
    
    Returns:
        Dictionary with granularities and pairs lists
    """
    pairs = sorted(settings.INVESTING_COM_PAIRS.keys())

    return {
        'granularities': [make_option(g) for g in settings.TFS.keys()],
        'pairs': [make_option(p) for p in pairs]
    }
