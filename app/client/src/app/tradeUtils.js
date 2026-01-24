/**
 * Trade Utility Functions
 *
 * Utilities for processing, filtering, sorting, and exporting trade data
 * from backtest results.
 */

/**
 * Format trade duration from entry and exit timestamps to human-readable format
 * @param {string} entryTime - ISO 8601 entry timestamp
 * @param {string} exitTime - ISO 8601 exit timestamp
 * @returns {string} Formatted duration (e.g., "2h 15m", "3d 4h", "< 1m")
 */
export function formatTradeDuration(entryTime, exitTime) {
  if (!entryTime || !exitTime) return 'N/A';

  try {
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const durationMs = exit - entry;

    if (durationMs < 0) return 'Invalid';

    const minutes = Math.floor(durationMs / 60000);

    // Less than 1 minute
    if (minutes < 1) return '< 1m';

    // Less than 1 hour
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    // Less than 1 day
    if (hours < 24) {
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }

    // Days and hours
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  } catch (error) {
    return 'Invalid';
  }
}

/**
 * Format exit reason from snake_case to Title Case
 * @param {string} reason - Exit reason in snake_case (e.g., "stop_loss")
 * @returns {string} Formatted exit reason (e.g., "Stop Loss")
 */
export function formatExitReason(reason) {
  if (!reason) return 'N/A';

  // Convert snake_case to Title Case
  return reason
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Calculate trade P/L as a percentage
 * @param {number} pnl - Profit/loss in dollars
 * @param {number} entryPrice - Entry price
 * @param {number} size - Position size
 * @returns {number} P/L percentage
 */
export function calculateTradePnlPercent(pnl, entryPrice, size) {
  if (!entryPrice || !size || size === 0) return 0;

  const investment = entryPrice * size;
  if (investment === 0) return 0;

  return (pnl / investment) * 100;
}

/**
 * Filter trades based on provided filter criteria
 * @param {Array} trades - Array of trade objects
 * @param {Object} filters - Filter criteria
 * @param {string} filters.outcome - 'all' | 'winners' | 'losers'
 * @param {string} filters.direction - 'both' | 'long' | 'short'
 * @param {string} filters.startDate - ISO date string for start of range
 * @param {string} filters.endDate - ISO date string for end of range
 * @returns {Array} Filtered trades
 */
export function filterTrades(trades, filters = {}) {
  if (!trades || !Array.isArray(trades)) return [];

  const {
    outcome = 'all',
    direction = 'both',
    startDate = null,
    endDate = null,
  } = filters;

  return trades.filter(trade => {
    // Filter by outcome (winner/loser)
    if (outcome === 'winners' && trade.pnl <= 0) return false;
    if (outcome === 'losers' && trade.pnl >= 0) return false;

    // Filter by direction (long/short)
    if (direction === 'long' && trade.type !== 'long') return false;
    if (direction === 'short' && trade.type !== 'short') return false;

    // Filter by date range
    if (startDate) {
      const tradeDate = new Date(trade.entry_time);
      const filterStart = new Date(startDate);
      if (tradeDate < filterStart) return false;
    }

    if (endDate) {
      const tradeDate = new Date(trade.entry_time);
      const filterEnd = new Date(endDate);
      // Set end date to end of day
      filterEnd.setHours(23, 59, 59, 999);
      if (tradeDate > filterEnd) return false;
    }

    return true;
  });
}

/**
 * Sort trades by specified column and direction
 * @param {Array} trades - Array of trade objects
 * @param {string} sortColumn - Column name to sort by
 * @param {string} sortDirection - 'asc' | 'desc'
 * @returns {Array} Sorted trades (new array)
 */
export function sortTrades(trades, sortColumn, sortDirection = 'asc') {
  if (!trades || !Array.isArray(trades)) return [];
  if (!sortColumn) return [...trades];

  const sorted = [...trades];
  const multiplier = sortDirection === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    let aVal, bVal;

    switch (sortColumn) {
      case 'number':
        // Trade number is based on array index
        aVal = trades.indexOf(a);
        bVal = trades.indexOf(b);
        break;

      case 'entry_date':
        aVal = new Date(a.entry_time);
        bVal = new Date(b.entry_time);
        break;

      case 'exit_date':
        aVal = new Date(a.exit_time);
        bVal = new Date(b.exit_time);
        break;

      case 'direction':
        aVal = a.type || '';
        bVal = b.type || '';
        break;

      case 'entry_price':
        aVal = a.entry_price || 0;
        bVal = b.entry_price || 0;
        break;

      case 'exit_price':
        aVal = a.exit_price || 0;
        bVal = b.exit_price || 0;
        break;

      case 'size':
        aVal = a.size || 0;
        bVal = b.size || 0;
        break;

      case 'pnl':
        aVal = a.pnl || 0;
        bVal = b.pnl || 0;
        break;

      case 'pnl_percent':
        aVal = calculateTradePnlPercent(a.pnl, a.entry_price, a.size);
        bVal = calculateTradePnlPercent(b.pnl, b.entry_price, b.size);
        break;

      case 'duration':
        aVal = new Date(a.exit_time) - new Date(a.entry_time);
        bVal = new Date(b.exit_time) - new Date(b.entry_time);
        break;

      case 'exit_reason':
        aVal = a.exit_reason || '';
        bVal = b.exit_reason || '';
        break;

      default:
        return 0;
    }

    // Handle comparison
    if (aVal < bVal) return -1 * multiplier;
    if (aVal > bVal) return 1 * multiplier;
    return 0;
  });

  return sorted;
}

