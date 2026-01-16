# 🔧 Forex Trading API Server

A high-performance FastAPI backend providing real-time forex data, technical analysis, and market headlines for the trading dashboard.

## 📁 Directory Structure

```
server/
├── api/
│   ├── __init__.py
│   └── routes.py           # Route helpers and utilities
├── config/
│   ├── __init__.py
│   └── settings.py         # Configuration and environment variables
├── core/
│   ├── __init__.py
│   ├── constants.py        # Trading constants
│   ├── data_models.py      # Pydantic response models
│   └── openfx_api.py       # OpenFX API client
├── db/
│   ├── __init__.py
│   ├── database.py         # Supabase connection
│   ├── supabase_client.py  # Supabase client initialization
│   └── migrations/         # SQL migrations
├── infrastructure/
│   ├── __init__.py
│   └── instrument_collection.py  # Instrument data management
├── models/
│   ├── __init__.py
│   ├── api_price.py        # Price data models
│   ├── instrument.py       # Instrument models
│   └── open_trade.py       # Trade models
├── scraping/
│   ├── __init__.py
│   ├── bloomberg.py        # Bloomberg headlines scraper
│   └── investing.py        # Investing.com technicals scraper
├── tests/
│   ├── __init__.py
│   ├── assets/             # Test fixtures
│   └── core/
│       ├── __init__.py
│       ├── test_data_models.py
│       └── test_openfx_api.py
├── utils/
│   ├── __init__.py
│   └── logger.py           # Logging configuration
├── app.py                  # Alternative entry point
├── server.py               # Main FastAPI application
├── pyproject.toml          # UV/pip project configuration
├── requirements.txt        # Pip fallback dependencies
├── env.example             # Environment variables template
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- UV (recommended) or pip
- Supabase account (optional, for data persistence)

### Installation

```bash
# Navigate to server directory
cd app/server

# Install with UV (recommended)
uv sync

# Or with pip
pip install -r requirements.txt

# Copy environment file
cp env.example .env
# Edit .env with your API credentials
```

### Running the Server

```bash
# With UV (recommended)
uv run python server.py

# With uvicorn directly
uvicorn server:app --reload --host 0.0.0.0 --port 8000

# Or from project root
./scripts/start_server.sh
```

✅ Server runs at: **http://localhost:8000**
📚 API Docs at: **http://localhost:8000/docs**
📘 ReDoc at: **http://localhost:8000/redoc**

## ⚙️ Configuration

### Environment Variables (`.env`)

```bash
# OpenFX API Credentials
OPENFX_URL=https://marginalttdemowebapi.fxopen.net:8443/api/v2
OPENFX_API_ID=your_api_id
OPENFX_API_KEY=your_api_key
OPENFX_API_SECRET=your_api_secret

# Supabase (optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# Server Configuration
API_DEBUG=True
API_HOST=0.0.0.0
API_PORT=8000

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📡 API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/test` | Simple health check |
| GET | `/api/health` | Detailed health with uptime |

### Account

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/account` | Account summary (balance, margin, P/L) |

### Market Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/headlines` | Bloomberg forex headlines |
| GET | `/api/options` | Available pairs and timeframes |

### Technical Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/technicals/{pair}/{timeframe}` | Technical indicators for pair |

### Price Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prices/{pair}/{granularity}/{count}` | OHLC candlestick data |

## 📦 Dependencies

### Core Dependencies

| Package | Description |
|---------|-------------|
| `fastapi` | High-performance async web framework |
| `uvicorn[standard]` | ASGI server with websocket support |
| `pydantic` | Data validation and serialization |
| `pydantic-settings` | Environment variable management |
| `httpx` | Async HTTP client |
| `requests` | Sync HTTP client |

### Data Processing

| Package | Description |
|---------|-------------|
| `pandas` | Data manipulation and analysis |
| `numpy` | Numerical computing |
| `beautifulsoup4` | HTML parsing for web scraping |

### Database

| Package | Description |
|---------|-------------|
| `supabase` | Supabase Python client for PostgreSQL |

### Development

| Package | Description |
|---------|-------------|
| `pytest` | Testing framework |
| `pytest-asyncio` | Async test support |
| `ruff` | Fast Python linter |

## 🏗️ Architecture

### Core Components

#### `OpenFxApi` (`core/openfx_api.py`)

Main API client for the OpenFX broker:
- Account information
- Price data (candles)
- Trade execution
- Authentication handling

#### Data Models (`core/data_models.py`)

Pydantic models for API responses:
- `HealthCheckResponse`
- `HeadlinesResponse`
- `TradingOptionsResponse`
- `TechnicalsResponse`
- `PriceDataResponse`

### Scrapers (`scraping/`)

#### Bloomberg Scraper (`bloomberg.py`)
Fetches forex market headlines from Bloomberg.

#### Investing.com Scraper (`investing.py`)
Fetches technical analysis data including:
- Support/resistance levels
- Moving average signals
- Technical indicator summaries

### Configuration (`config/settings.py`)

Centralized configuration management:
- API credentials from environment
- Trading pairs mapping
- Timeframe definitions
- Server settings

## 🧪 Testing

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=. --cov-report=html

# Run specific test file
uv run pytest tests/core/test_openfx_api.py -v

# Run with verbose output
uv run pytest -v
```

### Test Structure

```
tests/
├── __init__.py
├── assets/                 # Test fixtures and mock data
└── core/
    ├── __init__.py
    ├── test_data_models.py # Pydantic model tests
    └── test_openfx_api.py  # API client tests
```

## 🛠️ Development

### Adding New Endpoints

1. Add Pydantic model in `core/data_models.py`:
   ```python
   class MyResponse(BaseModel):
       data: str
       count: int
   ```

2. Add endpoint in `server.py`:
   ```python
   @app.get("/api/myendpoint", response_model=MyResponse, tags=["MyCategory"])
   async def my_endpoint():
       return MyResponse(data="example", count=1)
   ```

### Adding New Scrapers

1. Create scraper in `scraping/`:
   ```python
   # scraping/my_scraper.py
   def get_my_data():
       # Scraping logic
       return data
   ```

2. Export in `scraping/__init__.py`:
   ```python
   from .my_scraper import get_my_data
   ```

### Code Quality

```bash
# Run linter
uv run ruff check .

# Run linter with auto-fix
uv run ruff check . --fix

# Format code
uv run ruff format .
```

## 🔒 Security

- API credentials stored in environment variables
- CORS configured for specific origins
- Input validation via Pydantic
- Error messages sanitized in production

## 📊 Monitoring

### Logging

The server uses Python's built-in logging:
- INFO level for successful operations
- ERROR level for failures with full tracebacks
- Configurable via `API_DEBUG` environment variable

### Health Checks

Use `/api/health` for monitoring:
```json
{
  "status": "ok",
  "service": "forex-trading-api",
  "version": "1.0.0",
  "uptime_seconds": 3600.5,
  "database_connected": true
}
```

## 🔧 Troubleshooting

### Common Issues

**API Credentials Invalid**
- Verify credentials in `.env`
- Check OpenFX account is active
- Ensure API access is enabled

**Supabase Connection Failed**
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in `.env`
- Check your Supabase project is active at https://supabase.com/dashboard
- Ensure tables are created using the migration in `db/migrations/`

**CORS Errors**
- Add frontend URL to `CORS_ORIGINS`
- Restart server after config changes

**Scraper Returning None**
- External sites may block requests
- Check for rate limiting
- Verify URL endpoints still valid

## 📄 License

MIT License - See main project LICENSE file for details.
