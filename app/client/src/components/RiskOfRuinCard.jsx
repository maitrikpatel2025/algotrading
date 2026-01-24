import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { AlertTriangle, Info, TrendingDown } from 'lucide-react';

/**
 * RiskOfRuinCard Component
 *
 * Displays the Risk of Ruin metric calculated from Monte Carlo simulation.
 * Color coded based on severity:
 * - Green: < 5% (Low risk)
 * - Yellow/Amber: 5-20% (Medium risk)
 * - Red: > 20% (High risk)
 */
function RiskOfRuinCard({ riskOfRuin, simulationCount = 10000, className }) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine risk level and styling
  const getRiskLevel = () => {
    if (riskOfRuin === null || riskOfRuin === undefined) {
      return { level: 'unknown', color: 'neutral', label: 'N/A', bgClass: 'bg-neutral-50' };
    }

    if (riskOfRuin < 5) {
      return {
        level: 'low',
        color: 'success',
        label: 'Low Risk',
        bgClass: 'bg-success-light',
      };
    } else if (riskOfRuin < 20) {
      return {
        level: 'medium',
        color: 'warning',
        label: 'Medium Risk',
        bgClass: 'bg-amber-50',
      };
    } else {
      return {
        level: 'high',
        color: 'danger',
        label: 'High Risk',
        bgClass: 'bg-danger-light',
      };
    }
  };

  const riskLevel = getRiskLevel();

  // Format the risk value
  const formatRisk = (value) => {
    if (value === null || value === undefined) return '--';
    return `${value.toFixed(2)}%`;
  };

  // Format simulation count
  const formatSimulations = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toLocaleString();
  };

  return (
    <div
      className={cn(
        'rounded-md border border-neutral-200 p-4 animate-fade-in',
        riskLevel.bgClass,
        className
      )}
    >
      {/* Header with Icon and Tooltip */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingDown
            className={cn(
              'h-4 w-4',
              riskLevel.color === 'success' && 'text-success',
              riskLevel.color === 'warning' && 'text-amber-600',
              riskLevel.color === 'danger' && 'text-danger',
              riskLevel.color === 'neutral' && 'text-neutral-400'
            )}
          />
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Risk of Ruin
          </span>
        </div>

        {/* Info Icon with Tooltip */}
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-white/50 transition-colors"
            aria-label="Risk of Ruin info"
          >
            <Info className="h-3.5 w-3.5" />
          </button>

          {/* Tooltip */}
          {showTooltip && (
            <div
              className="absolute z-50 bottom-full right-0 mb-2 w-64 p-2.5 text-xs text-neutral-700 bg-white border border-neutral-200 rounded-md shadow-lg animate-fade-in"
              role="tooltip"
            >
              <p className="mb-2">
                <strong>Risk of Ruin</strong> estimates the probability of losing 50% of your
                account based on your historical trade performance.
              </p>
              <p className="text-neutral-500">
                Calculated using Monte Carlo simulation with {formatSimulations(simulationCount)}{' '}
                iterations, resampling your trade returns to model possible future equity paths.
              </p>
              {/* Arrow */}
              <div className="absolute top-full right-3 -mt-px">
                <div className="w-2 h-2 bg-white border-r border-b border-neutral-200 transform rotate-45 -translate-y-1" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Value */}
      <div className="mb-2">
        <span
          className={cn(
            'text-2xl font-bold tabular-nums',
            riskLevel.color === 'success' && 'text-success',
            riskLevel.color === 'warning' && 'text-amber-600',
            riskLevel.color === 'danger' && 'text-danger',
            riskLevel.color === 'neutral' && 'text-neutral-400'
          )}
        >
          {formatRisk(riskOfRuin)}
        </span>
      </div>

      {/* Risk Level Badge */}
      <div className="flex items-center justify-between">
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium',
            riskLevel.level === 'low' && 'bg-success/10 text-success',
            riskLevel.level === 'medium' && 'bg-amber-100 text-amber-700',
            riskLevel.level === 'high' && 'bg-danger/10 text-danger',
            riskLevel.level === 'unknown' && 'bg-neutral-100 text-neutral-500'
          )}
        >
          {riskLevel.level === 'high' && <AlertTriangle className="h-3 w-3" />}
          {riskLevel.label}
        </div>

        <span className="text-xs text-neutral-400">
          {formatSimulations(simulationCount)} simulations
        </span>
      </div>
    </div>
  );
}

export default RiskOfRuinCard;
