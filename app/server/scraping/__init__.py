"""Scraping module."""

from .bloomberg import get_headlines as get_bloomberg_headlines
from .investing import get_all_technicals as get_all_technicals
from .investing import get_pair_technicals as get_pair_technicals

__all__ = ["get_bloomberg_headlines", "get_all_technicals", "get_pair_technicals"]
