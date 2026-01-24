/**
 * Metric Definitions for Backtest Results
 *
 * Provides tooltip explanations and formatting rules for each performance metric.
 */

export const METRIC_DEFINITIONS = {
  total_net_profit: {
    label: 'Net P/L',
    tooltip: 'The total profit or loss from all trades, in account currency',
    prefix: '$',
    format: 'currency',
  },
  return_on_investment: {
    label: 'ROI',
    tooltip: 'Return on Investment - the percentage gain or loss relative to initial capital',
    suffix: '%',
    format: 'percentage',
  },
  win_rate: {
    label: 'Win Rate',
    tooltip: 'Percentage of trades that were profitable',
    suffix: '%',
    format: 'percentage_one_decimal',
  },
  profit_factor: {
    label: 'Profit Factor',
    tooltip: 'Gross profit divided by gross loss. Values above 1.0 indicate profitability',
    format: 'decimal',
  },
  total_trades: {
    label: 'Total Trades',
    tooltip: 'Total number of completed trades',
    format: 'integer',
  },
  winning_trades: {
    label: 'Winners',
    tooltip: 'Number of trades that closed with a profit',
    format: 'integer',
  },
  losing_trades: {
    label: 'Losers',
    tooltip: 'Number of trades that closed with a loss',
    format: 'integer',
  },
  average_win: {
    label: 'Avg Win',
    tooltip: 'Average profit from winning trades',
    prefix: '$',
    format: 'currency',
  },
  average_loss: {
    label: 'Avg Loss',
    tooltip: 'Average loss from losing trades',
    prefix: '$',
    format: 'currency',
  },
  win_loss_ratio: {
    label: 'Win/Loss Ratio',
    tooltip: 'Average win divided by average loss',
    format: 'decimal',
  },
  largest_win: {
    label: 'Largest Win',
    tooltip: 'The single best trade profit',
    prefix: '$',
    format: 'currency',
  },
  largest_loss: {
    label: 'Largest Loss',
    tooltip: 'The single worst trade loss',
    prefix: '$',
    format: 'currency',
  },
  average_trade_duration_minutes: {
    label: 'Avg Duration',
    tooltip: 'Mean time from entry to exit across all trades',
    format: 'duration',
  },
  max_drawdown_dollars: {
    label: 'Max Drawdown ($)',
    tooltip: 'Largest peak-to-trough decline in equity, in account currency',
    prefix: '$',
    format: 'currency',
  },
  max_drawdown_percent: {
    label: 'Max Drawdown (%)',
    tooltip: 'Largest peak-to-trough decline in equity as a percentage',
    suffix: '%',
    format: 'percentage',
  },
  recovery_factor: {
    label: 'Recovery Factor',
    tooltip: 'Net profit divided by maximum drawdown. Higher values indicate better recovery from losses',
    format: 'decimal',
  },
  sharpe_ratio: {
    label: 'Sharpe Ratio',
    tooltip: 'Risk-adjusted return measure. Above 1.0 is good, above 2.0 is excellent',
    format: 'decimal',
  },
  sortino_ratio: {
    label: 'Sortino Ratio',
    tooltip: 'Like Sharpe Ratio but only penalizes downside volatility, making it more relevant for traders',
    format: 'decimal',
  },
  expectancy: {
    label: 'Expectancy',
    tooltip: 'Average expected profit per trade based on win rate and average wins/losses',
    prefix: '$',
    format: 'currency',
  },
  buy_hold_return: {
    label: 'Buy & Hold Return',
    tooltip: 'What you would have earned simply buying and holding the asset throughout the period',
    suffix: '%',
    format: 'percentage',
  },
  strategy_vs_benchmark: {
    label: 'Strategy vs B&H',
    tooltip: 'How much the strategy outperformed or underperformed buy-and-hold',
    suffix: '%',
    format: 'percentage',
  },
  // Risk Analytics metrics
  max_consecutive_wins: {
    label: 'Max Win Streak',
    tooltip: 'The longest sequence of consecutive winning trades',
    format: 'integer',
  },
  max_consecutive_losses: {
    label: 'Max Loss Streak',
    tooltip: 'The longest sequence of consecutive losing trades',
    format: 'integer',
  },
  avg_consecutive_wins: {
    label: 'Avg Win Streak',
    tooltip: 'Average length of winning trade streaks',
    format: 'decimal',
  },
  avg_consecutive_losses: {
    label: 'Avg Loss Streak',
    tooltip: 'Average length of losing trade streaks',
    format: 'decimal',
  },
  risk_of_ruin: {
    label: 'Risk of Ruin',
    tooltip:
      'Probability of losing 50% of account based on Monte Carlo simulation with 10,000 iterations using historical trade returns',
    suffix: '%',
    format: 'percentage',
  },
  var_95: {
    label: 'VaR (95%)',
    tooltip:
      'Value at Risk at 95% confidence - the maximum expected loss in 95% of trades based on historical distribution',
    prefix: '$',
    format: 'currency',
  },
  var_99: {
    label: 'VaR (99%)',
    tooltip:
      'Value at Risk at 99% confidence - the maximum expected loss in 99% of trades based on historical distribution',
    prefix: '$',
    format: 'currency',
  },
  avg_drawdown_duration_minutes: {
    label: 'Avg DD Duration',
    tooltip: 'Average time spent in drawdown before recovering to a new equity high',
    format: 'duration',
  },
  max_drawdown_duration_minutes: {
    label: 'Max DD Duration',
    tooltip: 'Longest time spent in drawdown before recovering to a new equity high',
    format: 'duration',
  },
};

