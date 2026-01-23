"""
Forex Trading API Server
========================
Main FastAPI application for the forex trading dashboard.

This server provides endpoints for:
- Account information
- Price data and charts
- Technical analysis
- Market headlines
"""

import logging
import sys
import traceback
from datetime import datetime, timedelta
from typing import Optional

import requests.exceptions
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from api.routes import get_options
from config import settings
from core.backtest_executor import backtest_executor
from core.backtest_service import (
    delete_backtest as service_delete_backtest,
)
from core.backtest_service import (
    duplicate_backtest as service_duplicate_backtest,
)
from core.backtest_service import (
    get_backtest as service_get_backtest,
)
from core.backtest_service import (
    list_backtests as service_list_backtests,
)
from core.backtest_service import (
    save_backtest as service_save_backtest,
)
from core.bot_controller import bot_controller
from core.bot_status import bot_status_tracker
from core.data_models import (
    BacktestProgressResponse,
    BotControlResponse,
    BotStartRequest,
    BotStatusResponse,
    CancelBacktestRequest,
    CancelBacktestResponse,
    CheckNameResponse,
    DeleteBacktestResponse,
    DeleteStrategyResponse,
    DuplicateBacktestResponse,
    DuplicateStrategyResponse,
    HeadlineItem,
    HeadlinesResponse,
    HealthCheckResponse,
    ImportStrategyRequest,
    ImportStrategyResponse,
    ImportStrategySaveRequest,
    ImportValidationResult,
    ListBacktestsResponse,
    ListStrategiesExtendedResponse,
    ListStrategiesResponse,
    LoadBacktestResponse,
    LoadStrategyResponse,
    OpenTradesResponse,
    RunBacktestRequest,
    RunBacktestResponse,
    SaveBacktestRequest,
    SaveBacktestResponse,
    SaveStrategyRequest,
    SaveStrategyResponse,
    SpreadResponse,
    TradeHistoryItem,
    TradeHistoryResponse,
    TradeInfo,
    TradingOptionsResponse,
)
from core.openfx_api import OpenFxApi
from core.strategy_service import (
    check_name_exists as service_check_name_exists,
)
from core.strategy_service import (
    delete_strategy as service_delete_strategy,
)
from core.strategy_service import (
    duplicate_strategy as service_duplicate_strategy,
)
from core.strategy_service import (
    get_strategy as service_get_strategy,
)
from core.strategy_service import (
    get_strategy_for_export as service_get_strategy_for_export,
)
from core.strategy_service import (
    import_strategy as service_import_strategy,
)
from core.strategy_service import (
    list_strategies as service_list_strategies,
)
from core.strategy_service import (
    list_strategies_extended as service_list_strategies_extended,
)
from core.strategy_service import (
    save_strategy as service_save_strategy,
)
from core.strategy_service import (
    validate_import as service_validate_import,
)
from db import is_configured, validate_connection
from scraping import get_bloomberg_headlines, get_pair_technicals

# Load .env file from server directory
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

# Create logger for this module
logger = logging.getLogger(__name__)

# =============================================================================
# Application Setup
# =============================================================================

