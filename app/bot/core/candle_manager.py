"""
Candle Manager
==============
Manages candle timing and triggers for the trading bot.
Uses Pydantic models for type-safe timing management.
"""

from typing import Dict, List, Callable

from core.models import CandleTiming, TradeSettings


class CandleManager:
    """
    Manages candle timing and triggers strategy evaluation
    when new candles complete.
    
    Uses Pydantic CandleTiming models for each monitored pair.
    """

    def __init__(
        self,
        api,
        trade_settings: Dict[str, TradeSettings],
        log_message: Callable,
        granularity: str
    ):
        """
        Initialize candle manager.
        
        Args:
            api: API client instance
            trade_settings: Dictionary of pair -> TradeSettings (Pydantic models)
            log_message: Logging function
            granularity: Timeframe for candles (e.g., 'M1', 'H1')
        """
        self.api = api
        self.trade_settings = trade_settings
        self.log_message = log_message
        self.granularity = granularity
        self.pairs_list = list(trade_settings.keys())
        
        # Initialize Pydantic CandleTiming for each pair
        self.timings: Dict[str, CandleTiming] = {}
        for pair in self.pairs_list:
            last_time = self.api.last_complete_candle(pair, self.granularity)
            self.timings[pair] = CandleTiming(last_time=last_time)
            self.log_message(f"CandleManager init: {self.timings[pair]}", pair)

    def update_timings(self) -> List[str]:
        """
        Check for new candles and return list of pairs with new candles.
        
        Iterates through all monitored pairs and checks if a new
        candle has completed since the last check.
        
        Returns:
            List of pair names that have new candles ready for analysis
        """
        triggered = []

        for pair in self.pairs_list:
            current = self.api.last_complete_candle(pair, self.granularity)
            
            print(f"CandleManager {pair} current:{current} last:{self.timings[pair].last_time}")
            
            if current is None:
                self.log_message("Unable to get candle", pair)
                continue
            
            # Use Pydantic model's update method
            if self.timings[pair].update(current):
                self.log_message(f"CandleManager new candle: {self.timings[pair]}", pair)
                print(f"CandleManager new candle: {self.timings[pair]}")
                triggered.append(pair)
                
        return triggered

    def get_timing(self, pair: str) -> CandleTiming:
        """
        Get the CandleTiming for a specific pair.
        
        Args:
            pair: Trading pair name
            
        Returns:
            CandleTiming Pydantic model for the pair
        """
        return self.timings.get(pair)

    def reset_timing(self, pair: str) -> None:
        """
        Reset the timing for a specific pair.
        
        Args:
            pair: Trading pair name
        """
        if pair in self.timings:
            self.timings[pair] = CandleTiming()
            self.log_message(f"CandleManager reset timing for {pair}", pair)
