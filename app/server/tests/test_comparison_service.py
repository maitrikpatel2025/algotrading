"""
Unit Tests for Comparison Service
=================================
Tests for backtest comparison functionality including statistical analysis.
"""

from datetime import datetime
from unittest.mock import patch

import pytest

from core.comparison_service import (
    COMPARISON_METRICS,
    HIGHER_IS_BETTER,
    LOWER_IS_BETTER,
    _bootstrap_test,
    _calculate_best_index,
    _determine_metric_direction,
    _format_metric_value,
    _get_metric_value,
    _metric_display_name,
    calculate_statistical_significance,
    get_comparison_data,
)
from core.data_models import (
    BacktestConfig,
    PartialClosesConfig,
    PositionSizingConfig,
    RiskManagementConfig,
    StopLossConfig,
    TakeProfitConfig,
    TrailingStopConfig,
)


@pytest.fixture
def sample_backtest():
    """Create a sample backtest configuration for testing."""
    return BacktestConfig(
        id="test-bt-1",
        name="Test Backtest 1",
        description="Sample backtest for testing",
        strategy_id="strategy-1",
        strategy_name="Test Strategy",
        pair="EURUSD",
        timeframe="H1",
        start_date=datetime(2025, 1, 1),
        end_date=datetime(2025, 12, 31),
        initial_balance=10000.0,
        currency="USD",
        position_sizing=PositionSizingConfig(
            method="percentage", value=2.0, leverage=10, max_position_size=None, compound=True
        ),
        risk_management=RiskManagementConfig(
            stop_loss=StopLossConfig(type="fixed_pips", value=20.0),
            take_profit=TakeProfitConfig(type="risk_reward", value=2.0),
            trailing_stop=TrailingStopConfig(type="none", value=None, break_even_trigger=None),
            partial_closes=PartialClosesConfig(enabled=False, levels=[]),
        ),
        status="completed",
        results={
            "total_net_profit": 2500.0,
            "return_on_investment": 25.0,
            "final_balance": 12500.0,
            "total_trades": 100,
            "winning_trades": 60,
            "losing_trades": 40,
            "win_rate": 60.0,
            "profit_factor": 1.85,
            "average_win": 150.0,
            "average_loss": -75.0,
            "win_loss_ratio": 2.0,
            "largest_win": 450.0,
            "largest_loss": -200.0,
            "expectancy": 25.0,
            "max_drawdown_dollars": 850.0,
            "max_drawdown_percent": 8.5,
            "recovery_factor": 2.94,
            "sharpe_ratio": 1.45,
            "sortino_ratio": 2.12,
            "average_trade_duration_minutes": 240.0,
            "equity_curve": [10000.0, 10500.0, 11000.0, 11500.0, 12000.0, 12500.0],
            "buy_hold_curve": [10000.0, 10300.0, 10600.0, 10900.0, 11200.0, 11550.0],
            "equity_curve_dates": [
                "2025-01-01",
                "2025-03-01",
                "2025-05-01",
                "2025-07-01",
                "2025-09-01",
                "2025-12-01",
            ],
            "trades": [
                {"profit_loss": 150.0},
                {"profit_loss": -75.0},
                {"profit_loss": 200.0},
                {"profit_loss": -50.0},
                {"profit_loss": 100.0},
            ],
        },
        notes=None,
        created_at=datetime(2026, 1, 24, 14, 30),
        updated_at=datetime(2026, 1, 24, 15, 45),
    )


