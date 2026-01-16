# Forex Trading Dashboard

A full-stack forex trading application with real-time price charts, technical analysis, market headlines, and an automated trading bot powered by AI-assisted development workflows.

## Features

- 📈 Real-time forex price charts
- 🤖 Automated trading bot
- 📊 Technical analysis indicators from Investing.com
- 📰 Live market headlines from Bloomberg
- 💰 Account summary with balance, margin, and P/L tracking
- 🔧 AI Developer Workflow (ADW) for GitHub issue automation
- ⚡ Fast development with UV (Python) and npm (Node.js)

## Prerequisites

- Python 3.10+
- UV (Python package manager)
- Node.js 18+
- npm (comes with Node.js)
- OpenFX API credentials
- MongoDB (optional, for data persistence)

## Setup

### 1. Install UV (Recommended)

```bash
# Install UV for fast Python package management
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Install Dependencies

```bash
# Backend
cd app/server
uv sync

# Frontend
cd app/client
npm install
```

### 3. Environment Configuration

Set up your API keys in the server directory:

```bash
cd app/server
cp env.example .env
# Edit .env and add your API credentials
```

#### Server Environment Variables (`app/server/.env`)

```bash
# OpenFX API Credentials
OPENFX_URL=https://marginalttdemowebapi.fxopen.net:8443/api/v2
OPENFX_API_ID=your_api_id
OPENFX_API_KEY=your_api_key
OPENFX_API_SECRET=your_api_secret

# MongoDB (optional)
MONGO_CONN_STR=mongodb://localhost:27017/forex_learning

# FastAPI Server
API_DEBUG=True
API_HOST=0.0.0.0
API_PORT=8000

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Client Environment Variables (`app/client/.env`)

```bash
REACT_APP_API_URL=http://localhost:8000/api
```

## Quick Start

Use the provided script to start all services:

```bash
./scripts/start.sh
```

Press `Ctrl+C` to stop all services.

The script will:
- Check that `.env` exists in `app/server/`
- Start the backend on http://localhost:8000
- Start the frontend on http://localhost:3000
- Start the trading bot (optional)
- Handle graceful shutdown when you exit

## Manual Start (Alternative)

### Backend
```bash
cd app/server
uv run python server.py
```

### Frontend
```bash
cd app/client
npm start
```

### Trading Bot
```bash
cd app/bot
python run.py
```

## Usage

1. **View Dashboard**: Navigate to http://localhost:3000 to see the trading dashboard
2. **Select Currency Pair**: Choose from available forex pairs (e.g., GBPJPY, EURUSD)
3. **Analyze Charts**: View real-time candlestick charts with technical indicators
4. **Check Headlines**: Browse latest forex market headlines from Bloomberg
5. **Monitor Account**: Track balance, margin usage, and open positions
6. **View Technicals**: See support/resistance levels and indicator signals

## Development

### Backend Commands
```bash
cd app/server
uv run python server.py      # Start server with hot reload
uv run pytest               # Run tests
uv run pytest --cov=. --cov-report=html  # Run tests with coverage
uv run ruff check .         # Run linter
uv run ruff format .        # Format code
```

### Frontend Commands
```bash
cd app/client
npm start                   # Start dev server
npm run build              # Build for production
npm test                   # Run tests
```

### Bot Commands
```bash
cd app/bot
python run.py              # Start trading bot
```

## Project Structure

```
.
├── app/                           # Main application
│   ├── client/                    # React frontend
│   │   ├── src/
│   │   │   ├── app/               # API client & utilities
│   │   │   ├── components/        # React components
│   │   │   ├── pages/             # Page components
│   │   │   └── lib/               # Utility functions
│   │   └── package.json
│   │
│   ├── server/                    # FastAPI backend
│   │   ├── api/                   # Route helpers
│   │   ├── config/                # Configuration & settings
│   │   ├── core/                  # Core business logic
│   │   ├── db/                    # Database connection
│   │   ├── infrastructure/        # Data management
│   │   ├── models/                # Pydantic models
│   │   ├── scraping/              # Web scrapers
│   │   ├── tests/                 # Test suite
│   │   ├── utils/                 # Utilities
│   │   └── server.py              # Main application
│   │
│   └── bot/                       # Trading bot
│       ├── config/                # Bot configuration
│       ├── core/                  # Bot core logic
│       ├── data/                  # Instrument definitions
│       ├── logs/                  # Trading logs
│       ├── strategies/            # Trading strategies
│       └── run.py                 # Bot entry point
│
├── adws/                          # AI Developer Workflow (ADW) system
│   ├── adw_modules/               # Core ADW modules
│   ├── adw_triggers/              # Automation triggers
│   ├── adw_tests/                 # ADW test suite
│   └── *.py                       # Workflow scripts
│
├── scripts/                       # Utility scripts
│   ├── start.sh                   # Start all services
│   ├── start_server.sh            # Start backend only
│   ├── start_client.sh            # Start frontend only
│   ├── start_bot.sh               # Start bot only
│   ├── stop_apps.sh               # Stop all services
│   └── copy_dot_env.sh            # Setup environment files
│
├── ai_docs/                       # AI/LLM documentation
└── specs/                         # Feature specifications
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/test` | GET | Simple health check |
| `/api/health` | GET | Detailed health with uptime |
| `/api/account` | GET | Account summary (balance, margin, P/L) |
| `/api/headlines` | GET | Bloomberg forex headlines |
| `/api/options` | GET | Available pairs & timeframes |
| `/api/technicals/{pair}/{tf}` | GET | Technical analysis data |
| `/api/prices/{pair}/{gran}/{count}` | GET | Candlestick price data |
| `/docs` | GET | Interactive API documentation (Swagger UI) |
| `/redoc` | GET | Alternative API documentation (ReDoc) |

