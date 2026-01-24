"""
Backtest Comparison Service
===========================
Service layer for comparing multiple backtest results with statistical analysis.
"""

import logging
import random
from typing import Dict, List, Optional, Tuple

from core.backtest_service import get_backtest
from core.data_models import (
    BacktestComparisonResult,
    BacktestConfig,
    MetricValue,
    StatisticalTest,
)

logger = logging.getLogger(__name__)

# Metrics where higher values are better
HIGHER_IS_BETTER = {
    "total_net_profit",
    "return_on_investment",
    "final_balance",
    "win_rate",
    "profit_factor",
    "average_win",
    "win_loss_ratio",
    "largest_win",
    "sharpe_ratio",
    "sortino_ratio",
    "expectancy",
    "recovery_factor",
    "max_consecutive_wins",
    "avg_consecutive_wins",
    "strategy_vs_benchmark",
}

# Metrics where lower values are better
LOWER_IS_BETTER = {
    "max_drawdown_dollars",
    "max_drawdown_percent",
    "average_loss",
    "largest_loss",
    "max_consecutive_losses",
    "avg_consecutive_losses",
    "risk_of_ruin",
    "var_95",
    "var_99",
    "avg_drawdown_duration_minutes",
    "max_drawdown_duration_minutes",
}

# Key metrics for statistical significance testing
KEY_METRICS_FOR_STATS = [
    "return_on_investment",
    "win_rate",
    "profit_factor",
    "sharpe_ratio",
    "max_drawdown_percent",
]

# Metrics to include in comparison table
COMPARISON_METRICS = [
    "total_net_profit",
    "return_on_investment",
    "final_balance",
    "total_trades",
    "winning_trades",
    "losing_trades",
    "win_rate",
    "profit_factor",
    "average_win",
    "average_loss",
    "win_loss_ratio",
    "largest_win",
    "largest_loss",
    "expectancy",
    "max_drawdown_dollars",
    "max_drawdown_percent",
    "recovery_factor",
    "sharpe_ratio",
    "sortino_ratio",
    "average_trade_duration_minutes",
]


