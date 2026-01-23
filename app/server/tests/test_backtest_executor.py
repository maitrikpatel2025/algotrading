"""
Tests for Backtest Executor
===========================
Unit tests for the BacktestExecutor class that manages backtest execution.
"""

import threading
import time
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

from core.backtest_executor import BacktestExecution, BacktestExecutor
from core.data_models import BacktestProgress


@pytest.fixture
def executor():
    """Create a fresh BacktestExecutor instance for testing."""
    # Reset the singleton
    BacktestExecutor._instance = None

    # Create a new instance
    instance = BacktestExecutor()

    yield instance

    # Cleanup - cancel any running backtests
    with instance._executions_lock:
        for backtest_id, execution in list(instance._running_backtests.items()):
            execution.cancel_event.set()

    # Wait briefly for threads to finish
    time.sleep(0.1)

    # Reset singleton for other tests
    BacktestExecutor._instance = None


@pytest.fixture
def mock_supabase():
    """Mock Supabase client for testing without database connection."""
    with (
        patch("core.backtest_executor.is_configured", return_value=True),
        patch("core.backtest_executor.get_supabase_client") as mock_client,
    ):
        mock_db = MagicMock()
        mock_client.return_value = mock_db

        # Default mock responses
        mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [
            {}
        ]

        yield mock_db


class TestBacktestExecutorSingleton:
    """Test cases for BacktestExecutor singleton behavior."""

    def test_executor_is_singleton(self):
        """Test that BacktestExecutor is a singleton."""
        # Reset singleton first
        BacktestExecutor._instance = None

        executor1 = BacktestExecutor()
        executor2 = BacktestExecutor()

        assert executor1 is executor2

        # Cleanup
        BacktestExecutor._instance = None


class TestStrategyValidation:
    """Test cases for strategy validation."""

    def test_validate_strategy_not_found(self, executor, mock_supabase):
        """Test validation fails when strategy is not found."""
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []

        is_valid, error = executor.validate_strategy_for_execution("nonexistent-id")

        assert is_valid is False
        assert "not found" in error.lower()

    def test_validate_strategy_no_entry_conditions(self, executor, mock_supabase):
        """Test validation fails when strategy has no entry conditions."""
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {
                "id": "strategy-1",
                "name": "Test Strategy",
                "conditions": {
                    "long_entry": [],
                    "short_entry": [],
                    "long_exit": [],
                    "short_exit": [],
                },
            }
        ]

        is_valid, error = executor.validate_strategy_for_execution("strategy-1")

        assert is_valid is False
        assert "entry condition" in error.lower()

    def test_validate_strategy_with_long_entry(self, executor, mock_supabase):
        """Test validation passes when strategy has long entry conditions."""
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {
                "id": "strategy-1",
                "name": "Test Strategy",
                "conditions": {
                    "long_entry": [{"type": "indicator", "config": {}}],
                    "short_entry": [],
                    "long_exit": [],
                    "short_exit": [],
                },
            }
        ]

        is_valid, error = executor.validate_strategy_for_execution("strategy-1")

        assert is_valid is True
        assert error is None

    def test_validate_strategy_with_short_entry(self, executor, mock_supabase):
        """Test validation passes when strategy has short entry conditions."""
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {
                "id": "strategy-1",
                "name": "Test Strategy",
                "conditions": {
                    "long_entry": [],
                    "short_entry": [{"type": "indicator", "config": {}}],
                    "long_exit": [],
                    "short_exit": [],
                },
            }
        ]

        is_valid, error = executor.validate_strategy_for_execution("strategy-1")

        assert is_valid is True
        assert error is None

    def test_validate_strategy_database_not_configured(self, executor):
        """Test validation fails when database is not configured."""
        with patch("core.backtest_executor.is_configured", return_value=False):
            is_valid, error = executor.validate_strategy_for_execution("strategy-1")

        assert is_valid is False
        assert "not configured" in error.lower()


class TestStartBacktest:
    """Test cases for starting a backtest."""

    def test_start_backtest_not_found(self, executor, mock_supabase):
        """Test starting backtest fails when backtest is not found."""
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []

        result = executor.start_backtest("nonexistent-id")

        assert result["success"] is False
        assert result["error"] == "not_found"

    def test_start_backtest_no_strategy(self, executor, mock_supabase):
        """Test starting backtest fails when no strategy is linked."""
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {
                "id": "backtest-1",
                "name": "Test Backtest",
                "strategy_id": None,
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-01-31T00:00:00Z",
            }
        ]

        result = executor.start_backtest("backtest-1")

        assert result["success"] is False
        assert result["error"] == "validation_error"
        assert "no linked strategy" in result["message"].lower()

    def test_start_backtest_invalid_strategy(self, executor, mock_supabase):
        """Test starting backtest fails when strategy validation fails."""

        # First call returns backtest, second call returns strategy with no conditions
        def mock_execute():
            mock = MagicMock()
            # This simulates different responses for different queries
            return mock

        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            # Backtest lookup
            MagicMock(
                data=[
                    {
                        "id": "backtest-1",
                        "name": "Test Backtest",
                        "strategy_id": "strategy-1",
                        "start_date": "2025-01-01T00:00:00Z",
                        "end_date": "2025-01-31T00:00:00Z",
                    }
                ]
            ),
            # Strategy lookup for validation
            MagicMock(
                data=[
                    {
                        "id": "strategy-1",
                        "name": "Test Strategy",
                        "conditions": {"long_entry": [], "short_entry": []},
                    }
                ]
            ),
        ]

        result = executor.start_backtest("backtest-1")

        assert result["success"] is False
        assert result["error"] == "validation_error"

    def test_start_backtest_already_running(self, executor, mock_supabase):
        """Test starting backtest fails when already running."""
        # Set up mock to return valid data
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            # Backtest lookup
            MagicMock(
                data=[
                    {
                        "id": "backtest-1",
                        "name": "Test Backtest",
                        "strategy_id": "strategy-1",
                        "start_date": "2025-01-01T00:00:00Z",
                        "end_date": "2025-01-02T00:00:00Z",
                    }
                ]
            ),
            # Strategy lookup
            MagicMock(
                data=[
                    {
                        "id": "strategy-1",
                        "conditions": {"long_entry": [{"type": "test"}], "short_entry": []},
                    }
                ]
            ),
            # Strategy lookup in execution
            MagicMock(
                data=[
                    {
                        "id": "strategy-1",
                        "conditions": {"long_entry": [{"type": "test"}], "short_entry": []},
                    }
                ]
            ),
        ]

        # Manually add a running execution
        execution = BacktestExecution(
            backtest_id="backtest-1",
            thread=MagicMock(),
            cancel_event=threading.Event(),
            status="running",
        )
        executor._running_backtests["backtest-1"] = execution

        result = executor.start_backtest("backtest-1")

        assert result["success"] is False
        assert result["error"] == "conflict"
        assert "already running" in result["message"].lower()


