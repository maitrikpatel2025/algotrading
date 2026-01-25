"""
Open Trade Model
================
Represents an open trade position.
"""

from datetime import datetime
from typing import Any, Dict, Optional


class OpenTrade:
    """
    Represents an open trade position from the trading API.
    """

    def __init__(self, api_obj: Dict[str, Any]):
        """
        Initialize an OpenTrade from API response.

        Args:
            api_obj: API response dictionary
        """
        self.id = api_obj["Id"]
        self.instrument = api_obj["Symbol"]
        self.price = api_obj["Price"]
        self.initialAmount = api_obj["InitialAmount"]
        self.unrealizedPL = api_obj["Profit"]
        self.marginUsed = api_obj["Margin"]
        self.stop_loss = api_obj.get("StopLoss", 0.0)
        self.take_profit = api_obj.get("TakeProfit", 0.0)
        # Additional fields for enhanced position view
        self.side = api_obj.get("Side", "")  # "Buy" or "Sell"
        # Open time from Created timestamp (in milliseconds)
        created_ts = api_obj.get("Created")
        self.open_time: Optional[datetime] = None
        if created_ts:
            try:
                self.open_time = datetime.fromtimestamp(created_ts / 1000)
            except (ValueError, TypeError, OSError):
                self.open_time = None
        # Comment field may contain bot name info
        self.comment = api_obj.get("Comment", "")

    def __repr__(self) -> str:
        return str(vars(self))

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert to dictionary format.

        Returns:
            Dictionary representation of the trade
        """
        return {
            "id": self.id,
            "instrument": self.instrument,
            "price": self.price,
            "initialAmount": self.initialAmount,
            "unrealizedPL": self.unrealizedPL,
            "marginUsed": self.marginUsed,
            "stop_loss": self.stop_loss,
            "take_profit": self.take_profit,
            "side": self.side,
            "open_time": self.open_time.isoformat() if self.open_time else None,
            "comment": self.comment,
        }