def _format_metric_value(metric_name: str, value: Optional[float], currency: str = "USD") -> str:
    """Format a metric value for display."""
    if value is None:
        return "--"

    # Currency formatting
    currency_symbols = {"USD": "$", "EUR": "€", "GBP": "£"}
    symbol = currency_symbols.get(currency, "$")

    # Currency metrics
    currency_metrics = {
        "total_net_profit",
        "final_balance",
        "average_win",
        "average_loss",
        "largest_win",
        "largest_loss",
        "expectancy",
        "max_drawdown_dollars",
        "var_95",
        "var_99",
    }

    # Percentage metrics
    percentage_metrics = {
        "return_on_investment",
        "win_rate",
        "max_drawdown_percent",
        "strategy_vs_benchmark",
        "risk_of_ruin",
    }

    # Integer metrics
    integer_metrics = {
        "total_trades",
        "winning_trades",
        "losing_trades",
        "max_consecutive_wins",
        "max_consecutive_losses",
    }

    # Duration metrics (in minutes)
    duration_metrics = {
        "average_trade_duration_minutes",
        "avg_drawdown_duration_minutes",
        "max_drawdown_duration_minutes",
    }

    if metric_name in currency_metrics:
        formatted = f"{symbol}{abs(value):,.2f}"
        if value < 0:
            formatted = f"-{formatted}"
        return formatted
    elif metric_name in percentage_metrics:
        return f"{value:.2f}%"
    elif metric_name in integer_metrics:
        return str(int(round(value)))
    elif metric_name in duration_metrics:
        if value < 60:
            return f"{int(round(value))}m"
        else:
            hours = int(value // 60)
            minutes = int(value % 60)
            return f"{hours}h {minutes}m" if minutes > 0 else f"{hours}h"
    else:
        # Default decimal formatting (ratios, etc.)
        return f"{value:.2f}"


def _determine_metric_direction(metric_name: str) -> str:
    """Determine if higher or lower is better for a metric."""
    if metric_name in HIGHER_IS_BETTER:
        return "higher"
    elif metric_name in LOWER_IS_BETTER:
        return "lower"
    else:
        return "neutral"


def _get_metric_value(results: Optional[Dict], metric_name: str) -> Optional[float]:
    """Extract a metric value from backtest results."""
    if results is None:
        return None
    return results.get(metric_name)


def _calculate_best_index(values: List[Optional[float]], direction: str) -> Optional[int]:
    """
    Calculate the index of the best value in a list.

    Args:
        values: List of metric values
        direction: "higher" or "lower"

    Returns:
        Index of best value, or None if all values are None
    """
    valid_values = [(i, v) for i, v in enumerate(values) if v is not None]
    if not valid_values:
        return None

    if direction == "higher":
        best = max(valid_values, key=lambda x: x[1])
    elif direction == "lower":
        best = min(valid_values, key=lambda x: x[1])
    else:
        return None

    return best[0]


def _bootstrap_test(
    values1: List[float], values2: List[float], n_iterations: int = 10000
) -> Tuple[float, bool]:
    """
    Perform bootstrap test to determine statistical significance.

    Uses resampling to estimate the distribution of the difference in means.

    Args:
        values1: First set of values (e.g., trade returns from backtest 1)
        values2: Second set of values (e.g., trade returns from backtest 2)
        n_iterations: Number of bootstrap iterations

    Returns:
        Tuple of (p_value, is_significant)
    """
    if len(values1) < 2 or len(values2) < 2:
        return 1.0, False

    # Observed difference in means
    observed_diff = sum(values1) / len(values1) - sum(values2) / len(values2)

    # Combined pool for permutation test
    combined = values1 + values2
    n1 = len(values1)

    # Count how many times random splits produce differences as extreme
    count_extreme = 0
    for _ in range(n_iterations):
        # Shuffle and split
        random.shuffle(combined)
        sample1 = combined[:n1]
        sample2 = combined[n1:]

        sample_diff = sum(sample1) / len(sample1) - sum(sample2) / len(sample2)

        if abs(sample_diff) >= abs(observed_diff):
            count_extreme += 1

    p_value = count_extreme / n_iterations
    is_significant = p_value < 0.05

    return p_value, is_significant


def calculate_statistical_significance(
    backtests: List[BacktestConfig],
) -> List[StatisticalTest]:
    """
    Calculate statistical significance of metric differences between backtests.

    Uses bootstrap resampling on trade returns to test for significant differences.

    Args:
        backtests: List of backtest configs with results

    Returns:
        List of StatisticalTest results for key metrics
    """
    results = []

    # Need at least 2 backtests to compare
    if len(backtests) < 2:
        return results

    # Extract trade returns for each backtest
    backtest_returns = []
    for bt in backtests:
        if bt.results and "trades" in bt.results:
            trades = bt.results.get("trades", [])
            returns = [t.get("profit_loss", 0) for t in trades if t.get("profit_loss") is not None]
            backtest_returns.append(returns)
        else:
            backtest_returns.append([])

    # Compare each key metric
    for metric_name in KEY_METRICS_FOR_STATS:
        values = []
        for bt in backtests:
            if bt.results:
                values.append(_get_metric_value(bt.results, metric_name))
            else:
                values.append(None)

        # Skip if not enough valid values
        valid_values = [(i, v, bt) for i, (v, bt) in enumerate(zip(values, backtests)) if v is not None]
        if len(valid_values) < 2:
            continue

        direction = _determine_metric_direction(metric_name)
        best_idx = _calculate_best_index(values, direction)

        if best_idx is None:
            continue

        best_bt = backtests[best_idx]

        # Perform statistical test if we have trade data
        p_value = None
        is_significant = False

        # Compare the two best backtests if we have trade returns
        if len(backtest_returns) >= 2:
            # Find the second best
            other_values = [(i, v) for i, v in enumerate(values) if v is not None and i != best_idx]
            if other_values:
                if direction == "higher":
                    second_idx = max(other_values, key=lambda x: x[1])[0]
                else:
                    second_idx = min(other_values, key=lambda x: x[1])[0]

                returns1 = backtest_returns[best_idx]
                returns2 = backtest_returns[second_idx]

                if len(returns1) >= 5 and len(returns2) >= 5:
                    p_value, is_significant = _bootstrap_test(returns1, returns2, n_iterations=1000)

        # Generate interpretation
        if is_significant:
            interpretation = (
                f"{best_bt.name}'s {_metric_display_name(metric_name)} is significantly "
                f"{'higher' if direction == 'higher' else 'lower'} than other backtests "
                f"(p={p_value:.3f})"
            )
        elif p_value is not None:
            interpretation = (
                f"No statistically significant difference in {_metric_display_name(metric_name)} "
                f"between backtests (p={p_value:.3f})"
            )
        else:
            interpretation = f"Insufficient data to determine statistical significance for {_metric_display_name(metric_name)}"

        results.append(
            StatisticalTest(
                metric=metric_name,
                p_value=p_value,
                is_significant=is_significant,
                interpretation=interpretation,
                best_backtest_id=best_bt.id,
                best_backtest_name=best_bt.name,
            )
        )

    return results


def _metric_display_name(metric_name: str) -> str:
    """Convert metric key to display name."""
    display_names = {
        "total_net_profit": "Net P/L",
        "return_on_investment": "ROI",
        "final_balance": "Final Balance",
        "total_trades": "Total Trades",
        "winning_trades": "Winning Trades",
        "losing_trades": "Losing Trades",
        "win_rate": "Win Rate",
        "profit_factor": "Profit Factor",
        "average_win": "Avg Win",
        "average_loss": "Avg Loss",
        "win_loss_ratio": "Win/Loss Ratio",
        "largest_win": "Largest Win",
        "largest_loss": "Largest Loss",
        "expectancy": "Expectancy",
        "max_drawdown_dollars": "Max Drawdown ($)",
        "max_drawdown_percent": "Max Drawdown (%)",
        "recovery_factor": "Recovery Factor",
        "sharpe_ratio": "Sharpe Ratio",
        "sortino_ratio": "Sortino Ratio",
        "average_trade_duration_minutes": "Avg Duration",
    }
    return display_names.get(metric_name, metric_name.replace("_", " ").title())


def get_comparison_data(
    backtest_ids: List[str], notes: Optional[str] = None
) -> Tuple[bool, Optional[BacktestComparisonResult], Optional[str]]:
    """
    Get comparison data for multiple backtests.

    Args:
        backtest_ids: List of 2-4 backtest IDs to compare
        notes: Optional comparison notes

    Returns:
        Tuple of (success, comparison_result, error_message)
    """
    # Validate number of backtests
    if len(backtest_ids) < 2:
        return False, None, "At least 2 backtests are required for comparison"
    if len(backtest_ids) > 4:
        return False, None, "Maximum of 4 backtests can be compared"

    # Fetch all backtests
    backtests: List[BacktestConfig] = []
    for bt_id in backtest_ids:
        success, backtest, error = get_backtest(bt_id)
        if not success or backtest is None:
            return False, None, f"Failed to fetch backtest {bt_id}: {error}"
        if backtest.status != "completed":
            return False, None, f"Backtest '{backtest.name}' is not completed (status: {backtest.status})"
        backtests.append(backtest)

    # Build metrics comparison
    metrics_comparison: Dict[str, List[MetricValue]] = {}
    best_values: Dict[str, int] = {}

    for metric_name in COMPARISON_METRICS:
        metric_values: List[MetricValue] = []
        raw_values: List[Optional[float]] = []

        for bt in backtests:
            value = _get_metric_value(bt.results, metric_name)
            raw_values.append(value)
            formatted = _format_metric_value(metric_name, value, bt.currency)
            metric_values.append(
                MetricValue(
                    backtest_id=bt.id,
                    backtest_name=bt.name,
                    value=value,
                    formatted_value=formatted,
                )
            )

        metrics_comparison[metric_name] = metric_values

        # Calculate best value index
        direction = _determine_metric_direction(metric_name)
        best_idx = _calculate_best_index(raw_values, direction)
        if best_idx is not None:
            best_values[metric_name] = best_idx

    # Calculate statistical significance
    statistical_significance = calculate_statistical_significance(backtests)

    comparison_result = BacktestComparisonResult(
        backtests=backtests,
        metrics_comparison=metrics_comparison,
        best_values=best_values,
        statistical_significance=statistical_significance,
        notes=notes,
    )

    logger.info(f"Comparison data generated for {len(backtests)} backtests")
    return True, comparison_result, None
