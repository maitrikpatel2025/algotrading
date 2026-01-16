"""
Open Trade Model
================
Represents an open trade position.
"""

from typing import Dict, Any


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
        self.id = api_obj['Id']
        self.instrument = api_obj['Symbol']
        self.price = api_obj['Price']
        self.initialAmount = api_obj['InitialAmount']
        self.unrealizedPL = api_obj['Profit']
        self.marginUsed = api_obj['Margin']
        self.stop_loss = api_obj.get('StopLoss', 0.0)
        self.take_profit = api_obj.get('TakeProfit', 0.0)

    def __repr__(self) -> str:
        return str(vars(self))

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert to dictionary format.
        
        Returns:
            Dictionary representation of the trade
        """
        return {
            'id': self.id,
            'instrument': self.instrument,
            'price': self.price,
            'initialAmount': self.initialAmount,
            'unrealizedPL': self.unrealizedPL,
            'marginUsed': self.marginUsed,
            'stop_loss': self.stop_loss,
            'take_profit': self.take_profit
        }
