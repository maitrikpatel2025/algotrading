"""
Instrument Model
================
Represents a tradable instrument (currency pair).
"""

from typing import Dict, Any


class Instrument:
    """
    Represents a forex instrument with its trading properties.
    """

    def __init__(self, symbol: str, precision: int, trade_amount_step: float):
        """
        Initialize an Instrument.
        
        Args:
            symbol: Instrument symbol (e.g., 'EURUSD')
            precision: Number of decimal places
            trade_amount_step: Minimum trade amount increment
        """
        self.name = symbol
        self.ins_type = "CURRENCY"
        self.displayName = symbol
        self.pipLocation = pow(10, (precision - 1) * -1)
        self.tradeUnitsPrecision = precision
        self.marginRate = 0.02
        self.displayPrecision = precision
        self.TradeAmountStep = int(trade_amount_step)

    def __repr__(self) -> str:
        return str(vars(self))

    @classmethod
    def from_api_object(cls, obj: Dict[str, Any]) -> 'Instrument':
        """
        Create an Instrument from an API response object.
        
        Args:
            obj: API response dictionary
            
        Returns:
            New Instrument instance
        """
        return cls(
            obj['Symbol'],
            obj['Precision'],
            obj['TradeAmountStep']
        )
