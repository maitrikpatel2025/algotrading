import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';
import { X, Square, Clock, Calendar, TrendingUp, BarChart3, Loader2, DollarSign, Percent, TrendingDown, Maximize2, Minimize2, Zap } from 'lucide-react';

/**
 * MiniEquityCurve Component
 * Simple SVG line chart for displaying equity curve during backtest progress
 */
function MiniEquityCurve({ data = [], initialBalance = 0 }) {
  if (!data || data.length < 2) {
    return (
      <div className="h-[120px] bg-neutral-50 rounded-md flex items-center justify-center">
        <span className="text-sm text-neutral-400">Equity curve will appear as backtest progresses...</span>
      </div>
    );
  }

  const height = 120;
  const width = 400;
  const padding = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate min/max for scaling
  const minValue = Math.min(...data, initialBalance);
  const maxValue = Math.max(...data, initialBalance);
  const valueRange = maxValue - minValue || 1;

  // Scale functions
  const scaleX = (index) => padding.left + (index / (data.length - 1)) * chartWidth;
  const scaleY = (value) => padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

  // Generate path for equity curve
  const pathPoints = data.map((value, index) => {
    const x = scaleX(index);
    const y = scaleY(value);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Generate area fill path
  const areaPath = `${pathPoints} L ${scaleX(data.length - 1)} ${scaleY(minValue)} L ${scaleX(0)} ${scaleY(minValue)} Z`;

  // Break-even line Y position
  const breakEvenY = scaleY(initialBalance);

  // Determine if current equity is above or below initial
  const currentEquity = data[data.length - 1];
  const isProfit = currentEquity >= initialBalance;

  return (
    <div className="bg-neutral-50 rounded-md p-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[120px]"
        preserveAspectRatio="none"
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="equityGradientProfit" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="equityGradientLoss" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={areaPath}
          fill={isProfit ? "url(#equityGradientProfit)" : "url(#equityGradientLoss)"}
        />

        {/* Break-even reference line */}
        <line
          x1={padding.left}
          y1={breakEvenY}
          x2={width - padding.right}
          y2={breakEvenY}
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="4 2"
        />

        {/* Equity curve line */}
        <path
          d={pathPoints}
          fill="none"
          stroke={isProfit ? "#22c55e" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current point indicator */}
        <circle
          cx={scaleX(data.length - 1)}
          cy={scaleY(currentEquity)}
          r="4"
          fill={isProfit ? "#22c55e" : "#ef4444"}
        />
      </svg>
    </div>
  );
}

/**
 * BacktestProgressModal Component - Precision Swiss Design System
 *
 * Modal displaying real-time backtest execution progress.
 * Shows progress bar, estimated time remaining, current date, trade count,
 * and live performance metrics (P/L, win rate, drawdown, equity curve).
 * Includes view mode toggle (compact/detailed) and performance mode option.
 */
function BacktestProgressModal({
  isOpen,
  onClose,
  onCancel,
  progress = {},
  isCancelling = false,
  onPerformanceModeChange,
}) {
  const dialogRef = useRef(null);

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState(() => {
    const stored = localStorage.getItem('backtest-progress-view-mode');
    return stored === 'compact' ? 'compact' : 'detailed';
  });

  // Performance mode state
  const [performanceMode, setPerformanceMode] = useState(false);

  // Focus management and escape key handler
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();

      const handleKeyDown = (e) => {
        // Don't close on escape during execution - must use cancel button
        if (e.key === 'Escape' && progress?.status === 'completed') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, progress?.status]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Persist view mode to localStorage
  useEffect(() => {
    localStorage.setItem('backtest-progress-view-mode', viewMode);
  }, [viewMode]);

  // Notify parent of performance mode changes
  useEffect(() => {
    if (onPerformanceModeChange) {
      onPerformanceModeChange(performanceMode);
    }
  }, [performanceMode, onPerformanceModeChange]);

  if (!isOpen) return null;

  const {
    status = 'pending',
    progress_percentage = 0,
    current_date,
    candles_processed = 0,
    total_candles = 0,
    trade_count = 0,
    estimated_seconds_remaining,
    // Live performance metrics
    current_pnl,
    running_win_rate,
    current_drawdown,
    equity_curve,
    peak_equity,
  } = progress;

  const isRunning = status === 'running' || status === 'pending';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';
  const isCancellingStatus = status === 'cancelling' || isCancelling;
  const isDetailed = viewMode === 'detailed';

  // Get initial balance from equity curve if available
  const initialBalance = equity_curve && equity_curve.length > 0 ? equity_curve[0] : (peak_equity || 10000);

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    if (!seconds || seconds <= 0) return '--';
    if (seconds < 60) return `~${Math.ceil(seconds)}s`;
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.ceil(seconds % 60);
      return `~${mins}m ${secs}s`;
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.ceil((seconds % 3600) / 60);
    return `~${hours}h ${mins}m`;
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '--';
    }
  };

  // Format P/L with sign and currency
  const formatPnL = (pnl) => {
    if (pnl === null || pnl === undefined) return '--';
    const formatted = Math.abs(pnl).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return pnl >= 0 ? `+$${formatted}` : `-$${formatted}`;
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '--';
    return `${value.toFixed(1)}%`;
  };

  // Get status text and color
  const getStatusDisplay = () => {
    if (isCancellingStatus) return { text: 'Cancelling...', color: 'text-warning' };
    if (isCompleted) return { text: 'Completed', color: 'text-success' };
    if (isFailed) return { text: 'Failed', color: 'text-danger' };
    if (progress_percentage >= 99) return { text: 'Completing...', color: 'text-primary' };
    return { text: 'Running', color: 'text-primary' };
  };

  const statusDisplay = getStatusDisplay();

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'detailed' ? 'compact' : 'detailed');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="progress-dialog-title"
    >
      {/* Backdrop - no close on click during execution */}
      <div
        className="absolute inset-0 bg-neutral-900/50"
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          "relative bg-white rounded-md shadow-elevated w-full border border-neutral-200 animate-fade-in",
          isDetailed ? "max-w-lg" : "max-w-md"
        )}
      >
        {/* Close Button - only show when completed or failed */}
        {(isCompleted || isFailed) && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full",
                isRunning || isCancellingStatus ? "bg-primary-light" : isCompleted ? "bg-success-light" : "bg-danger-light"
              )}>
                {isRunning || isCancellingStatus ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <BarChart3 className={cn("h-5 w-5", isCompleted ? "text-success" : "text-danger")} />
                )}
              </div>
              <div>
                <h2
                  id="progress-dialog-title"
                  className="text-lg font-semibold text-neutral-900"
                >
                  {isCancellingStatus ? 'Cancelling Backtest' : isCompleted ? 'Backtest Complete' : isFailed ? 'Backtest Failed' : 'Running Backtest'}
                </h2>
                <p className={cn("text-sm font-medium", statusDisplay.color)}>
                  {statusDisplay.text}
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <button
              type="button"
              onClick={toggleViewMode}
              className="p-2 rounded text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              title={isDetailed ? 'Switch to compact view' : 'Switch to detailed view'}
              aria-label={isDetailed ? 'Switch to compact view' : 'Switch to detailed view'}
            >
              {isDetailed ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Mini Equity Curve - Detailed mode only */}
          {isDetailed && (
            <div className="mb-4">
              <MiniEquityCurve
                data={equity_curve}
                initialBalance={initialBalance}
              />
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Progress</span>
              <span className="text-sm font-bold text-primary tabular-nums">
                {progress_percentage}%
              </span>
            </div>
            <div
              className="h-3 bg-neutral-100 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={progress_percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300 ease-out",
                  isCompleted ? "bg-success" : isFailed ? "bg-danger" : "bg-primary"
                )}
                style={{ width: `${progress_percentage}%` }}
              />
            </div>
          </div>

          {/* Performance Metrics - Detailed mode only */}
          {isDetailed && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* Running P/L */}
              <div className="bg-neutral-50 rounded-md p-3">
                <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">P/L</span>
                </div>
                <span className={cn(
                  "text-base font-semibold tabular-nums",
                  current_pnl === null || current_pnl === undefined ? "text-neutral-500" :
                  current_pnl >= 0 ? "text-success" : "text-danger"
                )}>
                  {formatPnL(current_pnl)}
                </span>
              </div>

              {/* Win Rate */}
              <div className="bg-neutral-50 rounded-md p-3">
                <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                  <Percent className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Win Rate</span>
                </div>
                <span className="text-base font-semibold text-neutral-900 tabular-nums">
                  {formatPercentage(running_win_rate)}
                </span>
              </div>

              {/* Current Drawdown */}
              <div className="bg-neutral-50 rounded-md p-3">
                <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Drawdown</span>
                </div>
                <span className={cn(
                  "text-base font-semibold tabular-nums",
                  current_drawdown === null || current_drawdown === undefined ? "text-neutral-500" :
                  current_drawdown > 0 ? "text-danger" : "text-neutral-900"
                )}>
                  {formatPercentage(current_drawdown)}
                </span>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className={cn(
            "grid gap-4 mb-6",
            isDetailed ? "grid-cols-2" : "grid-cols-2"
          )}>
            {/* Time Remaining */}
            <div className="bg-neutral-50 rounded-md p-3">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Time Remaining</span>
              </div>
              <span className="text-lg font-semibold text-neutral-900 tabular-nums">
                {isCompleted ? 'Done' : formatTimeRemaining(estimated_seconds_remaining)}
              </span>
            </div>

            {/* Trade Count */}
            <div className="bg-neutral-50 rounded-md p-3">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Trades</span>
              </div>
              <span className="text-lg font-semibold text-neutral-900 tabular-nums">
                {trade_count.toLocaleString()}
              </span>
            </div>

            {/* Current Date - Detailed mode only */}
            {isDetailed && (
              <div className="bg-neutral-50 rounded-md p-3">
                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium">Processing Date</span>
                </div>
                <span className="text-lg font-semibold text-neutral-900">
                  {formatDate(current_date)}
                </span>
              </div>
            )}

            {/* Candles Processed - Detailed mode only */}
            {isDetailed && (
              <div className="bg-neutral-50 rounded-md p-3">
                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs font-medium">Candles</span>
                </div>
                <span className="text-lg font-semibold text-neutral-900 tabular-nums">
                  {candles_processed.toLocaleString()}
                  {total_candles > 0 && (
                    <span className="text-sm text-neutral-500 font-normal">
                      {' / '}{total_candles.toLocaleString()}
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Footer with Actions and Performance Mode */}
          <div className="flex items-center justify-between">
            {/* Performance Mode Toggle */}
            {isRunning && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={performanceMode}
                  onChange={(e) => setPerformanceMode(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                />
                <span className="flex items-center gap-1.5 text-sm text-neutral-600">
                  <Zap className="h-3.5 w-3.5" />
                  Performance Mode
                </span>
              </label>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 ml-auto">
              {(isCompleted || isFailed) ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-primary"
                >
                  Close
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isCancellingStatus}
                  className="btn btn-danger flex items-center gap-2"
                >
                  {isCancellingStatus ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4" />
                      Cancel
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BacktestProgressModal;
