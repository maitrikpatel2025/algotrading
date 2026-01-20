import React from 'react';
import { cn } from '../lib/utils';
import { Clock, Zap } from 'lucide-react';
import {
  CANDLE_CLOSE_CONFIRMATION,
  CANDLE_CLOSE_CONFIRMATION_LABELS,
  CANDLE_CLOSE_CONFIRMATION_TOOLTIP,
} from '../app/constants';

/**
 * CandleCloseToggle - Component for selecting candle close confirmation setting
 *
 * @param {Object} props
 * @param {string} props.value - Current confirmation setting ('yes' or 'no')
 * @param {Function} props.onChange - Callback function when setting changes
 * @param {string} props.className - Additional CSS classes
 */
function CandleCloseToggle({ value, onChange, className }) {
  const options = [
    {
      key: CANDLE_CLOSE_CONFIRMATION.YES,
      icon: Clock,
      colorClass: 'primary',
    },
    {
      key: CANDLE_CLOSE_CONFIRMATION.NO,
      icon: Zap,
      colorClass: 'amber',
    },
  ];

  const handleClick = (option) => {
    if (onChange && value !== option) {
      onChange(option);
    }
  };

  const handleKeyDown = (e, option) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(option);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        className="text-sm font-medium text-muted-foreground"
        title={CANDLE_CLOSE_CONFIRMATION_TOOLTIP}
      >
        Confirm on Candle Close
      </label>
      <div className="flex gap-2 flex-wrap">
        {options.map(({ key, icon: Icon, colorClass }) => {
          const isActive = value === key;
          const label = CANDLE_CLOSE_CONFIRMATION_LABELS[key];

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleClick(key)}
              onKeyDown={(e) => handleKeyDown(e, key)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                "border-2 min-w-[140px] flex items-center justify-center gap-2",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                "hover:scale-105 active:scale-95",
                isActive ? [
                  key === CANDLE_CLOSE_CONFIRMATION.YES && "bg-blue-500 border-blue-600 text-white focus:ring-blue-500",
                  key === CANDLE_CLOSE_CONFIRMATION.NO && "bg-amber-500 border-amber-600 text-white focus:ring-amber-500",
                ] : [
                  "bg-background border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                  "focus:ring-primary",
                ]
              )}
              aria-label={`Select ${label}`}
              aria-pressed={isActive}
              title={getTitleForOption(key)}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Get tooltip title for each option
 */
function getTitleForOption(option) {
  const titles = {
    [CANDLE_CLOSE_CONFIRMATION.YES]: 'Yes - Wait for candle close: Conditions only evaluate as true after the candle closes. Reduces false signals but may delay entries.',
    [CANDLE_CLOSE_CONFIRMATION.NO]: 'No - Real-time: Conditions evaluate on each tick as prices update. Faster entries but may result in more false signals.',
  };
  return titles[option] || '';
}

export default CandleCloseToggle;
