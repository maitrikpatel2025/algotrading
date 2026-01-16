"""
Bollinger Bands Strategy
========================
Trading strategy based on Bollinger Band breakouts.
Uses Pydantic models for type-safe trade decisions.
"""

import pandas as pd
from typing import Optional, Callable

import sys
sys.path.insert(0, '../server')

from core.models import TradeSettings, TradeDecision, TradeSignal
from core.indicators import bollinger_bands

# Number of additional rows to fetch for indicator calculation
ADDROWS = 20


def apply_signal(row, trade_settings: TradeSettings) -> int:
    """
    Apply signal logic based on Bollinger Band breakout.
    
    Strategy Logic:
    - BUY: Price opens inside bands, closes below lower band
    - SELL: Price opens inside bands, closes above upper band
    - Filters: Spread must be acceptable, gain must be sufficient
    
    Args:
        row: DataFrame row with price and indicator data
        trade_settings: Strategy settings (Pydantic model)
        
    Returns:
        Signal: BUY (1), SELL (-1), or NONE (0)
    """
    # Check filters first
    if row.SPREAD > trade_settings.maxspread:
        return TradeSignal.NONE
    if row.GAIN < trade_settings.mingain:
        return TradeSignal.NONE
    
    # Check for breakout signals
    if row.mid_c > row.BB_UP and row.mid_o < row.BB_UP:
        return TradeSignal.SELL
    elif row.mid_c < row.BB_LW and row.mid_o > row.BB_LW:
        return TradeSignal.BUY
    
    return TradeSignal.NONE


def apply_stop_loss(row, trade_settings: TradeSettings) -> float:
    """
    Calculate stop loss price based on signal direction.
    
    Args:
        row: DataFrame row with signal data
        trade_settings: Strategy settings (Pydantic model)
        
    Returns:
        Stop loss price level
    """
    if row.SIGNAL == TradeSignal.BUY:
        return row.mid_c - (row.GAIN / trade_settings.riskreward)
    elif row.SIGNAL == TradeSignal.SELL:
        return row.mid_c + (row.GAIN / trade_settings.riskreward)
    return 0.0


def apply_take_profit(row) -> float:
    """
    Calculate take profit price based on signal direction.
    
    Args:
        row: DataFrame row with signal data
        
    Returns:
        Take profit price level
    """
    if row.SIGNAL == TradeSignal.BUY:
        return row.mid_c + row.GAIN
    elif row.SIGNAL == TradeSignal.SELL:
        return row.mid_c - row.GAIN
    return 0.0


def process_candles(
    df: pd.DataFrame,
    pair: str,
    trade_settings: TradeSettings,
    log_message: Callable
) -> pd.Series:
    """
    Process candle data and generate trading signals.
    
    Workflow:
    1. Calculate Bollinger Bands
    2. Compute spread and potential gain
    3. Apply signal logic for each candle
    4. Calculate SL/TP levels
    
    Args:
        df: DataFrame with OHLC data
        pair: Trading pair name
        trade_settings: Strategy settings (Pydantic model)
        log_message: Logging function
        
    Returns:
        Last row with signal information
    """
    df.reset_index(drop=True, inplace=True)
    df['PAIR'] = pair
    df['SPREAD'] = df.ask_c - df.bid_c

    # Calculate Bollinger Bands using settings from Pydantic model
    df = bollinger_bands(df, trade_settings.n_ma, trade_settings.n_std)
    
    # Calculate potential gain (distance to MA)
    df['GAIN'] = abs(df.mid_c - df.BB_MA)
    
    # Apply strategy logic
    df['SIGNAL'] = df.apply(apply_signal, axis=1, trade_settings=trade_settings)
    df['TP'] = df.apply(apply_take_profit, axis=1)
    df['SL'] = df.apply(apply_stop_loss, axis=1, trade_settings=trade_settings)
    df['LOSS'] = abs(df.mid_c - df.SL)

    # Log the analysis
    log_cols = ['PAIR', 'time', 'mid_c', 'mid_o', 'SL', 'TP', 'SPREAD', 'GAIN', 'LOSS', 'SIGNAL']
    log_message(f"process_candles:\n{df[log_cols].tail()}", pair)

    return df[log_cols].iloc[-1]


def get_trade_decision(
    candle_time,
    pair: str,
    granularity: str,
    api,
    trade_settings: TradeSettings,
    log_message: Callable
) -> Optional[TradeDecision]:
    """
    Get a trade decision for a pair based on the Bollinger Bands strategy.
    
    Args:
        candle_time: Time of the candle to analyze
        pair: Trading pair name
        granularity: Timeframe (e.g., 'M1', 'H1')
        api: API client instance
        trade_settings: Strategy settings (Pydantic model)
        log_message: Logging function
        
    Returns:
        TradeDecision (Pydantic model) or None if no decision
    """
    # Calculate how many rows to fetch
    max_rows = (trade_settings.n_ma + ADDROWS) * -1

    log_message(
        f"Strategy analysis: max_rows:{max_rows} candle_time:{candle_time} granularity:{granularity}",
        pair
    )

    # Fetch candle data from API
    df = api.get_candles_df(pair, count=max_rows, granularity=granularity)

    if df is None or df.shape[0] == 0:
        log_message("Failed to get candles", pair)
        return None

    # Verify we have the expected candle
    if df.iloc[-1].time != candle_time:
        log_message(f"Candle time mismatch: {df.iloc[-1].time} != {candle_time}", pair)
        return None

    # Process candles and get the last row with signal info
    last_row = process_candles(df, pair, trade_settings, log_message)
    
    # Create Pydantic TradeDecision from DataFrame row
    return TradeDecision.from_dataframe_row(last_row)