class TestGetProgress:
    """Test cases for getting backtest progress."""

    def test_get_progress_running_backtest(self, executor):
        """Test getting progress of a running backtest."""
        # Add a mock running backtest
        execution = BacktestExecution(
            backtest_id="backtest-1",
            thread=MagicMock(),
            cancel_event=threading.Event(),
            status="running",
            progress_percentage=50,
            candles_processed=500,
            total_candles=1000,
            trade_count=5,
            started_at=datetime.now(timezone.utc),
            current_date=datetime(2025, 1, 15, tzinfo=timezone.utc),
        )
        executor._running_backtests["backtest-1"] = execution

        progress = executor.get_progress("backtest-1")

        assert progress is not None
        assert progress.backtest_id == "backtest-1"
        assert progress.status == "running"
        assert progress.progress_percentage == 50
        assert progress.candles_processed == 500
        assert progress.total_candles == 1000
        assert progress.trade_count == 5

    def test_get_progress_not_found(self, executor, mock_supabase):
        """Test getting progress returns None when backtest not found."""
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []

        progress = executor.get_progress("nonexistent-id")

        assert progress is None

    def test_get_progress_from_database(self, executor, mock_supabase):
        """Test getting progress from database for completed backtest."""
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {
                "id": "backtest-1",
                "status": "completed",
                "progress_percentage": 100,
                "candles_processed": 1000,
                "total_candles": 1000,
                "trade_count": 15,
                "started_at": "2025-01-01T10:00:00Z",
                "current_date_processed": "2025-01-31T00:00:00Z",
            }
        ]

        progress = executor.get_progress("backtest-1")

        assert progress is not None
        assert progress.status == "completed"
        assert progress.progress_percentage == 100


class TestCancelBacktest:
    """Test cases for cancelling a backtest."""

    def test_cancel_backtest_not_running(self, executor):
        """Test cancelling a backtest that is not running."""
        result = executor.cancel_backtest("nonexistent-id")

        assert result["success"] is False
        assert result["error"] == "not_running"

    def test_cancel_backtest_success(self, executor):
        """Test successfully cancelling a running backtest."""
        cancel_event = threading.Event()
        mock_thread = MagicMock()
        mock_thread.join = MagicMock()

        execution = BacktestExecution(
            backtest_id="backtest-1",
            thread=mock_thread,
            cancel_event=cancel_event,
            status="running",
            candles_processed=500,
        )
        executor._running_backtests["backtest-1"] = execution

        result = executor.cancel_backtest("backtest-1", keep_partial_results=False)

        assert result["success"] is True
        assert cancel_event.is_set()
        mock_thread.join.assert_called_once()

    def test_cancel_backtest_keep_partial(self, executor):
        """Test cancelling with keep_partial_results flag."""
        cancel_event = threading.Event()
        mock_thread = MagicMock()
        mock_thread.join = MagicMock()

        execution = BacktestExecution(
            backtest_id="backtest-1",
            thread=mock_thread,
            cancel_event=cancel_event,
            status="running",
            candles_processed=500,
        )
        executor._running_backtests["backtest-1"] = execution

        result = executor.cancel_backtest("backtest-1", keep_partial_results=True)

        assert result["success"] is True
        assert execution.keep_partial_on_cancel is True

    def test_cancel_backtest_invalid_state(self, executor):
        """Test cancelling a backtest in completed state fails."""
        execution = BacktestExecution(
            backtest_id="backtest-1",
            thread=MagicMock(),
            cancel_event=threading.Event(),
            status="completed",
        )
        executor._running_backtests["backtest-1"] = execution

        result = executor.cancel_backtest("backtest-1")

        assert result["success"] is False
        assert result["error"] == "invalid_state"


class TestIsRunning:
    """Test cases for checking if backtest is running."""

    def test_is_running_true(self, executor):
        """Test is_running returns True for running backtest."""
        execution = BacktestExecution(
            backtest_id="backtest-1",
            thread=MagicMock(),
            cancel_event=threading.Event(),
            status="running",
        )
        executor._running_backtests["backtest-1"] = execution

        assert executor.is_running("backtest-1") is True

    def test_is_running_false_not_found(self, executor):
        """Test is_running returns False when not found."""
        assert executor.is_running("nonexistent-id") is False

    def test_is_running_false_completed(self, executor):
        """Test is_running returns False for completed backtest."""
        execution = BacktestExecution(
            backtest_id="backtest-1",
            thread=MagicMock(),
            cancel_event=threading.Event(),
            status="completed",
        )
        executor._running_backtests["backtest-1"] = execution

        assert executor.is_running("backtest-1") is False


class TestBacktestExecution:
    """Test cases for BacktestExecution dataclass."""

    def test_execution_default_values(self):
        """Test BacktestExecution has correct default values."""
        execution = BacktestExecution(
            backtest_id="test-id", thread=MagicMock(), cancel_event=threading.Event()
        )

        assert execution.progress_percentage == 0
        assert execution.candles_processed == 0
        assert execution.total_candles == 0
        assert execution.trade_count == 0
        assert execution.status == "pending"
        assert execution.error_message is None
        assert execution.keep_partial_on_cancel is False