@pytest.fixture
def sample_backtest_2():
    """Create a second sample backtest for comparison testing."""
    return BacktestConfig(
        id="test-bt-2",
        name="Test Backtest 2",
        description="Second backtest for comparison",
        strategy_id="strategy-2",
        strategy_name="Test Strategy 2",
        pair="EURUSD",
        timeframe="H1",
        start_date=datetime(2025, 1, 1),
        end_date=datetime(2025, 12, 31),
        initial_balance=10000.0,
        currency="USD",
        position_sizing=PositionSizingConfig(
            method="percentage", value=2.0, leverage=10, max_position_size=None, compound=True
        ),
        risk_management=RiskManagementConfig(
            stop_loss=StopLossConfig(type="fixed_pips", value=20.0),
            take_profit=TakeProfitConfig(type="risk_reward", value=2.0),
            trailing_stop=TrailingStopConfig(type="none", value=None, break_even_trigger=None),
            partial_closes=PartialClosesConfig(enabled=False, levels=[]),
        ),
        status="completed",
        results={
            "total_net_profit": 1500.0,
            "return_on_investment": 15.0,
            "final_balance": 11500.0,
            "total_trades": 80,
            "winning_trades": 48,
            "losing_trades": 32,
            "win_rate": 60.0,
            "profit_factor": 1.5,
            "average_win": 120.0,
            "average_loss": -60.0,
            "win_loss_ratio": 2.0,
            "largest_win": 350.0,
            "largest_loss": -150.0,
            "expectancy": 18.75,
            "max_drawdown_dollars": 600.0,
            "max_drawdown_percent": 6.0,
            "recovery_factor": 2.5,
            "sharpe_ratio": 1.2,
            "sortino_ratio": 1.8,
            "average_trade_duration_minutes": 180.0,
            "equity_curve": [10000.0, 10200.0, 10500.0, 10800.0, 11100.0, 11500.0],
            "buy_hold_curve": [10000.0, 10300.0, 10600.0, 10900.0, 11200.0, 11550.0],
            "equity_curve_dates": [
                "2025-01-01",
                "2025-03-01",
                "2025-05-01",
                "2025-07-01",
                "2025-09-01",
                "2025-12-01",
            ],
            "trades": [
                {"profit_loss": 120.0},
                {"profit_loss": -60.0},
                {"profit_loss": 80.0},
                {"profit_loss": -40.0},
                {"profit_loss": 90.0},
            ],
        },
        notes=None,
        created_at=datetime(2026, 1, 24, 14, 30),
        updated_at=datetime(2026, 1, 24, 15, 45),
    )


class TestFormatMetricValue:
    """Tests for _format_metric_value function."""

    def test_format_currency_usd(self):
        assert _format_metric_value("total_net_profit", 2500.0, "USD") == "$2,500.00"
        assert _format_metric_value("total_net_profit", -500.0, "USD") == "-$500.00"

    def test_format_currency_eur(self):
        assert _format_metric_value("total_net_profit", 1000.0, "EUR") == "€1,000.00"

    def test_format_percentage(self):
        assert _format_metric_value("win_rate", 60.0, "USD") == "60.00%"
        assert _format_metric_value("return_on_investment", -15.0, "USD") == "-15.00%"

    def test_format_integer(self):
        assert _format_metric_value("total_trades", 100, "USD") == "100"
        assert _format_metric_value("winning_trades", 60, "USD") == "60"

    def test_format_duration(self):
        assert _format_metric_value("average_trade_duration_minutes", 45.0, "USD") == "45m"
        assert _format_metric_value("average_trade_duration_minutes", 90.0, "USD") == "1h 30m"
        assert _format_metric_value("average_trade_duration_minutes", 120.0, "USD") == "2h"

    def test_format_decimal(self):
        assert _format_metric_value("profit_factor", 1.85, "USD") == "1.85"
        assert _format_metric_value("sharpe_ratio", 1.45, "USD") == "1.45"

    def test_format_none_value(self):
        assert _format_metric_value("sharpe_ratio", None, "USD") == "--"


class TestDetermineMetricDirection:
    """Tests for _determine_metric_direction function."""

    def test_higher_is_better_metrics(self):
        for metric in HIGHER_IS_BETTER:
            assert _determine_metric_direction(metric) == "higher"

    def test_lower_is_better_metrics(self):
        for metric in LOWER_IS_BETTER:
            assert _determine_metric_direction(metric) == "lower"

    def test_neutral_metrics(self):
        assert _determine_metric_direction("unknown_metric") == "neutral"


