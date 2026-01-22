import React, { useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { X, Square, Clock, Calendar, TrendingUp, BarChart3, Loader2 } from 'lucide-react';

/**
 * BacktestProgressModal Component - Precision Swiss Design System
 *
 * Modal displaying real-time backtest execution progress.
 * Shows progress bar, estimated time remaining, current date, and trade count.
 * Includes cancel functionality with partial results option.
 */
function BacktestProgressModal({
  isOpen,
  onClose,
  onCancel,
  progress = {},
  isCancelling = false,
}) {
  const dialogRef = useRef(null);

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

  if (!isOpen) return null;

  const {
    status = 'pending',
    progress_percentage = 0,
    current_date,
    candles_processed = 0,
    total_candles = 0,
    trade_count = 0,
    estimated_seconds_remaining,
  } = progress;

  const isRunning = status === 'running' || status === 'pending';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';
  const isCancellingStatus = status === 'cancelling' || isCancelling;

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

  // Get status text and color
  const getStatusDisplay = () => {
    if (isCancellingStatus) return { text: 'Cancelling...', color: 'text-warning' };
    if (isCompleted) return { text: 'Completed', color: 'text-success' };
    if (isFailed) return { text: 'Failed', color: 'text-danger' };
    if (progress_percentage >= 99) return { text: 'Completing...', color: 'text-primary' };
    return { text: 'Running', color: 'text-primary' };
  };

  const statusDisplay = getStatusDisplay();

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
        className="relative bg-white rounded-md shadow-elevated max-w-lg w-full border border-neutral-200 animate-fade-in"
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
          <div className="flex items-center gap-3 mb-6">
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

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
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

            {/* Current Date */}
            <div className="bg-neutral-50 rounded-md p-3">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium">Processing Date</span>
              </div>
              <span className="text-lg font-semibold text-neutral-900">
                {formatDate(current_date)}
              </span>
            </div>

            {/* Candles Processed */}
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
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
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
  );
}

export default BacktestProgressModal;
