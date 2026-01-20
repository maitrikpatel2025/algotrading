import React from 'react';
import { cn } from '../lib/utils';
import { TRADE_DIRECTION_ICONS } from '../app/constants';
import { BarChart3, Clock, Tag } from 'lucide-react';

/**
 * StrategyListItem Component
 *
 * A list item for displaying strategy information in the strategy browser.
 *
 * @param {Object} strategy - Strategy data object
 * @param {boolean} isSelected - Whether this item is currently selected
 * @param {Function} onClick - Click handler for selecting the item
 * @param {Function} onDoubleClick - Double-click handler for loading
 * @param {Function} onContextMenu - Right-click context menu handler
 * @param {boolean} showCheckbox - Whether to show multi-select checkbox
 * @param {boolean} isChecked - Whether the checkbox is checked
 * @param {Function} onCheckChange - Checkbox change handler
 */
function StrategyListItem({
  strategy,
  isSelected = false,
  onClick,
  onDoubleClick,
  onContextMenu,
  showCheckbox = false,
  isChecked = false,
  onCheckChange,
}) {
  const directionIcon = TRADE_DIRECTION_ICONS[strategy.trade_direction] || TRADE_DIRECTION_ICONS.both;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onCheckChange?.(!isChecked);
  };

  return (
    <div
      className={cn(
        "px-3 py-2.5 cursor-pointer border-b border-border last:border-b-0",
        "hover:bg-muted/50 transition-colors",
        isSelected && "bg-primary/10 border-l-2 border-l-primary",
        !isSelected && "border-l-2 border-l-transparent"
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      role="option"
      aria-selected={isSelected}
    >
      <div className="flex items-start gap-2">
        {/* Checkbox for multi-select */}
        {showCheckbox && (
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxClick}
              onClick={handleCheckboxClick}
              className={cn(
                "h-4 w-4 rounded border-input",
                "text-primary focus:ring-primary/50"
              )}
            />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Name and direction */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground truncate">
              {strategy.name}
            </span>
            <span
              className={cn(
                "text-xs font-mono px-1.5 py-0.5 rounded",
                strategy.trade_direction === 'long' && "bg-green-500/10 text-green-600",
                strategy.trade_direction === 'short' && "bg-red-500/10 text-red-600",
                strategy.trade_direction === 'both' && "bg-blue-500/10 text-blue-600"
              )}
              title={`Trade direction: ${strategy.trade_direction}`}
            >
              {directionIcon}
            </span>
          </div>

          {/* Description preview */}
          {strategy.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {strategy.description}
            </p>
          )}

          {/* Metadata row */}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            {/* Pair and timeframe */}
            {(strategy.pair || strategy.timeframe) && (
              <span className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                {strategy.pair?.replace('_', '/') || 'N/A'} / {strategy.timeframe || 'N/A'}
              </span>
            )}

            {/* Last modified */}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(strategy.updated_at)}
            </span>
          </div>

          {/* Counts badges */}
          <div className="flex items-center gap-1.5 mt-1.5">
            {strategy.indicator_count > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600">
                {strategy.indicator_count} ind
              </span>
            )}
            {strategy.condition_count > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600">
                {strategy.condition_count} cond
              </span>
            )}
            {strategy.pattern_count > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
                {strategy.pattern_count} pat
              </span>
            )}
            {strategy.drawing_count > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-600">
                {strategy.drawing_count} draw
              </span>
            )}
          </div>

          {/* Tags */}
          {strategy.tags && strategy.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground" />
              {strategy.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {strategy.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{strategy.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StrategyListItem;
