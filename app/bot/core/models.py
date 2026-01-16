"""
Bot Models
==========
Pydantic data models for trading bot operations.
Provides type validation, serialization, and documentation.
"""

from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, Dict, Literal, Any
from datetime import datetime


# =============================================================================
# Trading Constants
# =============================================================================

class TradeSignal:
    """Trading signal constants."""
    SELL: int = -1
    NONE: int = 0
    BUY: int = 1


# =============================================================================
# Configuration Models
# =============================================================================

class TradeSettingsConfig(BaseModel):
    """
    Configuration schema for a single trading pair.
    Used for validating settings.json pair entries.
    """
    n_ma: int = Field(ge=1, description="Moving average period for Bollinger Bands")
    n_std: float = Field(ge=0.1, le=5.0, description="Number of standard deviations for bands")
    maxspread: float = Field(ge=0, description="Maximum allowed spread to enter trade")
    mingain: float = Field(ge=0, description="Minimum required gain to trigger signal")
    riskreward: float = Field(ge=0.1, description="Risk/reward ratio for stop loss calculation")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "n_ma": 12,
                "n_std": 2.0,
                "maxspread": 0.04,
                "mingain": 0.06,
                "riskreward": 1.5
            }
        }
    )


class BotConfig(BaseModel):
    """
    Bot configuration schema for settings.json.
    Validates the entire configuration file structure.
    """
    trade_risk: float = Field(ge=0, description="Risk amount per trade in account currency")
    pairs: Dict[str, TradeSettingsConfig] = Field(
        description="Trading pair configurations"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "trade_risk": 5,
                "pairs": {
                    "GBPJPY": {
                        "n_ma": 12,
                        "n_std": 2.0,
                        "maxspread": 0.04,
                        "mingain": 0.06,
                        "riskreward": 1.5
                    }
                }
            }
        }
    )

    @field_validator('pairs')
    @classmethod
    def validate_pairs_not_empty(cls, v: Dict) -> Dict:
        """Ensure at least one trading pair is configured."""
        if not v:
            raise ValueError("At least one trading pair must be configured")
        return v


class TradeSettings(BaseModel):
    """
    Settings for a trading pair strategy with pair name included.
    Used at runtime for strategy execution.
    """
    pair: str = Field(description="Trading pair name (e.g., 'GBPJPY')")
    n_ma: int = Field(ge=1, description="Moving average period")
    n_std: float = Field(ge=0.1, le=5.0, description="Standard deviations")
    maxspread: float = Field(ge=0, description="Maximum spread")
    mingain: float = Field(ge=0, description="Minimum gain")
    riskreward: float = Field(ge=0.1, description="Risk/reward ratio")

    @classmethod
    def from_config(cls, config: TradeSettingsConfig, pair: str) -> "TradeSettings":
        """
        Create TradeSettings from a config object and pair name.
        
        Args:
            config: TradeSettingsConfig from BotConfig
            pair: Trading pair name
            
        Returns:
            TradeSettings instance
        """
        return cls(
            pair=pair,
            n_ma=config.n_ma,
            n_std=config.n_std,
            maxspread=config.maxspread,
            mingain=config.mingain,
            riskreward=config.riskreward
        )

    @classmethod
    def from_dict(cls, config: Dict[str, Any], pair: str) -> "TradeSettings":
        """
        Create TradeSettings from a dictionary (legacy support).
        
        Args:
            config: Configuration dictionary
            pair: Trading pair name
            
        Returns:
            TradeSettings instance
        """
        return cls(pair=pair, **config)

    @staticmethod
    def settings_to_str(settings: Dict[str, "TradeSettings"]) -> str:
        """Convert settings dictionary to formatted string."""
        ret_str = "Trade Settings:\n"
        for pair, setting in settings.items():
            ret_str += f"  {pair}: MA={setting.n_ma}, STD={setting.n_std}, "
            ret_str += f"spread<{setting.maxspread}, gain>{setting.mingain}, RR={setting.riskreward}\n"
        return ret_str


# =============================================================================
# Trading Decision Models
# =============================================================================

