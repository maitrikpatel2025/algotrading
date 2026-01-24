import React, { useState } from 'react';
import { cn } from '../lib/utils';
import {
  TrendingDown,
  ChevronDown,
  ChevronUp,
  BarChart3,
  ScatterChart,
  Clock,
} from 'lucide-react';
import MetricCard from './MetricCard';
import WinLossHistogram from './WinLossHistogram';
import PLScatterPlot from './PLScatterPlot';
import HoldingPeriodHistogram from './HoldingPeriodHistogram';
import RiskOfRuinCard from './RiskOfRuinCard';
import DrawdownDurationCard from './DrawdownDurationCard';
import VaRCard from './VaRCard';

/**
 * RiskAnalytics Component
 *
 * Comprehensive risk analysis section for backtest results.
 * Includes:
 * - Streak analysis (max/avg consecutive wins/losses)
 * - Value at Risk (VaR) at 95% and 99% confidence
 * - Risk of Ruin (Monte Carlo simulation)
 * - Drawdown duration analysis
 * - Win/Loss P/L distribution histogram
 * - P/L scatter plot over time
 * - Holding period distribution histogram
 */
function RiskAnalytics({
  // Streak metrics
  maxConsecutiveWins = 0,
  maxConsecutiveLosses = 0,
  avgConsecutiveWins = 0,
  avgConsecutiveLosses = 0,
  // Distribution data
  winLossDistribution = [],
  holdingPeriodDistribution = [],
  plScatterData = [],
  // Risk metrics
  riskOfRuin = null,
  riskOfRuinSimulations = 10000,
  avgDrawdownDurationMinutes = null,
  maxDrawdownDurationMinutes = null,
  var95 = null,
  var99 = null,
  // Options
  currency = '$',
  className,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDistributionExpanded, setIsDistributionExpanded] = useState(true);
  const [isScatterExpanded, setIsScatterExpanded] = useState(true);
  const [isHoldingPeriodExpanded, setIsHoldingPeriodExpanded] = useState(true);

  // Check if we have any meaningful data to display
  const hasStreakData = maxConsecutiveWins > 0 || maxConsecutiveLosses > 0;
  const hasRiskMetrics =
    riskOfRuin !== null ||
    var95 !== null ||
    var99 !== null ||
    avgDrawdownDurationMinutes !== null;
  const hasDistributionData = winLossDistribution && winLossDistribution.length > 0;
  const hasScatterData = plScatterData && plScatterData.length > 0;
  const hasHoldingPeriodData = holdingPeriodDistribution && holdingPeriodDistribution.length > 0;

  const hasAnyData =
    hasStreakData ||
    hasRiskMetrics ||
    hasDistributionData ||
    hasScatterData ||
    hasHoldingPeriodData;

  // Don't render if no data
  if (!hasAnyData) {
    return null;
  }

  return (
    <div
      className={cn('bg-white border border-neutral-200 rounded-md', className)}
    >
      {/* Section Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <TrendingDown className="h-4 w-4 text-neutral-500" />
          <h4 className="text-sm font-semibold text-neutral-900">Risk Analytics</h4>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-neutral-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-neutral-500" />
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Streak Analysis Row */}
          {hasStreakData && (
            <div>
              <h5 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
                Streak Analysis
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard
                  label="Max Win Streak"
                  value={maxConsecutiveWins}
                  tooltip="The longest sequence of consecutive winning trades"
                  trend={maxConsecutiveWins >= 3 ? 'positive' : 'neutral'}
                />
                <MetricCard
                  label="Max Loss Streak"
                  value={maxConsecutiveLosses}
                  tooltip="The longest sequence of consecutive losing trades"
                  trend={maxConsecutiveLosses >= 5 ? 'negative' : 'neutral'}
                />
                <MetricCard
                  label="Avg Win Streak"
                  value={avgConsecutiveWins}
                  tooltip="Average length of winning trade streaks"
                  trend="neutral"
                />
                <MetricCard
                  label="Avg Loss Streak"
                  value={avgConsecutiveLosses}
                  tooltip="Average length of losing trade streaks"
                  trend="neutral"
                />
              </div>
            </div>
          )}

          {/* Risk Metrics Row */}
          {hasRiskMetrics && (
            <div>
              <h5 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
                Risk Metrics
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <RiskOfRuinCard
                  riskOfRuin={riskOfRuin}
                  simulationCount={riskOfRuinSimulations}
                />
                <VaRCard var95={var95} var99={var99} currency={currency} />
                <DrawdownDurationCard
                  avgDurationMinutes={avgDrawdownDurationMinutes}
                  maxDurationMinutes={maxDrawdownDurationMinutes}
                />
              </div>
            </div>
          )}

          {/* Win/Loss Distribution Histogram */}
          {hasDistributionData && (
            <div className="border border-neutral-200 rounded-md">
              <div
                className="flex items-center justify-between p-3 border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => setIsDistributionExpanded(!isDistributionExpanded)}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm font-medium text-neutral-900">
                    Win/Loss Distribution
                  </span>
                </div>
                {isDistributionExpanded ? (
                  <ChevronUp className="h-4 w-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                )}
              </div>
              {isDistributionExpanded && (
                <div className="p-4">
                  <WinLossHistogram data={winLossDistribution} currency={currency} />
                </div>
              )}
            </div>
          )}

          {/* P/L Scatter Plot */}
          {hasScatterData && (
            <div className="border border-neutral-200 rounded-md">
              <div
                className="flex items-center justify-between p-3 border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => setIsScatterExpanded(!isScatterExpanded)}
              >
                <div className="flex items-center gap-2">
                  <ScatterChart className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm font-medium text-neutral-900">P/L Over Time</span>
                </div>
                {isScatterExpanded ? (
                  <ChevronUp className="h-4 w-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                )}
              </div>
              {isScatterExpanded && (
                <div className="p-4">
                  <PLScatterPlot data={plScatterData} currency={currency} />
                </div>
              )}
            </div>
          )}

          {/* Holding Period Distribution */}
          {hasHoldingPeriodData && (
            <div className="border border-neutral-200 rounded-md">
              <div
                className="flex items-center justify-between p-3 border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => setIsHoldingPeriodExpanded(!isHoldingPeriodExpanded)}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm font-medium text-neutral-900">
                    Holding Period Distribution
                  </span>
                </div>
                {isHoldingPeriodExpanded ? (
                  <ChevronUp className="h-4 w-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                )}
              </div>
              {isHoldingPeriodExpanded && (
                <div className="p-4">
                  <HoldingPeriodHistogram data={holdingPeriodDistribution} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RiskAnalytics;
