# 🤖 Forex Trading Bot

An automated trading bot that monitors currency pairs and executes trades based on technical analysis strategies. Uses **Pydantic** for configuration validation and type-safe operations.

## 📁 Directory Structure

```
bot/
├── config/
│   └── settings.json       # Trading pair configurations (validated by Pydantic)
├── core/
│   ├── __init__.py
│   ├── candle_manager.py   # Candle timing and management
│   ├── indicators.py       # Technical indicators (Bollinger Bands, etc.)
│   ├── models.py           # Pydantic data models
│   └── trade_manager.py    # Trade execution logic
├── data/
│   └── instruments.json    # Instrument definitions
├── logs/
│   ├── error.log           # Error logs
│   ├── main.log            # Main bot activity logs
│   └── {PAIR}.log          # Per-pair trading logs
├── strategies/
│   ├── __init__.py
│   └── bollinger_strategy.py   # Bollinger Bands breakout strategy
├── requirements.txt        # Python dependencies (includes Pydantic)
├── run.py                  # Main entry point
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- UV (recommended) or pip
- Server environment configured (the bot shares the server's API client)

### Installation

```bash
# Navigate to bot directory
cd app/bot

# Install dependencies (or use server's venv)
pip install -r requirements.txt
```

### Running the Bot

```bash
# From project root
./scripts/start_bot.sh

# Or manually
cd app/bot
python run.py
```

## ⚙️ Configuration

### Trading Settings (`config/settings.json`)

Configuration is validated using Pydantic's `BotConfig` model on startup:

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

#### Configuration Parameters

| Parameter | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `trade_risk` | `float` | `>= 0` | Risk amount per trade (in account currency units) |
| `n_ma` | `int` | `>= 1` | Moving average period for Bollinger Bands |
| `n_std` | `float` | `0.1 - 5.0` | Number of standard deviations for bands |
| `maxspread` | `float` | `>= 0` | Maximum allowed spread to enter a trade |
| `mingain` | `float` | `>= 0` | Minimum required gain to trigger a signal |
| `riskreward` | `float` | `>= 0.1` | Risk/reward ratio for stop loss calculation |

### Configuration Validation

Invalid configurations fail immediately with clear error messages:

```python
# Example validation error
pydantic.ValidationError: 1 validation error for BotConfig
pairs.GBPJPY.n_ma
  Input should be greater than or equal to 1 [type=greater_than_equal, input=-5]
```

### Adding New Trading Pairs

1. Add the pair configuration in `config/settings.json`:
   ```json
   "EUR_USD": {
       "n_ma": 20,
       "n_std": 2.0,
       "maxspread": 0.02,
       "mingain": 0.03,
       "riskreward": 1.5
   }
   ```

2. Ensure the pair exists in `data/instruments.json`

3. Verify the pair is available in the server's `config/settings.py`

## 🏗️ Pydantic Models

The bot uses Pydantic v2 for all data models, providing:

- **Type validation** at runtime
- **IDE autocomplete** and type hints
- **JSON serialization** for logging
- **Self-documenting** field descriptions
- **Constraint enforcement** (min/max values)

### Core Models (`core/models.py`)

```python
# Configuration Models
class BotConfig(BaseModel):
    """Validates settings.json structure"""
    trade_risk: float = Field(ge=0)
    pairs: Dict[str, TradeSettingsConfig]

class TradeSettings(BaseModel):
    """Runtime settings for a trading pair"""
    pair: str
    n_ma: int = Field(ge=1)
    n_std: float = Field(ge=0.1, le=5.0)
    maxspread: float = Field(ge=0)
    mingain: float = Field(ge=0)
    riskreward: float = Field(ge=0.1)

# Trading Models
class TradeDecision(BaseModel):
    """Strategy output with trade parameters"""
    pair: str
    signal: Literal[-1, 0, 1]  # SELL, NONE, BUY
    gain: float
    loss: float
    sl: float  # Stop loss
    tp: float  # Take profit

