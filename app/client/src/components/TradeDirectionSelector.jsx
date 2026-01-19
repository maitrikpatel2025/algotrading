import React from 'react';
import { cn } from '../lib/utils';
import { TRADE_DIRECTIONS, TRADE_DIRECTION_LABELS, TRADE_DIRECTION_ICONS } from '../app/constants';

/**
 * TradeDirectionSelector - Component for selecting trade direction (Long, Short, Both)
 *
 * @param {Object} props
 * @param {string} props.value - Current trade direction ('long', 'short', or 'both')
 * @param {Function} props.onChange - Callback function when direction changes
 * @param {string} props.className - Additional CSS classes
 */
function TradeDirectionSelector({ value, onChange, className }) {
  const directions = [
    { key: TRADE_DIRECTIONS.LONG, colorClass: 'success' },
    { key: TRADE_DIRECTIONS.SHORT, colorClass: 'destructive' },
    { key: TRADE_DIRECTIONS.BOTH, colorClass: 'primary' },
  ];

  const handleClick = (direction) => {
    if (onChange && value !== direction) {
      onChange(direction);
    }
  };

  const handleKeyDown = (e, direction) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(direction);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm font-medium text-muted-foreground">
        Trade Direction
      </label>
      <div className="flex gap-2 flex-wrap">
        {directions.map(({ key, colorClass }) => {
          const isActive = value === key;
          const icon = TRADE_DIRECTION_ICONS[key];
          const label = TRADE_DIRECTION_LABELS[key];

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleClick(key)}
              onKeyDown={(e) => handleKeyDown(e, key)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                "border-2 min-w-[110px] flex items-center justify-center gap-2",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                "hover:scale-105 active:scale-95",
                isActive ? [
                  // Active styles - match the color class
                  key === TRADE_DIRECTIONS.LONG && "bg-green-500 border-green-600 text-white focus:ring-green-500",
                  key === TRADE_DIRECTIONS.SHORT && "bg-red-500 border-red-600 text-white focus:ring-red-500",
                  key === TRADE_DIRECTIONS.BOTH && "bg-blue-500 border-blue-600 text-white focus:ring-blue-500",
                ] : [
                  // Inactive styles
                  "bg-background border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                  "focus:ring-primary",
                ]
              )}
              aria-label={`Select ${label} trade direction`}
              aria-pressed={isActive}
              title={getTitleForDirection(key)}
            >
              <span className="text-lg" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Get tooltip title for each trade direction
 */
function getTitleForDirection(direction) {
  const titles = {
    [TRADE_DIRECTIONS.LONG]: 'Long Only: Strategy will only enter buy positions (betting price goes up)',
    [TRADE_DIRECTIONS.SHORT]: 'Short Only: Strategy will only enter sell positions (betting price goes down)',
    [TRADE_DIRECTIONS.BOTH]: 'Both: Strategy can enter both buy and sell positions',
  };
  return titles[direction] || '';
}

export default TradeDirectionSelector;
