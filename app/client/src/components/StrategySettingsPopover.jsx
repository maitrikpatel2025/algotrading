import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { Settings, TrendingUp, TrendingDown, ArrowLeftRight, Clock, Zap, X } from 'lucide-react';
import { TRADE_DIRECTIONS } from '../app/constants';
import { CANDLE_CLOSE_CONFIRMATION } from '../app/constants';

/**
 * StrategySettingsPopover - Popover for strategy settings
 * Contains Trade Direction and Candle Close confirmation settings
 */
function StrategySettingsPopover({
  tradeDirection,
  onTradeDirectionChange,
  candleCloseConfirmation,
  onCandleCloseChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const directionOptions = [
    { key: TRADE_DIRECTIONS.LONG, icon: TrendingUp, label: 'Long Only', color: 'text-success' },
    { key: TRADE_DIRECTIONS.SHORT, icon: TrendingDown, label: 'Short Only', color: 'text-destructive' },
    { key: TRADE_DIRECTIONS.BOTH, icon: ArrowLeftRight, label: 'Both', color: 'text-primary' },
  ];

  const currentDirection = directionOptions.find(d => d.key === tradeDirection);
  const DirectionIcon = currentDirection?.icon || ArrowLeftRight;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
          "hover:bg-muted",
          isOpen && "bg-muted"
        )}
        title="Strategy Settings"
      >
        <Settings className="h-4 w-4 text-muted-foreground" />
        <DirectionIcon className={cn("h-3.5 w-3.5", currentDirection?.color)} />
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground">Strategy Settings</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Trade Direction */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Trade Direction
              </label>
              <div className="mt-2 space-y-1">
                {directionOptions.map(({ key, icon: Icon, label, color }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onTradeDirectionChange(key)}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors",
                      tradeDirection === key
                        ? "bg-primary/10 text-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", tradeDirection === key && color)} />
                    <span>{label}</span>
                    {tradeDirection === key && (
                      <span className="ml-auto text-primary">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Candle Close Confirmation */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Signal Confirmation
              </label>
              <div className="mt-2 space-y-1">
                <button
                  type="button"
                  onClick={() => onCandleCloseChange(CANDLE_CLOSE_CONFIRMATION.YES)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors",
                    candleCloseConfirmation === CANDLE_CLOSE_CONFIRMATION.YES
                      ? "bg-primary/10 text-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Clock className="h-4 w-4" />
                  <div className="text-left">
                    <div>Wait for Candle Close</div>
                    <div className="text-xs text-muted-foreground">More reliable signals</div>
                  </div>
                  {candleCloseConfirmation === CANDLE_CLOSE_CONFIRMATION.YES && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onCandleCloseChange(CANDLE_CLOSE_CONFIRMATION.NO)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors",
                    candleCloseConfirmation === CANDLE_CLOSE_CONFIRMATION.NO
                      ? "bg-primary/10 text-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Zap className="h-4 w-4" />
                  <div className="text-left">
                    <div>Real-time</div>
                    <div className="text-xs text-muted-foreground">Faster entries</div>
                  </div>
                  {candleCloseConfirmation === CANDLE_CLOSE_CONFIRMATION.NO && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StrategySettingsPopover;
