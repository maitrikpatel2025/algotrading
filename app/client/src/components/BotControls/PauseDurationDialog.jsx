import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Pause, Clock, Loader2 } from 'lucide-react';

/**
 * PauseDurationDialog Component - Precision Swiss Design System
 *
 * Dialog for selecting pause duration when pausing a bot:
 * - Preset options: 15m, 30m, 1h, 2h
 * - Custom duration input
 * - Indefinite pause option
 *
 * Shows message about existing positions being managed.
 */
function PauseDurationDialog({ isOpen, onClose, onConfirmPause, isLoading = false }) {
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [customMinutes, setCustomMinutes] = useState('');

  const presetOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
  ];

  const handleDurationSelect = (value) => {
    setSelectedDuration(value);
    setCustomMinutes('');
  };

  const handleCustomChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) > 0 && parseInt(value) <= 1440)) {
      setCustomMinutes(value);
      setSelectedDuration('custom');
    }
  };

  const handleIndefiniteSelect = () => {
    setSelectedDuration('indefinite');
    setCustomMinutes('');
  };

  const handleConfirm = () => {
    let durationMinutes = null;

    if (selectedDuration === 'custom' && customMinutes) {
      durationMinutes = parseInt(customMinutes);
    } else if (selectedDuration === 'indefinite') {
      durationMinutes = null;
    } else if (typeof selectedDuration === 'number') {
      durationMinutes = selectedDuration;
    }

    onConfirmPause(durationMinutes);
  };

  const canConfirm = selectedDuration !== null &&
    (selectedDuration !== 'custom' || (customMinutes && parseInt(customMinutes) > 0));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-neutral-900/50" onClick={onClose} />
      <div className="relative bg-white border border-neutral-200 rounded-md shadow-elevated p-6 max-w-md w-full mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning-light">
            <Pause className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Pause Trading Bot</h3>
            <p className="text-sm text-neutral-500">Select pause duration</p>
          </div>
        </div>

        {/* Position Management Notice */}
        <div className="p-3 rounded-md bg-primary-light border-l-4 border-l-primary mb-4">
          <p className="text-sm text-primary">
            Existing positions will continue to be managed (SL/TP remain active).
            No new positions will be opened during pause.
          </p>
        </div>

        {/* Duration Options */}
        <div className="space-y-3 mb-6">
          {/* Preset Options Grid */}
          <div className="grid grid-cols-2 gap-2">
            {presetOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDurationSelect(option.value)}
                className={cn(
                  'p-3 rounded-md border text-sm font-medium transition-colors',
                  selectedDuration === option.value
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" />
                  {option.label}
                </div>
              </button>
            ))}
          </div>

          {/* Custom Duration */}
          <div
            className={cn(
              'p-3 rounded-md border transition-colors',
              selectedDuration === 'custom'
                ? 'border-primary bg-primary-light'
                : 'border-neutral-200'
            )}
          >
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
              Custom Duration (minutes)
            </label>
            <input
              type="number"
              value={customMinutes}
              onChange={handleCustomChange}
              onFocus={() => setSelectedDuration('custom')}
              placeholder="Enter minutes (1-1440)"
              min="1"
              max="1440"
              className={cn(
                'input-field',
                selectedDuration === 'custom' ? 'border-primary' : ''
              )}
            />
          </div>

          {/* Indefinite Option */}
          <button
            onClick={handleIndefiniteSelect}
            className={cn(
              'w-full p-3 rounded-md border text-sm font-medium transition-colors',
              selectedDuration === 'indefinite'
                ? 'border-warning bg-warning-light text-warning'
                : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
            )}
          >
            Indefinite (Manual Resume Required)
          </button>
        </div>

        {/* Selected Duration Summary */}
        {selectedDuration && (
          <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200 mb-4">
            <p className="text-sm text-neutral-600">
              {selectedDuration === 'indefinite' ? (
                'Bot will remain paused until manually resumed'
              ) : selectedDuration === 'custom' && customMinutes ? (
                `Bot will auto-resume after ${customMinutes} minutes`
              ) : typeof selectedDuration === 'number' ? (
                `Bot will auto-resume after ${selectedDuration} minutes`
              ) : (
                'Select a duration'
              )}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={isLoading} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
            className={cn(
              'btn flex items-center gap-2',
              canConfirm ? 'btn-warning' : 'btn-disabled'
            )}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Pause Bot
          </button>
        </div>
      </div>
    </div>
  );
}

export default PauseDurationDialog;
