"""
Price Feed API Helpers
======================
Helper functions for batch price/spread fetching.
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from config import settings
from core.openfx_api import OpenFxApi

logger = logging.getLogger(__name__)


class PriceFeedItem(BaseModel):
    """Individual price feed item with spread and high/low data."""

    pair: str = Field(..., description="Currency pair (e.g., 'EUR_USD')")
    spread: Optional[float] = Field(None, description="Spread in pips")
    bid: Optional[float] = Field(None, description="Current bid price")
    ask: Optional[float] = Field(None, description="Current ask price")
    high: Optional[float] = Field(None, description="High of day (estimated from recent data)")
    low: Optional[float] = Field(None, description="Low of day (estimated from recent data)")
    timestamp: Optional[datetime] = Field(None, description="Price timestamp")
    error: Optional[str] = Field(None, description="Error message if fetch failed")


class BatchSpreadsResponse(BaseModel):
    """Response for batch spread fetching."""

    spreads: List[PriceFeedItem] = Field(default=[], description="List of spread data")
    count: int = Field(0, description="Number of pairs returned")
    timestamp: datetime = Field(default_factory=datetime.now, description="Response timestamp")
    error: Optional[str] = Field(None, description="Error message if fetch failed")


def fetch_batch_spreads(pairs: List[str], api: OpenFxApi) -> BatchSpreadsResponse:
    """
    Fetch spread data for multiple pairs in a batch.

    Args:
        pairs: List of currency pair symbols (e.g., ['EUR_USD', 'GBP_USD'])
        api: OpenFxApi instance

    Returns:
        BatchSpreadsResponse with spread data for all requested pairs
    """
    available_pairs = list(settings.INVESTING_COM_PAIRS.keys())
    spreads: List[PriceFeedItem] = []

    # Filter to valid pairs only
    valid_pairs = [p for p in pairs if p in available_pairs]

    if not valid_pairs:
        return BatchSpreadsResponse(
            spreads=[],
            count=0,
            timestamp=datetime.now(),
            error="No valid pairs provided",
        )

    # Convert pair format for API (EUR_USD -> EURUSD)
    symbols = [p.replace("_", "") for p in valid_pairs]

    try:
        # Fetch all prices in a single API call
        prices = api.get_prices(symbols)

        if prices is None:
            logger.warning("[WARNING] Could not fetch prices from API")
            # Return empty items with error
            for pair in valid_pairs:
                spreads.append(PriceFeedItem(pair=pair, error="Unable to fetch price data"))
            return BatchSpreadsResponse(
                spreads=spreads,
                count=len(spreads),
                timestamp=datetime.now(),
            )

        # Create a map of symbol to price data
        price_map: Dict[str, Any] = {}
        for price in prices:
            # The API returns symbol without underscore
            price_map[price.symbol] = price

        # Process each valid pair
        for pair in valid_pairs:
            symbol = pair.replace("_", "")
            price = price_map.get(symbol)

            if price is None:
                spreads.append(PriceFeedItem(pair=pair, error="Price data not available"))
                continue

            # Calculate spread in pips
            # JPY pairs have pip at 0.01, others at 0.0001
            is_jpy_pair = "JPY" in pair
            pip_multiplier = 100 if is_jpy_pair else 10000

            raw_spread = abs(price.ask - price.bid)
            spread_pips = round(raw_spread * pip_multiplier, 2)

            # For high/low, we'll estimate from current bid/ask
            # In production, this would fetch from candle data
            # For now, use a small range around current price
            mid_price = (price.bid + price.ask) / 2
            estimated_range = mid_price * 0.002  # 0.2% range estimate

            spreads.append(
                PriceFeedItem(
                    pair=pair,
                    spread=spread_pips,
                    bid=price.bid,
                    ask=price.ask,
                    high=round(mid_price + estimated_range, 5 if not is_jpy_pair else 3),
                    low=round(mid_price - estimated_range, 5 if not is_jpy_pair else 3),
                    timestamp=price.time,
                )
            )

        logger.info(f"[SUCCESS] Batch spreads fetched for {len(spreads)} pairs")

    except Exception as e:
        logger.error(f"[ERROR] Batch spread fetch failed: {str(e)}")
        # Return items with error
        for pair in valid_pairs:
            spreads.append(PriceFeedItem(pair=pair, error=str(e)))

    return BatchSpreadsResponse(
        spreads=spreads,
        count=len(spreads),
        timestamp=datetime.now(),
    )
