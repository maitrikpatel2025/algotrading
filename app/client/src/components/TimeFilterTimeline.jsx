import React, { useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  TRADING_SESSIONS,
  TIME_FILTER_MODES,
} from '../app/constants';
import {
  getActiveHoursForTimeline,
  getCurrentTimeInTimezone,
} from '../app/timeFilterUtils';

/**
 * TimeFilterTimeline Component
 *
 * Displays a visual 24-hour horizontal timeline showing active trading hours.
 * Highlights selected sessions and custom time windows.
 *
 * @param {Object} props
 * @param {Object} props.timeFilter - Time filter configuration
 * @param {string} props.timezone - Current timezone setting
 * @param {boolean} props.showCurrentTime - Whether to show current time indicator
 * @param {boolean} props.compact - Use compact layout for smaller spaces
 * @param {string} props.className - Additional CSS classes
 */
function TimeFilterTimeline({
  timeFilter,
  timezone = 'UTC',
  showCurrentTime = true,
  compact = false,
  className,
}) {
  // Get active hours for display
  const activeHours = useMemo(() => {
    return getActiveHoursForTimeline(timeFilter);
  }, [timeFilter]);

  // Get current time for indicator
  const currentTime = useMemo(() => {
    if (!showCurrentTime) return null;
    const timeInfo = getCurrentTimeInTimezone(timezone);
    return {
      ...timeInfo,
      position: ((timeInfo.hours + timeInfo.minutes / 60) / 24) * 100,
    };
  }, [showCurrentTime, timezone]);

  // Determine if in exclude mode
  const isExcludeMode = timeFilter?.mode === TIME_FILTER_MODES.EXCLUDE;

  // Hour labels (every 3 hours for compact, every 2 for full)
  const hourLabels = useMemo(() => {
    const step = compact ? 6 : 4;
    const labels = [];
    for (let i = 0; i < 24; i += step) {
      labels.push(i);
    }
    labels.push(24); // End label
    return labels;
  }, [compact]);

  return (
    <div className={cn("w-full", className)}>
      {/* Timeline Container */}
      <div className="relative">
        {/* Background track */}
        <div className={cn(
          "relative h-8 rounded-md overflow-hidden",
          "bg-muted border border-border"
        )}>
          {/* Hour segments */}
          <div className="absolute inset-0 flex">
            {activeHours.map((hourData, index) => {
              const isActive = hourData.isActive;
              const width = `${100 / 24}%`;

              // Determine color based on mode and active state
              let bgColor;
              if (isExcludeMode) {
                // Exclude mode: active hours are blocked (red/amber), inactive are allowed
                bgColor = isActive
                  ? 'bg-amber-500/40 hover:bg-amber-500/60'
                  : 'bg-success/20 hover:bg-success/30';
              } else {
                // Include mode: active hours are allowed (green), inactive are blocked
                bgColor = isActive
                  ? 'bg-primary/40 hover:bg-primary/60'
                  : 'bg-muted-foreground/10 hover:bg-muted-foreground/20';
              }

              return (
                <div
                  key={index}
                  className={cn(
                    "h-full transition-colors cursor-default",
                    bgColor,
                    index > 0 && "border-l border-border/30"
                  )}
                  style={{ width }}
                  title={hourData.source
                    ? `${String(hourData.hour).padStart(2, '0')}:00 - ${hourData.source}`
                    : `${String(hourData.hour).padStart(2, '0')}:00`
                  }
                />
              );
            })}
          </div>

          {/* Session labels (overlay) */}
          {timeFilter?.sessions && timeFilter.sessions.length > 0 && !compact && (
            <div className="absolute inset-0 pointer-events-none">
              {timeFilter.sessions.map(sessionId => {
                const session = TRADING_SESSIONS[sessionId.toUpperCase()];
                if (!session) return null;

                // Calculate position (adjust for sessions crossing midnight)
                let startHour = session.startHour;
                let endHour = session.endHour > 24 ? session.endHour - 24 : session.endHour;
                const startPos = (startHour / 24) * 100;
                const duration = endHour > startHour
                  ? endHour - startHour
                  : (24 - startHour) + endHour;
                const widthPercent = (duration / 24) * 100;

                return (
                  <div
                    key={sessionId}
                    className="absolute top-0 h-full flex items-center justify-center"
                    style={{
                      left: `${startPos}%`,
                      width: `${Math.min(widthPercent, 100 - startPos)}%`,
                    }}
                  >
                    <span
                      className="text-[10px] font-medium px-1 py-0.5 rounded truncate max-w-full"
                      style={{
                        backgroundColor: `${session.color}30`,
                        color: session.color,
                      }}
                    >
                      {session.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Current time indicator */}
          {currentTime && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10"
              style={{ left: `${currentTime.position}%` }}
              title={`Current time: ${String(currentTime.hours).padStart(2, '0')}:${String(currentTime.minutes).padStart(2, '0')}`}
            >
              {/* Triangle indicator */}
              <div className="absolute -top-1 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-destructive" />
            </div>
          )}
        </div>

        {/* Hour labels */}
        <div className="relative mt-1 flex justify-between text-[10px] text-muted-foreground">
          {hourLabels.map(hour => (
            <span
              key={hour}
              className="tabular-nums"
              style={{
                position: 'absolute',
                left: `${(hour / 24) * 100}%`,
                transform: hour === 24 ? 'translateX(-100%)' : 'translateX(-50%)',
              }}
            >
              {hour === 24 ? '24' : String(hour).padStart(2, '0')}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      {!compact && (
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "w-3 h-3 rounded",
              isExcludeMode ? "bg-success/30" : "bg-primary/40"
            )} />
            <span>{isExcludeMode ? 'Trading allowed' : 'Active hours'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "w-3 h-3 rounded",
              isExcludeMode ? "bg-amber-500/40" : "bg-muted-foreground/10"
            )} />
            <span>{isExcludeMode ? 'Blackout period' : 'Inactive hours'}</span>
          </div>
          {showCurrentTime && (
            <div className="flex items-center gap-1.5">
              <div className="w-0.5 h-3 bg-destructive" />
              <span>Current time</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TimeFilterTimeline;