## Trading Bot

### Bollinger Bands Strategy

The bot uses a Bollinger Bands breakout strategy:

**Entry Signals:**
- **BUY**: Price closes below the lower band (was inside bands on open)
- **SELL**: Price closes above the upper band (was inside bands on open)

**Trade Management:**
- **Take Profit**: Distance from entry to moving average
- **Stop Loss**: Calculated using risk/reward ratio

**Trade Filters:**
- Spread must be below `maxspread`
- Potential gain must exceed `mingain`

### Bot Configuration (`app/bot/config/settings.json`)

```json
{
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
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `trade_risk` | float | Risk amount per trade (in account currency) |
| `n_ma` | int | Moving average period for Bollinger Bands |
| `n_std` | float | Standard deviations for bands (0.1 - 5.0) |
| `maxspread` | float | Maximum allowed spread to enter trade |
| `mingain` | float | Minimum required gain to trigger signal |
| `riskreward` | float | Risk/reward ratio for stop loss |

## Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Plotly.js | Interactive charts |
| Tailwind CSS | Styling |
| Lucide React | Icons |

### Backend

| Technology | Purpose |
|------------|---------|
| FastAPI | High-performance async API framework |
| UV | Fast Python package manager |
| Uvicorn | ASGI server |
| Pydantic | Data validation |
| Pandas | Data processing |
| BeautifulSoup4 | Web scraping |
| PyMongo | MongoDB driver |

### Trading Bot

| Technology | Purpose |
|------------|---------|
| Pydantic | Configuration validation & type safety |
| Pandas | Data analysis |
| NumPy | Numerical computing |

## Utility Scripts

| Script | Description |
|--------|-------------|
| `scripts/start.sh` | Start all services (backend, frontend, bot) |
| `scripts/start_all.sh` | Alias for start.sh |
| `scripts/start_server.sh` | Start backend only |
| `scripts/start_client.sh` | Start frontend only |
| `scripts/start_bot.sh` | Start trading bot only |
| `scripts/stop_apps.sh` | Stop all services |
| `scripts/copy_dot_env.sh` | Setup environment files |
| `scripts/setup_env.sh` | Full environment setup |

## Testing

### Backend Tests
```bash
cd app/server
uv run pytest               # Run all tests
uv run pytest -v            # Verbose output
uv run pytest --cov=.       # With coverage
```

### Frontend Tests
```bash
cd app/client
npm test
```

## Troubleshooting

**Backend won't start:**
- Check Python version: `python --version` (requires 3.10+)
- Verify API keys are set: check `app/server/.env`
- Check UV installation: `uv --version`

**Frontend errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (requires 18+)

**CORS issues:**
- Ensure backend is running on port 8000
- Check `CORS_ORIGINS` in server settings

**Trading bot not starting:**
- Verify server `.env` is copied to bot directory
- Check API credentials are valid
- Review logs in `app/bot/logs/`

**MongoDB connection failed:**
- Check `MONGO_CONN_STR` format
- Verify MongoDB is running
- Check network/firewall settings

**Scraper returning None:**
- External sites may block requests
- Check for rate limiting
- Verify URL endpoints still valid

## Component Documentation

Each component has its own detailed README:

- **[App README](./app/README.md)** - Full-stack application overview
- **[Client README](./app/client/README.md)** - Frontend setup and components
- **[Server README](./app/server/README.md)** - Backend API and architecture
- **[Bot README](./app/bot/README.md)** - Trading bot configuration and strategies

## ⚠️ Disclaimer

This software is for **educational purposes only**. Trading forex involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results. Always test with demo accounts before using real money.

## License

MIT License - See LICENSE file for details.
