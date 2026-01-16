"""
Instrument Collection
=====================
Manages a collection of tradable instruments.
"""

import json
import logging
from typing import Dict, Optional, Any

from db.database import DataDB
from models.instrument import Instrument

logger = logging.getLogger(__name__)


class InstrumentCollection:
    """
    Manages loading and storing instrument data.
    """

    FILENAME = "instruments.json"
    API_KEYS = ['Symbol', 'Precision', 'TradeAmountStep']

    def __init__(self):
        """Initialize empty instrument collection."""
        self.instruments_dict: Dict[str, Instrument] = {}

    def load_from_file(self, path: str) -> None:
        """
        Load instruments from a JSON file.
        
        Args:
            path: Directory path containing instruments.json
        """
        self.instruments_dict = {}
        filename = f"{path}/{self.FILENAME}"
        
        with open(filename, "r") as f:
            data = json.loads(f.read())
            for key, value in data.items():
                self.instruments_dict[key] = Instrument.from_api_object(value)

    def load_from_db(self) -> None:
        """Load instruments from Supabase database."""
        self.instruments_dict = {}
        rows = DataDB().query_all(DataDB.INSTRUMENTS_COLL)

        if rows:
            for row in rows:
                # Convert Supabase row format to expected dict format
                symbol = row.get("symbol")
                if symbol:
                    instrument_data = {
                        "Symbol": symbol,
                        "Precision": row.get("precision", 5),
                        "TradeAmountStep": row.get("trade_amount_step", 1000),
                    }
                    self.instruments_dict[symbol] = Instrument.from_api_object(
                        instrument_data
                    )

    def create_file(self, data: list, path: str) -> None:
        """
        Create instruments JSON file from API data.
        
        Args:
            data: List of instrument data from API
            path: Directory path to save the file
        """
        if data is None:
            logger.warning("Instrument file creation failed")
            return

        instruments_dict = {}
        for item in data:
            key = item['Symbol']
            instruments_dict[key] = {k: item[k] for k in self.API_KEYS}

        filename = f"{path}/{self.FILENAME}"
        with open(filename, "w") as f:
            f.write(json.dumps(instruments_dict, indent=2))

    def create_in_db(self, data: list) -> None:
        """
        Store instruments in Supabase database.

        Args:
            data: List of instrument data from API
        """
        if data is None:
            logger.warning("Instrument DB creation failed")
            return

        # Convert to Supabase row format (one row per instrument)
        rows = []
        for item in data:
            rows.append(
                {
                    "symbol": item["Symbol"],
                    "precision": item["Precision"],
                    "trade_amount_step": item["TradeAmountStep"],
                }
            )

        database = DataDB()
        database.delete_many(DataDB.INSTRUMENTS_COLL)
        if rows:
            database.add_many(DataDB.INSTRUMENTS_COLL, rows)

    def print_instruments(self) -> None:
        """Print all instruments to console."""
        for key, value in self.instruments_dict.items():
            logger.debug(f"{key} {value}")
        logger.debug(f"{len(self.instruments_dict)} instruments")

    def get(self, symbol: str) -> Optional[Instrument]:
        """
        Get an instrument by symbol.
        
        Args:
            symbol: Instrument symbol
            
        Returns:
            Instrument or None if not found
        """
        return self.instruments_dict.get(symbol)


# Global singleton instance
instrument_collection = InstrumentCollection()
