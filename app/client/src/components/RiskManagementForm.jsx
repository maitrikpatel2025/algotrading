import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * RiskManagementForm Component
 *
 * Comprehensive risk management configuration for backtests.
 * Includes stop loss, take profit, trailing stop, and partial closes.
 */

const STOP_LOSS_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'fixed_pips', label: 'Fixed Pips', unit: 'pips' },
  { value: 'fixed_dollar', label: 'Fixed Dollar', unit: '$' },
  { value: 'atr_based', label: 'ATR-based', unit: 'x ATR' },
  { value: 'percentage', label: 'Percentage', unit: '%' },
];

const TAKE_PROFIT_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'fixed_pips', label: 'Fixed Pips', unit: 'pips' },
  { value: 'fixed_dollar', label: 'Fixed Dollar', unit: '$' },
  { value: 'atr_based', label: 'ATR-based', unit: 'x ATR' },
  { value: 'percentage', label: 'Percentage', unit: '%' },
  { value: 'risk_reward', label: 'Risk:Reward', unit: ':1' },
];

const TRAILING_STOP_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'fixed_pips', label: 'Fixed Pips', unit: 'pips' },
  { value: 'atr_based', label: 'ATR-based', unit: 'x ATR' },
  { value: 'percentage', label: 'Percentage', unit: '%' },
  { value: 'break_even', label: 'Break-even Trigger', unit: 'pips profit' },
];