class TradeResult(BaseModel):
    """Trade execution result"""
    success: bool
    trade_id: Optional[int]
    pair: str
    amount: Optional[int]
    message: str
    error: Optional[str]

# Timing Models
class CandleTiming(BaseModel):
    """Tracks candle completion for strategy triggers"""
    last_time: Optional[datetime]
    is_ready: bool = False
```

### Model Usage Examples

```python
# Load and validate configuration
with open("config/settings.json") as f:
    config = BotConfig.model_validate(json.load(f))

# Create trade decision from DataFrame row
decision = TradeDecision.from_dataframe_row(df.iloc[-1])

# Check if decision is actionable
if decision.is_actionable:
    result = place_trade(decision, api, log_fn, error_fn, risk)
    
# Serialize for logging
print(decision.model_dump_json())
```

## 📊 Trading Strategy

### Bollinger Bands Breakout

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

## 🔧 Core Components

### `Bot` Class (`run.py`)

Main bot orchestrator that:
- Loads and validates configuration with Pydantic
- Initializes API and candle manager
- Runs the main trading loop
- Processes candle updates and executes trades

### `TradeSettings` (`core/models.py`)

Pydantic model holding strategy parameters:
- Full type validation
- Field constraints (min/max values)
- Serialization methods

### `TradeDecision` (`core/models.py`)

Pydantic model representing strategy output:
- Created from DataFrame rows via `from_dataframe_row()`
- `is_actionable` property checks if trade should execute
- `signal_name` property for human-readable direction

### `TradeResult` (`core/models.py`)

Pydantic model for trade execution results:
- Success/failure status
- Trade ID if successful
- Error messages for failures

### `CandleManager` (`core/candle_manager.py`)

Manages candle timing with Pydantic models:
- Tracks last candle time per pair
- Triggers strategy evaluation on new candles
- Uses `CandleTiming.update()` for state management

### `BollingerStrategy` (`strategies/bollinger_strategy.py`)

Implements the trading logic:
- Uses `TradeSettings` Pydantic model for parameters
- Returns `TradeDecision` Pydantic model
- Type-safe throughout the strategy

## 📝 Logging

The bot creates separate log files for each component:

| Log File | Contents |
|----------|----------|
| `logs/main.log` | Bot startup, trade decisions |
| `logs/error.log` | Errors and crashes |
| `logs/{PAIR}.log` | Per-pair analysis and signals |

Pydantic models can be logged as JSON:

```python
log_message(f"Trade: {trade_decision.model_dump_json()}", pair)
```

## 🛠️ Development

### Adding New Strategies

1. Create a new file in `strategies/`:
   ```python
   # strategies/my_strategy.py
   from core.models import TradeSettings, TradeDecision
   
   def get_trade_decision(
       candle_time,
       pair: str,
       granularity: str,
       api,
       settings: TradeSettings,  # Pydantic model
       log
   ) -> Optional[TradeDecision]:  # Returns Pydantic model
       # Your strategy logic
       return TradeDecision(...)
   ```

2. Import in `strategies/__init__.py`

3. Update `run.py` to use the new strategy

### Adding New Models

Add new Pydantic models to `core/models.py`:

```python
class MyNewModel(BaseModel):
    """Description of the model."""
    field1: str = Field(description="Field description")
    field2: int = Field(ge=0, description="Must be positive")
    
    model_config = ConfigDict(
        json_schema_extra={"example": {"field1": "value", "field2": 10}}
    )
```

### Testing

```bash
# Run from server directory (shares test infrastructure)
cd app/server
uv run pytest
```

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `pydantic` | `>=2.5.0` | Data validation and serialization |
| `pandas` | `>=2.0.0` | Data processing |
| `numpy` | `>=1.24.0` | Numerical operations |
| `requests` | `>=2.31.0` | HTTP client |
| `python-dotenv` | `>=1.0.0` | Environment variables |

## ⚠️ Disclaimer

This trading bot is for **educational purposes only**. Trading forex involves substantial risk of loss. Always test thoroughly with demo accounts before using real money. Past performance does not guarantee future results.
