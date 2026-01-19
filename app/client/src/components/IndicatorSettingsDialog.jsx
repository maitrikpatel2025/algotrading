import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import { X, Settings2 } from 'lucide-react';

// Predefined color palette for indicators (from UI style guide)
const INDICATOR_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Sky', value: '#0EA5E9' },
];

// Parameter configuration by indicator type
const INDICATOR_PARAM_CONFIG = {
  sma: [{ key: 'period', label: 'Period', min: 1, max: 500, defaultValue: 20 }],
  ema: [{ key: 'period', label: 'Period', min: 1, max: 500, defaultValue: 20 }],
  rsi: [{ key: 'period', label: 'Period', min: 1, max: 100, defaultValue: 14 }],
  cci: [{ key: 'period', label: 'Period', min: 1, max: 100, defaultValue: 20 }],
  williams_r: [{ key: 'period', label: 'Period', min: 1, max: 100, defaultValue: 14 }],
  atr: [{ key: 'period', label: 'Period', min: 1, max: 100, defaultValue: 14 }],
  adx: [{ key: 'period', label: 'Period', min: 1, max: 100, defaultValue: 14 }],
  macd: [
    { key: 'fastPeriod', label: 'Fast Period', min: 1, max: 100, defaultValue: 12 },
    { key: 'slowPeriod', label: 'Slow Period', min: 1, max: 100, defaultValue: 26 },
    { key: 'signalPeriod', label: 'Signal Period', min: 1, max: 100, defaultValue: 9 },
  ],
  stochastic: [
    { key: 'kPeriod', label: 'K Period', min: 1, max: 100, defaultValue: 14 },
    { key: 'dPeriod', label: 'D Period', min: 1, max: 100, defaultValue: 3 },
  ],
  bollinger_bands: [
    { key: 'period', label: 'Period', min: 1, max: 500, defaultValue: 20 },
    { key: 'stdDev', label: 'Std Dev', min: 0.1, max: 5, step: 0.1, defaultValue: 2 },
  ],
  keltner_channel: [
    { key: 'period', label: 'Period', min: 1, max: 500, defaultValue: 20 },
    { key: 'atrMultiplier', label: 'ATR Multiplier', min: 0.1, max: 5, step: 0.1, defaultValue: 2 },
  ],
  obv: [], // No parameters
  volume_profile: [{ key: 'bins', label: 'Bins', min: 5, max: 100, defaultValue: 24 }],
};

/**
 * IndicatorSettingsDialog Component
 *
 * A modal dialog for configuring indicator parameters before adding to the chart,
 * or editing existing indicator settings.
 *
 * @param {boolean} isOpen - Whether the dialog is visible
 * @param {Function} onClose - Callback when dialog is closed/cancelled
 * @param {Function} onConfirm - Callback when settings are confirmed (params, color)
 * @param {Object} indicator - The indicator definition object
 * @param {Object} initialParams - Initial parameter values (for edit mode)
 * @param {string} initialColor - Initial color value (for edit mode)
 * @param {boolean} isEditMode - Whether editing existing indicator vs adding new
 */
