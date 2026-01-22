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
    with patch("core.backtest_executor.is_configured", return_value=True), \
         patch("core.backtest_executor.get_supabase_client") as mock_client:

        mock_db = MagicMock()
        mock_client.return_value = mock_db

        # Default mock responses
        mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [{}]

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
                    "short_exit": []
                }
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
                    "short_exit": []
                }
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
                    "short_exit": []
                }
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
                "end_date": "2025-01-31T00:00:00Z"
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
            MagicMock(data=[{
                "id": "backtest-1",
                "name": "Test Backtest",
                "strategy_id": "strategy-1",
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-01-31T00:00:00Z"
            }]),
            # Strategy lookup for validation
            MagicMock(data=[{
                "id": "strategy-1",
                "name": "Test Strategy",
                "conditions": {"long_entry": [], "short_entry": []}
            }])
        ]

        result = executor.start_backtest("backtest-1")

        assert result["success"] is False
        assert result["error"] == "validation_error"

    def test_start_backtest_already_running(self, executor, mock_supabase):
        """Test starting backtest fails when already running."""
        # Set up mock to return valid data
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            # Backtest lookup
            MagicMock(data=[{
                "id": "backtest-1",
                "name": "Test Backtest",
                "strategy_id": "strategy-1",
                "start_date": "2025-01-01T00:00:00Z",
                "end_date": "2025-01-02T00:00:00Z"
            }]),
            # Strategy lookup
            MagicMock(data=[{
                "id": "strategy-1",
                "conditions": {"long_entry": [{"type": "test"}], "short_entry": []}
            }]),
            # Strategy lookup in execution
            MagicMock(data=[{
                "id": "strategy-1",
                "conditions": {"long_entry": [{"type": "test"}], "short_entry": []}
            }])
        ]

        # Manually add a running execution
        execution = BacktestExecution(
            backtest_id="backtest-1",
            thread=MagicMock(),
            cancel_event=threading.Event(),
            status="running"
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
            current_date=datetime(2025, 1, 15, tzinfo=timezone.utc)
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
                "current_date_processed": "2025-01-31T00:00:00Z"
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
            candles_processed=500
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
            candles_processed=500
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
            status="completed"
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
            status="running"
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
            status="completed"
        )
        executor._running_backtests["backtest-1"] = execution

        assert executor.is_running("backtest-1") is False


class TestBacktestExecution:
    """Test cases for BacktestExecution dataclass."""

    def test_execution_default_values(self):
        """Test BacktestExecution has correct default values."""
        execution = BacktestExecution(
            backtest_id="test-id",
            thread=MagicMock(),
            cancel_event=threading.Event()
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
            trade_count=5
        )

        assert progress.backtest_id == "test-id"
        assert progress.status == "running"
        assert progress.progress_percentage == 50

    def test_progress_percentage_bounds(self):
        """Test progress_percentage validation bounds."""
        # Valid bounds
        progress = BacktestProgress(
            backtest_id="test-id",
            status="running",
            progress_percentage=0
        )
        assert progress.progress_percentage == 0

        progress = BacktestProgress(
            backtest_id="test-id",
            status="running",
            progress_percentage=100
        )
        assert progress.progress_percentage == 100

        # Invalid - should raise validation error
        with pytest.raises(Exception):  # Pydantic ValidationError
            BacktestProgress(
                backtest_id="test-id",
                status="running",
                progress_percentage=101
            )

        with pytest.raises(Exception):
            BacktestProgress(
                backtest_id="test-id",
                status="running",
                progress_percentage=-1
            )