class TestCalculateBestIndex:
    """Tests for _calculate_best_index function."""

    def test_higher_is_better(self):
        values = [10.0, 25.0, 15.0, 20.0]
        assert _calculate_best_index(values, "higher") == 1  # 25.0 is highest

    def test_lower_is_better(self):
        values = [10.0, 25.0, 5.0, 20.0]
        assert _calculate_best_index(values, "lower") == 2  # 5.0 is lowest

    def test_with_none_values(self):
        values = [None, 25.0, None, 20.0]
        assert _calculate_best_index(values, "higher") == 1

    def test_all_none_values(self):
        values = [None, None, None]
        assert _calculate_best_index(values, "higher") is None

    def test_neutral_direction(self):
        values = [10.0, 20.0, 30.0]
        assert _calculate_best_index(values, "neutral") is None


class TestGetMetricValue:
    """Tests for _get_metric_value function."""

    def test_get_existing_metric(self):
        results = {"total_net_profit": 2500.0, "win_rate": 60.0}
        assert _get_metric_value(results, "total_net_profit") == 2500.0
        assert _get_metric_value(results, "win_rate") == 60.0

    def test_get_missing_metric(self):
        results = {"total_net_profit": 2500.0}
        assert _get_metric_value(results, "missing_metric") is None

    def test_get_from_none_results(self):
        assert _get_metric_value(None, "total_net_profit") is None


class TestMetricDisplayName:
    """Tests for _metric_display_name function."""

    def test_known_metrics(self):
        assert _metric_display_name("total_net_profit") == "Net P/L"
        assert _metric_display_name("return_on_investment") == "ROI"
        assert _metric_display_name("win_rate") == "Win Rate"
        assert _metric_display_name("profit_factor") == "Profit Factor"

    def test_unknown_metric(self):
        assert _metric_display_name("unknown_metric") == "Unknown Metric"


class TestBootstrapTest:
    """Tests for _bootstrap_test function."""

    def test_identical_distributions(self):
        values1 = [100.0, 100.0, 100.0, 100.0, 100.0]
        values2 = [100.0, 100.0, 100.0, 100.0, 100.0]
        p_value, is_significant = _bootstrap_test(values1, values2, n_iterations=100)
        # Identical distributions should not be significant
        assert not is_significant or p_value > 0.05

    def test_very_different_distributions(self):
        values1 = [1000.0, 1000.0, 1000.0, 1000.0, 1000.0]
        values2 = [1.0, 1.0, 1.0, 1.0, 1.0]
        p_value, is_significant = _bootstrap_test(values1, values2, n_iterations=100)
        # Very different distributions should be significant
        assert is_significant or p_value < 0.1

    def test_insufficient_data(self):
        values1 = [100.0]  # Only 1 value
        values2 = [50.0, 60.0]
        p_value, is_significant = _bootstrap_test(values1, values2)
        # Should return not significant due to insufficient data
        assert p_value == 1.0
        assert not is_significant


class TestCalculateStatisticalSignificance:
    """Tests for calculate_statistical_significance function."""

    def test_with_two_backtests(self, sample_backtest, sample_backtest_2):
        results = calculate_statistical_significance([sample_backtest, sample_backtest_2])

        # Should have results for key metrics
        assert len(results) > 0

        # Check structure of results
        for stat in results:
            assert stat.metric is not None
            assert stat.interpretation is not None

    def test_with_single_backtest(self, sample_backtest):
        results = calculate_statistical_significance([sample_backtest])
        # Should return empty list for single backtest
        assert len(results) == 0

    def test_with_no_backtests(self):
        results = calculate_statistical_significance([])
        assert len(results) == 0


