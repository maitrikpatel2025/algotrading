import React from 'react';
import { cn } from '../lib/utils';
import { Clock, Zap } from 'lucide-react';
import {
  CANDLE_CLOSE_CONFIRMATION,
  CANDLE_CLOSE_CONFIRMATION_TOOLTIP,
} from '../app/constants';

/**
 * CandleCloseToggle - Compact toggle for candle close confirmation setting
 *
 * @param {Object} props
 * @param {string} props.value - Current confirmation setting ('yes' or 'no')
 * @param {Function} props.onChange - Callback function when setting changes
 * @param {string} props.className - Additional CSS classes
 */
function CandleCloseToggle({ value, onChange, className }) {
  const isWaitMode = value === CANDLE_CLOSE_CONFIRMATION.YES;

  const handleToggle = () => {
    if (onChange) {
      onChange(isWaitMode ? CANDLE_CLOSE_CONFIRMATION.NO : CANDLE_CLOSE_CONFIRMATION.YES);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
        "border border-border hover:border-foreground/20",
        isWaitMode 
          ? "bg-primary/10 text-primary border-primary/30" 
          : "bg-muted text-muted-foreground",
        className
      )}
      title={CANDLE_CLOSE_CONFIRMATION_TOOLTIP}
      aria-pressed={isWaitMode}
    >
      {isWaitMode ? (
        <>
          <Clock className="h-3.5 w-3.5" />
          <span>Wait Close</span>
        </>
      ) : (
        <>
          <Zap className="h-3.5 w-3.5" />
          <span>Real-time</span>
        </>
      )}
    </button>
  );
}

export default CandleCloseToggle;
