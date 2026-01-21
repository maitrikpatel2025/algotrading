/**
 * Time Filter Utilities
 *
 * Functions for evaluating time-based trading filters including
 * session times, custom windows, day of week, and timezone conversions.
 */

import {
  TRADING_SESSIONS,
  TIMEZONES,
  DAYS_OF_WEEK,
  TIME_FILTER_MODES,
} from './constants';

/**
 * Parse a time string in HH:MM format to hours and minutes
 * @param {string} timeStr - Time string in "HH:MM" format
 * @returns {Object|null} { hours, minutes } or null if invalid
 */
export function parseTimeString(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;

  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { hours, minutes };
}

/**
 * Format hours and minutes to HH:MM string
 * @param {number} hours - Hours (0-23)
 * @param {number} minutes - Minutes (0-59)
 * @returns {string} Time string in "HH:MM" format
 */
export function formatTimeString(hours, minutes = 0) {
  const h = Math.floor(hours) % 24;
  const m = Math.floor(minutes);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Get the current local timezone offset in hours
 * @returns {number} Timezone offset in hours (e.g., -5 for EST)
 */
export function getLocalTimezoneOffset() {
  // getTimezoneOffset returns minutes, negative for ahead of UTC
  return -new Date().getTimezoneOffset() / 60;
}

/**
 * Get the timezone offset for a timezone ID
 * @param {string} timezoneId - Timezone ID (UTC, EST, GMT, LOCAL)
 * @returns {number} Offset in hours
 */
export function getTimezoneOffset(timezoneId) {
  const tz = TIMEZONES[timezoneId] || TIMEZONES.UTC;
  if (tz.offset === null) {
    // LOCAL timezone
    return getLocalTimezoneOffset();
  }
  return tz.offset;
}

/**
 * Convert a Date to a specific timezone
 * @param {Date} date - Date object to convert
 * @param {string} timezoneId - Target timezone ID
 * @returns {Date} New Date object in the target timezone (as UTC representation)
 */
export function convertToTimezone(date, timezoneId) {
  const offset = getTimezoneOffset(timezoneId);
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  return new Date(utcTime + offset * 60 * 60 * 1000);
}

/**
 * Get current time in a specific timezone
 * @param {string} timezoneId - Timezone ID
 * @returns {Object} { hours, minutes, dayIndex } in the specified timezone
 */
export function getCurrentTimeInTimezone(timezoneId) {
  const now = new Date();
  const converted = convertToTimezone(now, timezoneId);
  return {
    hours: converted.getUTCHours(),
    minutes: converted.getUTCMinutes(),
    dayIndex: converted.getUTCDay(),
    date: converted,
  };
}

/**
 * Get session times adjusted for a specific timezone
 * @param {string} sessionId - Session ID (sydney, tokyo, london, new_york)
 * @param {string} timezoneId - Target timezone ID
 * @returns {Object|null} { startHour, endHour, name, color } or null if not found
 */
export function getSessionTimes(sessionId, timezoneId = 'UTC') {
  const sessionKey = sessionId.toUpperCase();
  const session = TRADING_SESSIONS[sessionKey];
  if (!session) return null;

  const offset = getTimezoneOffset(timezoneId);

  // Adjust hours for timezone
  let startHour = session.startHour + offset;
  let endHour = session.endHour + offset;

  // Normalize to 0-24+ range
  while (startHour < 0) startHour += 24;
  while (endHour < 0) endHour += 24;

  return {
    ...session,
    startHour,
    endHour,
  };
}

/**
 * Check if a time (in decimal hours) is within a time window
 * Handles windows that cross midnight (e.g., 22:00 to 06:00)
 * @param {number} timeDecimal - Time in decimal hours (e.g., 14.5 for 14:30)
 * @param {number} startHour - Window start hour
 * @param {number} endHour - Window end hour (can be > 24 for overnight)
 * @returns {boolean} True if time is within the window
 */
export function isTimeInWindow(timeDecimal, startHour, endHour) {
  // Normalize end hour for comparison
  const normalizedEnd = endHour > 24 ? endHour - 24 : endHour;
  const crossesMidnight = endHour > 24 || normalizedEnd < startHour;

  if (crossesMidnight) {
    // Window crosses midnight: check if time is after start OR before end
    return timeDecimal >= startHour || timeDecimal < normalizedEnd;
  }

  // Normal window: check if time is between start and end
  return timeDecimal >= startHour && timeDecimal < endHour;
}

/**
 * Check if current time is within any of the specified trading sessions
 * @param {number} timeDecimal - Time in decimal hours
 * @param {Array<string>} sessionIds - Array of session IDs to check
 * @param {string} timezoneId - Timezone for session times
 * @returns {Object} { isActive: boolean, activeSessions: string[] }
 */
export function isTimeInSessions(timeDecimal, sessionIds, timezoneId = 'UTC') {
  if (!sessionIds || sessionIds.length === 0) {
    return { isActive: false, activeSessions: [] };
  }

  const activeSessions = [];

  for (const sessionId of sessionIds) {
    const session = getSessionTimes(sessionId, timezoneId);
    if (session && isTimeInWindow(timeDecimal, session.startHour, session.endHour)) {
      activeSessions.push(sessionId);
    }
  }

  return {
    isActive: activeSessions.length > 0,
    activeSessions,
  };
}

/**
 * Check if current time is within any custom time window
 * @param {number} timeDecimal - Time in decimal hours
 * @param {Array<Object>} customWindows - Array of { start: "HH:MM", end: "HH:MM" }
 * @returns {Object} { isActive: boolean, activeWindows: Object[] }
 */
export function isTimeInCustomWindows(timeDecimal, customWindows) {
  if (!customWindows || customWindows.length === 0) {
    return { isActive: false, activeWindows: [] };
  }

  const activeWindows = [];

  for (const window of customWindows) {
    const start = parseTimeString(window.start);
    const end = parseTimeString(window.end);

    if (!start || !end) continue;

    const startDecimal = start.hours + start.minutes / 60;
    let endDecimal = end.hours + end.minutes / 60;

    // Handle overnight windows
    if (endDecimal <= startDecimal) {
      endDecimal += 24;
    }

    if (isTimeInWindow(timeDecimal, startDecimal, endDecimal)) {
      activeWindows.push(window);
    }
  }

  return {
    isActive: activeWindows.length > 0,
    activeWindows,
  };
}

/**
 * Check if the day of week is allowed
 * @param {number} dayIndex - Day of week (0 = Sunday, 6 = Saturday)
 * @param {Array<string>} allowedDays - Array of allowed day IDs
 * @returns {boolean} True if day is allowed
 */
export function isDayAllowed(dayIndex, allowedDays) {
  if (!allowedDays || allowedDays.length === 0) {
    return false; // No days means no trading
  }

  const dayInfo = DAYS_OF_WEEK.find(d => d.dayIndex === dayIndex);
  if (!dayInfo) return false;

  return allowedDays.includes(dayInfo.id);
}

/**
 * Main evaluation function for time filters
 * @param {Object} timeFilter - Time filter configuration
 * @param {Date} currentTime - Time to evaluate (defaults to now)
 * @returns {Object} Evaluation result
 */
export function evaluateTimeFilter(timeFilter, currentTime = new Date()) {
  // If filter is not enabled, always pass
  if (!timeFilter || !timeFilter.enabled) {
    return {
      passes: true,
      isActive: false,
      reason: 'Time filter not enabled',
    };
  }

  const { mode, sessions, customWindows, days, timezone } = timeFilter;

  // Get current time in the specified timezone
  const timeInfo = getCurrentTimeInTimezone(timezone);
  const timeDecimal = timeInfo.hours + timeInfo.minutes / 60;

  // Check day of week
  const dayAllowed = isDayAllowed(timeInfo.dayIndex, days);
  if (!dayAllowed) {
    const dayName = DAYS_OF_WEEK.find(d => d.dayIndex === timeInfo.dayIndex)?.label || 'Unknown';
    const result = {
      passes: mode === TIME_FILTER_MODES.EXCLUDE,
      isActive: true,
      reason: `${dayName} is not in allowed trading days`,
      dayBlocked: true,
      currentDay: dayName,
    };
    return result;
  }

  // Check sessions
  const sessionResult = isTimeInSessions(timeDecimal, sessions, timezone);

  // Check custom windows
  const windowResult = isTimeInCustomWindows(timeDecimal, customWindows);

  // Combined result: OR logic - any active session or window passes
  const isInTimeRange = sessionResult.isActive || windowResult.isActive;

  // If no sessions and no custom windows defined, consider it as "no time restriction"
  const noTimeRestrictions = (!sessions || sessions.length === 0) &&
                             (!customWindows || customWindows.length === 0);

  if (noTimeRestrictions) {
    return {
      passes: true,
      isActive: true,
      reason: 'No time restrictions defined (day filter only)',
      dayAllowed: true,
    };
  }

  // Apply mode logic
  let passes;
  let reason;

  if (mode === TIME_FILTER_MODES.INCLUDE) {
    // Include mode: pass if within time range
    passes = isInTimeRange;
    if (passes) {
      const activeNames = [
        ...sessionResult.activeSessions.map(id =>
          TRADING_SESSIONS[id.toUpperCase()]?.name || id
        ),
        ...windowResult.activeWindows.map(w => `${w.start}-${w.end}`),
      ];
      reason = `Within active period: ${activeNames.join(', ')}`;
    } else {
      reason = 'Outside of allowed trading hours';
    }
  } else {
    // Exclude mode: pass if NOT within time range
    passes = !isInTimeRange;
    if (passes) {
      reason = 'Outside of excluded blackout period';
    } else {
      const activeNames = [
        ...sessionResult.activeSessions.map(id =>
          TRADING_SESSIONS[id.toUpperCase()]?.name || id
        ),
        ...windowResult.activeWindows.map(w => `${w.start}-${w.end}`),
      ];
      reason = `Within excluded blackout period: ${activeNames.join(', ')}`;
    }
  }

  return {
    passes,
    isActive: true,
    reason,
    mode,
    timezone,
    currentTime: formatTimeString(timeInfo.hours, timeInfo.minutes),
    currentDay: DAYS_OF_WEEK.find(d => d.dayIndex === timeInfo.dayIndex)?.label,
    inSessions: sessionResult.activeSessions,
    inWindows: windowResult.activeWindows,
  };
}

/**
 * Get all active hours for timeline display (returns array of hour indices that are active)
 * @param {Object} timeFilter - Time filter configuration
 * @returns {Array<Object>} Array of { hour, isActive, sessionName }
 */
export function getActiveHoursForTimeline(timeFilter) {
  const hours = [];

  // If filter is not enabled or no time restrictions, all hours are potentially active
  if (!timeFilter || !timeFilter.enabled) {
    for (let i = 0; i < 24; i++) {
      hours.push({ hour: i, isActive: true, source: null });
    }
    return hours;
  }

  const { sessions, customWindows, timezone } = timeFilter;
  const noTimeRestrictions = (!sessions || sessions.length === 0) &&
                             (!customWindows || customWindows.length === 0);

  if (noTimeRestrictions) {
    for (let i = 0; i < 24; i++) {
      hours.push({ hour: i, isActive: true, source: null });
    }
    return hours;
  }

  // Check each hour
  for (let i = 0; i < 24; i++) {
    const timeDecimal = i + 0.5; // Check middle of hour

    // Check sessions
    const sessionResult = isTimeInSessions(timeDecimal, sessions, timezone);
    // Check custom windows
    const windowResult = isTimeInCustomWindows(timeDecimal, customWindows);

    const isActive = sessionResult.isActive || windowResult.isActive;
    const sources = [
      ...sessionResult.activeSessions.map(id =>
        TRADING_SESSIONS[id.toUpperCase()]?.name || id
      ),
      ...windowResult.activeWindows.map(w => `${w.start}-${w.end}`),
    ];

    hours.push({
      hour: i,
      isActive,
      source: sources.length > 0 ? sources.join(', ') : null,
    });
  }

  return hours;
}

/**
 * Get a summary text for the time filter configuration
 * @param {Object} timeFilter - Time filter configuration
 * @returns {string} Summary text (e.g., "London + NY" or "Mon-Thu, 09:00-17:00")
 */
export function getTimeFilterSummary(timeFilter) {
  if (!timeFilter || !timeFilter.enabled) {
    return 'No time filter';
  }

  const parts = [];

  // Add session names
  if (timeFilter.sessions && timeFilter.sessions.length > 0) {
    const sessionNames = timeFilter.sessions.map(id => {
      const session = TRADING_SESSIONS[id.toUpperCase()];
      return session ? session.name : id;
    });
    if (sessionNames.length <= 2) {
      parts.push(sessionNames.join(' + '));
    } else {
      parts.push(`${sessionNames.length} sessions`);
    }
  }

  // Add custom window count
  if (timeFilter.customWindows && timeFilter.customWindows.length > 0) {
    if (timeFilter.customWindows.length === 1) {
      const w = timeFilter.customWindows[0];
      parts.push(`${w.start}-${w.end}`);
    } else {
      parts.push(`${timeFilter.customWindows.length} windows`);
    }
  }

  // Add day info if not all weekdays
  const defaultDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const daysMatch = timeFilter.days &&
    timeFilter.days.length === defaultDays.length &&
    defaultDays.every(d => timeFilter.days.includes(d));

  if (!daysMatch && timeFilter.days) {
    if (timeFilter.days.length === 7) {
      parts.push('All days');
    } else if (timeFilter.days.length === 0) {
      parts.push('No days');
    } else {
      const dayShorts = timeFilter.days.map(id => {
        const day = DAYS_OF_WEEK.find(d => d.id === id);
        return day ? day.short : id;
      });
      parts.push(dayShorts.join('-'));
    }
  }

  if (parts.length === 0) {
    return timeFilter.mode === TIME_FILTER_MODES.EXCLUDE ? 'Exclude mode' : 'Day filter only';
  }

  const prefix = timeFilter.mode === TIME_FILTER_MODES.EXCLUDE ? '⊘ ' : '';
  return prefix + parts.join(', ');
}

/**
 * Validate a time filter configuration
 * @param {Object} timeFilter - Time filter to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateTimeFilter(timeFilter) {
  const errors = [];

  if (!timeFilter) {
    return { isValid: true, errors: [] }; // No filter is valid
  }

  // Validate days
  if (!timeFilter.days || timeFilter.days.length === 0) {
    errors.push('At least one trading day must be selected');
  }

  // Validate custom windows
  if (timeFilter.customWindows) {
    timeFilter.customWindows.forEach((window, index) => {
      const start = parseTimeString(window.start);
      const end = parseTimeString(window.end);

      if (!start) {
        errors.push(`Custom window ${index + 1}: Invalid start time "${window.start}"`);
      }
      if (!end) {
        errors.push(`Custom window ${index + 1}: Invalid end time "${window.end}"`);
      }
    });
  }

  // Validate timezone
  if (timeFilter.timezone && !TIMEZONES[timeFilter.timezone]) {
    errors.push(`Invalid timezone: ${timeFilter.timezone}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Convert frontend time filter structure to backend format
 * Converts sessions/customWindows arrays to single start_hour/end_hour fields
 * Converts day ID strings (monday, tuesday) to day indices (0-6)
 * @param {Object} timeFilter - Frontend time filter structure
 * @returns {Object|null} Backend time filter structure or null if disabled
 */
export function convertTimeFilterToBackend(timeFilter) {
  if (!timeFilter || !timeFilter.enabled) {
    return null;
  }

  // Convert days from string IDs to numeric indices (0=Sunday, 6=Saturday)
  let daysOfWeek = [];
  if (timeFilter.days && Array.isArray(timeFilter.days)) {
    daysOfWeek = timeFilter.days
      .map(dayId => {
        const day = DAYS_OF_WEEK.find(d => d.id === dayId);
        return day ? day.dayIndex : null;
      })
      .filter(idx => idx !== null);
  }

  // Calculate start_hour and end_hour from sessions and custom windows
  let startHour = null;
  let startMinute = null;
  let endHour = null;
  let endMinute = null;

  // Priority: use first custom window if available, otherwise use first session
  if (timeFilter.customWindows && timeFilter.customWindows.length > 0) {
    const firstWindow = timeFilter.customWindows[0];
    const start = parseTimeString(firstWindow.start);
    const end = parseTimeString(firstWindow.end);
    if (start && end) {
      startHour = start.hours;
      startMinute = start.minutes;
      endHour = end.hours;
      endMinute = end.minutes;
    }
  } else if (timeFilter.sessions && timeFilter.sessions.length > 0) {
    const firstSession = getSessionTimes(timeFilter.sessions[0], timeFilter.timezone || 'UTC');
    if (firstSession) {
      startHour = firstSession.startHour % 24;
      startMinute = 0;
      endHour = firstSession.endHour % 24;
      endMinute = 0;
    }
  }

  return {
    enabled: true,
    mode: timeFilter.mode || TIME_FILTER_MODES.INCLUDE,
    start_hour: startHour,
    start_minute: startMinute,
    end_hour: endHour,
    end_minute: endMinute,
    days_of_week: daysOfWeek,
    timezone: timeFilter.timezone || 'UTC',
  };
}

/**
 * Convert backend time filter structure to frontend format
 * Converts start_hour/end_hour to customWindows array
 * Converts day indices (0-6) to day ID strings (monday, tuesday)
 * @param {Object} backendTimeFilter - Backend time filter structure
 * @returns {Object} Frontend time filter structure
 */
export function convertTimeFilterFromBackend(backendTimeFilter) {
  if (!backendTimeFilter || !backendTimeFilter.enabled) {
    return {
      enabled: false,
      mode: TIME_FILTER_MODES.INCLUDE,
      sessions: [],
      customWindows: [],
      days: [],
      timezone: 'UTC',
    };
  }

  // Convert days_of_week from numeric indices to string IDs
  let days = [];
  if (backendTimeFilter.days_of_week && Array.isArray(backendTimeFilter.days_of_week)) {
    days = backendTimeFilter.days_of_week
      .map(dayIndex => {
        const day = DAYS_OF_WEEK.find(d => d.dayIndex === dayIndex);
        return day ? day.id : null;
      })
      .filter(id => id !== null);
  }

  // Convert start_hour/end_hour to customWindows array
  let customWindows = [];
  if (
    backendTimeFilter.start_hour !== null &&
    backendTimeFilter.start_hour !== undefined &&
    backendTimeFilter.end_hour !== null &&
    backendTimeFilter.end_hour !== undefined
  ) {
    const startTime = formatTimeString(
      backendTimeFilter.start_hour,
      backendTimeFilter.start_minute || 0
    );
    const endTime = formatTimeString(
      backendTimeFilter.end_hour,
      backendTimeFilter.end_minute || 0
    );
    customWindows = [{ start: startTime, end: endTime }];
  }

  return {
    enabled: true,
    mode: backendTimeFilter.mode || TIME_FILTER_MODES.INCLUDE,
    sessions: [], // Backend doesn't store session IDs, only times
    customWindows,
    days,
    timezone: backendTimeFilter.timezone || 'UTC',
  };
}
