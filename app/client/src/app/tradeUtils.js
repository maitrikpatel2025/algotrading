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