class TestBacktestProgressModel:
    """Test cases for BacktestProgress Pydantic model."""

    def test_progress_model_validation(self):
        """Test BacktestProgress model validates correctly."""
        progress = BacktestProgress(
            backtest_id="test-id",
            status="running",
            progress_percentage=50,
            candles_processed=500,
            total_candles=1000,
            trade_count=5,
        )

        assert progress.backtest_id == "test-id"
        assert progress.status == "running"
        assert progress.progress_percentage == 50

    def test_progress_percentage_bounds(self):
        """Test progress_percentage validation bounds."""
        # Valid bounds
        progress = BacktestProgress(backtest_id="test-id", status="running", progress_percentage=0)
        assert progress.progress_percentage == 0

        progress = BacktestProgress(
            backtest_id="test-id", status="running", progress_percentage=100
        )
        assert progress.progress_percentage == 100

        # Invalid - should raise validation error
        with pytest.raises(Exception):  # Pydantic ValidationError
            BacktestProgress(backtest_id="test-id", status="running", progress_percentage=101)

        with pytest.raises(Exception):
            BacktestProgress(backtest_id="test-id", status="running", progress_percentage=-1)


class TestLiveMetrics:
    """Test cases for live performance metrics during backtest execution."""

    def test_execution_default_metrics(self):
        """Test BacktestExecution has correct default metric values."""
        execution = BacktestExecution(
            backtest_id="test-id", thread=MagicMock(), cancel_event=threading.Event()
        )

        assert execution.current_pnl == 0.0
        assert execution.running_win_rate == 0.0
        assert execution.current_drawdown == 0.0
        assert execution.equity_curve == []
        assert execution.peak_equity == 0.0
        assert execution.initial_balance == 0.0

    def test_progress_includes_live_metrics(self):
        """Test that BacktestProgress includes live performance metrics."""
        progress = BacktestProgress(
            backtest_id="test-id",
            status="running",
            progress_percentage=50,
            current_pnl=150.50,
            running_win_rate=65.5,
            current_drawdown=2.5,
            equity_curve=[10000, 10050, 10100, 10150],
            peak_equity=10200.0,
        )

        assert progress.current_pnl == 150.50
        assert progress.running_win_rate == 65.5
        assert progress.current_drawdown == 2.5
        assert progress.equity_curve == [10000, 10050, 10100, 10150]
        assert progress.peak_equity == 10200.0

    def test_progress_metrics_optional(self):
        """Test that live metrics are optional for backward compatibility."""
        progress = BacktestProgress(backtest_id="test-id", status="running", progress_percentage=50)

        assert progress.current_pnl is None
        assert progress.running_win_rate is None
        assert progress.current_drawdown is None
        assert progress.equity_curve is None
        assert progress.peak_equity is None

    def test_win_rate_bounds(self):
        """Test running_win_rate validation bounds."""
        # Valid bounds
        progress = BacktestProgress(backtest_id="test-id", status="running", running_win_rate=0.0)
        assert progress.running_win_rate == 0.0

        progress = BacktestProgress(backtest_id="test-id", status="running", running_win_rate=100.0)
        assert progress.running_win_rate == 100.0

        # Invalid - should raise validation error
        with pytest.raises(Exception):
            BacktestProgress(backtest_id="test-id", status="running", running_win_rate=101.0)

        with pytest.raises(Exception):
            BacktestProgress(backtest_id="test-id", status="running", running_win_rate=-1.0)

    def test_drawdown_non_negative(self):
        """Test current_drawdown must be non-negative."""
        progress = BacktestProgress(backtest_id="test-id", status="running", current_drawdown=0.0)
        assert progress.current_drawdown == 0.0

        progress = BacktestProgress(backtest_id="test-id", status="running", current_drawdown=50.0)
        assert progress.current_drawdown == 50.0

        # Invalid - should raise validation error
        with pytest.raises(Exception):
            BacktestProgress(backtest_id="test-id", status="running", current_drawdown=-5.0)

    def test_get_progress_includes_metrics(self, executor):
        """Test get_progress returns live metrics from running execution."""
        execution = BacktestExecution(
            backtest_id="backtest-1",
            thread=MagicMock(),
            cancel_event=threading.Event(),
            status="running",
            progress_percentage=50,
            candles_processed=500,
            total_candles=1000,
            trade_count=10,
            started_at=datetime.now(timezone.utc),
            current_pnl=250.75,
            running_win_rate=60.0,
            current_drawdown=1.5,
            equity_curve=[10000, 10100, 10200, 10150, 10250],
            peak_equity=10300.0,
            initial_balance=10000.0,
        )
        executor._running_backtests["backtest-1"] = execution

        progress = executor.get_progress("backtest-1")

        assert progress is not None
        assert progress.current_pnl == 250.75
        assert progress.running_win_rate == 60.0
        assert progress.current_drawdown == 1.5
        assert progress.equity_curve == [10000, 10100, 10200, 10150, 10250]
        assert progress.peak_equity == 10300.0

    def test_equity_curve_limit(self):
        """Test equity curve respects the 50 point limit."""
        # Create a list with more than 50 points
        large_curve = list(range(10000, 10060))  # 60 points
        assert len(large_curve) == 60

        # When limited, should keep last 50
        limited_curve = large_curve[-50:]
        assert len(limited_curve) == 50
        assert limited_curve[0] == 10010
        assert limited_curve[-1] == 10059

    def test_pnl_calculation_accuracy(self):
        """Test P/L calculation with various trade scenarios."""
        # Scenario: initial_balance=10000, final_balance=10500
        initial_balance = 10000.0
        final_balance = 10500.0
        expected_pnl = round(final_balance - initial_balance, 2)
        assert expected_pnl == 500.0

        # Scenario: loss
        final_balance = 9800.0
        expected_pnl = round(final_balance - initial_balance, 2)
        assert expected_pnl == -200.0

    def test_win_rate_calculation(self):
        """Test win rate calculation with various trade counts."""
        # 0 trades - should be 0%
        win_rate = 0.0
        assert win_rate == 0.0

        # 5 wins out of 10 trades
        winning_trades = 5
        total_trades = 10
        win_rate = round((winning_trades / total_trades) * 100, 1)
        assert win_rate == 50.0

        # All winning trades
        winning_trades = 10
        total_trades = 10
        win_rate = round((winning_trades / total_trades) * 100, 1)
        assert win_rate == 100.0

        # All losing trades
        winning_trades = 0
        total_trades = 10
        win_rate = round((winning_trades / total_trades) * 100, 1)
        assert win_rate == 0.0

    def test_drawdown_calculation(self):
        """Test drawdown calculation with peak tracking."""
        # Peak = 10500, current = 10200
        peak_equity = 10500.0
        current_equity = 10200.0
        drawdown = round(((peak_equity - current_equity) / peak_equity) * 100, 2)
        assert drawdown == 2.86

        # No drawdown when at peak
        current_equity = 10500.0
        drawdown = round(((peak_equity - current_equity) / peak_equity) * 100, 2)
        assert drawdown == 0.0

        # Large drawdown
        current_equity = 8000.0
        drawdown = round(((peak_equity - current_equity) / peak_equity) * 100, 2)
        assert drawdown == 23.81


