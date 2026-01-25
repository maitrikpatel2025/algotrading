import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Square, AlertTriangle, Hand, Clock, Loader2 } from 'lucide-react';

/**
 * StopOptionsDialog Component - Precision Swiss Design System
 *
 * Dialog for selecting stop options when stopping a bot:
 * - Close all positions at market
 * - Keep positions for manual management
 * - Wait for current position to close
 *
 * Each option includes clear explanation of implications.
 */
function StopOptionsDialog({ isOpen, onClose, onConfirmStop, isLoading = false }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const stopOptions = [
    {
      value: 'close_all',
      label: 'Stop and close all positions',
      description: 'All open positions will be closed at market price immediately.',
      icon: Square,
      warning: 'This will realize any unrealized P/L at current market prices.',
      color: 'danger',
    },
    {
      value: 'keep_positions',
      label: 'Stop and keep positions open',
      description: 'Bot will stop but positions remain open for manual management.',
      icon: Hand,
      warning: 'You will need to monitor and close positions manually.',
      color: 'warning',
    },
    {
      value: 'wait_for_close',
      label: 'Stop after position closes',
      description: 'Bot enters "stopping" state and stops after current position closes.',
      icon: Clock,
      warning: 'Bot will continue managing the current position until it closes.',
      color: 'primary',
    },
  ];

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleProceed = () => {
    if (selectedOption === 'close_all') {
      // Show extra confirmation for close_all
      setShowConfirmation(true);
    } else {
      onConfirmStop(selectedOption);
    }
  };

  const handleConfirmCloseAll = () => {
    onConfirmStop(selectedOption);
    setShowConfirmation(false);
  };

  const getColorClasses = (color, isSelected) => {
    if (!isSelected) {
      return 'border-neutral-200 hover:border-neutral-300';
    }
    switch (color) {
      case 'danger':
        return 'border-danger bg-danger-light';
      case 'warning':
        return 'border-warning bg-warning-light';
      case 'primary':
        return 'border-primary bg-primary-light';
      default:
        return 'border-primary bg-primary-light';
    }
  };

  const getIconColor = (color) => {
    switch (color) {
      case 'danger':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      case 'primary':
        return 'text-primary';
      default:
        return 'text-neutral-500';
    }
  };

  if (!isOpen) return null;

  // Close All Confirmation Dialog
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-neutral-900/50" onClick={() => setShowConfirmation(false)} />
        <div className="relative bg-white border border-neutral-200 rounded-md shadow-elevated p-6 max-w-md w-full mx-4 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-danger-light">
              <AlertTriangle className="h-5 w-5 text-danger" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Confirm Close All</h3>
              <p className="text-sm text-neutral-500">This action cannot be undone</p>
            </div>
          </div>

          <div className="p-4 rounded-md bg-danger-light border-l-4 border-l-danger mb-6">
            <p className="text-sm text-danger font-medium">
              All open positions will be closed at market price. Any unrealized P/L will be realized.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowConfirmation(false)}
              disabled={isLoading}
              className="btn btn-secondary"
            >
              Back
            </button>
            <button
              onClick={handleConfirmCloseAll}
              disabled={isLoading}
              className="btn btn-danger flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Close All & Stop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-neutral-900/50" onClick={onClose} />
      <div className="relative bg-white border border-neutral-200 rounded-md shadow-elevated p-6 max-w-md w-full mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
            <Square className="h-5 w-5 text-neutral-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Stop Trading Bot</h3>
            <p className="text-sm text-neutral-500">Choose how to handle open positions</p>
          </div>
        </div>

        {/* Stop Options */}
        <div className="space-y-3 mb-6">
          {stopOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedOption === option.value;

            return (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className={cn(
                  'w-full p-4 rounded-md border text-left transition-colors',
                  getColorClasses(option.color, isSelected)
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md',
                    isSelected ? '' : 'bg-neutral-100'
                  )}>
                    <Icon className={cn('h-4 w-4', isSelected ? getIconColor(option.color) : 'text-neutral-500')} />
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      'text-sm font-medium',
                      isSelected ? 'text-neutral-900' : 'text-neutral-700'
                    )}>
                      {option.label}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">{option.description}</p>
                    {isSelected && (
                      <div className={cn(
                        'mt-2 p-2 rounded text-xs',
                        option.color === 'danger' ? 'bg-danger/10 text-danger' :
                        option.color === 'warning' ? 'bg-warning/10 text-warning' :
                        'bg-primary/10 text-primary'
                      )}>
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        {option.warning}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={isLoading} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleProceed}
            disabled={!selectedOption || isLoading}
            className={cn(
              'btn flex items-center gap-2',
              selectedOption ? 'btn-danger' : 'btn-disabled'
            )}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Stop Bot
          </button>
        </div>
      </div>
    </div>
  );
}

export default StopOptionsDialog;
