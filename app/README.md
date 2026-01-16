# 📈 Forex Trading Dashboard

A full-stack forex trading application with real-time price charts, technical analysis, and automated trading bot.

## 🏗️ Project Structure

```
app/
├── client/                       # 🖥️ Frontend (React)
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── app/                  # API client & utilities
│   │   │   ├── api.js            # Axios API endpoints
│   │   │   ├── chart.js          # Chart configuration
│   │   │   └── data.js           # Static data (pairs, timeframes)
│   │   ├── components/           # React components
│   │   │   ├── AccountSummary.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Headline.jsx
│   │   │   ├── Headlines.jsx
│   │   │   ├── NavbarLink.jsx
│   │   │   ├── NavigationBar.jsx
│   │   │   ├── PriceChart.jsx
│   │   │   ├── Progress.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Technicals.jsx
│   │   │   └── TitleHead.jsx
│   │   ├── pages/                # Page components
│   │   │   ├── Dashboard.jsx     # Trading dashboard
│   │   │   └── Home.jsx          # Landing page
│   │   ├── App.jsx               # Root component
│   │   ├── index.css             # Global styles
│   │   └── index.js              # Entry point
│   ├── package.json
│   ├── env.example
│   └── README.md
│
├── server/                       # 🔧 Backend (FastAPI + UV)
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py             # Route helpers
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py           # Configuration & env vars
│   ├── core/
│   │   ├── __init__.py
│   │   ├── constants.py          # Trading constants
│   │   ├── data_models.py        # Pydantic response models
│   │   └── openfx_api.py         # OpenFX API client
│   ├── db/
│   │   ├── __init__.py
│   │   ├── database.py           # Supabase database client
│   │   ├── migrations/           # SQL migrations
│   │   └── supabase_client.py    # Supabase connection
│   ├── infrastructure/
│   │   ├── __init__.py
│   │   └── instrument_collection.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── api_price.py
│   │   ├── instrument.py
│   │   └── open_trade.py
│   ├── scraping/
│   │   ├── __init__.py
│   │   ├── bloomberg.py          # Bloomberg headlines
│   │   └── investing.py          # Investing.com technicals
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── assets/               # Test fixtures
│   │   └── core/
│   │       ├── test_data_models.py
│   │       └── test_openfx_api.py
│   ├── utils/
│   │   ├── __init__.py
│   │   └── logger.py
│   ├── server.py                 # Main FastAPI application
│   ├── pyproject.toml            # UV package management
│   ├── requirements.txt          # Pip fallback
│   ├── env.example
│   └── README.md
│
└── bot/                          # 🤖 Trading Bot
    ├── config/
    │   └── settings.json         # Trading pair configurations
    ├── core/
    │   ├── __init__.py
    │   ├── candle_manager.py     # Candle timing management
    │   ├── indicators.py         # Technical indicators
    │   ├── models.py             # Bot data models
    │   └── trade_manager.py      # Trade execution
    ├── data/
    │   └── instruments.json      # Instrument definitions
    ├── logs/
    │   ├── error.log
    │   ├── main.log
    │   └── {PAIR}.log
    ├── strategies/
    │   ├── __init__.py
    │   └── bollinger_strategy.py # Bollinger Bands strategy
    ├── run.py                    # Bot entry point
    ├── requirements.txt
    └── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** - [Download](https://python.org)
- **UV** (recommended) - Fast Python package manager
- **Node.js 18+** - [Download](https://nodejs.org)
- **npm** - Comes with Node.js

### Install UV (Recommended)

```bash
# Install UV for fast Python package management
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 1. Environment Setup

```bash
# Clone and navigate to the project
cd forex-trading-app

# Make scripts executable
chmod +x scripts/*.sh

# Setup environment files
./scripts/copy_dot_env.sh

# Edit the .env files with your actual credentials
# - app/server/.env (API credentials, Supabase)
# - app/client/.env (API URL - usually fine as default)
```

### 2. Start All Services

```bash
# Start both backend and frontend
./scripts/start.sh
```

✅ Server runs at: **http://localhost:8000**
📚 API Docs at: **http://localhost:8000/docs**
✅ Frontend runs at: **http://localhost:3000**

### Alternative: Start Services Individually

