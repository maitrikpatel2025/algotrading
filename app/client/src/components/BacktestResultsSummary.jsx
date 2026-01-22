import React, { useState } from 'react';
import { cn } from '../lib/utils';
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Target,
  Scale,
  BarChart3,
} from 'lucide-react';
import MetricCard from './MetricCard';
import EquityCurveChart from './EquityCurveChart';
import {
  METRIC_DEFINITIONS,
  getMetricTrend,
  formatMetricValue,
} from '../app/metricDefinitions';

/**
 * BacktestResultsSummary Component - Precision Swiss Design System
 *
 * Comprehensive display of backtest results including:
 * - KPI cards for primary metrics (Net P/L, ROI, Win Rate, Profit Factor)
 * - Equity curve chart with buy-and-hold comparison
 * - Trade statistics section
 * - Risk metrics section
 * - Benchmark comparison section
 * - Color coding and tooltips for all metrics
 */
function BacktestResultsSummary({
  results,
  initialBalance = 10000,
  onClose,
  className,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Handle missing or incomplete results
  if (!results) {
    return null;
  }

  // Helper to get metric value with default
  const getMetric = (key, defaultValue = 0) => {
    return results[key] ?? defaultValue;
  };

  // Helper to render a metric row
  const renderMetricRow = (metricKey, label = null) => {
    const definition = METRIC_DEFINITIONS[metricKey] || {};
    const value = getMetric(metricKey);
    const trend = getMetricTrend(metricKey, value);
    const displayLabel = label || definition.label || metricKey;
    const formatted = formatMetricValue(
      definition.format,
      value,
      definition.prefix || '',
      definition.suffix || ''
    );

    return (
      <div className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
        <span className="text-sm text-neutral-600">{displayLabel}</span>
        <span
          className={cn(
            'text-sm font-semibold tabular-nums',
            trend === 'positive' && 'text-success',
            trend === 'negative' && 'text-danger',
            trend === 'neutral' && 'text-neutral-900'
          )}
        >
          {formatted}
        </span>
      </div>
    );
  };

  // Primary KPI values
  const netPnl = getMetric('total_net_profit');
  const roi = getMetric('return_on_investment');
  const winRate = getMetric('win_rate');
  const profitFactor = getMetric('profit_factor');

  return (
    <div
      className={cn(
        'bg-white border border-neutral-200 rounded-lg shadow-sm animate-fade-in',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-success-light">
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              Backtest Results
            </h3>
            <p className="text-sm text-neutral-500">
              {getMetric('total_trades')} trades completed
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          aria-label={isExpanded ? 'Collapse results' : 'Expand results'}
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Primary KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="Net P/L"
              value={netPnl}
              prefix="$"
              tooltip={METRIC_DEFINITIONS.total_net_profit?.tooltip}
              trend={getMetricTrend('total_net_profit', netPnl)}
              size="large"
            />
            <MetricCard
              label="ROI"
              value={roi}
              suffix="%"
              tooltip={METRIC_DEFINITIONS.return_on_investment?.tooltip}
              trend={getMetricTrend('return_on_investment', roi)}
              size="large"
            />
            <MetricCard
              label="Win Rate"
              value={winRate}
              suffix="%"
              tooltip={METRIC_DEFINITIONS.win_rate?.tooltip}
              trend={getMetricTrend('win_rate', winRate)}
              size="large"
            />
            <MetricCard
              label="Profit Factor"
              value={profitFactor}
              tooltip={METRIC_DEFINITIONS.profit_factor?.tooltip}
              trend={getMetricTrend('profit_factor', profitFactor)}
              size="large"
            />
          </div>

          {/* Equity Curve Chart */}
          <div className="bg-white border border-neutral-200 rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-neutral-500" />
              <h4 className="text-sm font-semibold text-neutral-900">
                Equity Curve
              </h4>
            </div>
            <EquityCurveChart
              equityCurve={results.equity_curve || []}
              buyHoldCurve={results.buy_hold_curve || []}
              equityCurveDates={results.equity_curve_dates || []}
              tradeCountsPerCandle={results.trade_counts_per_candle || []}
              drawdownPeriods={results.drawdown_periods || []}
              initialBalance={initialBalance}
              height={300}
            />
          </div>

          {/* Two Column Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Trade Statistics */}
            <div className="bg-neutral-50 rounded-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-neutral-500" />
                <h4 className="text-sm font-semibold text-neutral-900">
                  Trade Statistics
                </h4>
              </div>
              <div>
                {renderMetricRow('total_trades', 'Total Trades')}
                <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                  <span className="text-sm text-neutral-600">Winners / Losers</span>
                  <span className="text-sm font-semibold tabular-nums text-neutral-900">
                    {getMetric('winning_trades')} / {getMetric('losing_trades')}
                  </span>
                </div>
                {renderMetricRow('average_win', 'Avg Win')}
                {renderMetricRow('average_loss', 'Avg Loss')}
                {renderMetricRow('win_loss_ratio', 'Win/Loss Ratio')}
                {renderMetricRow('largest_win', 'Largest Win')}
                {renderMetricRow('largest_loss', 'Largest Loss')}
                {renderMetricRow('average_trade_duration_minutes', 'Avg Duration')}
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="bg-neutral-50 rounded-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="h-4 w-4 text-neutral-500" />
                <h4 className="text-sm font-semibold text-neutral-900">
                  Risk Metrics
                </h4>
              </div>
              <div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                  <span className="text-sm text-neutral-600">Max Drawdown</span>
                  <span
                    className={cn(
                      'text-sm font-semibold tabular-nums',
                      getMetric('max_drawdown_percent') > 20
                        ? 'text-danger'
                        : getMetric('max_drawdown_percent') > 10
                        ? 'text-warning'
                        : 'text-neutral-900'
                    )}
                  >
                    ${getMetric('max_drawdown_dollars').toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    ({getMetric('max_drawdown_percent').toFixed(2)}%)
                  </span>
                </div>
                {renderMetricRow('recovery_factor', 'Recovery Factor')}
                {renderMetricRow('sharpe_ratio', 'Sharpe Ratio')}
                {renderMetricRow('sortino_ratio', 'Sortino Ratio')}
                {renderMetricRow('expectancy', 'Expectancy')}

                {/* Benchmark Comparison Section */}
                <div className="mt-4 pt-3 border-t border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                      Benchmark Comparison
                    </span>
                  </div>
                  {renderMetricRow('buy_hold_return', 'Buy & Hold Return')}
                  {renderMetricRow('strategy_vs_benchmark', 'Strategy vs B&H')}
                </div>
              </div>
            </div>
          </div>

          {/* Final Balance */}
          <div className="flex items-center justify-between p-4 bg-neutral-100 rounded-md">
            <span className="text-sm font-medium text-neutral-700">
              Final Balance
            </span>
            <span
              className={cn(
                'text-lg font-bold tabular-nums',
                getMetric('final_balance') >= initialBalance
                  ? 'text-success'
                  : 'text-danger'
              )}
            >
              $
              {getMetric('final_balance').toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default BacktestResultsSummary;