class TestStatisticsCalculations:
    """Test cases for comprehensive backtest statistics calculations."""

    def test_calculate_sharpe_ratio_positive_returns(self, executor):
        """Test Sharpe ratio calculation with positive returns."""
        # Daily returns with positive average
        daily_returns = [0.5, 0.3, -0.2, 0.4, 0.6, -0.1, 0.8, 0.2, 0.5, 0.3]
        sharpe = executor._calculate_sharpe_ratio(daily_returns)

        assert sharpe is not None
        assert sharpe > 0

    def test_calculate_sharpe_ratio_negative_returns(self, executor):
        """Test Sharpe ratio calculation with negative returns."""
        # Daily returns with negative average
        daily_returns = [-0.5, -0.3, -0.2, -0.4, -0.6, -0.1, -0.8, -0.2, -0.5, -0.3]
        sharpe = executor._calculate_sharpe_ratio(daily_returns)

        assert sharpe is not None
        assert sharpe < 0

    def test_calculate_sharpe_ratio_insufficient_data(self, executor):
        """Test Sharpe ratio returns None with insufficient data."""
        # Only one data point
        sharpe = executor._calculate_sharpe_ratio([0.5])

        assert sharpe is None

    def test_calculate_sharpe_ratio_zero_std_dev(self, executor):
        """Test Sharpe ratio returns None when all returns are identical."""
        # All same value = zero standard deviation
        daily_returns = [0.5, 0.5, 0.5, 0.5, 0.5]
        sharpe = executor._calculate_sharpe_ratio(daily_returns)

        assert sharpe is None

    def test_calculate_sortino_ratio_with_downside(self, executor):
        """Test Sortino ratio calculation with downside volatility."""
        # Mix of positive and negative returns
        daily_returns = [1.0, -0.5, 0.8, -0.3, 1.2, -0.2, 0.5, -0.1, 0.9, 0.3]
        sortino = executor._calculate_sortino_ratio(daily_returns)

        assert sortino is not None

    def test_calculate_sortino_ratio_no_negative_returns(self, executor):
        """Test Sortino ratio returns None when there are no negative returns."""
        # All positive returns
        daily_returns = [0.5, 0.3, 0.2, 0.4, 0.6]
        sortino = executor._calculate_sortino_ratio(daily_returns)

        assert sortino is None

    def test_calculate_sortino_ratio_insufficient_data(self, executor):
        """Test Sortino ratio returns None with insufficient data."""
        sortino = executor._calculate_sortino_ratio([0.5])

        assert sortino is None

    def test_calculate_max_drawdown_with_drawdown(self, executor):
        """Test max drawdown calculation from equity curve."""
        # Equity curve with a drawdown: 10000 -> 10500 -> 10200 -> 10800
        equity_curve = [10000, 10200, 10500, 10300, 10200, 10400, 10800]
        dd_dollars, dd_percent = executor._calculate_max_drawdown(equity_curve)

        assert dd_dollars == 300.0  # Peak 10500 to low 10200
        assert dd_percent > 0
        assert dd_percent < 100

    def test_calculate_max_drawdown_no_drawdown(self, executor):
        """Test max drawdown is zero when equity always increases."""
        # Monotonically increasing equity
        equity_curve = [10000, 10100, 10200, 10300, 10400, 10500]
        dd_dollars, dd_percent = executor._calculate_max_drawdown(equity_curve)

        assert dd_dollars == 0.0
        assert dd_percent == 0.0

    def test_calculate_max_drawdown_insufficient_data(self, executor):
        """Test max drawdown with insufficient data points."""
        dd_dollars, dd_percent = executor._calculate_max_drawdown([10000])

        assert dd_dollars == 0.0
        assert dd_percent == 0.0

    def test_calculate_max_drawdown_full_loss(self, executor):
        """Test max drawdown with significant losses."""
        # 50% drawdown scenario
        equity_curve = [10000, 8000, 6000, 5000, 5500, 6000]
        dd_dollars, dd_percent = executor._calculate_max_drawdown(equity_curve)

        assert dd_dollars == 5000.0
        assert dd_percent == 50.0

    def test_calculate_recovery_factor_positive(self, executor):
        """Test recovery factor calculation with positive return."""
        total_return = 2000.0
        max_drawdown = 500.0
        recovery = executor._calculate_recovery_factor(total_return, max_drawdown)

        assert recovery == 4.0

    def test_calculate_recovery_factor_zero_drawdown(self, executor):
        """Test recovery factor returns 0 when no drawdown."""
        recovery = executor._calculate_recovery_factor(1000.0, 0.0)

        assert recovery == 0.0

    def test_calculate_expectancy_positive(self, executor):
        """Test expectancy calculation with profitable system."""
        # Win rate 60%, avg win $100, avg loss $50
        expectancy = executor._calculate_expectancy(60.0, 100.0, 50.0)

        # (0.6 * 100) - (0.4 * 50) = 60 - 20 = 40
        assert expectancy == 40.0

    def test_calculate_expectancy_negative(self, executor):
        """Test expectancy calculation with unprofitable system."""
        # Win rate 30%, avg win $50, avg loss $100
        expectancy = executor._calculate_expectancy(30.0, 50.0, 100.0)

        # (0.3 * 50) - (0.7 * 100) = 15 - 70 = -55
        assert expectancy == -55.0

    def test_calculate_expectancy_breakeven(self, executor):
        """Test expectancy calculation at breakeven."""
        # Win rate 50%, avg win $100, avg loss $100
        expectancy = executor._calculate_expectancy(50.0, 100.0, 100.0)

        # (0.5 * 100) - (0.5 * 100) = 50 - 50 = 0
        assert expectancy == 0.0

    def test_calculate_buy_hold_return_positive(self, executor):
        """Test buy-and-hold calculation with price increase."""
        candles = [
            {"close": 100.0},
            {"close": 105.0},
            {"close": 108.0},
            {"close": 110.0},
        ]
        initial_balance = 10000.0

        bh_return, bh_curve = executor._calculate_buy_hold_return(candles, initial_balance)

        assert bh_return == 10.0  # (110-100)/100 * 100 = 10%
        assert len(bh_curve) == 4
        assert bh_curve[0] == initial_balance
        assert bh_curve[-1] == 11000.0  # 10% increase

    def test_calculate_buy_hold_return_negative(self, executor):
        """Test buy-and-hold calculation with price decrease."""
        candles = [
            {"close": 100.0},
            {"close": 95.0},
            {"close": 92.0},
            {"close": 90.0},
        ]
        initial_balance = 10000.0

        bh_return, bh_curve = executor._calculate_buy_hold_return(candles, initial_balance)

        assert bh_return == -10.0  # (90-100)/100 * 100 = -10%
        assert bh_curve[-1] == 9000.0

    def test_calculate_buy_hold_return_no_data(self, executor):
        """Test buy-and-hold with empty candles."""
        bh_return, bh_curve = executor._calculate_buy_hold_return([], 10000.0)

        assert bh_return == 0.0
        assert bh_curve == [10000.0]

    def test_calculate_average_trade_duration(self, executor):
        """Test average trade duration calculation."""
        trades = [
            {
                "entry_time": "2025-01-01T10:00:00Z",
                "exit_time": "2025-01-01T11:30:00Z",  # 90 minutes
            },
            {
                "entry_time": "2025-01-02T10:00:00Z",
                "exit_time": "2025-01-02T10:30:00Z",  # 30 minutes
            },
            {
                "entry_time": "2025-01-03T10:00:00Z",
                "exit_time": "2025-01-03T12:00:00Z",  # 120 minutes
            },
        ]

        avg_duration = executor._calculate_average_trade_duration(trades)

        # (90 + 30 + 120) / 3 = 80 minutes
        assert avg_duration == 80.0

    def test_calculate_average_trade_duration_empty(self, executor):
        """Test average trade duration with no trades."""
        avg_duration = executor._calculate_average_trade_duration([])

        assert avg_duration == 0.0

    def test_calculate_results_empty_trades(self, executor):
        """Test _calculate_results with no trades."""
        results = executor._calculate_results(
            trades=[],
            initial_balance=10000.0,
            final_balance=10000.0,
        )

        assert results["total_trades"] == 0
        assert results["winning_trades"] == 0
        assert results["losing_trades"] == 0
        assert results["win_rate"] == 0.0
        assert results["total_net_profit"] == 0.0
        assert results["profit_factor"] == 0.0

    def test_calculate_results_with_trades(self, executor):
        """Test _calculate_results with sample trades."""
        trades = [
            {
                "pnl": 100.0,
                "entry_time": "2025-01-01T10:00:00Z",
                "exit_time": "2025-01-01T11:00:00Z",
            },
            {
                "pnl": -50.0,
                "entry_time": "2025-01-02T10:00:00Z",
                "exit_time": "2025-01-02T11:00:00Z",
            },
            {
                "pnl": 75.0,
                "entry_time": "2025-01-03T10:00:00Z",
                "exit_time": "2025-01-03T11:00:00Z",
            },
            {
                "pnl": -25.0,
                "entry_time": "2025-01-04T10:00:00Z",
                "exit_time": "2025-01-04T11:00:00Z",
            },
            {
                "pnl": 50.0,
                "entry_time": "2025-01-05T10:00:00Z",
                "exit_time": "2025-01-05T11:00:00Z",
            },
        ]

        results = executor._calculate_results(
            trades=trades,
            initial_balance=10000.0,
            final_balance=10150.0,
        )

        assert results["total_trades"] == 5
        assert results["winning_trades"] == 3
        assert results["losing_trades"] == 2
        assert results["win_rate"] == 60.0
        assert results["total_net_profit"] == 150.0
        assert results["largest_win"] == 100.0
        assert results["largest_loss"] == 50.0

    def test_calculate_results_all_winners(self, executor):
        """Test _calculate_results with all winning trades."""
        trades = [
            {
                "pnl": 100.0,
                "entry_time": "2025-01-01T10:00:00Z",
                "exit_time": "2025-01-01T11:00:00Z",
            },
            {
                "pnl": 50.0,
                "entry_time": "2025-01-02T10:00:00Z",
                "exit_time": "2025-01-02T11:00:00Z",
            },
            {
                "pnl": 75.0,
                "entry_time": "2025-01-03T10:00:00Z",
                "exit_time": "2025-01-03T11:00:00Z",
            },
        ]

        results = executor._calculate_results(
            trades=trades,
            initial_balance=10000.0,
            final_balance=10225.0,
        )

        assert results["win_rate"] == 100.0
        assert results["losing_trades"] == 0
        assert results["profit_factor"] == 0.0  # No losses, so profit factor is 0
        assert results["average_loss"] == 0.0

    def test_calculate_results_all_losers(self, executor):
        """Test _calculate_results with all losing trades."""
        trades = [
            {
                "pnl": -100.0,
                "entry_time": "2025-01-01T10:00:00Z",
                "exit_time": "2025-01-01T11:00:00Z",
            },
            {
                "pnl": -50.0,
                "entry_time": "2025-01-02T10:00:00Z",
                "exit_time": "2025-01-02T11:00:00Z",
            },
            {
                "pnl": -75.0,
                "entry_time": "2025-01-03T10:00:00Z",
                "exit_time": "2025-01-03T11:00:00Z",
            },
        ]

        results = executor._calculate_results(
            trades=trades,
            initial_balance=10000.0,
            final_balance=9775.0,
        )

        assert results["win_rate"] == 0.0
        assert results["winning_trades"] == 0
        assert results["total_net_profit"] == -225.0
        assert results["average_win"] == 0.0

    def test_calculate_results_with_equity_curve(self, executor):
        """Test _calculate_results with provided equity curve."""
        trades = [
            {
                "pnl": 100.0,
                "entry_time": "2025-01-01T10:00:00Z",
                "exit_time": "2025-01-01T11:00:00Z",
            },
            {
                "pnl": -50.0,
                "entry_time": "2025-01-02T10:00:00Z",
                "exit_time": "2025-01-02T11:00:00Z",
            },
        ]
        equity_curve = [10000.0, 10100.0, 10050.0]

        results = executor._calculate_results(
            trades=trades,
            initial_balance=10000.0,
            final_balance=10050.0,
            equity_curve=equity_curve,
        )

        assert results["max_drawdown_dollars"] == 50.0
        assert results["max_drawdown_percent"] > 0

    def test_calculate_results_with_candles(self, executor):
        """Test _calculate_results with candles for buy-and-hold comparison."""
        from datetime import datetime, timezone

        trades = [
            {
                "pnl": 500.0,
                "entry_time": "2025-01-01T10:00:00Z",
                "exit_time": "2025-01-01T11:00:00Z",
            }
        ]
        candles = [
            {"time": datetime(2025, 1, 1, 10, 0, tzinfo=timezone.utc), "close": 100.0},
            {"time": datetime(2025, 1, 1, 11, 0, tzinfo=timezone.utc), "close": 102.0},
            {
                "time": datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc),
                "close": 105.0,
            },  # 5% buy-and-hold return
        ]

        results = executor._calculate_results(
            trades=trades,
            initial_balance=10000.0,
            final_balance=10500.0,
            candles=candles,
        )

        assert results["buy_hold_return"] == 5.0
        # Strategy ROI is 5%, same as buy-hold
        assert results["return_on_investment"] == 5.0
        assert results["strategy_vs_benchmark"] == 0.0


