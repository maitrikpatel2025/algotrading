"""
Trading Bot Runner
==================
Main entry point for the automated trading bot.
Uses Pydantic for configuration validation and type safety.
"""

import json
import time
import sys
import os
import importlib.util

# Add bot directory to path first for local imports
BOT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_DIR = os.path.join(BOT_DIR, '..', 'server')

# Import bot's local modules
from core.models import BotConfig, TradeSettings, TradeSignal
from core.candle_manager import CandleManager
from core.trade_manager import place_trade
from strategies.bollinger_strategy import get_trade_decision

# Helper to import from server without path conflicts
def import_from_server(module_path, name):
    """Import a module from server directory."""
    spec = importlib.util.spec_from_file_location(name, os.path.join(SERVER_DIR, module_path))
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module

# Add server to path for nested imports within server modules
sys.path.insert(0, SERVER_DIR)

# Import from server module
from utils.logger import LogWrapper
from infrastructure.instrument_collection import instrument_collection
from config import settings

# Import OpenFxApi from server's core (avoiding conflict with bot's core)
server_core = import_from_server('core/openfx_api.py', 'server_openfx_api')
OpenFxApi = server_core.OpenFxApi


class Bot:
    """
    Automated trading bot that monitors currency pairs
    and executes trades based on strategy signals.
    
    Uses Pydantic models for configuration validation
    and type-safe operation.
    """

    ERROR_LOG = "error"
    MAIN_LOG = "main"
    GRANULARITY = "M1"
    SLEEP = 10

    def __init__(self, config_path: str = "./config/settings.json", data_path: str = "./data"):
        """
        Initialize the trading bot.
        
        Args:
            config_path: Path to settings JSON file
            data_path: Path to instrument data directory
            
        Raises:
            ValidationError: If configuration file is invalid
            FileNotFoundError: If configuration file doesn't exist
        """
        # Load instruments
        instrument_collection.load_from_file(data_path)
        
        # Load and validate settings with Pydantic
        self._load_settings(config_path)
        self._setup_logs()

        # Initialize API and candle manager
        self.api = OpenFxApi()
        self.candle_manager = CandleManager(
            self.api,
            self.trade_settings,
            self.log_message,
            Bot.GRANULARITY
        )

        self.log_to_main("Bot started")
        self.log_to_error("Bot started")

    def _load_settings(self, config_path: str) -> None:
        """
        Load and validate trading settings from JSON file.
        
        Args:
            config_path: Path to settings.json
            
        Raises:
            ValidationError: If configuration is invalid
            FileNotFoundError: If file doesn't exist
        """
        with open(config_path, "r") as f:
            raw_data = json.loads(f.read())
        
        # Validate configuration with Pydantic
        self.bot_config = BotConfig.model_validate(raw_data)
        
        # Convert to TradeSettings objects
        self.trade_settings = {
            pair: TradeSettings.from_config(config, pair)
            for pair, config in self.bot_config.pairs.items()
        }
        self.trade_risk = self.bot_config.trade_risk
        
        print(f"✅ Configuration validated: {len(self.trade_settings)} pairs loaded")

    def _setup_logs(self) -> None:
        """Initialize loggers for each trading pair."""
        self.logs = {}
        
        for pair in self.trade_settings.keys():
            self.logs[pair] = LogWrapper(pair)
            self.log_message(f"Settings: {self.trade_settings[pair].model_dump()}", pair)
            
        self.logs[Bot.ERROR_LOG] = LogWrapper(Bot.ERROR_LOG)
        self.logs[Bot.MAIN_LOG] = LogWrapper(Bot.MAIN_LOG)
        
        self.log_to_main(f"Bot started with {TradeSettings.settings_to_str(self.trade_settings)}")

    def log_message(self, msg: str, key: str) -> None:
        """Log a message to the specified logger."""
        self.logs[key].logger.debug(msg)

    def log_to_main(self, msg: str) -> None:
        """Log to main log file."""
        self.log_message(msg, Bot.MAIN_LOG)

    def log_to_error(self, msg: str) -> None:
        """Log to error log file."""
        self.log_message(msg, Bot.ERROR_LOG)

    def process_candles(self, triggered: list) -> None:
        """
        Process triggered candles and execute trades if signals are generated.
        
        Args:
            triggered: List of pairs with new candles
        """
        if len(triggered) == 0:
            return

        self.log_message(f"process_candles triggered:{triggered}", Bot.MAIN_LOG)
        print(f"process_candles triggered:{triggered}")

        for pair in triggered:
            last_time = self.candle_manager.timings[pair].last_time
            
            # Get trade decision from strategy
            trade_decision = get_trade_decision(
                last_time,
                pair,
                Bot.GRANULARITY,
                self.api,
                self.trade_settings[pair],
                self.log_message
            )

            # Execute trade if signal is generated
            if trade_decision is not None and trade_decision.is_actionable:
                self.log_message(f"Place Trade: {trade_decision}", pair)
                self.log_to_main(f"Place Trade: {trade_decision}")
                
                result = place_trade(
                    trade_decision,
                    self.api,
                    self.log_message,
                    self.log_to_error,
                    self.trade_risk
                )
                
                if result.success:
                    self.log_to_main(f"Trade placed: {result}")
                else:
                    self.log_to_error(f"Trade failed: {result}")

    def run(self) -> None:
        """
        Main bot loop - continuously monitors for new candles
        and processes trading signals.
        """
        pairs_str = ", ".join(self.trade_settings.keys())
        print(f"""
        ╔══════════════════════════════════════════════════════════════╗
        ║           🤖 FOREX TRADING BOT STARTED                       ║
        ╠══════════════════════════════════════════════════════════════╣
        ║  Monitoring pairs: {pairs_str:<40} ║
        ║  Risk per trade: {self.trade_risk:<42} ║
        ║  Granularity: {Bot.GRANULARITY:<45} ║
        ║  Press Ctrl+C to stop                                        ║
        ╚══════════════════════════════════════════════════════════════╝
        """)
        
        while True:
            time.sleep(Bot.SLEEP)
            try:
                self.process_candles(self.candle_manager.update_timings())
            except KeyboardInterrupt:
                print("\n\n Bot stopped by user")
                self.log_to_main("Bot stopped by user")
                break
            except Exception as error:
                self.log_to_error(f"CRASH: {error}")
                print(f"Bot crashed: {error}")
                break


if __name__ == "__main__":
    # Initialize and run the bot
    try:
        bot = Bot(
            config_path="./config/settings.json",
            data_path="./data"
        )
        bot.run()
    except Exception as e:
        print(f"❌ Failed to start bot: {e}")
        sys.exit(1)
