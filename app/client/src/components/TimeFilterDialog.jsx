import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  X,
  Clock,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import TimeFilterTimeline from './TimeFilterTimeline';
import {
  TRADING_SESSIONS,
  TIMEZONES,
  DAYS_OF_WEEK,
  TIME_FILTER_MODES,
  DEFAULT_TRADING_DAYS,
} from '../app/constants';
import {
  formatTimeString,
  getSessionTimes,
  validateTimeFilter,
  getTimeFilterSummary,
} from '../app/timeFilterUtils';

/**
 * TimeFilterDialog Component
 *
 * Modal dialog for configuring time-based trading filters.
 * Supports session templates, custom time windows, day selection,
 * and timezone configuration.
 *
 * @param {boolean} isOpen - Whether the dialog is visible
 * @param {Function} onClose - Callback when dialog is closed
 * @param {Function} onSave - Callback when filter is saved (receives timeFilter)
 * @param {Object} initialFilter - Initial time filter configuration (for editing)
 */
function TimeFilterDialog({
  isOpen,
  onClose,
  onSave,
  initialFilter = null,
}) {
  const dialogRef = useRef(null);

  // Form state
  const [mode, setMode] = useState(TIME_FILTER_MODES.INCLUDE);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [customWindows, setCustomWindows] = useState([]);
  const [selectedDays, setSelectedDays] = useState([...DEFAULT_TRADING_DAYS]);
  const [timezone, setTimezone] = useState('UTC');
  const [errors, setErrors] = useState([]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (initialFilter && initialFilter.enabled) {
        // Editing existing filter
        setMode(initialFilter.mode || TIME_FILTER_MODES.INCLUDE);
        setSelectedSessions(initialFilter.sessions || []);
        setCustomWindows(initialFilter.customWindows || []);
        setSelectedDays(initialFilter.days || [...DEFAULT_TRADING_DAYS]);
        setTimezone(initialFilter.timezone || 'UTC');
      } else {
        // New filter - reset to defaults
        setMode(TIME_FILTER_MODES.INCLUDE);
        setSelectedSessions([]);
        setCustomWindows([]);
        setSelectedDays([...DEFAULT_TRADING_DAYS]);
        setTimezone('UTC');
      }
      setErrors([]);
    }
  }, [isOpen, initialFilter]);

  // Build preview filter for timeline
  const previewFilter = useMemo(() => {
    return {
      enabled: true,
      mode,
      sessions: selectedSessions,
      customWindows,
      days: selectedDays,
      timezone,
    };
  }, [mode, selectedSessions, customWindows, selectedDays, timezone]);

  // Handle session toggle
  const handleSessionToggle = useCallback((sessionId) => {
    setSelectedSessions(prev => {
      if (prev.includes(sessionId)) {
        return prev.filter(id => id !== sessionId);
      }
      return [...prev, sessionId];
    });
  }, []);

  // Handle clear all sessions
  const handleClearSessions = useCallback(() => {
    setSelectedSessions([]);
  }, []);

  // Handle add custom window
  const handleAddCustomWindow = useCallback(() => {
    setCustomWindows(prev => [
      ...prev,
      { start: '09:00', end: '17:00' },
    ]);
  }, []);

  // Handle update custom window
  const handleUpdateCustomWindow = useCallback((index, field, value) => {
    setCustomWindows(prev => prev.map((window, i) => {
      if (i === index) {
        return { ...window, [field]: value };
      }
      return window;
    }));
  }, []);

  // Handle delete custom window
  const handleDeleteCustomWindow = useCallback((index) => {
    setCustomWindows(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle day toggle
  const handleDayToggle = useCallback((dayId) => {
    setSelectedDays(prev => {
      if (prev.includes(dayId)) {
        return prev.filter(id => id !== dayId);
      }
      return [...prev, dayId];
    });
  }, []);

  // Handle select all days
  const handleSelectAllDays = useCallback(() => {
    setSelectedDays(DAYS_OF_WEEK.map(d => d.id));
  }, []);

  // Handle select weekdays only
  const handleSelectWeekdays = useCallback(() => {
    setSelectedDays([...DEFAULT_TRADING_DAYS]);
  }, []);

  // Handle clear all days
  const handleClearDays = useCallback(() => {
    setSelectedDays([]);
  }, []);

  // Validate and save
  const handleSave = useCallback(() => {
    const filter = {
      enabled: true,
      mode,
      sessions: selectedSessions,
      customWindows,
      days: selectedDays,
      timezone,
    };

    const validation = validateTimeFilter(filter);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave?.(filter);
    onClose();
  }, [mode, selectedSessions, customWindows, selectedDays, timezone, onSave, onClose]);

  // Handle close with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = useCallback((e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={cn(
          "relative bg-card border border-border rounded-lg shadow-xl",
          "w-full max-w-lg mx-4",
          "max-h-[90vh] overflow-y-auto"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Time Filter
              </h2>
              <p className="text-sm text-muted-foreground">
                Restrict trading to specific hours
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={cn(
              "p-2 rounded-md text-muted-foreground",
              "hover:bg-muted hover:text-foreground",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Mode Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Filter Mode
            </label>
            <div className="flex gap-2">
              {Object.entries(TIME_FILTER_MODES).map(([key, value]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-md text-sm font-medium",
                    "border transition-colors",
                    mode === value
                      ? value === TIME_FILTER_MODES.EXCLUDE
                        ? "bg-amber-500 text-white border-amber-600"
                        : "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-foreground hover:bg-muted"
                  )}
                >
                  {value === TIME_FILTER_MODES.EXCLUDE ? 'Exclude' : 'Include'}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {mode === TIME_FILTER_MODES.INCLUDE
                ? 'Trade only during the selected hours'
                : 'Blackout trading during the selected hours'}
            </p>
          </div>

          {/* Session Templates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Trading Sessions
              </label>
              {selectedSessions.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSessions}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(TRADING_SESSIONS).map(session => {
                const isSelected = selectedSessions.includes(session.id);
                const sessionTimes = getSessionTimes(session.id, timezone);

                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => handleSessionToggle(session.id)}
                    className={cn(
                      "flex flex-col items-start p-3 rounded-md text-left",
                      "border transition-all",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:bg-muted"
                    )}
                    style={{
                      borderLeftWidth: '3px',
                      borderLeftColor: isSelected ? session.color : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-sm font-medium">{session.name}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {sessionTimes
                        ? `${formatTimeString(sessionTimes.startHour % 24)} - ${formatTimeString(sessionTimes.endHour % 24)}`
                        : `${formatTimeString(session.startHour % 24)} - ${formatTimeString(session.endHour % 24)}`
                      } ({timezone})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Time Windows */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Custom Time Windows
              </label>
              <button
                type="button"
                onClick={handleAddCustomWindow}
                className={cn(
                  "flex items-center gap-1 text-xs text-primary",
                  "hover:text-primary/80 transition-colors"
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Window
              </button>
            </div>

            {customWindows.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                No custom windows. Click "Add Window" to create one.
              </p>
            ) : (
              <div className="space-y-2">
                {customWindows.map((window, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border"
                  >
                    <input
                      type="time"
                      value={window.start}
                      onChange={(e) => handleUpdateCustomWindow(index, 'start', e.target.value)}
                      className={cn(
                        "px-2 py-1 rounded border border-border bg-background",
                        "text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      )}
                    />
                    <span className="text-muted-foreground">to</span>
                    <input
                      type="time"
                      value={window.end}
                      onChange={(e) => handleUpdateCustomWindow(index, 'end', e.target.value)}
                      className={cn(
                        "px-2 py-1 rounded border border-border bg-background",
                        "text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomWindow(index)}
                      className={cn(
                        "p-1 rounded text-muted-foreground",
                        "hover:bg-destructive/10 hover:text-destructive",
                        "transition-colors"
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Days of Week */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Days of Week
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectWeekdays}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Weekdays
                </button>
                <button
                  type="button"
                  onClick={handleSelectAllDays}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={handleClearDays}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleDayToggle(day.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium",
                      "border transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    )}
                  >
                    {day.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timezone Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className={cn(
                "w-full px-3 py-2 rounded-md text-sm",
                "bg-background border border-border",
                "focus:outline-none focus:ring-2 focus:ring-primary/50"
              )}
            >
              {Object.values(TIMEZONES).map(tz => (
                <option key={tz.id} value={tz.id}>
                  {tz.label} - {tz.description}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Preview
            </label>
            <TimeFilterTimeline
              timeFilter={previewFilter}
              timezone={timezone}
              showCurrentTime={true}
              compact={false}
            />
            <p className="text-sm text-muted-foreground text-center">
              {getTimeFilterSummary(previewFilter)}
            </p>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className={cn(
              "flex items-start gap-2 p-3 rounded-md",
              "bg-destructive/10 border border-destructive/30"
            )}>
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <p key={index} className="text-sm text-destructive">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium",
              "bg-muted text-foreground",
              "hover:bg-muted/80",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={selectedDays.length === 0}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            <Check className="h-4 w-4" />
            Save Filter
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimeFilterDialog;