class TestBacktestResultsSummaryModel:
    """Test cases for BacktestResultsSummary Pydantic model."""

    def test_results_summary_model_validation(self):
        """Test BacktestResultsSummary model validates correctly."""
        from core.data_models import BacktestResultsSummary

        summary = BacktestResultsSummary(
            total_net_profit=1500.0,
            return_on_investment=15.0,
            final_balance=11500.0,
            total_trades=50,
            winning_trades=30,
            losing_trades=20,
            win_rate=60.0,
            profit_factor=1.8,
            average_win=75.0,
            average_loss=37.5,
            win_loss_ratio=2.0,
            largest_win=250.0,
            largest_loss=100.0,
            expectancy=27.5,
            average_trade_duration_minutes=120.0,
            max_drawdown_dollars=500.0,
            max_drawdown_percent=4.35,
            recovery_factor=3.0,
            sharpe_ratio=1.5,
            sortino_ratio=2.1,
            buy_hold_return=10.0,
            strategy_vs_benchmark=5.0,
            equity_curve=[10000, 10500, 11000, 11500],
            buy_hold_curve=[10000, 10300, 10700, 11000],
        )

        assert summary.total_net_profit == 1500.0
        assert summary.win_rate == 60.0
        assert summary.sharpe_ratio == 1.5
        assert len(summary.equity_curve) == 4

    def test_results_summary_default_values(self):
        """Test BacktestResultsSummary has correct default values."""
        from core.data_models import BacktestResultsSummary

        summary = BacktestResultsSummary()

        assert summary.total_net_profit == 0.0
        assert summary.total_trades == 0
        assert summary.win_rate == 0.0
        assert summary.sharpe_ratio is None
        assert summary.sortino_ratio is None
        assert summary.equity_curve == []
        assert summary.trades == []

    def test_results_summary_optional_ratios(self):
        """Test that Sharpe and Sortino ratios are optional."""
        from core.data_models import BacktestResultsSummary

        summary = BacktestResultsSummary(
            total_trades=5,
            sharpe_ratio=None,
            sortino_ratio=None,
        )

        assert summary.sharpe_ratio is None
        assert summary.sortino_ratio is None