class TestGetComparisonData:
    """Tests for get_comparison_data function."""

    @patch("core.comparison_service.get_backtest")
    def test_successful_comparison(self, mock_get_backtest, sample_backtest, sample_backtest_2):
        # Mock get_backtest to return our sample backtests
        mock_get_backtest.side_effect = [
            (True, sample_backtest, None),
            (True, sample_backtest_2, None),
        ]

        success, comparison, error = get_comparison_data(["test-bt-1", "test-bt-2"])

        assert success
        assert comparison is not None
        assert error is None
        assert len(comparison.backtests) == 2
        assert len(comparison.metrics_comparison) > 0

    @patch("core.comparison_service.get_backtest")
    def test_comparison_with_notes(self, mock_get_backtest, sample_backtest, sample_backtest_2):
        mock_get_backtest.side_effect = [
            (True, sample_backtest, None),
            (True, sample_backtest_2, None),
        ]

        success, comparison, error = get_comparison_data(
            ["test-bt-1", "test-bt-2"], notes="Test comparison notes"
        )

        assert success
        assert comparison.notes == "Test comparison notes"

    def test_too_few_backtests(self):
        success, comparison, error = get_comparison_data(["test-bt-1"])

        assert not success
        assert comparison is None
        assert "At least 2 backtests" in error

    def test_too_many_backtests(self):
        success, comparison, error = get_comparison_data(
            ["bt-1", "bt-2", "bt-3", "bt-4", "bt-5"]
        )

        assert not success
        assert comparison is None
        assert "Maximum of 4 backtests" in error

    @patch("core.comparison_service.get_backtest")
    def test_backtest_not_found(self, mock_get_backtest):
        mock_get_backtest.return_value = (False, None, "Backtest not found")

        success, comparison, error = get_comparison_data(["test-bt-1", "test-bt-2"])

        assert not success
        assert comparison is None
        assert "Failed to fetch" in error

    @patch("core.comparison_service.get_backtest")
    def test_backtest_not_completed(self, mock_get_backtest, sample_backtest, sample_backtest_2):
        # Set first backtest as pending
        sample_backtest.status = "pending"

        mock_get_backtest.side_effect = [
            (True, sample_backtest, None),
            (True, sample_backtest_2, None),
        ]

        success, comparison, error = get_comparison_data(["test-bt-1", "test-bt-2"])

        assert not success
        assert comparison is None
        assert "not completed" in error

    @patch("core.comparison_service.get_backtest")
    def test_best_values_calculated(self, mock_get_backtest, sample_backtest, sample_backtest_2):
        mock_get_backtest.side_effect = [
            (True, sample_backtest, None),
            (True, sample_backtest_2, None),
        ]

        success, comparison, error = get_comparison_data(["test-bt-1", "test-bt-2"])

        assert success
        # Check that best values are calculated for various metrics
        assert "total_net_profit" in comparison.best_values
        assert "return_on_investment" in comparison.best_values
        # sample_backtest has higher profit (2500 vs 1500), so it should be best (index 0)
        assert comparison.best_values["total_net_profit"] == 0


class TestComparisonMetricsConstant:
    """Tests for COMPARISON_METRICS constant."""

    def test_contains_required_metrics(self):
        required = [
            "total_net_profit",
            "return_on_investment",
            "win_rate",
            "profit_factor",
            "sharpe_ratio",
            "max_drawdown_percent",
        ]
        for metric in required:
            assert metric in COMPARISON_METRICS


class TestMetricSets:
    """Tests for HIGHER_IS_BETTER and LOWER_IS_BETTER sets."""

    def test_no_overlap(self):
        # Ensure no metric is in both sets
        overlap = HIGHER_IS_BETTER & LOWER_IS_BETTER
        assert len(overlap) == 0

    def test_contains_key_metrics(self):
        # Higher is better
        assert "total_net_profit" in HIGHER_IS_BETTER
        assert "return_on_investment" in HIGHER_IS_BETTER
        assert "win_rate" in HIGHER_IS_BETTER
        assert "sharpe_ratio" in HIGHER_IS_BETTER

        # Lower is better
        assert "max_drawdown_dollars" in LOWER_IS_BETTER
        assert "max_drawdown_percent" in LOWER_IS_BETTER
        assert "average_loss" in LOWER_IS_BETTER
