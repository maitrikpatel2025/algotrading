"""
API Price Model
===============
Represents price data from the trading API.
"""

import datetime as dt
from typing import Any, Dict

import pytz


class ApiPrice:
    """
    Represents a price quote from the trading API.
    """

    def __init__(self, api_obj: Dict[str, Any]):
        """
        Initialize an ApiPrice from API response.

        Args:
            api_obj: API response dictionary
        """
        self.instrument = api_obj["Symbol"]
        self.ask = api_obj["BestBid"]["Price"]
        self.bid = api_obj["BestAsk"]["Price"]
        self.time = dt.datetime.fromtimestamp(api_obj["Timestamp"] / 1000, pytz.timezone("UTC"))

    def __repr__(self) -> str:
        return f"ApiPrice() {self.instrument} {self.ask} {self.bid} {self.time}"

    def get_dict(self) -> Dict[str, Any]:
        """
        Convert to dictionary format.

        Returns:
            Dictionary representation of the price
        """
        return {"instrument": self.instrument, "time": self.time, "ask": self.ask, "bid": self.bid}