/**
 * Paginate trades array
 * @param {Array} trades - Array of trade objects
 * @param {number} page - Current page (1-indexed)
 * @param {number} pageSize - Number of trades per page (0 = all)
 * @returns {Array} Trades for current page
 */
export function paginateTrades(trades, page = 1, pageSize = 50) {
  if (!trades || !Array.isArray(trades)) return [];
  if (pageSize === 0 || pageSize >= trades.length) return trades;

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return trades.slice(startIndex, endIndex);
}

/**
 * Export trades to CSV format and trigger download
 * @param {Array} trades - Array of trade objects
 * @param {string} backtestName - Name for the CSV file
 */
export function exportTradesToCSV(trades, backtestName = 'backtest') {
  if (!trades || !Array.isArray(trades) || trades.length === 0) {
    console.warn('No trades to export');
    return;
  }

  // CSV headers
  const headers = [
    'Trade #',
    'Entry Date',
    'Exit Date',
    'Direction',
    'Entry Price',
    'Exit Price',
    'Size',
    'P/L ($)',
    'P/L (%)',
    'Duration',
    'Exit Reason'
  ];

  // Build CSV rows
  const rows = trades.map((trade, index) => {
    const pnlPercent = calculateTradePnlPercent(trade.pnl, trade.entry_price, trade.size);

    return [
      index + 1,
      formatDateForCSV(trade.entry_time),
      formatDateForCSV(trade.exit_time),
      trade.type ? trade.type.charAt(0).toUpperCase() + trade.type.slice(1) : 'N/A',
      trade.entry_price?.toFixed(5) || '0',
      trade.exit_price?.toFixed(5) || '0',
      trade.size || '0',
      trade.pnl?.toFixed(2) || '0',
      pnlPercent.toFixed(2),
      formatTradeDuration(trade.entry_time, trade.exit_time),
      formatExitReason(trade.exit_reason)
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => escapeCSVCell(cell)).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizeFilename(backtestName)}_trades.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Format date for CSV export
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDateForCSV(dateString) {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Escape special characters in CSV cells
 * @param {string|number} cell - Cell value
 * @returns {string} Escaped cell value
 */
function escapeCSVCell(cell) {
  if (cell === null || cell === undefined) return '';

  const cellStr = String(cell);

  // If cell contains comma, quote, or newline, wrap in quotes and escape quotes
  if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
    return `"${cellStr.replace(/"/g, '""')}"`;
  }

  return cellStr;
}

/**
 * Sanitize filename for safe file downloads
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 50);
}

/**
 * Calculate total pages for pagination
 * @param {number} totalTrades - Total number of trades
 * @param {number} pageSize - Trades per page
 * @returns {number} Total pages
 */
export function calculateTotalPages(totalTrades, pageSize) {
  if (pageSize === 0 || totalTrades === 0) return 1;
  return Math.ceil(totalTrades / pageSize);
}

/**
 * Find the closest time index in chart data for a target timestamp
 * Used to map trade timestamps to chart candle indices for marker placement
 * @param {Array} chartTimes - Array of chart timestamps (Unix seconds or ISO strings)
 * @param {string} targetTime - ISO date string target time
 * @returns {number} Index of closest time in array, or -1 if no valid match
 */
export function findClosestTimeIndex(chartTimes, targetTime) {
  if (!chartTimes || !Array.isArray(chartTimes) || chartTimes.length === 0) {
    return -1;
  }

  if (!targetTime) {
    return -1;
  }

  try {
    // Convert target to Unix timestamp (seconds)
    const targetTimestamp = new Date(targetTime).getTime() / 1000;

    if (isNaN(targetTimestamp)) {
      return -1;
    }

    let closestIndex = -1;
    let smallestDiff = Infinity;

    for (let i = 0; i < chartTimes.length; i++) {
      const chartTime = chartTimes[i];

      // Convert chart time to Unix timestamp if it's not already
      let chartTimestamp;
      if (typeof chartTime === 'string') {
        chartTimestamp = new Date(chartTime).getTime() / 1000;
      } else if (typeof chartTime === 'object' && chartTime.time !== undefined) {
        // Handle lightweight-charts data format {time: ..., value: ...}
        chartTimestamp = typeof chartTime.time === 'string'
          ? new Date(chartTime.time).getTime() / 1000
          : chartTime.time;
      } else {
        // Assume it's already a Unix timestamp
        chartTimestamp = chartTime;
      }

      const diff = Math.abs(chartTimestamp - targetTimestamp);

      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestIndex = i;
      }
    }

    // Only return index if within reasonable threshold (1 day = 86400 seconds)
    // This prevents matching to times that are too far away
    const MAX_THRESHOLD = 86400;
    if (smallestDiff <= MAX_THRESHOLD) {
      return closestIndex;
    }

    return -1;
  } catch (error) {
    console.warn('findClosestTimeIndex error:', error);
    return -1;
  }
}

/**
 * Day of week names array (Monday = 0, Sunday = 6)
 */
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Short day of week names
 */
const DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Get day name from day index (0-6)
 * @param {number} dayIndex - Day of week (0=Monday, 6=Sunday)
 * @param {boolean} short - Use short format
 * @returns {string} Day name
 */
export function getDayName(dayIndex, short = false) {
  if (dayIndex < 0 || dayIndex > 6) return 'Unknown';
  return short ? DAY_NAMES_SHORT[dayIndex] : DAY_NAMES[dayIndex];
}

/**
 * Format month string (YYYY-MM) to readable format
 * @param {string} monthStr - Month string in YYYY-MM format
 * @returns {string} Formatted month (e.g., "Jan 2024")
 */
export function formatMonthLabel(monthStr) {
  if (!monthStr || typeof monthStr !== 'string') return 'N/A';

  try {
    const [year, month] = monthStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = parseInt(month, 10) - 1;

    if (monthIndex < 0 || monthIndex > 11) return monthStr;

    return `${monthNames[monthIndex]} ${year}`;
  } catch (error) {
    return monthStr;
  }
}

/**
 * Get color for P/L value based on min/max range
 * Returns HSL color string with green for profit, red for loss
 * @param {number} pnl - Profit/loss value
 * @param {number} minPnl - Minimum P/L in dataset
 * @param {number} maxPnl - Maximum P/L in dataset
 * @param {number} opacity - Color opacity (0-1)
 * @returns {string} HSL color string
 */
export function getColorForPnL(pnl, minPnl, maxPnl, opacity = 1) {
  // Handle edge cases
  if (minPnl === maxPnl) {
    if (pnl > 0) return `hsla(142, 71%, 45%, ${opacity})`; // Green
    if (pnl < 0) return `hsla(0, 84%, 60%, ${opacity})`; // Red
    return `hsla(220, 9%, 46%, ${opacity})`; // Neutral gray
  }

  if (pnl === 0) {
    return `hsla(220, 9%, 46%, ${opacity})`; // Neutral gray
  }

  // Calculate intensity based on position in range
  if (pnl > 0) {
    // Green range: hue 142 (green), saturation and lightness based on intensity
    const intensity = maxPnl > 0 ? Math.min(pnl / maxPnl, 1) : 0;
    const saturation = 50 + intensity * 21; // 50-71%
    const lightness = 60 - intensity * 15; // 60-45%
    return `hsla(142, ${saturation}%, ${lightness}%, ${opacity})`;
  } else {
    // Red range: hue 0 (red), saturation and lightness based on intensity
    const intensity = minPnl < 0 ? Math.min(Math.abs(pnl) / Math.abs(minPnl), 1) : 0;
    const saturation = 60 + intensity * 24; // 60-84%
    const lightness = 70 - intensity * 10; // 70-60%
    return `hsla(0, ${saturation}%, ${lightness}%, ${opacity})`;
  }
}

/**
 * Get CSS class for P/L value highlighting
 * @param {number} pnl - Profit/loss value
 * @returns {string} CSS class name
 */
export function getPnLColorClass(pnl) {
  if (pnl > 0) return 'text-green-500';
  if (pnl < 0) return 'text-red-500';
  return 'text-gray-500';
}

/**
 * Export time period breakdown data to CSV
 * @param {Array} monthlyData - Monthly performance data
 * @param {Array} dayOfWeekData - Day of week performance data
 * @param {Array} hourlyData - Hourly performance data
 * @param {string} backtestName - Name for the CSV file
 */
export function exportTimePeriodDataToCSV(monthlyData, dayOfWeekData, hourlyData, backtestName = 'backtest') {
  const lines = [];

  // Monthly section
  lines.push('TIME PERIOD ANALYSIS - MONTHLY');
  lines.push('Month,# Trades,Win Rate (%),Net P/L ($),Is Best,Is Worst');

  if (monthlyData && Array.isArray(monthlyData)) {
    monthlyData.forEach(row => {
      lines.push([
        formatMonthLabel(row.month),
        row.trades,
        row.win_rate.toFixed(1),
        row.net_pnl.toFixed(2),
        row.is_best ? 'Yes' : 'No',
        row.is_worst ? 'Yes' : 'No'
      ].map(cell => escapeCSVCellInternal(cell)).join(','));
    });
  }

  lines.push(''); // Empty line separator

  // Day of week section
  lines.push('TIME PERIOD ANALYSIS - DAY OF WEEK');
  lines.push('Day,Day Name,# Trades,Win Rate (%),Net P/L ($),Is Best,Is Worst');

  if (dayOfWeekData && Array.isArray(dayOfWeekData)) {
    dayOfWeekData.forEach(row => {
      lines.push([
        row.day,
        row.day_name,
        row.trades,
        row.win_rate.toFixed(1),
        row.net_pnl.toFixed(2),
        row.is_best ? 'Yes' : 'No',
        row.is_worst ? 'Yes' : 'No'
      ].map(cell => escapeCSVCellInternal(cell)).join(','));
    });
  }

  lines.push(''); // Empty line separator

  // Hourly section
  lines.push('TIME PERIOD ANALYSIS - HOURLY');
  lines.push('Hour,# Trades,Win Rate (%),Net P/L ($),Is Best,Is Worst');

  if (hourlyData && Array.isArray(hourlyData)) {
    hourlyData.forEach(row => {
      lines.push([
        `${row.hour}:00`,
        row.trades,
        row.win_rate.toFixed(1),
        row.net_pnl.toFixed(2),
        row.is_best ? 'Yes' : 'No',
        row.is_worst ? 'Yes' : 'No'
      ].map(cell => escapeCSVCellInternal(cell)).join(','));
    });
  }

  const csvContent = lines.join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizeFilenameInternal(backtestName)}_time_period_analysis.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Internal CSV cell escape function
 * @param {string|number} cell - Cell value
 * @returns {string} Escaped cell value
 */
function escapeCSVCellInternal(cell) {
  if (cell === null || cell === undefined) return '';

  const cellStr = String(cell);

  if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
    return `"${cellStr.replace(/"/g, '""')}"`;
  }

  return cellStr;
}

/**
 * Internal filename sanitization function
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilenameInternal(filename) {
  return filename
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 50);
}

/**
 * Format hour for display (24-hour format with padding)
 * @param {number} hour - Hour (0-23)
 * @returns {string} Formatted hour (e.g., "09:00")
 */
export function formatHour(hour) {
  if (hour < 0 || hour > 23) return 'N/A';
  return `${hour.toString().padStart(2, '0')}:00`;
}

/**
 * Calculate min and max P/L from a dataset
 * @param {Array} data - Array of objects with net_pnl field
 * @returns {Object} {minPnl, maxPnl}
 */
export function calculatePnLRange(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { minPnl: 0, maxPnl: 0 };
  }

  const pnlValues = data
    .filter(item => item && typeof item.net_pnl === 'number')
    .map(item => item.net_pnl);

  if (pnlValues.length === 0) {
    return { minPnl: 0, maxPnl: 0 };
  }

  return {
    minPnl: Math.min(...pnlValues),
    maxPnl: Math.max(...pnlValues)
  };
}
