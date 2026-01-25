import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { X, AlertTriangle, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import api from '../app/api';

/**
 * PositionCloseDialog Component
 *
 * Confirmation dialog for closing an open trading position.
 * Displays position details and handles the close operation with loading state.
 */
function PositionCloseDialog({
  isOpen,
  onClose,
  position,
  onSuccess,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dialogRef = useRef(null);
  const confirmButtonRef = useRef(null);

  // Focus management and escape key handler
  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus();

      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !isLoading) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, isLoading]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Reset error state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleClose = async () => {
    if (!position || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.closeTrade(position.id);

      if (response.success) {
        onSuccess?.(response);
        onClose();
      } else {
        setError(response.error || response.message || 'Failed to close position');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred while closing the position');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !position) return null;

  // Determine if position is profitable
  const isProfit = position.unrealized_pl >= 0;
  const isLong = position.initial_amount > 0;

  // Format currency pair for display (EURUSD -> EUR/USD)
  const formatPair = (instrument) => {
    if (!instrument) return '';
    if (instrument.length === 6) {
      return `${instrument.slice(0, 3)}/${instrument.slice(3)}`;
    }
    return instrument.replace('_', '/');
  };

  // Format duration for display
  const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return '-';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    }
    return '< 1m';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="close-position-dialog-title"
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-neutral-900/50",
          isLoading && "cursor-not-allowed"
        )}
        onClick={!isLoading ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative bg-white rounded-md shadow-elevated max-w-md w-full border border-neutral-200 animate-fade-in"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className={cn(
            "absolute top-3 right-3 p-1.5 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-warning-light">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <h2
                id="close-position-dialog-title"
                className="text-lg font-semibold text-neutral-900"
              >
                Close Position
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Are you sure you want to close this position?
              </p>
            </div>
          </div>

          {/* Position Details */}
          <div className="mt-6 bg-neutral-50 rounded-md p-4 space-y-3">
            {/* Pair and Direction */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-900">
                {formatPair(position.instrument)}
              </span>
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                isLong ? "bg-success-light text-success" : "bg-danger-light text-danger"
              )}>
                {isLong ? (
                  <>
                    <TrendingUp className="h-3 w-3" />
                    Long
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3" />
                    Short
                  </>
                )}
              </span>
            </div>

            {/* Position Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-neutral-500">Size</span>
                <p className="font-medium text-neutral-900">
                  {Math.abs(position.initial_amount).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">Entry Price</span>
                <p className="font-medium text-neutral-900">
                  {position.price?.toFixed(5) || '-'}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">Current Price</span>
                <p className="font-medium text-neutral-900">
                  {position.current_price?.toFixed(5) || '-'}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">Duration</span>
                <p className="font-medium text-neutral-900">
                  {formatDuration(position.duration_seconds)}
                </p>
              </div>
            </div>

            {/* P/L Display */}
            <div className="pt-3 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Current P/L</span>
                <div className="text-right">
                  <span className={cn(
                    "text-lg font-semibold",
                    isProfit ? "text-success" : "text-danger"
                  )}>
                    {isProfit ? '+' : ''}{position.unrealized_pl?.toFixed(2) || '0.00'}
                    <span className="text-xs ml-1">USD</span>
                  </span>
                  {position.pips_pl !== null && position.pips_pl !== undefined && (
                    <p className={cn(
                      "text-xs",
                      isProfit ? "text-success" : "text-danger"
                    )}>
                      {isProfit ? '+' : ''}{position.pips_pl?.toFixed(1)} pips
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-danger-light rounded-md">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={cn(
                "btn btn-secondary",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              Cancel
            </button>
            <button
              ref={confirmButtonRef}
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className={cn(
                "btn btn-danger",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Closing...
                </>
              ) : (
                'Close Position'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PositionCloseDialog;
