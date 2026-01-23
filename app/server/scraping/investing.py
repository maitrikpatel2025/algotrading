"""
Investing.com Scraper
=====================
Scrapes technical analysis data from Investing.com.
"""

import datetime as dt
import logging
import time
from typing import Any, Dict, List

import requests

from config import settings

logger = logging.getLogger(__name__)


DATA_KEYS = [
    "pair_name",
    "ti_buy",
    "ti_sell",
    "ma_buy",
    "ma_sell",
    "S1",
    "S2",
    "S3",
    "pivot",
    "R1",
    "R2",
    "R3",
    "percent_bullish",
    "percent_bearish",
]


def _parse_data(text_list: List[str], pair_id: int, time_frame: int) -> Dict[str, Any]:
    """
    Parse scraped text data into a dictionary.

    Args:
        text_list: List of key=value strings
        pair_id: Investing.com pair ID
        time_frame: Timeframe in seconds

    Returns:
        Dictionary with parsed data
    """
    data = {"pair_id": pair_id, "time_frame": time_frame, "updated": dt.datetime.utcnow()}

    for item in text_list:
        temp_item = item.split("=")
        if len(temp_item) == 2 and temp_item[0] in DATA_KEYS:
            data[temp_item[0]] = temp_item[1]

    if "pair_name" in data:
        data["pair_name"] = data["pair_name"].replace("/", "_")

    return data


def fetch_technicals(pair_id: int, time_frame: int) -> Dict[str, Any]:
    """
    Fetch technical analysis data for a pair from Investing.com.

    Args:
        pair_id: Investing.com pair ID
        time_frame: Timeframe in seconds

    Returns:
        Dictionary with technical data or error information with 'error' key
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0"
    }

    params = {"action": "get_studies", "pair_ID": pair_id, "time_frame": time_frame}

    try:
        resp = requests.get(
            "https://www.investing.com/common/technical_studies/technical_studies_data.php",
            params=params,
            headers=headers,
            timeout=10,
        )

        if resp.status_code != 200:
            logger.error(f"Investing.com returned status {resp.status_code} for pair_id={pair_id}")
            return {
                "error": "external_service_error",
                "message": f"External data source returned status {resp.status_code}",
            }

        text = resp.content.decode("utf-8")

        if "pair_name=" not in text:
            logger.error(
                f"Invalid response format from Investing.com for pair_id={pair_id}: missing pair_name"
            )
            return {
                "error": "parsing_error",
                "message": "Unable to parse technical data from external source",
            }

        if "*;*quote_link" not in text:
            logger.error(
                f"Invalid response format from Investing.com for pair_id={pair_id}: missing quote_link"
            )
            return {
                "error": "parsing_error",
                "message": "Unable to parse technical data from external source",
            }

        index_start = text.index("pair_name=")
        index_end = text.index("*;*quote_link")

        data_str = text[index_start:index_end]

        return _parse_data(data_str.split("*;*"), pair_id, time_frame)

    except requests.exceptions.Timeout:
        logger.error(f"Timeout fetching technicals for pair_id={pair_id}")
        return {"error": "timeout", "message": "External data source request timed out"}
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Connection error fetching technicals for pair_id={pair_id}: {e}")
        return {"error": "connection_error", "message": "Unable to connect to external data source"}
    except Exception as e:
        logger.error(f"Unexpected error fetching technicals for pair_id={pair_id}: {e}")
        return {"error": "unknown_error", "message": f"An unexpected error occurred: {str(e)}"}


def get_pair_technicals(pair_name: str, timeframe: str) -> Dict[str, Any]:
    """
    Get technical analysis data for a currency pair.

    Args:
        pair_name: Currency pair (e.g., 'EUR_USD')
        timeframe: Timeframe key (e.g., 'H1', 'D')

    Returns:
        Dictionary with technical data or error information with 'error' key
    """
    # Convert timeframe to seconds
    if timeframe not in settings.TFS:
        tf = settings.TFS["H1"]
    else:
        tf = settings.TFS[timeframe]

    # Get pair ID from configuration
    if pair_name in settings.INVESTING_COM_PAIRS:
        pair_id = settings.INVESTING_COM_PAIRS[pair_name]["pair_id"]
        return fetch_technicals(pair_id, tf)

    logger.warning(f"Pair {pair_name} not found in INVESTING_COM_PAIRS configuration")
    return {
        "error": "invalid_pair",
        "message": f"Currency pair {pair_name} is not supported for technical analysis",
    }


def get_all_technicals() -> List[Dict[str, Any]]:
    """
    Fetch technical data for all major pairs and timeframes.

    Returns:
        List of technical data dictionaries
    """
    data = []

    for pair_id in range(1, 12):
        for time_frame in [3600, 86400]:
            logger.info(f"Fetching pair_id: {pair_id}, timeframe: {time_frame}")
            result = fetch_technicals(pair_id, time_frame)
            if result:
                data.append(result)
            time.sleep(0.5)  # Rate limiting

    return data