function IndicatorSettingsDialog({
  isOpen,
  onClose,
  onConfirm,
  indicator,
  initialParams = null,
  initialColor = null,
  isEditMode = false,
}) {
  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);

  // Initialize params from indicator defaults or initial values
  const [params, setParams] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);
  const [errors, setErrors] = useState({});

  // Reset state when indicator changes or dialog opens
  useEffect(() => {
    if (isOpen && indicator) {
      const defaultParams = { ...indicator.defaultParams };

      // Use initial params if in edit mode, otherwise use defaults
      if (initialParams) {
        setParams({ ...defaultParams, ...initialParams });
      } else {
        setParams(defaultParams);
      }

      // Use initial color if provided, otherwise use indicator's default color
      setSelectedColor(initialColor || indicator.color);
      setErrors({});
    }
  }, [isOpen, indicator, initialParams, initialColor]);

  // Focus management and escape key handler
  useEffect(() => {
    if (isOpen) {
      // Focus first input when dialog opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);

      // Handle escape key
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Handle parameter change with validation
  const handleParamChange = useCallback((key, value, config) => {
    const numValue = parseFloat(value);

    // Validate the value
    let error = null;
    if (value === '' || isNaN(numValue)) {
      error = 'Required';
    } else if (numValue < config.min) {
      error = `Min: ${config.min}`;
    } else if (numValue > config.max) {
      error = `Max: ${config.max}`;
    }

    setErrors(prev => ({
      ...prev,
      [key]: error,
    }));

    setParams(prev => ({
      ...prev,
      [key]: value === '' ? '' : numValue,
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    // Validate all params
    const paramConfig = INDICATOR_PARAM_CONFIG[indicator.id] || [];
    const newErrors = {};
    let hasErrors = false;

    paramConfig.forEach(config => {
      const value = params[config.key];
      if (value === '' || value === undefined || isNaN(value)) {
        newErrors[config.key] = 'Required';
        hasErrors = true;
      } else if (value < config.min) {
        newErrors[config.key] = `Min: ${config.min}`;
        hasErrors = true;
      } else if (value > config.max) {
        newErrors[config.key] = `Max: ${config.max}`;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    onConfirm(params, selectedColor);
  }, [indicator, params, selectedColor, onConfirm]);

  if (!isOpen || !indicator) return null;

  const paramConfig = INDICATOR_PARAM_CONFIG[indicator.id] || [];
  const hasParams = paramConfig.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="indicator-settings-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={cn(
          "relative bg-card rounded-lg shadow-xl max-w-md w-full",
          "border border-border",
          "animate-fade-in"
        )}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute top-3 right-3 p-1.5 rounded-md",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-muted transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary/50"
          )}
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className="p-2 rounded-full"
              style={{ backgroundColor: `${selectedColor}20` }}
            >
              <Settings2 className="h-5 w-5" style={{ color: selectedColor }} />
            </div>
            <div className="flex-1">
              <h2
                id="indicator-settings-title"
                className="text-lg font-semibold text-foreground"
              >
                {isEditMode ? 'Edit' : 'Configure'} {indicator.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {indicator.description}
              </p>
            </div>
          </div>

          {/* Parameters */}
          {hasParams && (
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-medium text-foreground">Parameters</h3>
              <div className="grid grid-cols-2 gap-4">
                {paramConfig.map((config, index) => (
                  <div key={config.key} className="space-y-1.5">
                    <label
                      htmlFor={`param-${config.key}`}
                      className="text-sm font-medium text-muted-foreground"
                    >
                      {config.label}
                    </label>
                    <input
                      ref={index === 0 ? firstInputRef : null}
                      id={`param-${config.key}`}
                      type="number"
                      min={config.min}
                      max={config.max}
                      step={config.step || 1}
                      value={params[config.key] ?? config.defaultValue}
                      onChange={(e) => handleParamChange(config.key, e.target.value, config)}
                      className={cn(
                        "w-full px-3 py-2 text-sm rounded-md",
                        "border bg-background",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50",
                        "transition-shadow",
                        errors[config.key]
                          ? "border-destructive focus:ring-destructive/50"
                          : "border-border"
                      )}
                    />
                    {errors[config.key] && (
                      <p className="text-xs text-destructive">{errors[config.key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-foreground">Color</h3>
            <div className="flex flex-wrap gap-2">
              {INDICATOR_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
                    selectedColor === color.value
                      ? "ring-2 ring-foreground ring-offset-2 scale-110"
                      : "hover:scale-110"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  aria-label={`Select ${color.name} color`}
                  aria-pressed={selectedColor === color.value}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6 p-3 rounded-md bg-muted/50 border border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Preview:</span>
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-muted text-foreground"
                style={{ borderLeft: `3px solid ${selectedColor}` }}
              >
                {indicator.shortName}
                {hasParams && ` (${Object.values(params).filter(v => v !== '').join(', ')})`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md",
                "bg-muted text-foreground",
                "hover:bg-muted/80 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/50"
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
              )}
            >
              {isEditMode ? 'Update' : 'Add Indicator'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IndicatorSettingsDialog;
