import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import { X, Settings2, Eye, EyeOff } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import {
  PREVIEW_DEBOUNCE_DELAY,
  PERFORMANCE_THRESHOLD_GOOD,
  PERFORMANCE_THRESHOLD_WARNING,
  LINE_WIDTH_OPTIONS,
  LINE_STYLE_OPTIONS,
  LINE_STYLE_LABELS,
  DEFAULT_LINE_WIDTH,
  DEFAULT_LINE_STYLE,
  DEFAULT_FILL_OPACITY
} from '../app/chartConstants';

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
 * @param {number} initialLineWidth - Initial line width value (for edit mode)
 * @param {string} initialLineStyle - Initial line style value (for edit mode)
 * @param {number} initialFillOpacity - Initial fill opacity value (for edit mode)
 * @param {boolean} isEditMode - Whether editing existing indicator vs adding new
 * @param {Function} onPreviewUpdate - Callback for real-time preview updates (params, color)
 * @param {boolean} comparisonMode - Whether before/after comparison is enabled
 * @param {Function} onComparisonToggle - Callback to toggle comparison mode
 */
function IndicatorSettingsDialog({
  isOpen,
  onClose,
  onConfirm,
  indicator,
  initialParams = null,
  initialColor = null,
  initialLineWidth = null,
  initialLineStyle = null,
  initialFillOpacity = null,
  isEditMode = false,
  onPreviewUpdate = null,
  comparisonMode = false,
  onComparisonToggle = null,
}) {
  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);

  // Initialize params from indicator defaults or initial values
  const [params, setParams] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);
  const [lineWidth, setLineWidth] = useState(DEFAULT_LINE_WIDTH);
  const [lineStyle, setLineStyle] = useState(DEFAULT_LINE_STYLE);
  const [fillOpacity, setFillOpacity] = useState(DEFAULT_FILL_OPACITY);
  const [errors, setErrors] = useState({});

  // Performance monitoring for preview calculations
  const { startTimer, stopTimer, elapsedTime } = usePerformanceMonitor();

  // Debounce params, color, and styling for preview updates
  const debouncedParams = useDebounce(params, PREVIEW_DEBOUNCE_DELAY);
  const debouncedColor = useDebounce(selectedColor, PREVIEW_DEBOUNCE_DELAY);
  const debouncedLineWidth = useDebounce(lineWidth, PREVIEW_DEBOUNCE_DELAY);
  const debouncedLineStyle = useDebounce(lineStyle, PREVIEW_DEBOUNCE_DELAY);
  const debouncedFillOpacity = useDebounce(fillOpacity, PREVIEW_DEBOUNCE_DELAY);

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

      // Use initial styling if provided, otherwise use indicator's defaults
      setLineWidth(initialLineWidth ?? indicator.defaultLineWidth ?? DEFAULT_LINE_WIDTH);
      setLineStyle(initialLineStyle ?? indicator.defaultLineStyle ?? DEFAULT_LINE_STYLE);
      setFillOpacity(initialFillOpacity ?? indicator.defaultFillOpacity ?? DEFAULT_FILL_OPACITY);

      setErrors({});
    }
  }, [isOpen, indicator, initialParams, initialColor, initialLineWidth, initialLineStyle, initialFillOpacity]);

  // Handle reset to default
  const handleResetToDefault = useCallback(() => {
    if (indicator) {
      // Reset parameters to defaults
      setParams({ ...indicator.defaultParams });

      // Reset color to default
      setSelectedColor(indicator.color);

      // Reset styling to defaults
      setLineWidth(indicator.defaultLineWidth ?? DEFAULT_LINE_WIDTH);
      setLineStyle(indicator.defaultLineStyle ?? DEFAULT_LINE_STYLE);
      setFillOpacity(indicator.defaultFillOpacity ?? DEFAULT_FILL_OPACITY);

      // Clear errors
      setErrors({});
    }
  }, [indicator]);

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

    onConfirm(params, selectedColor, lineWidth, lineStyle, fillOpacity);
  }, [indicator, params, selectedColor, lineWidth, lineStyle, fillOpacity, onConfirm]);

  // Focus management and escape key handler
  useEffect(() => {
    if (isOpen) {
      // Focus first input when dialog opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);

      // Handle escape and enter keys
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
          // Only handle Enter if not in a textarea and no modifier keys
          e.preventDefault();
          handleSubmit(e);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, handleSubmit]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Trigger preview update when debounced params or color change
  useEffect(() => {
    if (isOpen && isEditMode && onPreviewUpdate) {
      // Validate params before triggering preview
      const paramConfig = INDICATOR_PARAM_CONFIG[indicator?.id] || [];
      let hasErrors = false;

      paramConfig.forEach(config => {
        const value = debouncedParams[config.key];
        if (value === '' || value === undefined || isNaN(value) || value < config.min || value > config.max) {
          hasErrors = true;
        }
      });

      // Only trigger preview if all params are valid
      if (!hasErrors && Object.keys(debouncedParams).length > 0) {
        startTimer();
        onPreviewUpdate(debouncedParams, debouncedColor, debouncedLineWidth, debouncedLineStyle, debouncedFillOpacity);
        // Stop timer after a frame to allow chart to render
        requestAnimationFrame(() => {
          stopTimer();
        });
      }
    }
  }, [isOpen, isEditMode, debouncedParams, debouncedColor, debouncedLineWidth, debouncedLineStyle, debouncedFillOpacity, onPreviewUpdate, indicator, startTimer, stopTimer]);

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
              <div className="flex items-center gap-2">
                <h2
                  id="indicator-settings-title"
                  className="text-lg font-semibold text-foreground"
                >
                  {isEditMode ? 'Edit' : 'Configure'} {indicator.name}
                </h2>
                {isEditMode && onPreviewUpdate && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Preview Mode
                  </span>
                )}
              </div>
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

          {/* Line Thickness */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-foreground">Line Thickness</h3>
            <div className="flex gap-2">
              {LINE_WIDTH_OPTIONS.map((width) => (
                <button
                  key={width}
                  type="button"
                  onClick={() => setLineWidth(width)}
                  className={cn(
                    "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    "border focus:outline-none focus:ring-2 focus:ring-primary/50",
                    lineWidth === width
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-foreground border-border hover:bg-muted/80"
                  )}
                  aria-label={`Select ${width}px line width`}
                  aria-pressed={lineWidth === width}
                >
                  {width}px
                </button>
              ))}
            </div>
          </div>

          {/* Line Style */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-foreground">Line Style</h3>
            <div className="flex gap-2">
              {Object.entries(LINE_STYLE_OPTIONS).map(([key, value]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLineStyle(value)}
                  className={cn(
                    "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    "border focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "flex flex-col items-center gap-1",
                    lineStyle === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-foreground border-border hover:bg-muted/80"
                  )}
                  aria-label={`Select ${LINE_STYLE_LABELS[value]} line style`}
                  aria-pressed={lineStyle === value}
                >
                  <span className="text-xs">{LINE_STYLE_LABELS[value]}</span>
                  <div className="w-full h-0.5 relative" style={{
                    background: lineStyle === value ? 'currentColor' : 'currentColor',
                    ...(value === 'dash' && {
                      backgroundImage: 'linear-gradient(to right, currentColor 40%, transparent 40%)',
                      backgroundSize: '8px 2px',
                      backgroundRepeat: 'repeat-x'
                    }),
                    ...(value === 'dot' && {
                      backgroundImage: 'linear-gradient(to right, currentColor 25%, transparent 25%)',
                      backgroundSize: '4px 2px',
                      backgroundRepeat: 'repeat-x'
                    })
                  }} />
                </button>
              ))}
            </div>
          </div>

          {/* Fill Opacity - only show for indicators with fill areas */}
          {(indicator.id === 'bollinger_bands' || indicator.id === 'keltner_channel') && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Fill Opacity</h3>
                <span className="text-xs text-muted-foreground">{Math.round(fillOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={fillOpacity}
                onChange={(e) => setFillOpacity(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-muted"
                style={{
                  background: `linear-gradient(to right, ${selectedColor} 0%, ${selectedColor} ${fillOpacity * 100}%, rgb(var(--muted)) ${fillOpacity * 100}%, rgb(var(--muted)) 100%)`
                }}
                aria-label="Fill opacity slider"
              />
            </div>
          )}

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

          {/* Performance Indicator */}
          {isEditMode && onPreviewUpdate && elapsedTime !== null && (
            <div className="mb-4 p-2 rounded-md bg-muted/30 border border-border">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Calculation time:</span>
                <span
                  className={cn(
                    "font-medium",
                    elapsedTime < PERFORMANCE_THRESHOLD_GOOD
                      ? "text-green-600 dark:text-green-400"
                      : elapsedTime < PERFORMANCE_THRESHOLD_WARNING
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {elapsedTime}ms
                </span>
                {elapsedTime >= PERFORMANCE_THRESHOLD_WARNING && (
                  <span className="text-muted-foreground">
                    (Preview calculation is slow. Consider reducing candle count.)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2">
            {/* Left side - Comparison toggle and Reset button */}
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              {isEditMode && onComparisonToggle && (
                <button
                  type="button"
                  onClick={onComparisonToggle}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    "border border-border",
                    comparisonMode
                      ? "bg-primary/10 text-primary border-primary/50"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "flex items-center gap-2 justify-center sm:justify-start"
                  )}
                >
                  {comparisonMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {comparisonMode ? 'Comparison On' : 'Compare Before/After'}
                </button>
              )}
              <button
                type="button"
                onClick={handleResetToDefault}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  "border border-border",
                  "bg-muted text-foreground hover:bg-muted/80",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50"
                )}
              >
                Reset to Default
              </button>
            </div>

            {/* Right side - Cancel and Apply buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-2">
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
                {isEditMode ? 'Apply' : 'Add Indicator'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IndicatorSettingsDialog;
