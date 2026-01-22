"""
Backtest Executor
=================
Service class for executing backtests with progress tracking and cancellation support.
Follows the BotController singleton pattern for background execution management.
"""

import logging
import math
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from threading import Event, Lock
from typing import Any, Dict, List, Literal, Optional

from core.data_models import BacktestProgress, BacktestResultsSummary
from db.supabase_client import get_supabase_client, is_configured

logger = logging.getLogger(__name__)


@dataclass
class BacktestExecution:
    """Tracks a running backtest execution."""
    backtest_id: str
    thread: threading.Thread
    cancel_event: Event
    keep_partial_on_cancel: bool = False
    progress_percentage: int = 0
    current_date: Optional[datetime] = None
    candles_processed: int = 0
    total_candles: int = 0
    trade_count: int = 0
    started_at: Optional[datetime] = None
    status: Literal["pending", "running", "cancelling", "completed", "failed"] = "pending"
    error_message: Optional[str] = None
    trades: List[Dict[str, Any]] = field(default_factory=list)
    # Live performance metrics
    current_pnl: float = 0.0
    running_win_rate: float = 0.0
    current_drawdown: float = 0.0
    equity_curve: List[float] = field(default_factory=list)
    peak_equity: float = 0.0
    initial_balance: float = 0.0