function RiskManagementForm({ value, onChange, className }) {
  const {
    stop_loss = { type: 'none', value: null },
    take_profit = { type: 'none', value: null },
    trailing_stop = { type: 'none', value: null, break_even_trigger: null },
    partial_closes = { enabled: false, levels: [] }
  } = value || {};

  // Handle nested field changes
  const handleStopLossChange = (field, newValue) => {
    onChange({
      ...value,
      stop_loss: {
        ...stop_loss,
        [field]: newValue
      }
    });
  };

  const handleTakeProfitChange = (field, newValue) => {
    onChange({
      ...value,
      take_profit: {
        ...take_profit,
        [field]: newValue
      }
    });
  };

  const handleTrailingStopChange = (field, newValue) => {
    onChange({
      ...value,
      trailing_stop: {
        ...trailing_stop,
        [field]: newValue
      }
    });
  };

  const handlePartialClosesChange = (field, newValue) => {
    onChange({
      ...value,
      partial_closes: {
        ...partial_closes,
        [field]: newValue
      }
    });
  };

  // Add partial close level
  const addPartialCloseLevel = () => {
    const newLevel = { target_pips: 20, close_percentage: 50 };
    handlePartialClosesChange('levels', [...partial_closes.levels, newLevel]);
  };

  // Remove partial close level
  const removePartialCloseLevel = (index) => {
    const newLevels = partial_closes.levels.filter((_, i) => i !== index);
    handlePartialClosesChange('levels', newLevels);
  };

  // Update partial close level
  const updatePartialCloseLevel = (index, field, newValue) => {
    const newLevels = partial_closes.levels.map((level, i) => {
      if (i === index) {
        return { ...level, [field]: newValue };
      }
      return level;
    });
    handlePartialClosesChange('levels', newLevels);
  };

  // Get unit for a type
  const getUnit = (types, type) => {
    const found = types.find(t => t.value === type);
    return found?.unit || '';
  };

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="text-sm font-medium text-neutral-700">Risk Management</h3>

      {/* Stop Loss */}
      <div className="p-4 bg-neutral-50 rounded-md space-y-3">
        <h4 className="text-sm font-medium text-neutral-900">Stop Loss</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Type</label>
            <select
              value={stop_loss.type}
              onChange={(e) => handleStopLossChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {STOP_LOSS_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {stop_loss.type !== 'none' && (
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Value</label>
              <div className="relative">
                <input
                  type="number"
                  value={stop_loss.value || ''}
                  onChange={(e) => handleStopLossChange('value', parseFloat(e.target.value) || null)}
                  placeholder="Enter value"
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 pr-12 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                  {getUnit(STOP_LOSS_TYPES, stop_loss.type)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Take Profit */}
      <div className="p-4 bg-neutral-50 rounded-md space-y-3">
        <h4 className="text-sm font-medium text-neutral-900">Take Profit</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Type</label>
            <select
              value={take_profit.type}
              onChange={(e) => handleTakeProfitChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {TAKE_PROFIT_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {take_profit.type !== 'none' && (
            <div>
              <label className="block text-xs text-neutral-500 mb-1">
                {take_profit.type === 'risk_reward' ? 'Ratio (e.g., 2 for 1:2)' : 'Value'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={take_profit.value || ''}
                  onChange={(e) => handleTakeProfitChange('value', parseFloat(e.target.value) || null)}
                  placeholder={take_profit.type === 'risk_reward' ? '2' : 'Enter value'}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 pr-12 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                  {getUnit(TAKE_PROFIT_TYPES, take_profit.type)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trailing Stop */}
      <div className="p-4 bg-neutral-50 rounded-md space-y-3">
        <h4 className="text-sm font-medium text-neutral-900">Trailing Stop</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Type</label>
            <select
              value={trailing_stop.type}
              onChange={(e) => handleTrailingStopChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {TRAILING_STOP_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {trailing_stop.type !== 'none' && (
            <div>
              <label className="block text-xs text-neutral-500 mb-1">
                {trailing_stop.type === 'break_even' ? 'Trigger (pips in profit)' : 'Distance'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={trailing_stop.value || ''}
                  onChange={(e) => handleTrailingStopChange('value', parseFloat(e.target.value) || null)}
                  placeholder="Enter value"
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 pr-16 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                  {getUnit(TRAILING_STOP_TYPES, trailing_stop.type)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Partial Closes */}
      <div className="p-4 bg-neutral-50 rounded-md space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-neutral-900">Partial Closes</h4>
          <button
            type="button"
            onClick={() => handlePartialClosesChange('enabled', !partial_closes.enabled)}
            className={cn(
              "relative w-10 h-5 rounded-full transition-colors",
              partial_closes.enabled ? "bg-primary" : "bg-neutral-300"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                partial_closes.enabled ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>

        {partial_closes.enabled && (
          <div className="space-y-3">
            <p className="text-xs text-neutral-500">
              Close portions of your position at different profit targets
            </p>

            {partial_closes.levels.map((level, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-white rounded border border-neutral-200">
                <div className="flex-1">
                  <label className="block text-xs text-neutral-500 mb-1">Target (pips)</label>
                  <input
                    type="number"
                    value={level.target_pips}
                    onChange={(e) => updatePartialCloseLevel(index, 'target_pips', parseFloat(e.target.value) || 0)}
                    min="1"
                    className="w-full px-2 py-1.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-neutral-500 mb-1">Close (%)</label>
                  <input
                    type="number"
                    value={level.close_percentage}
                    onChange={(e) => updatePartialCloseLevel(index, 'close_percentage', parseFloat(e.target.value) || 0)}
                    min="1"
                    max="100"
                    className="w-full px-2 py-1.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePartialCloseLevel(index)}
                  className="p-1.5 text-danger hover:bg-danger-light rounded transition-colors mt-4"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addPartialCloseLevel}
              className="w-full py-2 border-2 border-dashed border-neutral-300 rounded-md text-sm text-neutral-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Level
            </button>

            {partial_closes.levels.length > 0 && (
              <p className="text-xs text-neutral-400">
                Total to close: {partial_closes.levels.reduce((sum, l) => sum + l.close_percentage, 0)}%
                {partial_closes.levels.reduce((sum, l) => sum + l.close_percentage, 0) > 100 && (
                  <span className="text-danger ml-2">(exceeds 100%)</span>
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RiskManagementForm;
