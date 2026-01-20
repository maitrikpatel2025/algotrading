import React, { useMemo } from 'react';
import { cn } from '../lib/utils';
import { Clock, X } from 'lucide-react';
import { TIME_FILTER_MODES } from '../app/constants';
import { getTimeFilterSummary } from '../app/timeFilterUtils';

/**
 * TimeFilterBadge Component
 *
 * A compact pill/badge showing the active time filter summary.
 * Displays clock icon, summary text, and clear button.
 *
 * @param {Object} props
 * @param {Object} props.timeFilter - Time filter configuration
 * @param {Function} props.onEdit - Callback when badge is clicked (opens dialog)
 * @param {Function} props.onClear - Callback when clear button is clicked
 * @param {string} props.className - Additional CSS classes
 */
function TimeFilterBadge({
  timeFilter,
  onEdit,
  onClear,
  className,
}) {
  // Get summary text
  const summary = useMemo(() => {
    return getTimeFilterSummary(timeFilter);
  }, [timeFilter]);

  // Check if in exclude mode for styling
  const isExcludeMode = timeFilter?.mode === TIME_FILTER_MODES.EXCLUDE;

  // If no filter or not enabled, don't render
  if (!timeFilter || !timeFilter.enabled) {
    return null;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
        "text-sm font-medium cursor-pointer",
        "transition-all duration-200",
        "border",
        isExcludeMode
          ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
          : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20",
        className
      )}
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit?.();
        }
      }}
      title={`Time Filter: ${summary}. Click to edit.`}
    >
      {/* Clock icon */}
      <Clock className="h-4 w-4 flex-shrink-0" />

      {/* Summary text */}
      <span className="truncate max-w-[150px]">
        {summary}
      </span>

      {/* Clear button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClear?.();
        }}
        className={cn(
          "p-0.5 rounded-full",
          "hover:bg-black/10 dark:hover:bg-white/10",
          "transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-1",
          isExcludeMode
            ? "focus:ring-amber-500/50"
            : "focus:ring-primary/50"
        )}
        aria-label="Clear time filter"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default TimeFilterBadge;
