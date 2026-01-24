import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { X, Save, Play, Loader2 } from 'lucide-react';
import StrategySelector from './StrategySelector';
import DateRangePicker from './DateRangePicker';
import PositionSizingForm from './PositionSizingForm';
import RiskManagementForm from './RiskManagementForm';
import RiskPreviewChart from './RiskPreviewChart';

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
];

const DEFAULT_FORM_STATE = {
  name: '',
  description: '',
  strategy_id: null,
  strategy_name: null,
  pair: null,
  timeframe: null,
  start_date: '',
  end_date: '',
  initial_balance: 10000,
  currency: 'USD',
  position_sizing: {
    method: 'percentage',
    value: 2,
    leverage: 1,
    max_position_size: null,
    compound: true
  },
  risk_management: {
    stop_loss: { type: 'none', value: null },
    take_profit: { type: 'none', value: null },
    trailing_stop: { type: 'none', value: null, break_even_trigger: null },
    partial_closes: { enabled: false, levels: [] }
  }
};

/**
 * BacktestConfigurationDialog Component
 *
 * A modal dialog for configuring backtest settings.
 * Can be used for creating new backtests or editing existing ones.
 *
 * @param {boolean} isOpen - Whether the dialog is visible
 * @param {Function} onClose - Callback when dialog is closed/cancelled
 * @param {Function} onSave - Callback when Save Configuration is clicked
 * @param {Function} onSaveAndRun - Callback when Save & Run Backtest is clicked
 * @param {Object} editingBacktest - Backtest data for edit mode (null for new)
 * @param {Array} strategies - List of available strategies
 */
