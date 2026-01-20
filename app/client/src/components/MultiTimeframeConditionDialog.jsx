import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  X,
  Clock,
  AlertTriangle,
  Check,
  Activity,
} from 'lucide-react';
import {
  TIMEFRAME_LABELS,
  MULTI_TIMEFRAME_WARNING_TEXT,
  CONDITION_SECTION_LABELS,
} from '../app/constants';
import {
  OPERATORS,
  PRICE_SOURCES,
  getOperatorLabel,
  validateTimeframeLimits,
  getAvailableReferenceTimeframes,
} from '../app/conditionDefaults';
import { INDICATORS, getIndicatorDisplayName } from '../app/indicators';

// Parameter configuration by indicator type (reused from IndicatorSettingsDialog)
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
  obv: [],
  volume_profile: [{ key: 'bins', label: 'Bins', min: 5, max: 100, defaultValue: 24 }],
};

/**
 * MultiTimeframeConditionDialog Component
 *
 * A dialog for adding conditions that reference indicators on different timeframes.
 * Allows selecting timeframe, indicator, parameters, and condition configuration.
 *
 * @param {boolean} isOpen - Whether the dialog is visible
 * @param {Function} onClose - Callback when dialog is closed
 * @param {Function} onAddCondition - Callback when condition is added (condition, referenceIndicator)
 * @param {string} currentTimeframe - The current chart timeframe (will be excluded)
 * @param {string} section - The section for the new condition
 * @param {Array} referenceIndicators - Current reference indicators (for limit validation)
 */
