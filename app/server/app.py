"""
Forex Trading API Server (FastAPI)
==================================
Main FastAPI application for the forex trading dashboard.

This server provides endpoints for:
- Account information
- Price data and charts
- Technical analysis
- Market headlines
"""

import logging
import sys

import uvicorn
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any

from config import settings

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
from core.openfx_api import OpenFxApi
from api.routes import get_options
from scraping import get_bloomberg_headlines, get_pair_technicals
from db import validate_connection, is_configured


# =============================================================================
# Application Setup
# =============================================================================

app = FastAPI(
    title="Forex Trading API",
    description="API for forex trading dashboard with real-time price data, technical analysis, and market headlines",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
# Helper Functions
# =============================================================================

def get_response(data: Optional[Any]) -> Dict[str, Any]:
    """
    Create a standardized API response.
    
    Args:
        data: Response data or None
        
    Returns:
        Data if available
        
    Raises:
        HTTPException: If data is None
    """
    if data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Error getting data"
        )
    return data


# =============================================================================
# API Routes
# =============================================================================

@app.get("/api/test", tags=["Health"])
async def test():
    """Health check endpoint."""
    return {"message": "Forex Trading API is running!"}


@app.get("/api/health", tags=["Health"])
async def health():
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "service": "forex-trading-api",
        "version": "1.0.0"
    }


@app.get("/api/headlines", tags=["Market Data"])
async def headlines():
    """
    Get forex market headlines from Bloomberg.
    
    Returns:
        JSON array of headline objects with 'headline' and 'link' fields
    """
    return get_response(get_bloomberg_headlines())


@app.get("/api/account", tags=["Account"])
async def account():
    """
    Get trading account summary.
    
    Returns:
        JSON object with account balance, margin, and other details
    """
    return get_response(api.get_account_summary())


@app.get("/api/options", tags=["Trading"])
async def options():
    """
    Get available trading options (pairs and timeframes).
    
    Returns:
        JSON object with 'pairs' and 'granularities' arrays
    """
    return get_response(get_options())


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
    return get_response(get_pair_technicals(pair, timeframe))


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
    return get_response(api.web_api_candles(pair, granularity, count))


# =============================================================================
# Entry Point
# =============================================================================

def main():
    """Run the FastAPI server."""
    logger.info("""
    ╔══════════════════════════════════════════════════════════════╗
    ║           🚀 FOREX TRADING API SERVER (FastAPI)              ║
    ╠══════════════════════════════════════════════════════════════╣
    ║  Endpoints:                                                   ║
    ║  • GET /api/test        - Health check                       ║
    ║  • GET /api/health      - Detailed health check              ║
    ║  • GET /api/account     - Account summary                    ║
    ║  • GET /api/headlines   - Market headlines                   ║
    ║  • GET /api/options     - Trading options                    ║
    ║  • GET /api/technicals/{pair}/{tf} - Technical analysis      ║
    ║  • GET /api/prices/{pair}/{gran}/{count} - Price data        ║
    ╠══════════════════════════════════════════════════════════════╣
    ║  📚 API Docs: http://localhost:{port}/api/docs               ║
    ╚══════════════════════════════════════════════════════════════╝
    """.format(port=settings.API_PORT))
    
    uvicorn.run(
        "app:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_DEBUG,
        log_level="info" if settings.API_DEBUG else "warning"
    )


if __name__ == "__main__":
    main()