app = FastAPI(
    title="Forex Trading API",
    description="API for forex trading dashboard with real-time price data, technical analysis, and market headlines",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React & Vite dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global app state
app_start_time = datetime.now()

# Initialize API client
api = OpenFxApi()


# =============================================================================
# Startup Events
# =============================================================================


@app.on_event("startup")
async def startup_event():
    """Validate database connection on startup."""
    if is_configured():
        if validate_connection():
            logger.info("[STARTUP] Supabase connection validated successfully")
        else:
            logger.warning(
                "[STARTUP] Supabase connection validation failed. "
                "Database features may not work correctly."
            )
    else:
        logger.info(
            "[STARTUP] Supabase not configured. "
            "Set SUPABASE_URL and SUPABASE_ANON_KEY to enable database features."
        )


# =============================================================================
# API Routes
# =============================================================================


@app.get("/api/test", tags=["Health"])
async def test():
    """Health check endpoint."""
    return {"message": "Forex Trading API is running!"}


@app.get("/api/health", response_model=HealthCheckResponse, tags=["Health"])
async def health():
    """Detailed health check endpoint with uptime information."""
    try:
        uptime = (datetime.now() - app_start_time).total_seconds()

        # Check Supabase connection status
        db_connected = False
        if is_configured():
            db_connected = validate_connection()

        response = HealthCheckResponse(
            status="ok",
            service="forex-trading-api",
            version="1.0.0",
            uptime_seconds=uptime,
            database_connected=db_connected,
        )
        logger.info(f"[SUCCESS] Health check: OK, uptime: {uptime:.2f}s, db: {db_connected}")
        return response
    except Exception as e:
        logger.error(f"[ERROR] Health check failed: {str(e)}")
        return HealthCheckResponse(status="error", uptime_seconds=0)


@app.get("/api/account", tags=["Account"])
async def account():
    """
    Get account summary information.

    Returns:
        JSON object with account data including Id, Balance, Equity, Profit,
        Margin, MarginLevel, and Leverage
    """
    try:
        data = api.get_account_summary()

        if data is None:
            logger.warning("[WARNING] Account summary returned None - API call may have failed")
            return {"error": "Failed to fetch account data"}

        logger.info(f"[SUCCESS] Account summary fetched for account: {data.get('Id', 'unknown')}")
        return data
    except Exception as e:
        logger.error(f"[ERROR] Account summary fetch failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return {"error": str(e)}


@app.get("/api/trades/open", response_model=OpenTradesResponse, tags=["Trades"])
async def open_trades():
    """
    Get all open trades.

    Returns:
        JSON object with list of open trades including instrument, price,
        amount, unrealized P/L, margin used, stop loss, and take profit
    """
    try:
        trades = api.get_open_trades()

        if trades is None:
            logger.warning("[WARNING] Open trades returned None - API call may have failed")
            return OpenTradesResponse(trades=[], count=0, error="Failed to fetch open trades")

        trade_info_list = [
            TradeInfo(
                id=trade.id,
                instrument=trade.instrument,
                price=trade.price,
                initial_amount=trade.initialAmount,
                unrealized_pl=trade.unrealizedPL,
                margin_used=trade.marginUsed,
                stop_loss=trade.stop_loss if trade.stop_loss else None,
                take_profit=trade.take_profit if trade.take_profit else None,
            )
            for trade in trades
        ]

        response = OpenTradesResponse(trades=trade_info_list, count=len(trade_info_list))
        logger.info(f"[SUCCESS] Open trades fetched: {len(trade_info_list)} trades")
        return response
    except Exception as e:
        logger.error(f"[ERROR] Open trades fetch failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return OpenTradesResponse(trades=[], count=0, error=str(e))


@app.get("/api/trades/history", response_model=TradeHistoryResponse, tags=["Trades"])
async def trade_history(timestamp_from: Optional[int] = None, timestamp_to: Optional[int] = None):
    """
    Get trade history (closed/completed trades) from FXOpen API.

    Args:
        timestamp_from: Start timestamp in milliseconds (Unix time). Defaults to 30 days ago.
        timestamp_to: End timestamp in milliseconds (Unix time). Defaults to now.

    Returns:
        JSON object with list of historical trades from the FXOpen Trade History API.
    """
    try:
        # Default to last 30 days if timestamps not provided
        if timestamp_to is None:
            timestamp_to = int(datetime.now().timestamp() * 1000)
        if timestamp_from is None:
            timestamp_from = int((datetime.now() - timedelta(days=30)).timestamp() * 1000)

        # Fetch trade history from FXOpen API
        history_data = api.get_trade_history(timestamp_from, timestamp_to)

        if history_data is None:
            logger.warning("[WARNING] Trade history returned None from API")
            return TradeHistoryResponse(
                trades=[], count=0, message="Unable to fetch trade history from the API."
            )

        # Parse the response and transform to TradeHistoryItem format
        records = history_data.get("Records", [])
        trades = []

        for record in records:
            # Map FXOpen API fields to our TradeHistoryItem model
            trade_item = TradeHistoryItem(
                id=record.get("TradeId", 0),
                instrument=record.get("Symbol", ""),
                side=record.get("TradeSide", ""),
                amount=record.get("TradeAmount", 0),
                entry_price=record.get("TradePrice", 0.0),
                exit_price=record.get("PositionClosePrice"),
                realized_pl=record.get("BalanceMovement"),
                closed_at=datetime.fromtimestamp(record.get("TransactionTimestamp", 0) / 1000)
                if record.get("TransactionTimestamp")
                else None,
                transaction_type=record.get("TransactionType"),
                transaction_reason=record.get("TransactionReason"),
                transaction_timestamp=record.get("TransactionTimestamp"),
                trade_id=record.get("TradeId"),
                trade_type=record.get("TradeType"),
                position_id=record.get("PositionId"),
                position_amount=record.get("PositionAmount"),
                position_close_price=record.get("PositionClosePrice"),
                balance_movement=record.get("BalanceMovement"),
                commission=record.get("Commission"),
                swap=record.get("Swap"),
            )
            trades.append(trade_item)

        response = TradeHistoryResponse(
            trades=trades,
            count=len(trades),
            message=f"Retrieved {len(trades)} trade history records.",
        )
        logger.info(f"[SUCCESS] Trade history endpoint returned {len(trades)} records")
        return response

    except requests.exceptions.Timeout as e:
        logger.warning(f"[TIMEOUT] Trade history request timed out: {str(e)}")
        return TradeHistoryResponse(
            trades=[], count=0, message="Trade history request timed out. Please try again later."
        )
    except requests.exceptions.RequestException as e:
        logger.warning(f"[NETWORK_ERROR] Trade history network error: {str(e)}")
        return TradeHistoryResponse(
            trades=[],
            count=0,
            message="Unable to connect to trade history service. Please try again later.",
        )
    except Exception as e:
        logger.error(f"[ERROR] Trade history fetch failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return TradeHistoryResponse(trades=[], count=0, error=str(e))


@app.get("/api/bot/status", response_model=BotStatusResponse, tags=["Bot"])
async def bot_status():
    """
    Get trading bot operational status.

    Returns:
        JSON object with bot status including:
        - status (running/stopped/paused/error)
        - uptime, last signal time, signals today, trades today
        - monitored pairs and active strategy
    """
    try:
        status = bot_status_tracker.get_status()
        logger.info(f"[SUCCESS] Bot status fetched: {status.status}")
        return status
    except Exception as e:
        logger.error(f"[ERROR] Bot status fetch failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return BotStatusResponse(status="error", error_message=str(e))


@app.post("/api/bot/start", response_model=BotControlResponse, tags=["Bot"])
async def bot_start(request: BotStartRequest = None):
    """
    Start the trading bot.

    Args:
        request: Optional configuration for the bot (strategy, pairs, timeframe)

    Returns:
        JSON object with success status, message, and PID if successful

    Status Codes:
        200: Bot started successfully
        409: Bot is already running
        500: Internal server error
    """
    try:
        # Extract configuration from request if provided
        strategy = request.strategy if request else None
        pairs = request.pairs if request else None
        timeframe = request.timeframe if request else None

        logger.info(
            f"[BOT_CONTROL] Start request received - strategy: {strategy}, pairs: {pairs}, timeframe: {timeframe}"
        )

        result = bot_controller.start_bot(strategy=strategy, pairs=pairs, timeframe=timeframe)

        if result["success"]:
            # Update bot status tracker
            bot_status_tracker.set_running(
                strategy_name=strategy or "Bollinger Bands Strategy",
                strategy_description="Automated trading strategy",
            )
            logger.info(f"[SUCCESS] Bot started: {result['message']}")
            return BotControlResponse(**result)
        else:
            error = result.get("error", "")
            if error == "conflict":
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=result["message"])
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result["message"]
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Bot start failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/bot/stop", response_model=BotControlResponse, tags=["Bot"])
async def bot_stop():
    """
    Stop the trading bot gracefully.

    Returns:
        JSON object with success status and message

    Status Codes:
        200: Bot stopped successfully
        400: Bot is not running
        500: Internal server error
    """
    try:
        logger.info("[BOT_CONTROL] Stop request received")

        result = bot_controller.stop_bot()

        if result["success"]:
            # Update bot status tracker
            bot_status_tracker.set_stopped()
            logger.info(f"[SUCCESS] Bot stopped: {result['message']}")
            return BotControlResponse(**result)
        else:
            error = result.get("error", "")
            if error == "not_running":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"]
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result["message"]
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Bot stop failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/bot/restart", response_model=BotControlResponse, tags=["Bot"])
async def bot_restart(request: BotStartRequest = None):
    """
    Restart the trading bot (stop + start).

    Args:
        request: Optional configuration for the bot (strategy, pairs, timeframe)

    Returns:
        JSON object with success status, message, and PID if successful

    Status Codes:
        200: Bot restarted successfully
        500: Internal server error
    """
    try:
        # Extract configuration from request if provided
        strategy = request.strategy if request else None
        pairs = request.pairs if request else None
        timeframe = request.timeframe if request else None

        logger.info(
            f"[BOT_CONTROL] Restart request received - strategy: {strategy}, pairs: {pairs}, timeframe: {timeframe}"
        )

        result = bot_controller.restart_bot(strategy=strategy, pairs=pairs, timeframe=timeframe)

        if result["success"]:
            # Update bot status tracker
            bot_status_tracker.set_running(
                strategy_name=strategy or "Bollinger Bands Strategy",
                strategy_description="Automated trading strategy",
            )
            logger.info(f"[SUCCESS] Bot restarted: {result['message']}")
            return BotControlResponse(**result)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result["message"]
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Bot restart failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/api/headlines", response_model=HeadlinesResponse, tags=["Market Data"])
async def headlines():
    """
    Get forex market headlines from Bloomberg.

    Returns:
        JSON array of headline objects with 'headline' and 'link' fields
    """
    try:
        data = get_bloomberg_headlines()

        if data is None:
            return HeadlinesResponse(headlines=[], count=0, error="Failed to fetch headlines")

        headline_items = [
            HeadlineItem(headline=item["headline"], link=item["link"]) for item in data
        ]

        response = HeadlinesResponse(headlines=headline_items, count=len(headline_items))
        logger.info(f"[SUCCESS] Headlines fetched: {len(headline_items)} items")
        return response
    except Exception as e:
        logger.error(f"[ERROR] Headlines fetch failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return HeadlinesResponse(headlines=[], count=0, error=str(e))


@app.get("/api/options", response_model=TradingOptionsResponse, tags=["Trading"])
async def options():
    """
    Get available trading options (pairs and timeframes).

    Returns:
        JSON object with 'pairs' and 'granularities' arrays
    """
    try:
        data = get_options()

        if data is None:
            return TradingOptionsResponse(error="Failed to get options")

        response = TradingOptionsResponse(
            pairs=data.get("pairs", []), granularities=data.get("granularities", [])
        )
        logger.info(
            f"[SUCCESS] Options fetched: {len(response.pairs)} pairs, {len(response.granularities)} granularities"
        )
        return response
    except Exception as e:
        logger.error(f"[ERROR] Options fetch failed: {str(e)}")
        return TradingOptionsResponse(error=str(e))


@app.get("/api/spread/{pair}", response_model=SpreadResponse, tags=["Price Data"])
async def spread(pair: str):
    """
    Get current spread data for a currency pair.

    Args:
        pair: Currency pair (e.g., 'EUR_USD')

    Returns:
        JSON object with spread in pips, bid/ask prices, and timestamp
    """
    try:
        # Validate pair exists in available options
        available_pairs = list(settings.INVESTING_COM_PAIRS.keys())
        if pair not in available_pairs:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Currency pair '{pair}' not found in available instruments",
            )

        # Get price data (API expects pair without underscore)
        symbol = pair.replace("_", "")
        prices = api.get_prices([symbol])

        if prices is None or len(prices) == 0:
            logger.warning(f"[WARNING] Could not fetch price for {pair}")
            return SpreadResponse(pair=pair, error="Unable to fetch current price data")

        price = prices[0]

        # Calculate spread in pips
        # JPY pairs have pip at 0.01, others at 0.0001
        is_jpy_pair = "JPY" in pair
        pip_multiplier = 100 if is_jpy_pair else 10000

        raw_spread = abs(price.ask - price.bid)
        spread_pips = round(raw_spread * pip_multiplier, 2)

        response = SpreadResponse(
            pair=pair, spread=spread_pips, bid=price.bid, ask=price.ask, timestamp=price.time
        )
        logger.info(f"[SUCCESS] Spread fetched for {pair}: {spread_pips} pips")
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Spread fetch failed for {pair}: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return SpreadResponse(pair=pair, error=str(e))


@app.get("/api/technicals/{pair}/{timeframe}", tags=["Technical Analysis"])
async def technicals(pair: str, timeframe: str):
    """
    Get technical analysis data for a currency pair.

    Args:
        pair: Currency pair (e.g., 'EUR_USD')
        timeframe: Timeframe (e.g., 'H1', 'D')

    Returns:
        JSON object with technical indicators and support/resistance levels
    """
    try:
        data = get_pair_technicals(pair, timeframe)

        # Check if the response contains an error
        if data is not None and "error" in data:
            error_type = data.get("error")
            error_message = data.get("message", "Unknown error")
            logger.warning(
                f"[WARNING] Technicals error for {pair}/{timeframe}: {error_type} - {error_message}"
            )

            # Return 503 for external service errors, 400 for invalid input
            if error_type in ["external_service_error", "timeout", "connection_error"]:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=error_message
                )
            elif error_type == "invalid_pair":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_message)
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_message
                )

        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Technical data not found for {pair}/{timeframe}",
            )

        logger.info(f"[SUCCESS] Technicals fetched for {pair}/{timeframe}")
        return data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Technicals fetch failed: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/api/prices/{pair}/{granularity}/{count}", tags=["Price Data"])