class TradeDecision(BaseModel):
    """
    Represents a trading decision made by the strategy.
    Contains all information needed to execute a trade.
    """
    pair: str = Field(description="Trading pair name")
    signal: Literal[-1, 0, 1] = Field(
        description="Trade direction: -1=SELL, 0=NONE, 1=BUY"
    )
    gain: float = Field(description="Expected gain in price units")
    loss: float = Field(description="Expected loss in price units")
    sl: float = Field(description="Stop loss price level")
    tp: float = Field(description="Take profit price level")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "pair": "GBPJPY",
                "signal": 1,
                "gain": 0.0045,
                "loss": 0.003,
                "sl": 188.50,
                "tp": 189.00
            }
        }
    )

    @classmethod
    def from_dataframe_row(cls, row) -> "TradeDecision":
        """
        Create TradeDecision from a pandas DataFrame row.
        
        Args:
            row: Pandas DataFrame row with PAIR, SIGNAL, GAIN, LOSS, SL, TP columns
            
        Returns:
            TradeDecision instance
        """
        return cls(
            pair=str(row.PAIR),
            signal=int(row.SIGNAL),
            gain=float(row.GAIN),
            loss=float(row.LOSS),
            sl=float(row.SL),
            tp=float(row.TP)
        )

    @property
    def signal_name(self) -> str:
        """Get human-readable signal name."""
        return {-1: "SELL", 0: "NONE", 1: "BUY"}.get(self.signal, "UNKNOWN")

    @property
    def is_actionable(self) -> bool:
        """Check if this decision should trigger a trade."""
        return self.signal != TradeSignal.NONE

    def __str__(self) -> str:
        """Human-readable string representation."""
        return (
            f"TradeDecision({self.pair} {self.signal_name} "
            f"gain:{self.gain:.4f} sl:{self.sl:.4f} tp:{self.tp:.4f})"
        )


# =============================================================================
# Candle Timing Models
# =============================================================================

class CandleTiming(BaseModel):
    """
    Tracks candle timing for triggering strategy evaluation.
    Monitors when new candles complete to trigger analysis.
    """
    last_time: Optional[datetime] = Field(
        default=None,
        description="Timestamp of last complete candle"
    )
    is_ready: bool = Field(
        default=False,
        description="Whether a new candle is ready for analysis"
    )

    model_config = ConfigDict(arbitrary_types_allowed=True)

    def update(self, new_time: datetime) -> bool:
        """
        Update timing with new candle time.
        
        Args:
            new_time: Timestamp of the new candle
            
        Returns:
            True if this is a new candle, False otherwise
        """
        if self.last_time is None or new_time > self.last_time:
            self.last_time = new_time
            self.is_ready = True
            return True
        self.is_ready = False
        return False

    def __str__(self) -> str:
        """Human-readable string representation."""
        if self.last_time:
            time_str = self.last_time.strftime('%y-%m-%d %H:%M')
        else:
            time_str = "None"
        return f"last_candle:{time_str} is_ready:{self.is_ready}"


# =============================================================================
# Trade Execution Models
# =============================================================================

class TradeRequest(BaseModel):
    """Request model for placing a trade."""
    pair: str = Field(description="Trading pair")
    amount: int = Field(ge=1, description="Trade amount/units")
    direction: Literal[-1, 1] = Field(description="-1=SELL, 1=BUY")
    stop_loss: float = Field(description="Stop loss price")
    take_profit: float = Field(description="Take profit price")


class TradeResult(BaseModel):
    """Result of a trade placement attempt."""
    success: bool = Field(default=False, description="Whether trade was placed")
    trade_id: Optional[int] = Field(default=None, description="Trade ID if successful")
    pair: str = Field(description="Trading pair")
    amount: Optional[int] = Field(default=None, description="Trade amount")
    message: str = Field(default="", description="Status message")
    error: Optional[str] = Field(default=None, description="Error message if failed")

    def __str__(self) -> str:
        if self.success:
            return f"TradeResult(SUCCESS id:{self.trade_id} {self.pair} amount:{self.amount})"
        return f"TradeResult(FAILED {self.pair}: {self.error or self.message})"
