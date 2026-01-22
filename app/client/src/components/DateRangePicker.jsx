import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * DateRangePicker Component
 *
 * Date range picker with preset buttons for backtest date selection.
 * Includes validation for date ranges and data availability indicators.
 */

const PRESETS = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: '2Y', months: 24 },
  { label: '5Y', months: 60 },
];

function DateRangePicker({ startDate, endDate, onChange, className }) {
  // Calculate preset dates
  const applyPreset = (months) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);

    onChange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
  };

  // Handle date changes
  const handleStartDateChange = (e) => {
    onChange({
      startDate: e.target.value,
      endDate
    });
  };

  const handleEndDateChange = (e) => {
    onChange({
      startDate,
      endDate: e.target.value
    });
  };

  // Validate date range
  const getValidationError = () => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // End date cannot be in the future
    if (end > today) {
      return 'End date cannot be in the future';
    }

    // Start must be before end
    if (start >= end) {
      return 'Start date must be before end date';
    }

    // Minimum range: 1 week
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    if (end - start < oneWeek) {
      return 'Date range must be at least 1 week';
    }

    // Maximum range: 10 years
    const tenYears = 10 * 365 * 24 * 60 * 60 * 1000;
    if (end - start > tenYears) {
      return 'Date range cannot exceed 10 years';
    }

    return null;
  };

  // Check which preset is active
  const isPresetActive = (months) => {
    if (!startDate || !endDate) return false;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const expectedStart = new Date();
    expectedStart.setMonth(expectedStart.getMonth() - months);

    // Allow 1 day tolerance for comparison
    const dayDiff = Math.abs(start.getTime() - expectedStart.getTime()) / (24 * 60 * 60 * 1000);
    const isToday = end.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

    return dayDiff < 2 && isToday;
  };

  const validationError = getValidationError();

  // Calculate date range summary
  const getDateRangeSummary = () => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.round((end - start) / (24 * 60 * 60 * 1000));

    if (days < 30) {
      return `${days} days`;
    } else if (days < 365) {
      const months = Math.round(days / 30);
      return `~${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = (days / 365).toFixed(1);
      return `~${years} year${parseFloat(years) !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-neutral-700">
          Date Range
        </label>
        {startDate && endDate && !validationError && (
          <span className="text-sm text-neutral-500">
            {getDateRangeSummary()}
          </span>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => applyPreset(preset.months)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              isPresetActive(preset.months)
                ? "bg-primary text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            <input
              type="date"
              value={startDate || ''}
              onChange={handleStartDateChange}
              className={cn(
                "w-full pl-10 pr-3 py-2 border rounded-md text-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                validationError
                  ? "border-danger bg-danger-light"
                  : "border-neutral-300"
              )}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            <input
              type="date"
              value={endDate || ''}
              onChange={handleEndDateChange}
              max={new Date().toISOString().split('T')[0]}
              className={cn(
                "w-full pl-10 pr-3 py-2 border rounded-md text-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                validationError
                  ? "border-danger bg-danger-light"
                  : "border-neutral-300"
              )}
            />
          </div>
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-center gap-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4" />
          {validationError}
        </div>
      )}

      {/* Data Availability Indicator (placeholder) */}
      {startDate && endDate && !validationError && (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span>Historical data available for selected range</span>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
