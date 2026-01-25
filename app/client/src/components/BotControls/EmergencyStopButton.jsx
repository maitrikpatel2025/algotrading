import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { AlertOctagon, X, Loader2, Check, AlertTriangle } from 'lucide-react';

/**
 * EmergencyStopButton Component - Precision Swiss Design System
 *
 * Prominent emergency stop button that:
 * - Immediately stops all bots (SIGKILL)
 * - Closes all open positions at market
 * - Shows confirmation dialog
 * - Displays post-emergency summary
 *
 * Always visible and accessible on mobile.
 */
function EmergencyStopButton({ onEmergencyStop, isLoading = false, disabled = false }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState(null);

  const handleEmergencyClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    try {
      const result = await onEmergencyStop();
      setSummary(result);
      setShowSummary(true);
    } catch (error) {
      console.error('Emergency stop failed:', error);
      setSummary({
        success: false,
        message: `Emergency stop failed: ${error.message}`,
        bots_stopped: 0,
        positions_closed: 0,
        actions: [],
      });
      setShowSummary(true);
    }
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    setSummary(null);
  };

  return (
    <>
      {/* Emergency Stop Button */}
      <button
        onClick={handleEmergencyClick}
        disabled={disabled || isLoading}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
          'bg-danger text-white shadow-md',
          'hover:bg-danger-hover hover:shadow-lg',
          'focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'animate-pulse-subtle'
        )}
        title="Emergency Stop - Stop all bots and close all positions"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <AlertOctagon className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Emergency Stop</span>
        <span className="sm:hidden">STOP</span>
      </button>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-neutral-900/50" onClick={() => setShowConfirmDialog(false)} />
          <div className="relative bg-white border border-danger rounded-md shadow-elevated p-6 max-w-md w-full mx-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-light animate-pulse">
                <AlertOctagon className="h-6 w-6 text-danger" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-danger uppercase">Emergency Stop</h3>
                <p className="text-sm text-neutral-500">Immediate action required</p>
              </div>
            </div>

            {/* Warning Message */}
            <div className="p-4 rounded-md bg-danger-light border border-danger mb-6">
              <p className="text-base font-semibold text-danger mb-2">
                STOP ALL BOTS and CLOSE ALL POSITIONS immediately?
              </p>
              <ul className="text-sm text-danger space-y-1 list-disc list-inside">
                <li>All running bots will be force-stopped</li>
                <li>All open positions will be closed at market</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={isLoading}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="btn btn-danger flex items-center gap-2 animate-pulse"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <AlertOctagon className="h-4 w-4" />
                )}
                CONFIRM EMERGENCY STOP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Emergency Summary Dialog */}
      {showSummary && summary && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-neutral-900/50" onClick={handleCloseSummary} />
          <div className="relative bg-white border border-neutral-200 rounded-md shadow-elevated p-6 max-w-lg w-full mx-4 animate-fade-in max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  summary.success ? 'bg-success-light' : 'bg-danger-light'
                )}>
                  {summary.success ? (
                    <Check className="h-5 w-5 text-success" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-danger" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Emergency Stop Summary</h3>
                  <p className={cn(
                    'text-sm',
                    summary.success ? 'text-success' : 'text-danger'
                  )}>
                    {summary.success ? 'Completed' : 'Completed with errors'}
                  </p>
                </div>
              </div>
              <button onClick={handleCloseSummary} className="p-2 rounded hover:bg-neutral-100">
                <X className="h-5 w-5 text-neutral-400" />
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-md bg-neutral-50 border border-neutral-200 text-center">
                <p className="text-2xl font-bold text-neutral-900">{summary.bots_stopped || 0}</p>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Bots Stopped</p>
              </div>
              <div className="p-4 rounded-md bg-neutral-50 border border-neutral-200 text-center">
                <p className="text-2xl font-bold text-neutral-900">{summary.positions_closed || 0}</p>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Positions Closed</p>
              </div>
              <div className="p-4 rounded-md bg-neutral-50 border border-neutral-200 text-center">
                <p className={cn(
                  'text-2xl font-bold tabular-nums',
                  summary.total_pnl_realized >= 0 ? 'text-success' : 'text-danger'
                )}>
                  {summary.total_pnl_realized != null
                    ? `${summary.total_pnl_realized >= 0 ? '+' : ''}$${summary.total_pnl_realized.toFixed(2)}`
                    : '--'}
                </p>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">P/L Realized</p>
              </div>
            </div>

            {/* Overall Message */}
            <div className={cn(
              'p-3 rounded-md mb-4',
              summary.success ? 'bg-success-light' : 'bg-danger-light'
            )}>
              <p className={cn(
                'text-sm font-medium',
                summary.success ? 'text-success' : 'text-danger'
              )}>
                {summary.message}
              </p>
            </div>

            {/* Detailed Actions */}
            {summary.actions && summary.actions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                  Actions Taken
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {summary.actions.map((action, index) => (
                    <div
                      key={index}
                      className={cn(
                        'p-2 rounded-md text-xs flex items-start gap-2',
                        action.result === 'success' ? 'bg-success-light' : 'bg-danger-light'
                      )}
                    >
                      {action.result === 'success' ? (
                        <Check className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-3 w-3 text-danger mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <span className="font-medium text-neutral-900">{action.action}</span>
                        <span className="text-neutral-500"> - {action.target}</span>
                        {action.details && (
                          <p className="text-neutral-500 mt-0.5">{action.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end">
              <button onClick={handleCloseSummary} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EmergencyStopButton;