function BacktestConfigurationDialog({
  isOpen,
  onClose,
  onSave,
  onSaveAndRun,
  editingBacktest = null,
  strategies = []
}) {
  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);

  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const isEditMode = !!editingBacktest;

  // Initialize form data when dialog opens or editing backtest changes
  useEffect(() => {
    if (isOpen) {
      if (editingBacktest) {
        // Edit mode - populate with existing data
        setFormData({
          name: editingBacktest.name || '',
          description: editingBacktest.description || '',
          strategy_id: editingBacktest.strategy_id,
          strategy_name: editingBacktest.strategy_name,
          pair: editingBacktest.pair,
          timeframe: editingBacktest.timeframe,
          start_date: editingBacktest.start_date ? editingBacktest.start_date.split('T')[0] : '',
          end_date: editingBacktest.end_date ? editingBacktest.end_date.split('T')[0] : '',
          initial_balance: editingBacktest.initial_balance || 10000,
          currency: editingBacktest.currency || 'USD',
          position_sizing: editingBacktest.position_sizing || DEFAULT_FORM_STATE.position_sizing,
          risk_management: editingBacktest.risk_management || DEFAULT_FORM_STATE.risk_management
        });
      } else {
        // New mode - use defaults with date range
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 3);
        setFormData({
          ...DEFAULT_FORM_STATE,
          start_date: start.toISOString().split('T')[0],
          end_date: end.toISOString().split('T')[0]
        });
      }
      setErrors({});
    }
  }, [isOpen, editingBacktest]);

  // Focus management and keyboard handlers
  useEffect(() => {
    if (isOpen) {
      // Focus first input when dialog opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);

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

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Handle strategy selection
  const handleStrategyChange = (strategyData) => {
    setFormData(prev => ({
      ...prev,
      strategy_id: strategyData.strategy_id,
      strategy_name: strategyData.strategy_name,
      pair: strategyData.pair || prev.pair,
      timeframe: strategyData.timeframe || prev.timeframe
    }));
  };

  // Handle date range change
  const handleDateRangeChange = ({ startDate, endDate }) => {
    setFormData(prev => ({
      ...prev,
      start_date: startDate,
      end_date: endDate
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.start_date || !formData.end_date) {
      newErrors.dateRange = 'Date range is required';
    } else if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      newErrors.dateRange = 'Start date must be before end date';
    }

    if (formData.initial_balance < 100 || formData.initial_balance > 10000000) {
      newErrors.initial_balance = 'Balance must be between $100 and $10,000,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSaveClick = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const backtestData = {
        id: editingBacktest?.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        strategy_id: formData.strategy_id,
        pair: formData.pair,
        timeframe: formData.timeframe,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        initial_balance: parseFloat(formData.initial_balance),
        currency: formData.currency,
        position_sizing: formData.position_sizing,
        risk_management: formData.risk_management,
        status: 'pending'
      };

      await onSave(backtestData);
    } catch (error) {
      console.error('Error saving backtest:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle save and run
  const handleSaveAndRunClick = async () => {
    if (!validateForm()) return;

    if (!formData.strategy_id) {
      setErrors(prev => ({ ...prev, strategy: 'Please select a strategy' }));
      return;
    }

    setSaving(true);
    try {
      const backtestData = {
        id: editingBacktest?.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        strategy_id: formData.strategy_id,
        pair: formData.pair,
        timeframe: formData.timeframe,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        initial_balance: parseFloat(formData.initial_balance),
        currency: formData.currency,
        position_sizing: formData.position_sizing,
        risk_management: formData.risk_management,
        status: 'pending'
      };

      await onSaveAndRun(backtestData);
    } catch (error) {
      console.error('Error saving and running backtest:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backtest-config-dialog-title"
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
          "relative bg-card rounded-lg shadow-xl",
          "border border-border",
          "w-full max-w-5xl max-h-[90vh]",
          "flex flex-col",
          "animate-fade-in"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2
              id="backtest-config-dialog-title"
              className="text-xl font-semibold text-foreground"
            >
              {isEditMode ? 'Edit Backtest Configuration' : 'Configure Backtest'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEditMode ? 'Update your backtest settings' : 'Create a new backtest to validate your strategy'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "p-1.5 rounded-md",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-muted transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">Basic Information</h3>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter backtest name"
                  maxLength={100}
                  className={cn(
                    "w-full px-3 py-2 rounded-md",
                    "border bg-background",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "transition-shadow",
                    errors.name ? "border-destructive focus:ring-destructive/50" : "border-border"
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                  maxLength={500}
                  className={cn(
                    "w-full px-3 py-2 rounded-md resize-none",
                    "border border-border bg-background",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50"
                  )}
                />
              </div>
            </div>

            {/* Strategy Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">Strategy</h3>
              <StrategySelector
                value={formData.strategy_id}
                onChange={handleStrategyChange}
              />
              {errors.strategy && (
                <p className="text-xs text-destructive">{errors.strategy}</p>
              )}
            </div>

            {/* Date Range Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                Backtest Period <span className="text-destructive">*</span>
              </h3>
              <DateRangePicker
                startDate={formData.start_date}
                endDate={formData.end_date}
                onChange={handleDateRangeChange}
              />
              {errors.dateRange && (
                <p className="text-xs text-destructive">{errors.dateRange}</p>
              )}
            </div>

            {/* Account Settings Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">Account Settings</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    Initial Balance
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '£'}
                    </span>
                    <input
                      type="number"
                      value={formData.initial_balance}
                      onChange={(e) => handleChange('initial_balance', parseFloat(e.target.value) || 0)}
                      min={100}
                      max={10000000}
                      step={100}
                      className={cn(
                        "w-full pl-8 pr-3 py-2 rounded-md",
                        "border bg-background",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50",
                        errors.initial_balance ? "border-destructive" : "border-border"
                      )}
                    />
                  </div>
                  {errors.initial_balance && (
                    <p className="mt-1 text-xs text-destructive">{errors.initial_balance}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 rounded-md",
                      "border border-border bg-background",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.value} value={curr.value}>
                        {curr.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Position Sizing Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">Position Sizing</h3>
              <PositionSizingForm
                value={formData.position_sizing}
                onChange={(val) => handleChange('position_sizing', val)}
              />
            </div>

            {/* Risk Management Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">Risk Management</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RiskManagementForm
                  value={formData.risk_management}
                  onChange={(val) => handleChange('risk_management', val)}
                />
                <RiskPreviewChart
                  riskManagement={formData.risk_management}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              "bg-muted text-foreground",
              "hover:bg-muted/80 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={saving}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2"
            )}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Configuration
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleSaveAndRunClick}
            disabled={saving}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              "bg-green-600 text-white",
              "hover:bg-green-700 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-green-500/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2"
            )}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Save & Run Backtest
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BacktestConfigurationDialog;