class BacktestExecutor:
    """
    Singleton class to manage backtest execution.

    Features:
    - Background thread execution
    - Progress tracking
    - Cancellation support with partial results
    - Thread-safe access via singleton pattern
    """

    _instance: Optional["BacktestExecutor"] = None
    _lock: Lock = Lock()

    # Configuration
    PROGRESS_UPDATE_INTERVAL = 100  # Update progress every N candles
    CANCEL_CHECK_INTERVAL = 50  # Check cancel event every N candles

    def __new__(cls) -> "BacktestExecutor":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self._running_backtests: Dict[str, BacktestExecution] = {}
        self._executions_lock: Lock = Lock()

        self._initialized = True
        logger.info("[BACKTEST_EXECUTOR] BacktestExecutor initialized")

    def validate_strategy_for_execution(self, strategy_id: str) -> tuple[bool, Optional[str]]:
        """
        Validate that a strategy is suitable for backtest execution.

        Args:
            strategy_id: The strategy ID to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        if not is_configured():
            return False, "Database not configured"

        client = get_supabase_client()
        if client is None:
            return False, "Failed to connect to database"

        try:
            # Fetch the strategy
            result = client.table("strategies").select("*").eq("id", strategy_id).execute()

            if not result.data or len(result.data) == 0:
                return False, f"Strategy not found: {strategy_id}"

            strategy = result.data[0]

            # Check for entry conditions
            # Conditions can be a list of condition objects with 'section' field
            # or a dict with 'long_entry'/'short_entry' keys
            conditions = strategy.get("conditions", []) or []

            if isinstance(conditions, list):
                # New format: list of condition objects with 'section' field
                long_entry = [c for c in conditions if c.get("section") == "long_entry"]
                short_entry = [c for c in conditions if c.get("section") == "short_entry"]
            else:
                # Legacy format: dict with entry type keys
                long_entry = conditions.get("long_entry", []) or []
                short_entry = conditions.get("short_entry", []) or []

            if not long_entry and not short_entry:
                return False, "Strategy must have at least one entry condition (long_entry or short_entry)"

            return True, None

        except Exception as e:
            logger.error(f"[BACKTEST_EXECUTOR] Error validating strategy {strategy_id}: {e}")
            return False, f"Failed to validate strategy: {str(e)}"

    def start_backtest(self, backtest_id: str, keep_partial_on_cancel: bool = False) -> dict:
        """
        Start a backtest execution in a background thread.

        Args:
            backtest_id: The backtest ID to execute
            keep_partial_on_cancel: Whether to save partial results if cancelled

        Returns:
            dict with success status, message, and error
        """
        with self._executions_lock:
            # Check if already running
            if backtest_id in self._running_backtests:
                existing = self._running_backtests[backtest_id]
                if existing.status in ["running", "cancelling"]:
                    return {
                        "success": False,
                        "message": "Backtest is already running",
                        "error": "conflict"
                    }

            # Validate backtest exists
            if not is_configured():
                return {
                    "success": False,
                    "message": "Database not configured",
                    "error": "configuration_error"
                }

            client = get_supabase_client()
            if client is None:
                return {
                    "success": False,
                    "message": "Failed to connect to database",
                    "error": "connection_error"
                }

            try:
                # Fetch the backtest
                result = client.table("backtests").select("*").eq("id", backtest_id).execute()

                if not result.data or len(result.data) == 0:
                    return {
                        "success": False,
                        "message": f"Backtest not found: {backtest_id}",
                        "error": "not_found"
                    }

                backtest = result.data[0]
                strategy_id = backtest.get("strategy_id")

                # Validate strategy has entry conditions
                if strategy_id:
                    is_valid, validation_error = self.validate_strategy_for_execution(strategy_id)
                    if not is_valid:
                        return {
                            "success": False,
                            "message": validation_error,
                            "error": "validation_error"
                        }
                else:
                    return {
                        "success": False,
                        "message": "Backtest has no linked strategy",
                        "error": "validation_error"
                    }

                # Create execution tracker
                cancel_event = Event()
                execution = BacktestExecution(
                    backtest_id=backtest_id,
                    thread=None,  # Will be set after thread creation
                    cancel_event=cancel_event,
                    keep_partial_on_cancel=keep_partial_on_cancel,
                    status="pending",
                    started_at=datetime.now(timezone.utc)
                )

                # Create and start the execution thread
                thread = threading.Thread(
                    target=self._execute_backtest,
                    args=(backtest_id, cancel_event, backtest),
                    daemon=True,
                    name=f"backtest-{backtest_id[:8]}"
                )
                execution.thread = thread

                # Store the execution
                self._running_backtests[backtest_id] = execution

                # Update database status to running
                self._update_backtest_status(backtest_id, "running", started_at=datetime.now(timezone.utc))

                # Start the thread
                thread.start()

                logger.info(f"[BACKTEST_EXECUTOR] Started backtest {backtest_id}")

                return {
                    "success": True,
                    "message": "Backtest started successfully",
                    "error": None
                }

            except Exception as e:
                logger.error(f"[BACKTEST_EXECUTOR] Error starting backtest {backtest_id}: {e}")
                return {
                    "success": False,
                    "message": f"Failed to start backtest: {str(e)}",
                    "error": "internal_error"
                }

    def get_progress(self, backtest_id: str) -> Optional[BacktestProgress]:
        """
        Get the current progress of a backtest.

        Args:
            backtest_id: The backtest ID to get progress for

        Returns:
            BacktestProgress or None if not found
        """
        with self._executions_lock:
            if backtest_id in self._running_backtests:
                execution = self._running_backtests[backtest_id]

                # Calculate estimated time remaining
                estimated_seconds = None
                if execution.progress_percentage > 0 and execution.started_at:
                    elapsed = (datetime.now(timezone.utc) - execution.started_at).total_seconds()
                    if execution.progress_percentage < 100:
                        estimated_seconds = elapsed * (100 - execution.progress_percentage) / execution.progress_percentage

                return BacktestProgress(
                    backtest_id=backtest_id,
                    status=execution.status,
                    progress_percentage=execution.progress_percentage,
                    current_date=execution.current_date,
                    candles_processed=execution.candles_processed,
                    total_candles=execution.total_candles,
                    trade_count=execution.trade_count,
                    estimated_seconds_remaining=estimated_seconds,
                    error_message=execution.error_message,
                    started_at=execution.started_at,
                    # Live performance metrics
                    current_pnl=execution.current_pnl,
                    running_win_rate=execution.running_win_rate,
                    current_drawdown=execution.current_drawdown,
                    equity_curve=execution.equity_curve if execution.equity_curve else None,
                    peak_equity=execution.peak_equity if execution.peak_equity > 0 else None
                )

        # Check database for completed/failed backtests
        if is_configured():
            client = get_supabase_client()
            if client:
                try:
                    result = client.table("backtests").select(
                        "id, status, progress_percentage, current_date_processed, "
                        "candles_processed, total_candles, trade_count, started_at, error_message"
                    ).eq("id", backtest_id).execute()

                    if result.data and len(result.data) > 0:
                        row = result.data[0]
                        current_date = row.get("current_date_processed")
                        if isinstance(current_date, str):
                            current_date = datetime.fromisoformat(current_date.replace("Z", "+00:00"))

                        started_at = row.get("started_at")
                        if isinstance(started_at, str):
                            started_at = datetime.fromisoformat(started_at.replace("Z", "+00:00"))

                        return BacktestProgress(
                            backtest_id=backtest_id,
                            status=row.get("status", "pending"),
                            progress_percentage=row.get("progress_percentage", 0),
                            current_date=current_date,
                            candles_processed=row.get("candles_processed", 0),
                            total_candles=row.get("total_candles"),
                            trade_count=row.get("trade_count", 0),
                            estimated_seconds_remaining=None,
                            error_message=row.get("error_message"),
                            started_at=started_at
                        )
                except Exception as e:
                    logger.error(f"[BACKTEST_EXECUTOR] Error getting progress from DB: {e}")

        return None

    def cancel_backtest(self, backtest_id: str, keep_partial_results: bool = False) -> dict:
        """
        Cancel a running backtest.

        Args:
            backtest_id: The backtest ID to cancel
            keep_partial_results: Whether to save partial results

        Returns:
            dict with success status, message, and partial_results_saved flag
        """
        with self._executions_lock:
            if backtest_id not in self._running_backtests:
                return {
                    "success": False,
                    "message": "Backtest is not running",
                    "partial_results_saved": False,
                    "error": "not_running"
                }

            execution = self._running_backtests[backtest_id]

            if execution.status not in ["running", "pending"]:
                return {
                    "success": False,
                    "message": f"Backtest cannot be cancelled (status: {execution.status})",
                    "partial_results_saved": False,
                    "error": "invalid_state"
                }

            # Set the keep partial flag
            execution.keep_partial_on_cancel = keep_partial_results
            execution.status = "cancelling"

            # Signal cancellation
            execution.cancel_event.set()

            logger.info(f"[BACKTEST_EXECUTOR] Cancellation requested for backtest {backtest_id}")

        # Wait for thread to finish (max 2 seconds as per spec)
        try:
            execution.thread.join(timeout=2.0)
        except Exception as e:
            logger.error(f"[BACKTEST_EXECUTOR] Error waiting for thread: {e}")

        # Check if partial results were saved
        partial_saved = keep_partial_results and execution.candles_processed > 0

        return {
            "success": True,
            "message": "Backtest cancelled" + (" with partial results saved" if partial_saved else ""),
            "partial_results_saved": partial_saved,
            "error": None
        }

    def is_running(self, backtest_id: str) -> bool:
        """Check if a backtest is currently running."""
        with self._executions_lock:
            if backtest_id in self._running_backtests:
                return self._running_backtests[backtest_id].status in ["running", "pending", "cancelling"]
        return False

    def _execute_backtest(self, backtest_id: str, cancel_event: Event, backtest_data: dict):
        """
        Execute the backtest in a background thread.

        Args:
            backtest_id: The backtest ID
            cancel_event: Event to signal cancellation
            backtest_data: The backtest configuration from database
        """
        execution = None

        try:
            with self._executions_lock:
                if backtest_id not in self._running_backtests:
                    return
                execution = self._running_backtests[backtest_id]
                execution.status = "running"

            logger.info(f"[BACKTEST_EXECUTOR] Executing backtest {backtest_id}")

            # Fetch strategy
            client = get_supabase_client()
            strategy_id = backtest_data.get("strategy_id")
            strategy_result = client.table("strategies").select("*").eq("id", strategy_id).execute()

            if not strategy_result.data:
                raise ValueError("Strategy not found")

            strategy = strategy_result.data[0]

            # Get backtest parameters
            start_date = backtest_data.get("start_date")
            end_date = backtest_data.get("end_date")
            _pair = backtest_data.get("pair") or strategy.get("pair", "EUR_USD")  # noqa: F841
            timeframe = backtest_data.get("timeframe") or strategy.get("timeframe", "H1")
            initial_balance = float(backtest_data.get("initial_balance", 10000))
            position_sizing = backtest_data.get("position_sizing", {})
            risk_management = backtest_data.get("risk_management", {})

            # Parse dates
            if isinstance(start_date, str):
                start_date = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            if isinstance(end_date, str):
                end_date = datetime.fromisoformat(end_date.replace("Z", "+00:00"))

            # Simulate fetching historical data
            # In a real implementation, this would fetch from a data provider
            # For now, we'll simulate with generated candles
            candles = self._generate_simulated_candles(start_date, end_date, timeframe)
            total_candles = len(candles)

            with self._executions_lock:
                execution.total_candles = total_candles

            # Update database with total candles
            self._update_backtest_progress(
                backtest_id,
                progress_percentage=0,
                total_candles=total_candles,
                candles_processed=0,
                trade_count=0
            )

            # Initialize trading state
            trades = []
            current_position = None
            balance = initial_balance
            trade_count = 0

            # Initialize live metrics tracking
            with self._executions_lock:
                execution.initial_balance = initial_balance
                execution.peak_equity = initial_balance
                execution.equity_curve = [initial_balance]
                execution.current_pnl = 0.0
                execution.running_win_rate = 0.0
                execution.current_drawdown = 0.0

            winning_trades = 0
            # Track full equity curve for final results (separate from limited progress curve)
            full_equity_curve = [initial_balance]

            # Get strategy conditions
            conditions = strategy.get("conditions", {}) or {}
            long_entry_conditions = conditions.get("long_entry", []) or []
            short_entry_conditions = conditions.get("short_entry", []) or []
            _long_exit_conditions = conditions.get("long_exit", []) or []  # noqa: F841
            _short_exit_conditions = conditions.get("short_exit", []) or []  # noqa: F841

            # Process candles
            for i, candle in enumerate(candles):
                # Check for cancellation frequently
                if i % self.CANCEL_CHECK_INTERVAL == 0:
                    if cancel_event.is_set():
                        logger.info(f"[BACKTEST_EXECUTOR] Backtest {backtest_id} cancelled at candle {i}")
                        self._handle_cancellation(backtest_id, execution, trades)
                        return

                # Simulate condition evaluation and trading
                candle_time = candle["time"]
                candle_close = candle["close"]

                # Simplified trading logic
                if current_position is None:
                    # Check entry conditions (simplified simulation)
                    if long_entry_conditions and self._evaluate_entry(candle, "long"):
                        # Open long position
                        current_position = {
                            "type": "long",
                            "entry_price": candle_close,
                            "entry_time": candle_time,
                            "size": self._calculate_position_size(balance, position_sizing)
                        }
                    elif short_entry_conditions and self._evaluate_entry(candle, "short"):
                        # Open short position
                        current_position = {
                            "type": "short",
                            "entry_price": candle_close,
                            "entry_time": candle_time,
                            "size": self._calculate_position_size(balance, position_sizing)
                        }
                else:
                    # Check exit conditions (simplified simulation)
                    exit_triggered, exit_reason = self._check_exit_conditions(
                        current_position, candle, risk_management
                    )

                    if exit_triggered:
                        # Close position
                        pnl = self._calculate_pnl(current_position, candle_close)
                        balance += pnl

                        trade = {
                            "type": current_position["type"],
                            "entry_price": current_position["entry_price"],
                            "entry_time": current_position["entry_time"].isoformat() if hasattr(current_position["entry_time"], "isoformat") else current_position["entry_time"],
                            "exit_price": candle_close,
                            "exit_time": candle_time.isoformat() if hasattr(candle_time, "isoformat") else candle_time,
                            "pnl": pnl,
                            "exit_reason": exit_reason
                        }
                        trades.append(trade)
                        trade_count += 1
                        if pnl > 0:
                            winning_trades += 1
                        current_position = None

                        # Update live metrics
                        with self._executions_lock:
                            execution.trade_count = trade_count
                            execution.trades = trades
                            # Calculate cumulative P/L
                            execution.current_pnl = round(balance - initial_balance, 2)
                            # Calculate win rate
                            execution.running_win_rate = round((winning_trades / trade_count) * 100, 1) if trade_count > 0 else 0.0
                            # Update peak equity and drawdown
                            if balance > execution.peak_equity:
                                execution.peak_equity = balance
                            if execution.peak_equity > 0:
                                execution.current_drawdown = round(((execution.peak_equity - balance) / execution.peak_equity) * 100, 2)

                        # Add to full equity curve for final stats
                        full_equity_curve.append(round(balance, 2))

                # Update progress periodically
                if i % self.PROGRESS_UPDATE_INTERVAL == 0 or i == total_candles - 1:
                    progress_pct = int((i + 1) * 100 / total_candles)

                    with self._executions_lock:
                        execution.candles_processed = i + 1
                        execution.progress_percentage = progress_pct
                        execution.current_date = candle_time
                        # Update equity curve (limit to last 50 points)
                        execution.equity_curve.append(balance)
                        if len(execution.equity_curve) > 50:
                            execution.equity_curve = execution.equity_curve[-50:]

                    self._update_backtest_progress(
                        backtest_id,
                        progress_percentage=progress_pct,
                        candles_processed=i + 1,
                        trade_count=trade_count,
                        current_date=candle_time
                    )

            # Backtest completed
            logger.info(f"[BACKTEST_EXECUTOR] Backtest {backtest_id} completed with {trade_count} trades")

            # Calculate final results with full equity curve and candles for buy-hold comparison
            results = self._calculate_results(
                trades=trades,
                initial_balance=initial_balance,
                final_balance=balance,
                equity_curve=full_equity_curve,
                candles=candles
            )

            # Update database
            self._complete_backtest(backtest_id, results)

            with self._executions_lock:
                execution.status = "completed"
                execution.progress_percentage = 100

        except Exception as e:
            logger.error(f"[BACKTEST_EXECUTOR] Error executing backtest {backtest_id}: {e}")

            with self._executions_lock:
                if execution:
                    execution.status = "failed"
                    execution.error_message = str(e)

            self._update_backtest_status(backtest_id, "failed", error_message=str(e))

        finally:
            # Clean up after a delay to allow final progress queries
            def cleanup():
                time.sleep(5)
                with self._executions_lock:
                    if backtest_id in self._running_backtests:
                        del self._running_backtests[backtest_id]

            cleanup_thread = threading.Thread(target=cleanup, daemon=True)
            cleanup_thread.start()

    def _generate_simulated_candles(
        self,
        start_date: datetime,
        end_date: datetime,
        timeframe: str
    ) -> List[Dict[str, Any]]:
        """Generate simulated candles for backtesting."""
        import random

        # Map timeframe to minutes
        tf_minutes = {
            "M1": 1, "M5": 5, "M15": 15, "M30": 30,
            "H1": 60, "H4": 240, "D": 1440
        }
        minutes = tf_minutes.get(timeframe, 60)

        candles = []
        current_time = start_date
        price = 1.1000  # Starting price for simulation

        while current_time <= end_date:
            # Generate random OHLC data
            change = random.uniform(-0.002, 0.002)
            high_extra = random.uniform(0, 0.001)
            low_extra = random.uniform(0, 0.001)

            open_price = price
            close_price = price + change
            high_price = max(open_price, close_price) + high_extra
            low_price = min(open_price, close_price) - low_extra

            candles.append({
                "time": current_time,
                "open": open_price,
                "high": high_price,
                "low": low_price,
                "close": close_price,
                "volume": random.randint(100, 10000)
            })

            price = close_price
            current_time = current_time.replace(tzinfo=None) if current_time.tzinfo else current_time

            # Move to next candle
            from datetime import timedelta
            current_time += timedelta(minutes=minutes)

        return candles

    def _evaluate_entry(self, candle: dict, direction: str) -> bool:
        """Simplified entry condition evaluation."""
        # In a real implementation, this would evaluate the actual strategy conditions
        # For simulation, we use a simple probability-based approach
        import random
        return random.random() < 0.02  # 2% chance of entry signal per candle

    def _check_exit_conditions(
        self,
        position: dict,
        candle: dict,
        risk_management: dict
    ) -> tuple[bool, str]:
        """Check if exit conditions are met."""
        import random

        entry_price = position["entry_price"]
        current_price = candle["close"]
        is_long = position["type"] == "long"

        # Calculate unrealized P/L in pips (simplified)
        pips_change = (current_price - entry_price) * 10000
        if not is_long:
            pips_change = -pips_change

        # Check stop loss
        stop_loss = risk_management.get("stop_loss", {})
        sl_type = stop_loss.get("type", "none")
        sl_value = stop_loss.get("value")

        if sl_type != "none" and sl_value:
            if sl_type == "fixed_pips" and pips_change < -sl_value:
                return True, "stop_loss"
            elif sl_type == "percentage" and pips_change < -sl_value:
                return True, "stop_loss"

        # Check take profit
        take_profit = risk_management.get("take_profit", {})
        tp_type = take_profit.get("type", "none")
        tp_value = take_profit.get("value")

        if tp_type != "none" and tp_value:
            if tp_type == "fixed_pips" and pips_change > tp_value:
                return True, "take_profit"
            elif tp_type == "percentage" and pips_change > tp_value:
                return True, "take_profit"
            elif tp_type == "risk_reward" and sl_value and pips_change > sl_value * tp_value:
                return True, "take_profit"

        # Random exit for simulation (if no explicit conditions met)
        if random.random() < 0.05:  # 5% chance of random exit
            return True, "signal"

        return False, ""

    def _calculate_position_size(self, balance: float, position_sizing: dict) -> float:
        """Calculate position size based on configuration."""
        method = position_sizing.get("method", "percentage")
        value = position_sizing.get("value", 2.0)

        if method == "percentage":
            return balance * (value / 100)
        elif method == "fixed_dollar":
            return min(value, balance * 0.5)
        elif method == "fixed_lot":
            return value * 100000  # Standard lot = 100,000 units
        elif method == "risk_based":
            return balance * (value / 100)

        return balance * 0.02  # Default 2%

    def _calculate_pnl(self, position: dict, exit_price: float) -> float:
        """Calculate profit/loss for a trade."""
        entry_price = position["entry_price"]
        size = position["size"]
        is_long = position["type"] == "long"

        price_change = exit_price - entry_price
        if not is_long:
            price_change = -price_change

        # Simplified P/L calculation
        pnl = price_change * size * 10000  # Assuming forex with pip value
        return round(pnl, 2)

    def _calculate_sharpe_ratio(self, daily_returns: List[float], risk_free_rate: float = 0.0) -> Optional[float]:
        """
        Calculate annualized Sharpe Ratio.

        Args:
            daily_returns: List of daily return percentages
            risk_free_rate: Annual risk-free rate (default 0)

        Returns:
            Annualized Sharpe Ratio or None if not calculable
        """
        if len(daily_returns) < 2:
            return None

        # Calculate mean and standard deviation of daily returns
        mean_return = sum(daily_returns) / len(daily_returns)
        variance = sum((r - mean_return) ** 2 for r in daily_returns) / len(daily_returns)
        std_dev = math.sqrt(variance) if variance > 0 else 0

        if std_dev == 0:
            return None

        # Annualize: multiply by sqrt(252) for daily returns
        daily_risk_free = risk_free_rate / 252
        sharpe = (mean_return - daily_risk_free) / std_dev
        annualized_sharpe = sharpe * math.sqrt(252)

        return round(annualized_sharpe, 2)

    def _calculate_sortino_ratio(self, daily_returns: List[float], risk_free_rate: float = 0.0) -> Optional[float]:
        """
        Calculate annualized Sortino Ratio (uses only downside deviation).

        Args:
            daily_returns: List of daily return percentages
            risk_free_rate: Annual risk-free rate (default 0)

        Returns:
            Annualized Sortino Ratio or None if not calculable
        """
        if len(daily_returns) < 2:
            return None

        # Calculate mean return
        mean_return = sum(daily_returns) / len(daily_returns)

        # Calculate downside deviation (only negative returns)
        negative_returns = [r for r in daily_returns if r < 0]
        if not negative_returns:
            # No negative returns means infinite Sortino (very good), but we cap it
            return None

        downside_variance = sum(r ** 2 for r in negative_returns) / len(daily_returns)
        downside_deviation = math.sqrt(downside_variance) if downside_variance > 0 else 0

        if downside_deviation == 0:
            return None

        # Annualize
        daily_risk_free = risk_free_rate / 252
        sortino = (mean_return - daily_risk_free) / downside_deviation
        annualized_sortino = sortino * math.sqrt(252)

        return round(annualized_sortino, 2)

    def _calculate_max_drawdown(self, equity_curve: List[float]) -> tuple[float, float]:
        """
        Calculate maximum drawdown from equity curve.

        Args:
            equity_curve: List of equity values

        Returns:
            Tuple of (max_drawdown_dollars, max_drawdown_percent)
        """
        if len(equity_curve) < 2:
            return 0.0, 0.0

        max_dd_dollars = 0.0
        max_dd_percent = 0.0
        peak = equity_curve[0]

        for equity in equity_curve:
            if equity > peak:
                peak = equity
            drawdown_dollars = peak - equity
            drawdown_percent = (drawdown_dollars / peak * 100) if peak > 0 else 0

            if drawdown_dollars > max_dd_dollars:
                max_dd_dollars = drawdown_dollars
            if drawdown_percent > max_dd_percent:
                max_dd_percent = drawdown_percent

        return round(max_dd_dollars, 2), round(max_dd_percent, 2)

    def _calculate_recovery_factor(self, total_return: float, max_drawdown: float) -> float:
        """
        Calculate recovery factor = total_return / max_drawdown.

        Args:
            total_return: Total profit/loss in dollars
            max_drawdown: Maximum drawdown in dollars

        Returns:
            Recovery factor (higher is better)
        """
        if max_drawdown <= 0:
            return 0.0
        return round(total_return / max_drawdown, 2)

    def _calculate_expectancy(self, win_rate: float, avg_win: float, avg_loss: float) -> float:
        """
        Calculate expectancy = (win_rate * avg_win) - (loss_rate * avg_loss).

        Args:
            win_rate: Win rate as percentage (0-100)
            avg_win: Average winning trade amount
            avg_loss: Average losing trade amount (positive value)

        Returns:
            Expected profit per trade
        """
        win_rate_decimal = win_rate / 100
        loss_rate_decimal = 1 - win_rate_decimal
        expectancy = (win_rate_decimal * avg_win) - (loss_rate_decimal * avg_loss)
        return round(expectancy, 2)

    def _calculate_buy_hold_return(
        self,
        candles: List[Dict[str, Any]],
        initial_balance: float
    ) -> tuple[float, List[float]]:
        """
        Calculate buy-and-hold benchmark return.

        Args:
            candles: List of candle data
            initial_balance: Starting balance

        Returns:
            Tuple of (buy_hold_return_percent, buy_hold_equity_curve)
        """
        if not candles or len(candles) < 2:
            return 0.0, [initial_balance]

        first_price = candles[0]["close"]
        last_price = candles[-1]["close"]

        buy_hold_return = ((last_price - first_price) / first_price) * 100

        # Calculate buy-hold equity curve
        buy_hold_curve = []
        for candle in candles:
            price_change = (candle["close"] - first_price) / first_price
            equity = initial_balance * (1 + price_change)
            buy_hold_curve.append(round(equity, 2))

        return round(buy_hold_return, 2), buy_hold_curve

    def _calculate_average_trade_duration(self, trades: List[Dict[str, Any]]) -> float:
        """
        Calculate average trade duration in minutes.

        Args:
            trades: List of trade dictionaries with entry_time and exit_time

        Returns:
            Average duration in minutes
        """
        if not trades:
            return 0.0

        total_duration_minutes = 0.0
        valid_trades = 0

        for trade in trades:
            entry_time = trade.get("entry_time")
            exit_time = trade.get("exit_time")

            if entry_time and exit_time:
                try:
                    # Parse times if they're strings
                    if isinstance(entry_time, str):
                        entry_time = datetime.fromisoformat(entry_time.replace("Z", "+00:00"))
                    if isinstance(exit_time, str):
                        exit_time = datetime.fromisoformat(exit_time.replace("Z", "+00:00"))

                    # Ensure both are datetime objects
                    if hasattr(entry_time, "timestamp") and hasattr(exit_time, "timestamp"):
                        duration = (exit_time - entry_time).total_seconds() / 60
                        if duration >= 0:
                            total_duration_minutes += duration
                            valid_trades += 1
                except (ValueError, TypeError):
                    continue

        if valid_trades == 0:
            return 0.0

        return round(total_duration_minutes / valid_trades, 2)

    def _calculate_results(
        self,
        trades: List[Dict[str, Any]],
        initial_balance: float,
        final_balance: float,
        equity_curve: Optional[List[float]] = None,
        candles: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Calculate comprehensive backtest results summary."""
        # Handle empty trades case
        if not trades:
            return BacktestResultsSummary(
                total_net_profit=0.0,
                return_on_investment=0.0,
                final_balance=initial_balance,
                total_trades=0,
                winning_trades=0,
                losing_trades=0,
                win_rate=0.0,
                profit_factor=0.0,
                average_win=0.0,
                average_loss=0.0,
                win_loss_ratio=0.0,
                largest_win=0.0,
                largest_loss=0.0,
                expectancy=0.0,
                average_trade_duration_minutes=0.0,
                max_drawdown_dollars=0.0,
                max_drawdown_percent=0.0,
                recovery_factor=0.0,
                sharpe_ratio=None,
                sortino_ratio=None,
                buy_hold_return=0.0,
                strategy_vs_benchmark=0.0,
                equity_curve=equity_curve or [initial_balance],
                buy_hold_curve=[initial_balance],
                trades=[]
            ).model_dump()

        # Categorize trades
        winning_trade_list = [t for t in trades if t.get("pnl", 0) > 0]
        losing_trade_list = [t for t in trades if t.get("pnl", 0) < 0]

        # Calculate basic metrics
        total_trades = len(trades)
        num_winning = len(winning_trade_list)
        num_losing = len(losing_trade_list)
        win_rate = (num_winning / total_trades * 100) if total_trades > 0 else 0.0

        # Calculate P/L metrics
        total_wins = sum(t.get("pnl", 0) for t in winning_trade_list)
        total_losses = abs(sum(t.get("pnl", 0) for t in losing_trade_list))

        avg_win = (total_wins / num_winning) if num_winning > 0 else 0.0
        avg_loss = (total_losses / num_losing) if num_losing > 0 else 0.0
        win_loss_ratio = (avg_win / avg_loss) if avg_loss > 0 else 0.0

        # Find largest win/loss
        pnl_values = [t.get("pnl", 0) for t in trades]
        largest_win = max(pnl_values) if pnl_values else 0.0
        largest_loss = abs(min(pnl_values)) if pnl_values else 0.0

        # Calculate profit factor
        profit_factor = (total_wins / total_losses) if total_losses > 0 else 0.0

        # Calculate total P/L and ROI
        total_net_profit = final_balance - initial_balance
        roi = (total_net_profit / initial_balance * 100) if initial_balance > 0 else 0.0

        # Calculate expectancy
        expectancy = self._calculate_expectancy(win_rate, avg_win, avg_loss)

        # Calculate average trade duration
        avg_duration = self._calculate_average_trade_duration(trades)

        # Build full equity curve if not provided
        if equity_curve is None or len(equity_curve) < 2:
            # Reconstruct from trades
            equity_curve = [initial_balance]
            running_balance = initial_balance
            for trade in trades:
                running_balance += trade.get("pnl", 0)
                equity_curve.append(round(running_balance, 2))

        # Calculate max drawdown
        max_dd_dollars, max_dd_percent = self._calculate_max_drawdown(equity_curve)

        # Calculate recovery factor
        recovery_factor = self._calculate_recovery_factor(total_net_profit, max_dd_dollars)

        # Calculate daily returns for Sharpe/Sortino
        daily_returns = []
        if len(equity_curve) >= 2:
            for i in range(1, len(equity_curve)):
                if equity_curve[i - 1] > 0:
                    daily_return = (equity_curve[i] - equity_curve[i - 1]) / equity_curve[i - 1] * 100
                    daily_returns.append(daily_return)

        # Calculate Sharpe and Sortino ratios
        sharpe_ratio = self._calculate_sharpe_ratio(daily_returns)
        sortino_ratio = self._calculate_sortino_ratio(daily_returns)

        # Calculate buy-and-hold benchmark
        buy_hold_return = 0.0
        buy_hold_curve = [initial_balance]
        if candles and len(candles) >= 2:
            buy_hold_return, buy_hold_curve = self._calculate_buy_hold_return(candles, initial_balance)

        # Calculate strategy vs benchmark
        strategy_vs_benchmark = roi - buy_hold_return

        # Build the results summary
        results = BacktestResultsSummary(
            total_net_profit=round(total_net_profit, 2),
            return_on_investment=round(roi, 2),
            final_balance=round(final_balance, 2),
            total_trades=total_trades,
            winning_trades=num_winning,
            losing_trades=num_losing,
            win_rate=round(win_rate, 1),
            profit_factor=round(profit_factor, 2),
            average_win=round(avg_win, 2),
            average_loss=round(avg_loss, 2),
            win_loss_ratio=round(win_loss_ratio, 2),
            largest_win=round(largest_win, 2),
            largest_loss=round(largest_loss, 2),
            expectancy=round(expectancy, 2),
            average_trade_duration_minutes=avg_duration,
            max_drawdown_dollars=max_dd_dollars,
            max_drawdown_percent=max_dd_percent,
            recovery_factor=recovery_factor,
            sharpe_ratio=sharpe_ratio,
            sortino_ratio=sortino_ratio,
            buy_hold_return=buy_hold_return,
            strategy_vs_benchmark=round(strategy_vs_benchmark, 2),
            equity_curve=equity_curve,
            buy_hold_curve=buy_hold_curve,
            trades=trades[-100:]  # Keep last 100 trades for detail view
        )

        return results.model_dump()

    def _handle_cancellation(self, backtest_id: str, execution: BacktestExecution, trades: List[Dict]):
        """Handle backtest cancellation."""
        if execution.keep_partial_on_cancel and trades:
            # Save partial results
            partial_results = {
                "partial": True,
                "candles_processed": execution.candles_processed,
                "total_candles": execution.total_candles,
                "trades": trades,
                "trade_count": len(trades)
            }
            self._save_partial_results(backtest_id, partial_results)

        # Update status back to pending
        self._update_backtest_status(backtest_id, "pending")

        with self._executions_lock:
            execution.status = "pending"

    def _update_backtest_status(
        self,
        backtest_id: str,
        status: str,
        started_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None,
        error_message: Optional[str] = None
    ):
        """Update backtest status in database."""
        if not is_configured():
            return

        client = get_supabase_client()
        if client is None:
            return

        try:
            update_data = {"status": status}

            if started_at:
                update_data["started_at"] = started_at.isoformat()
            if completed_at:
                update_data["completed_at"] = completed_at.isoformat()
            if error_message:
                update_data["error_message"] = error_message
            if status == "pending":
                # Reset progress fields on cancel
                update_data["progress_percentage"] = 0
                update_data["candles_processed"] = 0

            client.table("backtests").update(update_data).eq("id", backtest_id).execute()

        except Exception as e:
            logger.error(f"[BACKTEST_EXECUTOR] Error updating backtest status: {e}")

    def _update_backtest_progress(
        self,
        backtest_id: str,
        progress_percentage: int,
        candles_processed: int = 0,
        total_candles: Optional[int] = None,
        trade_count: int = 0,
        current_date: Optional[datetime] = None
    ):
        """Update backtest progress in database."""
        if not is_configured():
            return

        client = get_supabase_client()
        if client is None:
            return

        try:
            update_data = {
                "progress_percentage": progress_percentage,
                "candles_processed": candles_processed,
                "trade_count": trade_count
            }

            if total_candles is not None:
                update_data["total_candles"] = total_candles
            if current_date:
                update_data["current_date_processed"] = current_date.isoformat() if hasattr(current_date, "isoformat") else current_date

            client.table("backtests").update(update_data).eq("id", backtest_id).execute()

        except Exception as e:
            logger.error(f"[BACKTEST_EXECUTOR] Error updating backtest progress: {e}")

    def _complete_backtest(self, backtest_id: str, results: Dict[str, Any]):
        """Mark backtest as completed and save results."""
        if not is_configured():
            return

        client = get_supabase_client()
        if client is None:
            return

        try:
            client.table("backtests").update({
                "status": "completed",
                "progress_percentage": 100,
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "results": results
            }).eq("id", backtest_id).execute()

        except Exception as e:
            logger.error(f"[BACKTEST_EXECUTOR] Error completing backtest: {e}")

    def _save_partial_results(self, backtest_id: str, partial_results: Dict[str, Any]):
        """Save partial results for a cancelled backtest."""
        if not is_configured():
            return

        client = get_supabase_client()
        if client is None:
            return

        try:
            client.table("backtests").update({
                "partial_results": partial_results
            }).eq("id", backtest_id).execute()

        except Exception as e:
            logger.error(f"[BACKTEST_EXECUTOR] Error saving partial results: {e}")


# Global singleton instance
backtest_executor = BacktestExecutor()