```bash
# Start backend only
./scripts/start_server.sh

# Start frontend only (in another terminal)
./scripts/start_client.sh

# Start trading bot (optional)
./scripts/start_bot.sh
```

### Stop All Services

```bash
./scripts/stop_apps.sh
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/test` | GET | Health check |
| `/api/health` | GET | Detailed health check with uptime |
| `/api/account` | GET | Account summary (balance, margin, P/L) |
| `/api/headlines` | GET | Bloomberg forex headlines |
| `/api/options` | GET | Available pairs & timeframes |
| `/api/technicals/{pair}/{tf}` | GET | Technical analysis data |
| `/api/prices/{pair}/{gran}/{count}` | GET | Candlestick price data |
| `/docs` | GET | Interactive API documentation (Swagger UI) |
| `/redoc` | GET | Alternative API documentation (ReDoc) |

## ⚙️ Configuration

### Environment Variables

All configuration is done via environment variables in `.env` files:

#### Server (`app/server/.env`)

```bash
# OpenFX API
OPENFX_URL=https://marginalttdemowebapi.fxopen.net:8443/api/v2
OPENFX_API_ID=your_api_id
OPENFX_API_KEY=your_api_key
OPENFX_API_SECRET=your_api_secret

# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# FastAPI Server
API_DEBUG=True
API_HOST=0.0.0.0
API_PORT=8000
```

#### Client (`app/client/.env`)

```bash
REACT_APP_API_URL=http://localhost:8000/api
```

### Bot Configuration

Edit `bot/config/settings.json`:

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

## 🧪 Running Tests

```bash
cd app/server

# With UV (recommended)
uv run pytest

# Or with pytest directly
pytest tests/ -v

# With coverage
uv run pytest --cov=. --cov-report=html
```

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Plotly.js | Interactive charts |
| CSS3 | Styling |

### Backend

| Technology | Purpose |
|------------|---------|
| FastAPI | High-performance async API framework |
| UV | Fast Python package manager |
| Uvicorn | ASGI server |
| Pydantic | Data validation |
| Pandas | Data processing |
| BeautifulSoup4 | Web scraping |
| Supabase | PostgreSQL database client |

### Trading Bot

| Feature | Description |
|---------|-------------|
| Bollinger Bands | Primary trading strategy |
| Automated execution | Trade placement via API |
| Risk management | Configurable risk per trade |
| Multi-pair support | Monitor multiple currency pairs |

## 📚 Component Documentation

Each component has its own detailed README:

- **[Client README](./client/README.md)** - Frontend setup, components, and development
- **[Server README](./server/README.md)** - Backend API, endpoints, and architecture
- **[Bot README](./bot/README.md)** - Trading bot configuration and strategies

## 📚 Development

### Adding New Trading Pairs

1. Add pair configuration in `bot/config/settings.json`
2. Ensure pair exists in `server/config/settings.py` INVESTING_COM_PAIRS

### Adding New Strategies

1. Create new strategy file in `bot/strategies/`
2. Implement `get_trade_decision()` function
3. Import in `bot/strategies/__init__.py`
4. Update `bot/run.py` to use new strategy

### Adding New API Endpoints

1. Add Pydantic model in `server/core/data_models.py`
2. Add FastAPI route in `server/server.py`
3. Update frontend API client in `client/src/app/api.js`

### Code Quality

```bash
# Backend linting
cd app/server
uv run ruff check .

# Frontend linting
cd app/client
npm run lint  # if configured
```

## 🔧 Utility Scripts

| Script | Description |
|--------|-------------|
| `scripts/start.sh` | Start all services (UV-powered) |
| `scripts/start_all.sh` | Alias for start.sh |
| `scripts/start_server.sh` | Start backend only |
| `scripts/start_client.sh` | Start frontend only |
| `scripts/start_bot.sh` | Start trading bot only |
| `scripts/stop_apps.sh` | Stop all services |
| `scripts/copy_dot_env.sh` | Setup environment files |
| `scripts/setup_env.sh` | Full environment setup |

## ⚠️ Disclaimer

This software is for **educational purposes only**. Trading forex involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results. Always test with demo accounts before using real money.

## 📄 License

MIT License - See LICENSE file for details.
