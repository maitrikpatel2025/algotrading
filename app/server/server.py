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
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from api.routes import get_options
from config import settings
from core.data_models import (
    HeadlineItem,
    HeadlinesResponse,
    HealthCheckResponse,
    OpenTradesResponse,
    TradeHistoryResponse,
    TradeInfo,
    TradingOptionsResponse,
)
from core.openfx_api import OpenFxApi
from db import is_configured, validate_connection
from scraping import get_bloomberg_headlines, get_pair_technicals

# Load .env file from server directory
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
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
    openapi_url="/openapi.json"
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
        return HealthCheckResponse(
            status="error",
            uptime_seconds=0
        )


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
            return OpenTradesResponse(
                trades=[],
                count=0,
                error="Failed to fetch open trades"
            )

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

        response = OpenTradesResponse(
            trades=trade_info_list,
            count=len(trade_info_list)
        )
        logger.info(f"[SUCCESS] Open trades fetched: {len(trade_info_list)} trades")
        return response
    except Exception as e:
        logger.error(f"[ERROR] Open trades fetch failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return OpenTradesResponse(
            trades=[],
            count=0,
            error=str(e)
        )


@app.get("/api/trades/history", response_model=TradeHistoryResponse, tags=["Trades"])
async def trade_history():
    """
    Get trade history (closed/completed trades).

    Returns:
        JSON object with list of historical trades.
        Note: Trade history may be limited by the external API capabilities.
    """
    try:
        # The OpenFX API doesn't provide a direct trade history endpoint
        # Return an empty response with a message indicating this limitation
        response = TradeHistoryResponse(
            trades=[],
            count=0,
            message="Trade history is not available from the current API. This feature requires historical trade data storage."
        )
        logger.info("[SUCCESS] Trade history endpoint called - returning empty response (API limitation)")
        return response
    except Exception as e:
        logger.error(f"[ERROR] Trade history fetch failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return TradeHistoryResponse(
            trades=[],
            count=0,
            error=str(e)
        )


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
            return HeadlinesResponse(
                headlines=[],
                count=0,
                error="Failed to fetch headlines"
            )

        headline_items = [
            HeadlineItem(headline=item['headline'], link=item['link'])
            for item in data
        ]

        response = HeadlinesResponse(
            headlines=headline_items,
            count=len(headline_items)
        )
        logger.info(f"[SUCCESS] Headlines fetched: {len(headline_items)} items")
        return response
    except Exception as e:
        logger.error(f"[ERROR] Headlines fetch failed: {str(e)}")
        logger.error(f"[ERROR] Full traceback:\n{traceback.format_exc()}")
        return HeadlinesResponse(
            headlines=[],
            count=0,
            error=str(e)
        )
    
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
            pairs=data.get('pairs', []),
            granularities=data.get('granularities', [])
        )
        logger.info(f"[SUCCESS] Options fetched: {len(response.pairs)} pairs, {len(response.granularities)} granularities")
        return response
    except Exception as e:
        logger.error(f"[ERROR] Options fetch failed: {str(e)}")
        return TradingOptionsResponse(error=str(e))


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
        if data is not None and 'error' in data:
            error_type = data.get('error')
            error_message = data.get('message', 'Unknown error')
            logger.warning(f"[WARNING] Technicals error for {pair}/{timeframe}: {error_type} - {error_message}")

            # Return 503 for external service errors, 400 for invalid input
            if error_type in ['external_service_error', 'timeout', 'connection_error']:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=error_message
                )
            elif error_type == 'invalid_pair':
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=error_message
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=error_message
                )

        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Technical data not found for {pair}/{timeframe}"
            )

        logger.info(f"[SUCCESS] Technicals fetched for {pair}/{timeframe}")
        return data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Technicals fetch failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


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
        if data is not None and 'error' in data:
            error_type = data.get('error')
            error_message = data.get('message', 'Unknown error')
            logger.warning(f"[WARNING] Prices error for {pair}/{granularity}: {error_type} - {error_message}")

            # Return 503 for API/service errors
            if error_type in ['api_error', 'no_data']:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=error_message
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=error_message
                )

        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Price data not found for {pair}/{granularity}"
            )

        logger.info(f"[SUCCESS] Prices fetched for {pair}/{granularity}, count: {count}")
        return data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Prices fetch failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
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
        log_level="info" if settings.API_DEBUG else "warning"
    )
