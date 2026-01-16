"""
Technical Indicators
====================
Technical analysis indicators for trading strategies.
"""

import pandas as pd


def bollinger_bands(df: pd.DataFrame, n: int = 20, s: float = 2) -> pd.DataFrame:
    """
    Calculate Bollinger Bands.
    
    Args:
        df: DataFrame with OHLC data
        n: Moving average period
        s: Standard deviation multiplier
        
    Returns:
        DataFrame with BB_MA, BB_UP, BB_LW columns added
    """
    typical_price = (df.mid_c + df.mid_h + df.mid_l) / 3
    stddev = typical_price.rolling(window=n).std()
    
    df['BB_MA'] = typical_price.rolling(window=n).mean()
    df['BB_UP'] = df['BB_MA'] + stddev * s
    df['BB_LW'] = df['BB_MA'] - stddev * s
    
    return df


def atr(df: pd.DataFrame, n: int = 14) -> pd.DataFrame:
    """
    Calculate Average True Range (ATR).
    
    Args:
        df: DataFrame with OHLC data
        n: ATR period
        
    Returns:
        DataFrame with ATR column added
    """
    prev_c = df.mid_c.shift(1)
    tr1 = df.mid_h - df.mid_l
    tr2 = abs(df.mid_h - prev_c)
    tr3 = abs(prev_c - df.mid_l)
    
    tr = pd.DataFrame({'tr1': tr1, 'tr2': tr2, 'tr3': tr3}).max(axis=1)
    df[f"ATR_{n}"] = tr.rolling(window=n).mean()
    
    return df


def keltner_channels(df: pd.DataFrame, n_ema: int = 20, n_atr: int = 10) -> pd.DataFrame:
    """
    Calculate Keltner Channels.
    
    Args:
        df: DataFrame with OHLC data
        n_ema: EMA period
        n_atr: ATR period
        
    Returns:
        DataFrame with EMA, KeUp, KeLo columns added
    """
    df['EMA'] = df.mid_c.ewm(span=n_ema, min_periods=n_ema).mean()
    df = atr(df, n=n_atr)
    
    c_atr = f"ATR_{n_atr}"
    df['KeUp'] = df[c_atr] * 2 + df.EMA
    df['KeLo'] = df.EMA - df[c_atr] * 2
    df.drop(c_atr, axis=1, inplace=True)
    
    return df


def rsi(df: pd.DataFrame, n: int = 14) -> pd.DataFrame:
    """
    Calculate Relative Strength Index (RSI).
    
    Args:
        df: DataFrame with OHLC data
        n: RSI period
        
    Returns:
        DataFrame with RSI column added
    """
    alpha = 1.0 / n
    gains = df.mid_c.diff()

    wins = pd.Series([x if x >= 0 else 0.0 for x in gains], name="wins")
    losses = pd.Series([x * -1 if x < 0 else 0.0 for x in gains], name="losses")

    wins_rma = wins.ewm(min_periods=n, alpha=alpha).mean()
    losses_rma = losses.ewm(min_periods=n, alpha=alpha).mean()

    rs = wins_rma / losses_rma
    df[f"RSI_{n}"] = 100.0 - (100.0 / (1.0 + rs))
    
    return df


def macd(
    df: pd.DataFrame,
    n_slow: int = 26,
    n_fast: int = 12,
    n_signal: int = 9
) -> pd.DataFrame:
    """
    Calculate MACD (Moving Average Convergence Divergence).
    
    Args:
        df: DataFrame with OHLC data
        n_slow: Slow EMA period
        n_fast: Fast EMA period
        n_signal: Signal line period
        
    Returns:
        DataFrame with MACD, SIGNAL, HIST columns added
    """
    ema_long = df.mid_c.ewm(min_periods=n_slow, span=n_slow).mean()
    ema_short = df.mid_c.ewm(min_periods=n_fast, span=n_fast).mean()

    df['MACD'] = ema_short - ema_long
    df['SIGNAL'] = df.MACD.ewm(min_periods=n_signal, span=n_signal).mean()
    df['HIST'] = df.MACD - df.SIGNAL

    return df