/**
 * Get trend direction for a metric based on its value
 * @param {string} metricKey - The metric key
 * @param {number} value - The metric value
 * @returns {'positive' | 'negative' | 'neutral'}
 */
export function getMetricTrend(metricKey, value) {
  if (value === null || value === undefined) return 'neutral';

  // Metrics where higher is better (green for positive)
  const higherIsBetter = [
    'total_net_profit',
    'return_on_investment',
    'profit_factor',
    'average_win',
    'win_loss_ratio',
    'largest_win',
    'recovery_factor',
    'sharpe_ratio',
    'sortino_ratio',
    'expectancy',
    'strategy_vs_benchmark',
    'max_consecutive_wins',
    'avg_consecutive_wins',
  ];

  // Metrics where lower is better (red for high values)
  const lowerIsBetter = [
    'max_drawdown_dollars',
    'max_drawdown_percent',
    'average_loss',
    'largest_loss',
    'max_consecutive_losses',
    'avg_consecutive_losses',
    'risk_of_ruin',
    'var_95',
    'var_99',
    'avg_drawdown_duration_minutes',
    'max_drawdown_duration_minutes',
  ];

  // Win rate thresholds
  if (metricKey === 'win_rate') {
    if (value >= 50) return 'positive';
    if (value < 40) return 'negative';
    return 'neutral';
  }

  if (higherIsBetter.includes(metricKey)) {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  }

  if (lowerIsBetter.includes(metricKey)) {
    // For drawdown, higher values are worse
    if (metricKey.includes('drawdown')) {
      if (value > 20) return 'negative';
      if (value > 10) return 'neutral';
      return 'positive';
    }
    return 'negative'; // Losses are always negative trend
  }

  return 'neutral';
}

/**
 * Format a metric value based on its format type
 * @param {string} format - The format type
 * @param {number} value - The value to format
 * @param {string} prefix - Optional prefix
 * @param {string} suffix - Optional suffix
 * @returns {string}
 */
export function formatMetricValue(format, value, prefix = '', suffix = '') {
  if (value === null || value === undefined) return '--';

  let formatted;

  switch (format) {
    case 'currency':
      formatted = Math.abs(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      break;

    case 'percentage':
      formatted = value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      break;

    case 'percentage_one_decimal':
      formatted = value.toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
      break;

    case 'decimal':
      formatted = value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      break;

    case 'integer':
      formatted = Math.round(value).toLocaleString('en-US');
      break;

    case 'duration':
      // Convert minutes to hours and minutes format
      if (value < 60) {
        formatted = `${Math.round(value)}m`;
      } else {
        const hours = Math.floor(value / 60);
        const minutes = Math.round(value % 60);
        formatted = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      }
      break;

    default:
      formatted = String(value);
  }

  return `${prefix}${formatted}${suffix}`;
}