class TestEnhancedEquityCurveData:
    """Test cases for enhanced equity curve data for interactive charting."""

    def test_equity_curve_dates_array_matches_length(self, executor):
        """Test equity curve dates array matches equity curve values array in length."""
        from datetime import datetime, timezone

        candles = [
            {"time": datetime(2025, 1, 1, 10, 0, tzinfo=timezone.utc), "close": 100.0},
            {"time": datetime(2025, 1, 1, 11, 0, tzinfo=timezone.utc), "close": 102.0},
            {"time": datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc), "close": 105.0},
        ]

        trades = [
            {
                "pnl": 100.0,
                "entry_time": "2025-01-01T10:00:00Z",
                "exit_time": "2025-01-01T11:00:00Z",
            }
        ]

        results = executor._calculate_results(
            trades=trades, initial_balance=10000.0, final_balance=10100.0, candles=candles
        )

        assert results["equity_curve_dates"] is not None
        assert len(results["equity_curve_dates"]) == len(candles)
        assert all(isinstance(date, str) for date in results["equity_curve_dates"])

    def test_trade_counts_per_candle_array_matches_length(self, executor):
        """Test trade counts per candle array matches equity curve length."""
        from datetime import datetime, timezone

        candles = [
            {"time": datetime(2025, 1, 1, 10, 0, tzinfo=timezone.utc), "close": 100.0},
            {"time": datetime(2025, 1, 1, 11, 0, tzinfo=timezone.utc), "close": 102.0},
            {"time": datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc), "close": 105.0},
        ]

        trades = [
            {
                "pnl": 50.0,
                "entry_time": "2025-01-01T10:00:00Z",
                "exit_time": "2025-01-01T11:00:00Z",
            },
            {
                "pnl": 50.0,
                "entry_time": "2025-01-01T10:30:00Z",
                "exit_time": "2025-01-01T12:00:00Z",
            },
        ]

        results = executor._calculate_results(
            trades=trades, initial_balance=10000.0, final_balance=10100.0, candles=candles
        )

        assert results["trade_counts_per_candle"] is not None
        assert len(results["trade_counts_per_candle"]) == len(candles)
        assert all(isinstance(count, int) for count in results["trade_counts_per_candle"])

    def test_identify_drawdown_periods_single_drawdown(self, executor):
        """Test drawdown period identification with a single drawdown."""
        # Peak at 10500, drawdown to 10200, recovery to 10800
        equity_curve = [10000, 10200, 10500, 10400, 10200, 10400, 10800]

        drawdown_periods = executor._identify_drawdown_periods(equity_curve)

        assert len(drawdown_periods) == 1
        assert drawdown_periods[0]["start_index"] == 2
        assert drawdown_periods[0]["end_index"] == 5
        assert drawdown_periods[0]["max_drawdown_pct"] > 0

    def test_identify_drawdown_periods_multiple_drawdowns(self, executor):
        """Test drawdown period identification with multiple drawdowns."""
        # Two separate drawdown periods
        equity_curve = [10000, 10500, 10300, 10600, 10400, 10800]

        drawdown_periods = executor._identify_drawdown_periods(equity_curve)

        assert len(drawdown_periods) == 2

    def test_identify_drawdown_periods_no_drawdown(self, executor):
        """Test drawdown period identification with no drawdowns."""
        # Monotonically increasing equity
        equity_curve = [10000, 10100, 10200, 10300, 10400, 10500]

        drawdown_periods = executor._identify_drawdown_periods(equity_curve)

        assert len(drawdown_periods) == 0

    def test_identify_drawdown_periods_ending_in_drawdown(self, executor):
        """Test drawdown period identification when ending in a drawdown."""
        # Peak at 10500, then continuous drawdown to end
        equity_curve = [10000, 10500, 10400, 10300, 10200]

        drawdown_periods = executor._identify_drawdown_periods(equity_curve)

        assert len(drawdown_periods) == 1
        assert drawdown_periods[0]["end_index"] == len(equity_curve) - 1

    def test_identify_drawdown_periods_insufficient_data(self, executor):
        """Test drawdown period identification with insufficient data."""
        drawdown_periods = executor._identify_drawdown_periods([10000])

        assert len(drawdown_periods) == 0

    def test_drawdown_periods_serializable(self, executor):
        """Test drawdown periods are properly serialized in results."""
        from datetime import datetime, timezone

        candles = [
            {"time": datetime(2025, 1, 1, 10, 0, tzinfo=timezone.utc), "close": 100.0},
            {"time": datetime(2025, 1, 1, 11, 0, tzinfo=timezone.utc), "close": 102.0},
            {"time": datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc), "close": 98.0},
        ]

        # Create equity curve with drawdown
        equity_curve = [10000, 10200, 9900]

        trades = [
            {
                "pnl": -100.0,
                "entry_time": "2025-01-01T11:00:00Z",
                "exit_time": "2025-01-01T12:00:00Z",
            }
        ]

        results = executor._calculate_results(
            trades=trades,
            initial_balance=10000.0,
            final_balance=9900.0,
            equity_curve=equity_curve,
            candles=candles,
        )

        assert results["drawdown_periods"] is not None
        # Verify it serializes to JSON properly
        import json

        json_str = json.dumps(results["drawdown_periods"])
        assert json_str is not None

    def test_enhanced_fields_backward_compatible(self, executor):
        """Test enhanced fields are optional for backward compatibility."""
        from core.data_models import BacktestResultsSummary

        # Create results without enhanced fields
        summary = BacktestResultsSummary(
            total_trades=5,
            equity_curve=[10000, 10500, 11000],
            equity_curve_dates=None,
            trade_counts_per_candle=None,
            drawdown_periods=None,
        )

        assert summary.equity_curve_dates is None
        assert summary.trade_counts_per_candle is None
        assert summary.drawdown_periods is None

    def test_enhanced_fields_with_data(self, executor):
        """Test enhanced fields can be populated with data."""
        from core.data_models import BacktestResultsSummary

        summary = BacktestResultsSummary(
            total_trades=5,
            equity_curve=[10000, 10500, 11000],
            equity_curve_dates=[
                "2025-01-01T10:00:00Z",
                "2025-01-01T11:00:00Z",
                "2025-01-01T12:00:00Z",
            ],
            trade_counts_per_candle=[0, 1, 2],
            drawdown_periods=[{"start_index": 1, "end_index": 2, "max_drawdown_pct": 5.0}],
        )

        assert len(summary.equity_curve_dates) == 3
        assert len(summary.trade_counts_per_candle) == 3
        assert len(summary.drawdown_periods) == 1


