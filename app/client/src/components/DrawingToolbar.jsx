import React from 'react';
import { cn } from '../lib/utils';
import { MousePointer2, Minus, TrendingUp, BarChart3, AlertTriangle } from 'lucide-react';
import {
  DRAWING_TOOLS,
  DRAWING_TOOL_LABELS,
  DRAWING_TOOL_HINTS,
  DRAWING_LIMITS,
  getDrawingCount,
  getDrawingLimitWarning,
} from '../app/drawingTypes';

// Tool icons mapping
const TOOL_ICONS = {
  [DRAWING_TOOLS.POINTER]: MousePointer2,
  [DRAWING_TOOLS.HORIZONTAL_LINE]: Minus,
  [DRAWING_TOOLS.TRENDLINE]: TrendingUp,
  [DRAWING_TOOLS.FIBONACCI]: BarChart3,
};

/**
 * DrawingToolbar Component
 *
 * Provides a toolbar for selecting chart drawing tools. Displays tool buttons
 * with keyboard shortcut hints and shows warnings when approaching limits.
 *
 * @param {string} activeTool - Currently selected drawing tool
 * @param {Function} onToolSelect - Callback when a tool is selected
 * @param {Array} drawings - Array of all drawings (for counting limits)
 * @param {boolean} disabled - Whether the toolbar is disabled (e.g., no price data)
 */
function DrawingToolbar({
  activeTool = DRAWING_TOOLS.POINTER,
  onToolSelect,
  drawings = [],
  disabled = false,
}) {
  // Calculate drawing counts for limit warnings
  const horizontalLineCount = getDrawingCount(drawings, DRAWING_TOOLS.HORIZONTAL_LINE);
  const trendlineCount = getDrawingCount(drawings, DRAWING_TOOLS.TRENDLINE);
  const fibonacciCount = getDrawingCount(drawings, DRAWING_TOOLS.FIBONACCI);

  // Check if limits are exceeded or approaching
  const horizontalLineAtLimit = horizontalLineCount >= DRAWING_LIMITS.MAX_HORIZONTAL_LINES;
  const trendlineAtLimit = trendlineCount >= DRAWING_LIMITS.MAX_TRENDLINES;
  const fibonacciAtLimit = fibonacciCount >= DRAWING_LIMITS.MAX_FIBONACCI;

  // Warning thresholds (show warning when 80% of limit reached)
  const horizontalLineWarning = horizontalLineCount >= DRAWING_LIMITS.MAX_HORIZONTAL_LINES * 0.8;
  const trendlineWarning = trendlineCount >= DRAWING_LIMITS.MAX_TRENDLINES * 0.8;
  const fibonacciWarning = fibonacciCount >= DRAWING_LIMITS.MAX_FIBONACCI * 0.8;

  const handleToolClick = (tool) => {
    if (disabled) return;

    // Don't allow selecting a tool if at limit
    if (tool === DRAWING_TOOLS.HORIZONTAL_LINE && horizontalLineAtLimit) {
      return;
    }
    if (tool === DRAWING_TOOLS.TRENDLINE && trendlineAtLimit) {
      return;
    }
    if (tool === DRAWING_TOOLS.FIBONACCI && fibonacciAtLimit) {
      return;
    }

    if (onToolSelect) {
      onToolSelect(tool);
    }
  };

  // Tool configuration with counts and warnings
  const tools = [
    {
      id: DRAWING_TOOLS.POINTER,
      label: DRAWING_TOOL_LABELS[DRAWING_TOOLS.POINTER],
      hint: DRAWING_TOOL_HINTS[DRAWING_TOOLS.POINTER],
      icon: TOOL_ICONS[DRAWING_TOOLS.POINTER],
      count: null,
      limit: null,
      warning: false,
      atLimit: false,
    },
    {
      id: DRAWING_TOOLS.HORIZONTAL_LINE,
      label: DRAWING_TOOL_LABELS[DRAWING_TOOLS.HORIZONTAL_LINE],
      hint: DRAWING_TOOL_HINTS[DRAWING_TOOLS.HORIZONTAL_LINE],
      icon: TOOL_ICONS[DRAWING_TOOLS.HORIZONTAL_LINE],
      count: horizontalLineCount,
      limit: DRAWING_LIMITS.MAX_HORIZONTAL_LINES,
      warning: horizontalLineWarning,
      atLimit: horizontalLineAtLimit,
    },
    {
      id: DRAWING_TOOLS.TRENDLINE,
      label: DRAWING_TOOL_LABELS[DRAWING_TOOLS.TRENDLINE],
      hint: DRAWING_TOOL_HINTS[DRAWING_TOOLS.TRENDLINE],
      icon: TOOL_ICONS[DRAWING_TOOLS.TRENDLINE],
      count: trendlineCount,
      limit: DRAWING_LIMITS.MAX_TRENDLINES,
      warning: trendlineWarning,
      atLimit: trendlineAtLimit,
    },
    {
      id: DRAWING_TOOLS.FIBONACCI,
      label: DRAWING_TOOL_LABELS[DRAWING_TOOLS.FIBONACCI],
      hint: DRAWING_TOOL_HINTS[DRAWING_TOOLS.FIBONACCI],
      icon: TOOL_ICONS[DRAWING_TOOLS.FIBONACCI],
      count: fibonacciCount,
      limit: DRAWING_LIMITS.MAX_FIBONACCI,
      warning: fibonacciWarning,
      atLimit: fibonacciAtLimit,
    },
  ];

  return (
    <div
      className="flex items-center gap-1 bg-muted/50 rounded-lg p-1"
      role="toolbar"
      aria-label="Drawing tools"
    >
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        const isDisabled = disabled || tool.atLimit;

        return (
          <div key={tool.id} className="relative">
            <button
              type="button"
              onClick={() => handleToolClick(tool.id)}
              disabled={isDisabled}
              className={cn(
                "relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
                isDisabled && "opacity-50 cursor-not-allowed",
                !isDisabled && !isActive && "hover:bg-muted/80"
              )}
              title={`${tool.label}${tool.hint ? ` (${tool.hint})` : ''}${tool.atLimit ? ` - ${getDrawingLimitWarning(tool.id)}` : ''}`}
              aria-pressed={isActive}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tool.label.replace(' Line', '').replace(' Retracement', '')}</span>
              {tool.hint && (
                <kbd
                  className={cn(
                    "hidden lg:inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 text-[10px] rounded",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tool.hint}
                </kbd>
              )}

              {/* Count badge for drawing types with limits */}
              {tool.count !== null && tool.count > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 text-[10px] rounded-full",
                    tool.atLimit
                      ? "bg-destructive text-destructive-foreground"
                      : tool.warning
                        ? "bg-amber-500 text-white"
                        : isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted-foreground/20 text-muted-foreground"
                  )}
                >
                  {tool.count}
                </span>
              )}

              {/* Warning indicator for approaching limit */}
              {tool.warning && !tool.atLimit && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-amber-500 rounded-full" />
              )}

              {/* At limit indicator */}
              {tool.atLimit && (
                <span className="absolute -top-1 -right-1">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default DrawingToolbar;