async def prices(pair: str, granularity: str, count: str):
    """
    Get historical price data (candlesticks) for a currency pair.

    Args:
        pair: Currency pair (e.g., 'EUR_USD')
        granularity: Timeframe (e.g., 'H1', 'D')
        count: Number of candles to fetch

    Returns:
        JSON object with OHLC price arrays for charting
    """
    try:
        data = api.web_api_candles(pair, granularity, count)

        # Check if the response contains an error
        if data is not None and "error" in data:
            error_type = data.get("error")
            error_message = data.get("message", "Unknown error")
            logger.warning(
                f"[WARNING] Prices error for {pair}/{granularity}: {error_type} - {error_message}"
            )

            # Return 503 for API/service errors
            if error_type in ["api_error", "no_data"]:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=error_message
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_message
                )

        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Price data not found for {pair}/{granularity}",
            )

        logger.info(f"[SUCCESS] Prices fetched for {pair}/{granularity}, count: {count}")
        return data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Prices fetch failed: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# =============================================================================
# Strategy Routes
# =============================================================================


@app.post("/api/strategies", response_model=SaveStrategyResponse, tags=["Strategies"])
async def save_strategy(request: SaveStrategyRequest):
    """
    Save a new strategy or update an existing one.

    Args:
        request: Strategy configuration to save

    Returns:
        JSON object with success status, strategy ID, and message
    """
    try:
        strategy = request.strategy
        logger.info(f"[STRATEGY] Save request received for strategy: {strategy.name}")

        success, strategy_id, error = service_save_strategy(strategy)

        if success:
            logger.info(f"[SUCCESS] Strategy saved: {strategy.name} (ID: {strategy_id})")
            return SaveStrategyResponse(
                success=True,
                strategy_id=strategy_id,
                message=f"Strategy '{strategy.name}' saved successfully",
            )
        else:
            logger.warning(f"[WARNING] Strategy save failed: {error}")
            return SaveStrategyResponse(
                success=False, message="Failed to save strategy", error=error
            )

    except Exception as e:
        logger.error(f"[ERROR] Strategy save failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return SaveStrategyResponse(success=False, message="Failed to save strategy", error=str(e))


@app.get("/api/strategies", response_model=ListStrategiesResponse, tags=["Strategies"])
async def list_strategies():
    """
    List all saved strategies.

    Returns:
        JSON object with list of strategy summaries
    """
    try:
        logger.info("[STRATEGY] List strategies request received")

        success, strategies, error = service_list_strategies()

        if success:
            logger.info(f"[SUCCESS] Listed {len(strategies)} strategies")
            return ListStrategiesResponse(
                success=True, strategies=strategies, count=len(strategies)
            )
        else:
            logger.warning(f"[WARNING] Strategy list failed: {error}")
            return ListStrategiesResponse(success=False, strategies=[], count=0, error=error)

    except Exception as e:
        logger.error(f"[ERROR] Strategy list failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return ListStrategiesResponse(success=False, strategies=[], count=0, error=str(e))


@app.get("/api/strategies/check-name/{name}", response_model=CheckNameResponse, tags=["Strategies"])
async def check_strategy_name(name: str):
    """
    Check if a strategy with the given name already exists.

    Args:
        name: Strategy name to check

    Returns:
        JSON object indicating if the name exists and the strategy ID if found
    """
    try:
        logger.info(f"[STRATEGY] Check name request for: {name}")

        success, response, error = service_check_name_exists(name)

        if success:
            logger.info(f"[SUCCESS] Name check complete: exists={response.exists}")
            return response
        else:
            logger.warning(f"[WARNING] Name check failed: {error}")
            return CheckNameResponse(exists=False)

    except Exception as e:
        logger.error(f"[ERROR] Name check failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return CheckNameResponse(exists=False)


@app.get(
    "/api/strategies/extended", response_model=ListStrategiesExtendedResponse, tags=["Strategies"]
)
async def list_strategies_extended():
    """
    List all saved strategies with extended metadata (indicator counts, etc).

    Returns:
        JSON object with list of strategy summaries including counts
    """
    try:
        logger.info("[STRATEGY] List strategies (extended) request received")

        success, strategies, error = service_list_strategies_extended()

        if success:
            logger.info(f"[SUCCESS] Listed {len(strategies)} strategies (extended)")
            return ListStrategiesExtendedResponse(
                success=True, strategies=strategies, count=len(strategies)
            )
        else:
            logger.warning(f"[WARNING] Strategy list (extended) failed: {error}")
            return ListStrategiesExtendedResponse(
                success=False, strategies=[], count=0, error=error
            )

    except Exception as e:
        logger.error(f"[ERROR] Strategy list (extended) failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return ListStrategiesExtendedResponse(success=False, strategies=[], count=0, error=str(e))


@app.get("/api/strategies/{strategy_id}", response_model=LoadStrategyResponse, tags=["Strategies"])
async def get_strategy(strategy_id: str):
    """
    Get a specific strategy by ID.

    Args:
        strategy_id: The strategy ID to retrieve

    Returns:
        JSON object with the strategy configuration
    """
    try:
        logger.info(f"[STRATEGY] Get strategy request for ID: {strategy_id}")

        success, strategy, error = service_get_strategy(strategy_id)

        if success:
            logger.info(f"[SUCCESS] Strategy retrieved: {strategy.name}")
            return LoadStrategyResponse(success=True, strategy=strategy)
        else:
            logger.warning(f"[WARNING] Strategy get failed: {error}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error or f"Strategy not found: {strategy_id}",
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Strategy get failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.delete(
    "/api/strategies/{strategy_id}", response_model=DeleteStrategyResponse, tags=["Strategies"]
)
async def delete_strategy(strategy_id: str):
    """
    Delete a strategy by ID.

    Args:
        strategy_id: The strategy ID to delete

    Returns:
        JSON object with success status and message
    """
    try:
        logger.info(f"[STRATEGY] Delete strategy request for ID: {strategy_id}")

        success, error = service_delete_strategy(strategy_id)

        if success:
            logger.info(f"[SUCCESS] Strategy deleted: {strategy_id}")
            return DeleteStrategyResponse(success=True, message="Strategy deleted successfully")
        else:
            logger.warning(f"[WARNING] Strategy delete failed: {error}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error or f"Strategy not found: {strategy_id}",
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Strategy delete failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post(
    "/api/strategies/{strategy_id}/duplicate",
    response_model=DuplicateStrategyResponse,
    tags=["Strategies"],
)
async def duplicate_strategy(strategy_id: str):
    """
    Duplicate a strategy by ID.

    Args:
        strategy_id: The strategy ID to duplicate

    Returns:
        JSON object with new strategy ID and name
    """
    try:
        logger.info(f"[STRATEGY] Duplicate strategy request for ID: {strategy_id}")

        success, new_id, new_name, error = service_duplicate_strategy(strategy_id)

        if success:
            logger.info(f"[SUCCESS] Strategy duplicated: {new_name} (ID: {new_id})")
            return DuplicateStrategyResponse(
                success=True,
                strategy_id=new_id,
                strategy_name=new_name,
                message=f"Strategy duplicated as '{new_name}'",
            )
        else:
            logger.warning(f"[WARNING] Strategy duplicate failed: {error}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error or f"Strategy not found: {strategy_id}",
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Strategy duplicate failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/api/strategies/{strategy_id}/export", tags=["Strategies"])
async def export_strategy(strategy_id: str):
    """
    Export a strategy as JSON.

    Args:
        strategy_id: The strategy ID to export

    Returns:
        JSON file with strategy data in export schema format
    """
    from fastapi.responses import JSONResponse

    try:
        logger.info(f"[STRATEGY] Export strategy request for ID: {strategy_id}")

        success, export_data, error = service_get_strategy_for_export(strategy_id)

        if success and export_data:
            # Generate filename
            strategy_name = export_data.strategy.name.replace(" ", "_").replace("/", "-")
            date_str = datetime.now().strftime("%Y%m%d")
            filename = f"strategy_{strategy_name}_{date_str}.json"

            logger.info(f"[SUCCESS] Strategy exported: {filename}")

            # Return JSON response with Content-Disposition header for download
            return JSONResponse(
                content=export_data.model_dump(mode="json"),
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"',
                    "Content-Type": "application/json",
                },
            )
        else:
            logger.warning(f"[WARNING] Strategy export failed: {error}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error or f"Strategy not found: {strategy_id}",
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Strategy export failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post(
    "/api/strategies/import/validate", response_model=ImportValidationResult, tags=["Strategies"]
)
async def validate_import_strategy(request: ImportStrategyRequest):
    """
    Validate import data without saving.

    Args:
        request: JSON data to validate

    Returns:
        Validation result with errors, warnings, and preview
    """
    try:
        logger.info("[STRATEGY] Import validation request received")

        result = service_validate_import(request.strategy_data)

        if result.valid:
            logger.info("[SUCCESS] Import validation passed")
        else:
            logger.warning(f"[WARNING] Import validation failed: {result.errors}")

        return result

    except Exception as e:
        logger.error(f"[ERROR] Import validation failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return ImportValidationResult(
            valid=False,
            errors=[str(e)],
            warnings=[],
            strategy_preview=None,
            name_conflict=False,
            conflicting_strategy_id=None,
        )


@app.post("/api/strategies/import/save", response_model=ImportStrategyResponse, tags=["Strategies"])
async def save_imported_strategy(request: ImportStrategySaveRequest):
    """
    Save a validated imported strategy.

    Args:
        request: Validated strategy data with optional name override and conflict resolution

    Returns:
        JSON object with success status and new strategy ID
    """
    try:
        logger.info("[STRATEGY] Import save request received")

        success, strategy_id, strategy_name, error = service_import_strategy(
            request.strategy_data,
            name_override=request.name_override,
            conflict_resolution=request.conflict_resolution,
        )

        if success:
            logger.info(f"[SUCCESS] Strategy imported: {strategy_name} (ID: {strategy_id})")
            return ImportStrategyResponse(
                success=True,
                strategy_id=strategy_id,
                strategy_name=strategy_name,
                message=f"Strategy '{strategy_name}' imported successfully",
            )
        else:
            logger.warning(f"[WARNING] Import save failed: {error}")
            return ImportStrategyResponse(
                success=False, message="Failed to import strategy", error=error
            )

    except Exception as e:
        logger.error(f"[ERROR] Import save failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return ImportStrategyResponse(
            success=False, message="Failed to import strategy", error=str(e)
        )


# =============================================================================
# Backtest Routes
# =============================================================================


@app.post("/api/backtests", response_model=SaveBacktestResponse, tags=["Backtests"])
async def save_backtest(request: SaveBacktestRequest):
    """
    Save a new backtest or update an existing one.

    Args:
        request: Backtest configuration to save

    Returns:
        JSON object with success status, backtest ID, and message
    """
    try:
        backtest = request.backtest
        logger.info(f"[BACKTEST] Save request received for backtest: {backtest.name}")

        success, backtest_id, error = service_save_backtest(backtest)

        if success:
            logger.info(f"[SUCCESS] Backtest saved: {backtest.name} (ID: {backtest_id})")
            return SaveBacktestResponse(
                success=True,
                backtest_id=backtest_id,
                message=f"Backtest '{backtest.name}' saved successfully",
            )
        else:
            logger.warning(f"[WARNING] Backtest save failed: {error}")
            return SaveBacktestResponse(
                success=False, message="Failed to save backtest", error=error
            )

    except Exception as e:
        logger.error(f"[ERROR] Backtest save failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return SaveBacktestResponse(success=False, message="Failed to save backtest", error=str(e))


@app.get("/api/backtests", response_model=ListBacktestsResponse, tags=["Backtests"])
async def list_backtests():
    """
    List all saved backtests.

    Returns:
        JSON object with list of backtest summaries
    """
    try:
        logger.info("[BACKTEST] List backtests request received")

        success, backtests, error = service_list_backtests()

        if success:
            logger.info(f"[SUCCESS] Listed {len(backtests)} backtests")
            return ListBacktestsResponse(success=True, backtests=backtests, count=len(backtests))
        else:
            logger.warning(f"[WARNING] Backtest list failed: {error}")
            return ListBacktestsResponse(success=False, backtests=[], count=0, error=error)

    except Exception as e:
        logger.error(f"[ERROR] Backtest list failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return ListBacktestsResponse(success=False, backtests=[], count=0, error=str(e))


@app.get("/api/backtests/{backtest_id}", response_model=LoadBacktestResponse, tags=["Backtests"])
async def get_backtest(backtest_id: str):
    """
    Get a specific backtest by ID.

    Args:
        backtest_id: The backtest ID to retrieve

    Returns:
        JSON object with the backtest configuration
    """
    try:
        logger.info(f"[BACKTEST] Get backtest request for ID: {backtest_id}")

        success, backtest, error = service_get_backtest(backtest_id)

        if success:
            logger.info(f"[SUCCESS] Backtest retrieved: {backtest.name}")
            return LoadBacktestResponse(success=True, backtest=backtest)
        else:
            logger.warning(f"[WARNING] Backtest get failed: {error}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error or f"Backtest not found: {backtest_id}",
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Backtest get failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.delete(
    "/api/backtests/{backtest_id}", response_model=DeleteBacktestResponse, tags=["Backtests"]
)
async def delete_backtest(backtest_id: str):
    """
    Delete a backtest by ID.

    Args:
        backtest_id: The backtest ID to delete

    Returns:
        JSON object with success status and message
    """
    try:
        logger.info(f"[BACKTEST] Delete backtest request for ID: {backtest_id}")

        success, error = service_delete_backtest(backtest_id)

        if success:
            logger.info(f"[SUCCESS] Backtest deleted: {backtest_id}")
            return DeleteBacktestResponse(success=True, message="Backtest deleted successfully")
        else:
            logger.warning(f"[WARNING] Backtest delete failed: {error}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error or f"Backtest not found: {backtest_id}",
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Backtest delete failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post(
    "/api/backtests/{backtest_id}/duplicate",
    response_model=DuplicateBacktestResponse,
    tags=["Backtests"],
)
async def duplicate_backtest(backtest_id: str):
    """
    Duplicate a backtest by ID.

    Args:
        backtest_id: The backtest ID to duplicate

    Returns:
        JSON object with new backtest ID and name
    """
    try:
        logger.info(f"[BACKTEST] Duplicate backtest request for ID: {backtest_id}")

        success, new_id, new_name, error = service_duplicate_backtest(backtest_id)

        if success:
            logger.info(f"[SUCCESS] Backtest duplicated: {new_name} (ID: {new_id})")
            return DuplicateBacktestResponse(
                success=True,
                backtest_id=new_id,
                backtest_name=new_name,
                message=f"Backtest duplicated as '{new_name}'",
            )
        else:
            logger.warning(f"[WARNING] Backtest duplicate failed: {error}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error or f"Backtest not found: {backtest_id}",
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Backtest duplicate failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# =============================================================================
# Backtest Execution Routes
# =============================================================================


@app.post(
    "/api/backtests/{backtest_id}/run",
    response_model=RunBacktestResponse,
    tags=["Backtest Execution"],
)
async def run_backtest(backtest_id: str, request: RunBacktestRequest = None):
    """
    Start a backtest execution.

    Args:
        backtest_id: The backtest ID to execute
        request: Optional request body with execution options

    Returns:
        JSON object with success status and message
    """
    try:
        logger.info(f"[BACKTEST] Run backtest request for ID: {backtest_id}")

        keep_partial = request.keep_partial_on_cancel if request else False
        result = backtest_executor.start_backtest(backtest_id, keep_partial)

        if result["success"]:
            logger.info(f"[SUCCESS] Backtest started: {backtest_id}")
            return RunBacktestResponse(success=True, message=result["message"])
        else:
            logger.warning(f"[WARNING] Backtest run failed: {result.get('message')}")
            return RunBacktestResponse(
                success=False, message=result["message"], error=result.get("error")
            )

    except Exception as e:
        logger.error(f"[ERROR] Backtest run failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return RunBacktestResponse(success=False, message="Failed to start backtest", error=str(e))


@app.get(
    "/api/backtests/{backtest_id}/progress",
    response_model=BacktestProgressResponse,
    tags=["Backtest Execution"],
)
async def get_backtest_progress(backtest_id: str):
    """
    Get the current progress of a backtest execution.

    Args:
        backtest_id: The backtest ID to get progress for

    Returns:
        JSON object with backtest progress information
    """
    try:
        logger.debug(f"[BACKTEST] Progress request for ID: {backtest_id}")

        progress = backtest_executor.get_progress(backtest_id)

        if progress:
            return BacktestProgressResponse(success=True, progress=progress)
        else:
            return BacktestProgressResponse(
                success=False, error=f"No progress data found for backtest: {backtest_id}"
            )

    except Exception as e:
        logger.error(f"[ERROR] Backtest progress failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return BacktestProgressResponse(success=False, error=str(e))


@app.post(
    "/api/backtests/{backtest_id}/cancel",
    response_model=CancelBacktestResponse,
    tags=["Backtest Execution"],
)
async def cancel_backtest(backtest_id: str, request: CancelBacktestRequest = None):
    """
    Cancel a running backtest.

    Args:
        backtest_id: The backtest ID to cancel
        request: Optional request body with cancellation options

    Returns:
        JSON object with success status and partial results flag
    """
    try:
        logger.info(f"[BACKTEST] Cancel backtest request for ID: {backtest_id}")

        keep_partial = request.keep_partial_results if request else False
        result = backtest_executor.cancel_backtest(backtest_id, keep_partial)

        if result["success"]:
            logger.info(f"[SUCCESS] Backtest cancelled: {backtest_id}")
            return CancelBacktestResponse(
                success=True,
                message=result["message"],
                partial_results_saved=result.get("partial_results_saved", False),
            )
        else:
            logger.warning(f"[WARNING] Backtest cancel failed: {result.get('message')}")
            return CancelBacktestResponse(
                success=False,
                message=result["message"],
                partial_results_saved=False,
                error=result.get("error"),
            )

    except Exception as e:
        logger.error(f"[ERROR] Backtest cancel failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return CancelBacktestResponse(
            success=False,
            message="Failed to cancel backtest",
            partial_results_saved=False,
            error=str(e),
        )


# =============================================================================
# Entry Point
# =============================================================================

if __name__ == "__main__":
    import uvicorn

    logger.info(f"""
    ╔══════════════════════════════════════════════════════════════╗
    ║           🚀 FOREX TRADING API SERVER (FastAPI)              ║
    ╠══════════════════════════════════════════════════════════════╣
    ║  Endpoints:                                                   ║
    ║  • GET /api/test        - Health check                       ║
    ║  • GET /api/health      - Detailed health check              ║
    ║  • GET /api/account     - Account summary                    ║
    ║  • GET /api/headlines   - Market headlines                   ║
    ║  • GET /api/options     - Trading options                    ║
    ║  • GET /api/technicals/{{pair}}/{{tf}} - Technical analysis      ║
    ║  • GET /api/prices/{{pair}}/{{gran}}/{{count}} - Price data        ║
    ╠══════════════════════════════════════════════════════════════╣
    ║  📚 API Docs: http://localhost:{settings.API_PORT}/docs                   ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

    uvicorn.run(
        "server:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_DEBUG,
        log_level="info" if settings.API_DEBUG else "warning",
    )
