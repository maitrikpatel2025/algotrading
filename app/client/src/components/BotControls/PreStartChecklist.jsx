import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { Check, X, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import endPoints from '../../app/api';

/**
 * PreStartChecklist Component - Precision Swiss Design System
 *
 * Displays pre-start validation checklist before starting the bot:
 * - Strategy assigned check
 * - Risk parameters configured check
 * - Broker connectivity check
 *
 * Each item shows passed/failed/warning status with color coding.
 */
function PreStartChecklist({ isOpen, onClose, onConfirmStart, botName = 'Trading Bot' }) {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadChecklist();
    }
  }, [isOpen]);

  const loadChecklist = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await endPoints.botPreStartCheck();
      setChecklist(data);
    } catch (err) {
      console.error('Error loading pre-start checklist:', err);
      setError('Failed to load pre-start checklist');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <Check className="h-4 w-4 text-success" />;
      case 'failed':
        return <X className="h-4 w-4 text-danger" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'border-l-success bg-success-light';
      case 'failed':
        return 'border-l-danger bg-danger-light';
      case 'warning':
        return 'border-l-warning bg-warning-light';
      default:
        return 'border-l-neutral-300 bg-neutral-50';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'passed':
        return 'text-success';
      case 'failed':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-neutral-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-neutral-900/50" onClick={onClose} />
      <div className="relative bg-white border border-neutral-200 rounded-md shadow-elevated p-6 max-w-md w-full mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-light">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Pre-Start Checklist</h3>
            <p className="text-sm text-neutral-500">Validate before starting {botName}</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-8 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-neutral-500">Running pre-start checks...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-md bg-danger-light border-l-4 border-l-danger mb-4">
            <p className="text-sm text-danger">{error}</p>
          </div>
        ) : (
          <>
            {/* Checklist Items */}
            <div className="space-y-3 mb-6">
              {checklist?.items?.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-3 rounded-md border-l-4 transition-colors',
                    getStatusColor(item.status)
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium text-neutral-900">{item.name}</span>
                    </div>
                    <span className={cn('text-xs font-medium uppercase', getStatusTextColor(item.status))}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 ml-7">{item.message}</p>
                </div>
              ))}
            </div>

            {/* Overall Status */}
            <div className={cn(
              'p-4 rounded-md mb-6',
              checklist?.can_start ? 'bg-success-light' : 'bg-danger-light'
            )}>
              <p className={cn(
                'text-sm font-medium',
                checklist?.can_start ? 'text-success' : 'text-danger'
              )}>
                {checklist?.message || (checklist?.can_start ? 'Ready to start' : 'Cannot start')}
              </p>
            </div>
          </>
        )}

        {/* Confirmation Message */}
        {checklist?.can_start && !loading && !error && (
          <p className="text-sm text-neutral-500 mb-4">
            Start {botName}? It will begin trading with real money.
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => onConfirmStart()}
            disabled={loading || error || !checklist?.can_start}
            className={cn(
              'btn flex items-center gap-2',
              checklist?.can_start ? 'btn-primary' : 'btn-disabled'
            )}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Start Bot
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreStartChecklist;
