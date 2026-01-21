import React from 'react';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import { TRADE_DIRECTIONS } from '../app/constants';

/**
 * TradeDirectionSelector - Compact segmented control for selecting trade direction
 *
 * @param {Object} props
 * @param {string} props.value - Current trade direction ('long', 'short', or 'both')
 * @param {Function} props.onChange - Callback function when direction changes
 * @param {string} props.className - Additional CSS classes
 */
function TradeDirectionSelector({ value, onChange, className }) {
  const directions = [
    { 
      key: TRADE_DIRECTIONS.LONG, 
      icon: TrendingUp, 
      label: 'Long',
      title: 'Long Only: Only enter buy positions'
    },
    { 
      key: TRADE_DIRECTIONS.SHORT, 
      icon: TrendingDown, 
      label: 'Short',
      title: 'Short Only: Only enter sell positions'
    },
    { 
      key: TRADE_DIRECTIONS.BOTH, 
      icon: ArrowLeftRight, 
      label: 'Both',
      title: 'Both: Enter buy and sell positions'
    },
  ];

  const handleClick = (direction) => {
    if (onChange && value !== direction) {
      onChange(direction);
    }
  };

  return (
    <div className={cn("flex items-center gap-1 p-1 bg-muted rounded-lg", className)}>
      {directions.map(({ key, icon: Icon, label, title }) => {
        const isActive = value === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => handleClick(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={isActive}
            title={title}
          >
            <Icon className={cn(
              "h-3.5 w-3.5",
              isActive && key === TRADE_DIRECTIONS.LONG && "text-success",
              isActive && key === TRADE_DIRECTIONS.SHORT && "text-destructive",
              isActive && key === TRADE_DIRECTIONS.BOTH && "text-primary"
            )} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default TradeDirectionSelector;
