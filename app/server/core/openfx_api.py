"""
OpenFX API Client
=================
Client for interacting with the OpenFX trading API.
"""

import datetime as dt
import json
import logging
import time
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd
import requests

from config import settings
from infrastructure.instrument_collection import instrument_collection
from models.api_price import ApiPrice
from models.open_trade import OpenTrade

logger = logging.getLogger(__name__)

LABEL_MAP = {
    'Open': 'o',
    'High': 'h',
    'Low': 'l',
    'Close': 'c',
}

THROTTLE_TIME = 0.3


class OpenFxApi:
    """
    Client for the OpenFX trading API.
    Handles authentication, rate limiting, and all API operations.
    """

    def __init__(self):
        """Initialize API client with session and headers."""
        self.session = requests.Session()
        self.session.headers.update(settings.SECURE_HEADER)
        self.last_req_time = dt.datetime.now()

    def _throttle(self) -> None:
        """Apply rate limiting between API calls."""
        elapsed = (dt.datetime.now() - self.last_req_time).total_seconds()
        if elapsed < THROTTLE_TIME:
            time.sleep(THROTTLE_TIME - elapsed)
        self.last_req_time = dt.datetime.now()

    def _make_request(
        self,
        url: str,
        verb: str = 'get',
        code: int = 200,
        params: Optional[Dict] = None,
        data: Optional[Dict] = None,
        headers: Optional[Dict] = None
    ) -> Tuple[bool, Any]:
        """
        Make an HTTP request to the API.

        Args:
            url: API endpoint path
            verb: HTTP method (get, post, put, delete)
            code: Expected success status code
            params: URL parameters
            data: Request body data
            headers: Additional headers

        Returns:
            Tuple of (success, response_data)
        """
        self._throttle()
        full_url = f"{settings.OPENFX_URL}/{url}"

        if data is not None:
            data = json.dumps(data)

        try:
            response = None

            if verb == "get":
                response = self.session.get(full_url, params=params, data=data, headers=headers)
            elif verb == "post":
                response = self.session.post(full_url, params=params, data=data, headers=headers)
            elif verb == "put":
                response = self.session.put(full_url, params=params, data=data, headers=headers)
            elif verb == "delete":
                response = self.session.delete(full_url, params=params, data=data, headers=headers)

            if response is None:
                return False, {'error': 'verb not found'}

            if response.status_code == code:
                return True, response.json()
            else:
                return False, response.json()

        except Exception as error:
            return False, {'Exception': str(error)}

    # =========================================================================
    # Account Operations
    # =========================================================================

    def get_account_summary(self) -> Optional[Dict]:
        """
        Get account summary information.

        Returns:
            Account data or None on error
        """
        ok, data = self._make_request("account")

        if ok:
            return data
        else:
            logger.error(f"get_account_summary(): {data}")
            return None

    def get_account_instruments(self, status_group: str = 'Forex') -> Optional[List[Dict]]:
        """
        Get available trading instruments.

        Args:
            status_group: Filter by status group (default: 'Forex')

        Returns:
            List of instruments or None on error
        """
        ok, symbol_data = self._make_request("symbol")

        if not ok:
            logger.error(f"get_account_instruments(): {symbol_data}")
            return None

        # Filter to forex pairs with 6-character symbols
        target_inst = [
            x for x in symbol_data
            if x['StatusGroupId'] == status_group and len(x['Symbol']) == 6
        ]

        ok, history_symbols = self._make_request("quotehistory/symbols")

        if not ok:
            return target_inst

        return [x for x in target_inst if x['Symbol'] in history_symbols]

    # =========================================================================
    # Candle/Price Data Operations
    # =========================================================================

    def fetch_candles(
        self,
        pair_name: str,
        count: int = -10,
        granularity: str = "H1",
        ts_from: Optional[int] = None
    ) -> Tuple[bool, Optional[List]]:
        """
        Fetch candlestick data for a pair.

        Args:
            pair_name: Trading pair symbol
            count: Number of candles (negative for most recent)
            granularity: Timeframe (M5, M15, H1, D)
            ts_from: Starting timestamp (milliseconds)

        Returns:
            Tuple of (success, [ask_data, bid_data])
        """
        if ts_from is None:
            ts_from = int(pd.Timestamp(dt.datetime.utcnow()).timestamp() * 1000)

        params = {'timestamp': ts_from, 'count': count if count >= 0 else count + 1}

        base_url = f"quotehistory/{pair_name}/{granularity}/bars/"

        ok_bid, bid_data = self._make_request(base_url + "bid", params=params)
        ok_ask, ask_data = self._make_request(base_url + "ask", params=params)

        if ok_ask and ok_bid:
            return True, [ask_data, bid_data]

        return False, None

    def _get_price_dict(self, price_label: str, item: Dict) -> Dict:
        """Convert a candle item to price dictionary."""
        data = {'time': pd.to_datetime(item['Timestamp'], unit='ms')}
        for ohlc_key, ohlc_val in LABEL_MAP.items():
            data[f"{price_label}_{ohlc_val}"] = item[ohlc_key]
        return data

    def get_candles_df(
        self,
        pair_name: str,
        count: int = -10,
        granularity: str = "H1",
        date_from: Optional[dt.datetime] = None
    ) -> Optional[pd.DataFrame]:
        """
        Get candlestick data as a DataFrame.

        Args:
            pair_name: Trading pair symbol
            count: Number of candles
            granularity: Timeframe
            date_from: Starting date

        Returns:
            DataFrame with OHLC data or None on error
        """
        ts_from = None
        if date_from is not None:
            ts_from = int(pd.Timestamp(date_from).timestamp() * 1000)

        ok, data = self.fetch_candles(pair_name, count=count, granularity=granularity, ts_from=ts_from)

        if not ok:
            return None

        data_ask, data_bid = data

        if data_ask is None or data_bid is None:
            return None

        if "Bars" not in data_ask or "Bars" not in data_bid:
            return pd.DataFrame()

        ask_bars = data_ask["Bars"]
        bid_bars = data_bid["Bars"]

        if len(ask_bars) == 0 or len(bid_bars) == 0:
            return pd.DataFrame()

        available_to = pd.to_datetime(data_bid['AvailableTo'], unit='ms')

        bids = [self._get_price_dict('bid', item) for item in bid_bars]
        asks = [self._get_price_dict('ask', item) for item in ask_bars]

        df_bid = pd.DataFrame.from_dict(bids)
        df_ask = pd.DataFrame.from_dict(asks)
        df_merged = pd.merge(left=df_bid, right=df_ask, on='time')

        # Calculate mid prices
        for suffix in ['_o', '_h', '_l', '_c']:
            df_merged[f'mid{suffix}'] = (
                (df_merged[f'ask{suffix}'] - df_merged[f'bid{suffix}']) / 2
                + df_merged[f'bid{suffix}']
            )

        # Remove incomplete candle
        if count < 0 and df_merged.shape[0] > 0 and df_merged.iloc[-1].time == available_to:
            df_merged = df_merged[:-1]

        return df_merged

    def last_complete_candle(self, pair_name: str, granularity: str) -> Optional[pd.Timestamp]:
        """
        Get the timestamp of the last complete candle.

        Args:
            pair_name: Trading pair symbol
            granularity: Timeframe

        Returns:
            Timestamp or None if no data
        """
        df = self.get_candles_df(pair_name, granularity=granularity)
        if df is None or df.shape[0] == 0:
            return None
        return df.iloc[-1].time

    def web_api_candles(self, pair_name: str, granularity: str, count: int) -> Optional[Dict]:
        """
        Get candle data formatted for web API response.

        Args:
            pair_name: Trading pair symbol (with or without underscore)
            granularity: Timeframe
            count: Number of candles

        Returns:
            Dictionary with candle data for frontend
        """
        pair_name = pair_name.replace('_', '')
        df = self.get_candles_df(pair_name, granularity=granularity, count=int(count) * -1)

        if df is None or df.shape[0] == 0:
            return None

        cols = ['time', 'mid_o', 'mid_h', 'mid_l', 'mid_c']
        df = df[cols].copy()
        df['time'] = df.time.dt.strftime("%y-%m-%d %H:%M")

        return df.to_dict(orient='list')

    # =========================================================================
    # Trading Operations
    # =========================================================================

    def place_trade(
        self,
        pair_name: str,
        amount: int,
        direction: int,
        stop_loss: Optional[float] = None,
        take_profit: Optional[float] = None
    ) -> Optional[int]:
        """
        Place a market trade.

        Args:
            pair_name: Trading pair symbol
            amount: Trade amount
            direction: BUY (1) or SELL (-1)
            stop_loss: Stop loss price
            take_profit: Take profit price

        Returns:
            Trade ID or None on failure
        """
        dir_str = "Buy" if direction == settings.BUY else "Sell"

        instrument = instrument_collection.get(pair_name)
        if instrument is None:
            logger.error(f"Instrument not found: {pair_name}")
            return None

        data = {
            "Type": "Market",
            "Symbol": pair_name,
            "Amount": amount,
            "Side": dir_str
        }

        if stop_loss is not None:
            data['StopLoss'] = round(stop_loss, instrument.displayPrecision)

        if take_profit is not None:
            data['TakeProfit'] = round(take_profit, instrument.displayPrecision)

        logger.info(f"Place Trade: {data}")

        ok, response = self._make_request("trade", verb="post", data=data)

        if ok and response.get('RemainingAmount', 0) != 0:
            trade = self.get_open_trade(response['Id'])
            if trade is not None:
                return response['Id']

        return None

    def get_open_trade(self, trade_id: int) -> Optional[OpenTrade]:
        """
        Get an open trade by ID.

        Args:
            trade_id: Trade ID

        Returns:
            OpenTrade or None if not found
        """
        ok, response = self._make_request(f"trade/{trade_id}")

        if ok and 'Id' in response:
            return OpenTrade(response)

        return None

    def get_open_trades(self) -> Optional[List[OpenTrade]]:
        """
        Get all open trades.

        Returns:
            List of OpenTrade objects or None on error
        """
        ok, response = self._make_request("trade")

        if ok:
            return [OpenTrade(x) for x in response]

        return None

    def close_trade(self, trade_id: int) -> bool:
        """
        Close an open trade.

        Args:
            trade_id: Trade ID to close

        Returns:
            True on success, False on failure
        """
        params = {
            "trade.type": "Close",
            "trade.id": trade_id
        }

        ok, _ = self._make_request("trade", verb="delete", params=params)

        if ok:
            logger.info(f"Closed {trade_id} successfully")
        else:
            logger.error(f"Failed to close {trade_id}")

        return ok

    # =========================================================================
    # Price Operations
    # =========================================================================

    def get_prices(self, instruments_list: List[str]) -> Optional[List[ApiPrice]]:
        """
        Get current prices for instruments.

        Args:
            instruments_list: List of instrument symbols

        Returns:
            List of ApiPrice objects or None on error
        """
        ok, response = self._make_request(f"tick/{' '.join(instruments_list)}")

        if ok:
            return [ApiPrice(x) for x in response]

        return None

    def get_pip_value(self, instruments_list: List[str]) -> Optional[Dict[str, float]]:
        """
        Get pip values for instruments.

        Args:
            instruments_list: List of instrument symbols

        Returns:
            Dictionary of symbol -> pip value or None on error
        """
        params = {
            'targetCurrency': 'EUR',
            'symbols': ' '.join(instruments_list)
        }

        ok, response = self._make_request("pipsvalue", params=params)

        if ok:
            return {x['Symbol']: x['Value'] for x in response}

        return None