function MultiTimeframeConditionDialog({
  isOpen,
  onClose,
  onAddCondition,
  currentTimeframe,
  section,
  referenceIndicators = [],
}) {
  const dialogRef = useRef(null);

  // Form state
  const [selectedTimeframe, setSelectedTimeframe] = useState(null);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [indicatorParams, setIndicatorParams] = useState({});
  const [selectedOperator, setSelectedOperator] = useState('is_above');
  const [rightOperandType, setRightOperandType] = useState('value');
  const [rightOperandValue, setRightOperandValue] = useState(0);
  const [errors, setErrors] = useState({});

  // Get available timeframes (excluding current)
  const availableTimeframes = useMemo(() => {
    return getAvailableReferenceTimeframes(currentTimeframe);
  }, [currentTimeframe]);

  // Validate timeframe limit when selecting new timeframe
  const timeframeLimitValidation = useMemo(() => {
    if (!selectedTimeframe) return { isValid: true, errorMessage: null };
    return validateTimeframeLimits(referenceIndicators, selectedTimeframe);
  }, [selectedTimeframe, referenceIndicators]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTimeframe(null);
      setSelectedIndicator(null);
      setIndicatorParams({});
      setSelectedOperator('is_above');
      setRightOperandType('value');
      setRightOperandValue(0);
      setErrors({});
    }
  }, [isOpen]);

  // Update params when indicator changes
  useEffect(() => {
    if (selectedIndicator) {
      setIndicatorParams({ ...selectedIndicator.defaultParams });
    }
  }, [selectedIndicator]);

  // Handle timeframe selection
  const handleTimeframeSelect = useCallback((tf) => {
    setSelectedTimeframe(tf);
    setErrors(prev => ({ ...prev, timeframe: null }));
  }, []);

  // Handle indicator selection
  const handleIndicatorSelect = useCallback((indicator) => {
    setSelectedIndicator(indicator);
    setErrors(prev => ({ ...prev, indicator: null }));
  }, []);

  // Handle param change
  const handleParamChange = useCallback((key, value) => {
    setIndicatorParams(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0,
    }));
  }, []);

  // Handle operator change
  const handleOperatorChange = useCallback((operatorId) => {
    setSelectedOperator(operatorId);
  }, []);

  // Handle right operand type change
  const handleRightOperandTypeChange = useCallback((type) => {
    setRightOperandType(type);
    if (type === 'value') {
      setRightOperandValue(0);
    }
  }, []);

  // Handle right operand value change
  const handleRightOperandValueChange = useCallback((value) => {
    setRightOperandValue(parseFloat(value) || 0);
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!selectedTimeframe) {
      newErrors.timeframe = 'Please select a timeframe';
    } else if (!timeframeLimitValidation.isValid) {
      newErrors.timeframe = timeframeLimitValidation.errorMessage;
    }

    if (!selectedIndicator) {
      newErrors.indicator = 'Please select an indicator';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedTimeframe, selectedIndicator, timeframeLimitValidation]);

  // Handle add condition
  const handleAddCondition = useCallback(() => {
    if (!validateForm()) return;

    // Build the reference indicator object
    const referenceIndicator = {
      id: `ref-ind-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timeframe: selectedTimeframe,
      indicatorId: selectedIndicator.id,
      params: indicatorParams,
      color: selectedIndicator.color,
      name: selectedIndicator.name,
      shortName: selectedIndicator.shortName,
      components: selectedIndicator.components,
    };

    // Build display name
    const displayName = getIndicatorDisplayName(selectedIndicator, indicatorParams);

    // Build the condition object
    const condition = {
      id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      indicatorInstanceId: null,
      leftOperand: {
        type: 'referenceIndicator',
        referenceIndicatorId: referenceIndicator.id,
        timeframe: selectedTimeframe,
        component: null,
        label: displayName,
        color: selectedIndicator.color,
        indicatorId: selectedIndicator.id,
        isReferenceIndicator: true,
      },
      operator: selectedOperator,
      rightOperand: rightOperandType === 'value'
        ? {
            type: 'value',
            value: rightOperandValue,
            label: String(rightOperandValue),
          }
        : {
            type: 'price',
            value: rightOperandType,
            label: PRICE_SOURCES.find(p => p.id === rightOperandType)?.label || rightOperandType,
          },
      section: section,
      isMultiTimeframe: true,
      isNew: true,
    };

    // Call the callback
    if (onAddCondition) {
      onAddCondition(condition, referenceIndicator);
    }

    // Close dialog
    onClose();
  }, [
    validateForm,
    selectedTimeframe,
    selectedIndicator,
    indicatorParams,
    selectedOperator,
    rightOperandType,
    rightOperandValue,
    section,
    onAddCondition,
    onClose,
  ]);

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

  // Get param config for selected indicator
  const paramConfig = selectedIndicator
    ? INDICATOR_PARAM_CONFIG[selectedIndicator.id] || []
    : [];

  // Generate condition preview
  const conditionPreview = selectedTimeframe && selectedIndicator
    ? `[${selectedTimeframe}] ${getIndicatorDisplayName(selectedIndicator, indicatorParams)} ${getOperatorLabel(selectedOperator)} ${rightOperandType === 'value' ? rightOperandValue : PRICE_SOURCES.find(p => p.id === rightOperandType)?.label || rightOperandType}`
    : null;

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
                Add Multi-Timeframe Condition
              </h2>
              <p className="text-sm text-muted-foreground">
                {CONDITION_SECTION_LABELS[section]}
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
          {/* Performance Warning */}
          <div className={cn(
            "flex items-start gap-2 p-3 rounded-md",
            "bg-amber-500/10 border border-amber-500/20"
          )}>
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {MULTI_TIMEFRAME_WARNING_TEXT}
            </p>
          </div>

          {/* Step 1: Timeframe Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              1. Select Timeframe
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTimeframes.map(tf => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => handleTimeframeSelect(tf)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium",
                    "border transition-colors",
                    selectedTimeframe === tf
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-foreground hover:bg-muted"
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>
            {selectedTimeframe && (
              <p className="text-xs text-muted-foreground">
                {TIMEFRAME_LABELS[selectedTimeframe]}
              </p>
            )}
            {errors.timeframe && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.timeframe}
              </p>
            )}
          </div>

          {/* Step 2: Indicator Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              2. Select Indicator
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
              {INDICATORS.map(indicator => (
                <button
                  key={indicator.id}
                  type="button"
                  onClick={() => handleIndicatorSelect(indicator)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm",
                    "border transition-colors text-left",
                    selectedIndicator?.id === indicator.id
                      ? "bg-primary/10 border-primary text-foreground"
                      : "bg-background border-border text-foreground hover:bg-muted"
                  )}
                >
                  <Activity
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: indicator.color }}
                  />
                  <span className="truncate">{indicator.shortName}</span>
                </button>
              ))}
            </div>
            {errors.indicator && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.indicator}
              </p>
            )}
          </div>

          {/* Step 3: Indicator Parameters */}
          {selectedIndicator && paramConfig.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                3. Configure Parameters
              </label>
              <div className="grid grid-cols-2 gap-3">
                {paramConfig.map(param => (
                  <div key={param.key} className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      {param.label}
                    </label>
                    <input
                      type="number"
                      min={param.min}
                      max={param.max}
                      step={param.step || 1}
                      value={indicatorParams[param.key] || param.defaultValue}
                      onChange={(e) => handleParamChange(param.key, e.target.value)}
                      className={cn(
                        "w-full px-3 py-1.5 rounded-md text-sm",
                        "bg-background border border-border",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50"
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Condition Configuration */}
          {selectedIndicator && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                {paramConfig.length > 0 ? '4' : '3'}. Configure Condition
              </label>

              {/* Operator Selection */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Operator</label>
                <select
                  value={selectedOperator}
                  onChange={(e) => handleOperatorChange(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-md text-sm",
                    "bg-background border border-border",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50"
                  )}
                >
                  {OPERATORS.filter(op => op.id !== 'is_detected').map(op => (
                    <option key={op.id} value={op.id}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Right Operand Type */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Compare to</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRightOperandTypeChange('value')}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-md text-sm font-medium",
                      "border transition-colors",
                      rightOperandType === 'value'
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    )}
                  >
                    Custom Value
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRightOperandTypeChange('close')}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-md text-sm font-medium",
                      "border transition-colors",
                      rightOperandType !== 'value'
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    )}
                  >
                    Price
                  </button>
                </div>
              </div>

              {/* Value Input or Price Selector */}
              {rightOperandType === 'value' ? (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Value</label>
                  <input
                    type="number"
                    value={rightOperandValue}
                    onChange={(e) => handleRightOperandValueChange(e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 rounded-md text-sm",
                      "bg-background border border-border",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Price Source</label>
                  <select
                    value={rightOperandType}
                    onChange={(e) => handleRightOperandTypeChange(e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 rounded-md text-sm",
                      "bg-background border border-border",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                  >
                    {PRICE_SOURCES.map(source => (
                      <option key={source.id} value={source.id}>
                        {source.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Condition Preview */}
          {conditionPreview && (
            <div className="p-3 rounded-md bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Condition Preview</p>
              <p className="text-sm font-medium text-foreground">
                When {conditionPreview}
              </p>
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
            onClick={handleAddCondition}
            disabled={!selectedTimeframe || !selectedIndicator || !timeframeLimitValidation.isValid}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            <Check className="h-4 w-4" />
            Add Condition
          </button>
        </div>
      </div>
    </div>
  );
}

export default MultiTimeframeConditionDialog;
