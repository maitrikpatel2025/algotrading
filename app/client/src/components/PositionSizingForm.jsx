import React from 'react';
import { cn } from '../lib/utils';

/**
 * PositionSizingForm Component
 *
 * Position sizing configuration form for backtests.
 * Supports fixed lot, fixed dollar, percentage, and risk-based sizing.
 */

const SIZING_METHODS = [
  { value: 'fixed_lot', label: 'Fixed Lot', unit: 'lots', placeholder: '0.1' },
  { value: 'fixed_dollar', label: 'Fixed Dollar', unit: '$', placeholder: '1000' },
  { value: 'percentage', label: 'Percentage', unit: '%', placeholder: '2' },
  { value: 'risk_based', label: 'Risk-based', unit: '% risk', placeholder: '1' },
];

const LEVERAGE_OPTIONS = [
  { value: 1, label: '1:1' },
  { value: 2, label: '1:2' },
  { value: 5, label: '1:5' },
  { value: 10, label: '1:10' },
  { value: 20, label: '1:20' },
  { value: 50, label: '1:50' },
  { value: 100, label: '1:100' },
  { value: 200, label: '1:200' },
  { value: 500, label: '1:500' },
];

function PositionSizingForm({ value, onChange, className }) {
  const {
    method = 'percentage',
    value: sizingValue = 2,
    leverage = 1,
    max_position_size = null,
    compound = true
  } = value || {};

  // Get current method config
  const currentMethod = SIZING_METHODS.find(m => m.value === method) || SIZING_METHODS[2];

  // Handle field changes
  const handleChange = (field, newValue) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-sm font-medium text-neutral-700">Position Sizing</h3>

      {/* Sizing Method */}
      <div>
        <label className="block text-xs text-neutral-500 mb-1.5">Sizing Method</label>
        <div className="grid grid-cols-2 gap-2">
          {SIZING_METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => handleChange('method', m.value)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors text-left",
                method === m.value
                  ? "bg-primary text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sizing Value */}
      <div>
        <label className="block text-xs text-neutral-500 mb-1.5">
          {currentMethod.label} Value
        </label>
        <div className="relative">
          <input
            type="number"
            value={sizingValue}
            onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
            placeholder={currentMethod.placeholder}
            min="0"
            step={method === 'fixed_lot' ? '0.01' : '1'}
            className="w-full px-3 py-2 pr-12 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
            {currentMethod.unit}
          </span>
        </div>
        <p className="mt-1 text-xs text-neutral-400">
          {method === 'percentage' && 'Percentage of account balance per trade'}
          {method === 'fixed_lot' && 'Fixed lot size for each trade'}
          {method === 'fixed_dollar' && 'Fixed dollar amount per trade'}
          {method === 'risk_based' && 'Percentage of account to risk per trade (based on stop loss)'}
        </p>
      </div>

      {/* Leverage */}
      <div>
        <label className="block text-xs text-neutral-500 mb-1.5">Leverage</label>
        <select
          value={leverage}
          onChange={(e) => handleChange('leverage', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {LEVERAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Max Position Size */}
      <div>
        <label className="block text-xs text-neutral-500 mb-1.5">
          Maximum Position Size (optional)
        </label>
        <div className="relative">
          <input
            type="number"
            value={max_position_size || ''}
            onChange={(e) => handleChange('max_position_size', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="No limit"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 pr-12 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
            lots
          </span>
        </div>
        <p className="mt-1 text-xs text-neutral-400">
          Cap the maximum position size regardless of sizing method
        </p>
      </div>

      {/* Compound Toggle */}
      <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-md">
        <div>
          <label className="text-sm font-medium text-neutral-700">Compound Profits</label>
          <p className="text-xs text-neutral-500">Reinvest profits into position sizing</p>
        </div>
        <button
          type="button"
          onClick={() => handleChange('compound', !compound)}
          className={cn(
            "relative w-12 h-6 rounded-full transition-colors",
            compound ? "bg-primary" : "bg-neutral-300"
          )}
        >
          <span
            className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
              compound ? "translate-x-7" : "translate-x-1"
            )}
          />
        </button>
      </div>

      {/* Summary */}
      <div className="p-3 bg-neutral-100 rounded-md text-sm text-neutral-600">
        <strong>Summary:</strong> Using {currentMethod.label.toLowerCase()} sizing at {sizingValue}{currentMethod.unit}
        {leverage > 1 && ` with ${leverage}:1 leverage`}
        {max_position_size && ` (max ${max_position_size} lots)`}
        {compound ? ', compounding profits' : ', fixed base'}
      </div>
    </div>
  );
}

export default PositionSizingForm;
