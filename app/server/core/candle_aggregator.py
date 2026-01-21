"""
Candle Aggregator
=================
Aggregates real-time tick data into OHLC candlesticks for various timeframes.
Handles candle completion detection and provides both current and completed candles.
"""

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from config.settings import TFS

logger = logging.getLogger(__name__)


class CandleAggregator:
    """
    Aggregates tick data into OHLC candles based on timeframe boundaries.

    Supports timeframes: M1, M5, M15, M30, H1, H4, D, W1

    Features:
    - Real-time candle aggregation from tick data
    - OHLC calculation: Open (first tick), High (max), Low (min), Close (last tick)
    - Volume aggregation
    - Candle completion detection based on timeframe boundaries
    - Handles edge cases: first tick, candle rollover, missing timestamps
    """

    def __init__(self, timeframe: str = "M5"):
        """
        Initialize candle aggregator.

        Args:
            timeframe: Timeframe for candle aggregation (M1, M5, M15, M30, H1, H4, D, W1)
        """
        if timeframe not in TFS:
            raise ValueError(f"Invalid timeframe: {timeframe}. Must be one of {list(TFS.keys())}")

        self.timeframe = timeframe
        self.timeframe_seconds = TFS[timeframe]

        self.current_candle: Optional[Dict[str, Any]] = None
        self.completed_candles: List[Dict[str, Any]] = []

        logger.info(f"CandleAggregator initialized for {timeframe} ({self.timeframe_seconds}s)")

    def add_tick(self, timestamp: datetime, price: float, volume: float = 0) -> Dict[str, Any]:
        """
        Process incoming tick and update candles.

        Args:
            timestamp: Tick timestamp (UTC)
            price: Tick price (mid price or close price)
            volume: Tick volume (default: 0)

        Returns:
            Dictionary with keys:
                - 'candle_completed': bool - Whether a candle was completed
                - 'completed_candle': Optional[Dict] - The completed candle if any
                - 'current_candle': Dict - The current in-progress candle
        """
        # Ensure timestamp is timezone-aware UTC
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=timezone.utc)

        # Calculate candle boundary for this tick
        candle_start_time = self._get_candle_boundary(timestamp)

        # Check if we need to complete the current candle
        candle_completed = False
        completed_candle = None

        if self.current_candle and self.current_candle["time"] != candle_start_time:
            # Current candle is complete, save it
            candle_completed = True
            completed_candle = self.current_candle.copy()
            self.completed_candles.append(completed_candle)
            logger.debug(f"Candle completed: {completed_candle}")

            # Start new candle
            self.current_candle = None

        # Initialize or update current candle
        if self.current_candle is None:
            # Start new candle
            self.current_candle = {
                "time": candle_start_time,
                "open": price,
                "high": price,
                "low": price,
                "close": price,
                "volume": volume,
                "tick_count": 1,
            }
            logger.debug(f"New candle started: {candle_start_time}")
        else:
            # Update current candle OHLC
            self.current_candle["high"] = max(self.current_candle["high"], price)
            self.current_candle["low"] = min(self.current_candle["low"], price)
            self.current_candle["close"] = price
            self.current_candle["volume"] += volume
            self.current_candle["tick_count"] += 1

        return {
            "candle_completed": candle_completed,
            "completed_candle": completed_candle,
            "current_candle": self.current_candle.copy(),
        }

    def get_current_candle(self) -> Optional[Dict[str, Any]]:
        """
        Get the current in-progress candle.

        Returns:
            Dictionary with OHLC data or None if no candle exists
        """
        return self.current_candle.copy() if self.current_candle else None

    def get_completed_candles(self, count: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get completed candles.

        Args:
            count: Number of most recent candles to return (None for all)

        Returns:
            List of candle dictionaries
        """
        if count is None:
            return self.completed_candles.copy()
        return self.completed_candles[-count:].copy() if count > 0 else []

    def get_all_candles(self, include_current: bool = True) -> List[Dict[str, Any]]:
        """
        Get all candles (completed + current).

        Args:
            include_current: Whether to include the current in-progress candle

        Returns:
            List of candle dictionaries
        """
        candles = self.completed_candles.copy()
        if include_current and self.current_candle:
            candles.append(self.current_candle.copy())
        return candles

    def _get_candle_boundary(self, timestamp: datetime) -> datetime:
        """
        Calculate the candle start time (boundary) for a given timestamp.

        Args:
            timestamp: Tick timestamp

        Returns:
            Candle boundary timestamp (start of candle period)
        """
        # Get timestamp in UTC
        ts_utc = timestamp.astimezone(timezone.utc)

        if self.timeframe == "W1":
            # Weekly: start on Monday 00:00
            days_since_monday = ts_utc.weekday()
            boundary = ts_utc.replace(hour=0, minute=0, second=0, microsecond=0)
            boundary = boundary.replace(day=boundary.day - days_since_monday)
        elif self.timeframe == "D":
            # Daily: start at 00:00
            boundary = ts_utc.replace(hour=0, minute=0, second=0, microsecond=0)
        elif self.timeframe.startswith("H"):
            # Hourly: round down to hour boundary
            hours = int(self.timeframe[1:])
            hour_boundary = (ts_utc.hour // hours) * hours
            boundary = ts_utc.replace(hour=hour_boundary, minute=0, second=0, microsecond=0)
        elif self.timeframe.startswith("M"):
            # Minutes: round down to minute boundary
            minutes = int(self.timeframe[1:])
            minute_boundary = (ts_utc.minute // minutes) * minutes
            boundary = ts_utc.replace(minute=minute_boundary, second=0, microsecond=0)
        else:
            # Fallback: use timeframe_seconds
            epoch = datetime(1970, 1, 1, tzinfo=timezone.utc)
            seconds_since_epoch = int((ts_utc - epoch).total_seconds())
            boundary_seconds = (
                seconds_since_epoch // self.timeframe_seconds
            ) * self.timeframe_seconds
            boundary = datetime.fromtimestamp(boundary_seconds, tz=timezone.utc)

        return boundary

    def reset(self) -> None:
        """
        Reset aggregator state (clear all candles).
        """
        self.current_candle = None
        self.completed_candles = []
        logger.info(f"CandleAggregator reset for {self.timeframe}")

    def get_state(self) -> Dict[str, Any]:
        """
        Get current aggregator state.

        Returns:
            Dictionary with aggregator state
        """
        return {
            "timeframe": self.timeframe,
            "timeframe_seconds": self.timeframe_seconds,
            "current_candle": self.current_candle.copy() if self.current_candle else None,
            "completed_candles_count": len(self.completed_candles),
        }

    def format_candle_for_api(self, candle: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format candle data for API response.

        Args:
            candle: Candle dictionary

        Returns:
            Formatted candle dictionary
        """
        return {
            "time": candle["time"].strftime("%y-%m-%d %H:%M")
            if isinstance(candle["time"], datetime)
            else candle["time"],
            "open": round(candle["open"], 5),
            "high": round(candle["high"], 5),
            "low": round(candle["low"], 5),
            "close": round(candle["close"], 5),
            "volume": round(candle.get("volume", 0), 2),
        }

    def format_candles_for_api(self, candles: List[Dict[str, Any]]) -> Dict[str, List]:
        """
        Format multiple candles for API response (frontend expects separate arrays).

        Args:
            candles: List of candle dictionaries

        Returns:
            Dictionary with separate arrays: {time: [], mid_o: [], mid_h: [], mid_l: [], mid_c: []}
        """
        if not candles:
            return {"time": [], "mid_o": [], "mid_h": [], "mid_l": [], "mid_c": []}

        formatted = {"time": [], "mid_o": [], "mid_h": [], "mid_l": [], "mid_c": []}

        for candle in candles:
            formatted["time"].append(
                candle["time"].strftime("%y-%m-%d %H:%M")
                if isinstance(candle["time"], datetime)
                else candle["time"]
            )
            formatted["mid_o"].append(round(candle["open"], 5))
            formatted["mid_h"].append(round(candle["high"], 5))
            formatted["mid_l"].append(round(candle["low"], 5))
            formatted["mid_c"].append(round(candle["close"], 5))

        return formatted