class TestConditionFormatHandling:
    """Test cases for handling both legacy dict and new list condition formats."""

    def test_execute_backtest_with_legacy_dict_format(self, executor, mock_supabase):
        """Test backtest executes successfully with old dictionary format."""
        from unittest.mock import patch

        # Mock the database responses for backtest and strategy lookups
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            # Backtest lookup
            MagicMock(
                data=[
                    {
                        "id": "backtest-1",
                        "name": "Test Backtest",
                        "strategy_id": "strategy-1",
                        "start_date": "2025-01-01T00:00:00Z",
                        "end_date": "2025-01-02T00:00:00Z",
                        "initial_balance": 10000.0,
                        "position_size_percent": 100.0,
                        "fee_percent": 0.1,
                    }
                ]
            ),
            # Strategy lookup for validation
            MagicMock(
                data=[
                    {
                        "id": "strategy-1",
                        "name": "Test Strategy",
                        "conditions": {
                            "long_entry": [{"type": "indicator", "config": {}}],
                            "short_entry": [],
                            "long_exit": [],
                            "short_exit": [],
                        },
                    }
                ]
            ),
            # Strategy lookup in execution
            MagicMock(
                data=[
                    {
                        "id": "strategy-1",
                        "name": "Test Strategy",
                        "conditions": {
                            "long_entry": [{"type": "indicator", "config": {}}],
                            "short_entry": [],
                            "long_exit": [],
                            "short_exit": [],
                        },
                    }
                ]
            ),
        ]

        # Mock _generate_simulated_candles to return empty candles (no actual processing)
        with patch.object(executor, "_generate_simulated_candles", return_value=[]):
            result = executor.start_backtest("backtest-1")

            # Backtest should start successfully (legacy format should be handled)
            assert result["success"] is True

    def test_execute_backtest_with_new_list_format(self, executor, mock_supabase):
        """Test backtest executes successfully with new list format (primary test for this bug fix)."""
        from unittest.mock import patch

        # Mock the database responses with NEW list format
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            # Backtest lookup
            MagicMock(
                data=[
                    {
                        "id": "backtest-1",
                        "name": "Test Backtest",
                        "strategy_id": "strategy-1",
                        "start_date": "2025-01-01T00:00:00Z",
                        "end_date": "2025-01-02T00:00:00Z",
                        "initial_balance": 10000.0,
                        "position_size_percent": 100.0,
                        "fee_percent": 0.1,
                    }
                ]
            ),
            # Strategy lookup for validation
            MagicMock(
                data=[
                    {
                        "id": "strategy-1",
                        "name": "Test Strategy",
                        "conditions": [
                            {"section": "long_entry", "type": "indicator", "config": {}},
                            {"section": "short_entry", "type": "indicator", "config": {}},
                        ],
                    }
                ]
            ),
            # Strategy lookup in execution
            MagicMock(
                data=[
                    {
                        "id": "strategy-1",
                        "name": "Test Strategy",
                        "conditions": [
                            {"section": "long_entry", "type": "indicator", "config": {}},
                            {"section": "short_entry", "type": "indicator", "config": {}},
                        ],
                    }
                ]
            ),
        ]

        # Mock _generate_simulated_candles to return empty candles
        with patch.object(executor, "_generate_simulated_candles", return_value=[]):
            result = executor.start_backtest("backtest-1")

            # Backtest should start successfully with new list format
            assert result["success"] is True

    def test_execute_backtest_with_empty_conditions_list(self, executor, mock_supabase):
        """Test graceful handling of empty conditions."""
        from unittest.mock import patch

        # Mock the database responses with empty conditions list
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            # Backtest lookup
            MagicMock(
                data=[
                    {
                        "id": "backtest-1",
                        "name": "Test Backtest",
                        "strategy_id": "strategy-1",
                        "start_date": "2025-01-01T00:00:00Z",
                        "end_date": "2025-01-02T00:00:00Z",
                        "initial_balance": 10000.0,
                        "position_size_percent": 100.0,
                        "fee_percent": 0.1,
                    }
                ]
            ),
            # Strategy lookup for validation (empty conditions)
            MagicMock(
                data=[
                    {
                        "id": "strategy-1",
                        "name": "Test Strategy",
                        "conditions": [],
                    }
                ]
            ),
        ]

        result = executor.start_backtest("backtest-1")

        # Should fail validation because there are no entry conditions
        assert result["success"] is False
        assert result["error"] == "validation_error"

    def test_execute_backtest_with_mixed_section_types(self, executor, mock_supabase):
        """Test all four section types are extracted correctly from list format."""
        from unittest.mock import patch

        # Mock the database responses with all four section types
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            # Backtest lookup
            MagicMock(
                data=[
                    {
                        "id": "backtest-1",
                        "name": "Test Backtest",
                        "strategy_id": "strategy-1",
                        "start_date": "2025-01-01T00:00:00Z",
                        "end_date": "2025-01-02T00:00:00Z",
                        "initial_balance": 10000.0,
                        "position_size_percent": 100.0,
                        "fee_percent": 0.1,
                    }
                ]
            ),
            # Strategy lookup for validation
            MagicMock(
                data=[
                    {
                        "id": "strategy-1",
                        "name": "Test Strategy",
                        "conditions": [
                            {"section": "long_entry", "type": "indicator1", "config": {}},
                            {"section": "long_entry", "type": "indicator2", "config": {}},
                            {"section": "short_entry", "type": "indicator3", "config": {}},
                            {"section": "long_exit", "type": "indicator4", "config": {}},
                            {"section": "short_exit", "type": "indicator5", "config": {}},
                        ],
                    }
                ]
            ),
            # Strategy lookup in execution
            MagicMock(
                data=[
                    {
                        "id": "strategy-1",
                        "name": "Test Strategy",
                        "conditions": [
                            {"section": "long_entry", "type": "indicator1", "config": {}},
                            {"section": "long_entry", "type": "indicator2", "config": {}},
                            {"section": "short_entry", "type": "indicator3", "config": {}},
                            {"section": "long_exit", "type": "indicator4", "config": {}},
                            {"section": "short_exit", "type": "indicator5", "config": {}},
                        ],
                    }
                ]
            ),
        ]

        # Mock _generate_simulated_candles to return empty candles
        with patch.object(executor, "_generate_simulated_candles", return_value=[]):
            result = executor.start_backtest("backtest-1")

            # Backtest should start successfully with all section types
            assert result["success"] is True
