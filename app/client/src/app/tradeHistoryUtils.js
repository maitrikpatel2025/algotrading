/**
 * Trade History Utility Functions
 *
 * Utilities for processing, filtering, and exporting trade history data
 * from the Account page.
 */

/**
 * Format trade duration from seconds to human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "2h 15m", "1d 5h", "< 1m")
 */
export function formatTradeDuration(seconds) {
  if (seconds === null || seconds === undefined || seconds < 0) return '-';

  // Less than 1 minute
  if (seconds < 60) return '< 1m';

  const minutes = Math.floor(seconds / 60);

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
}

/**
 * Generate CSV string from trade history array
 * @param {Array} trades - Array of trade history objects
 * @param {Object} filters - Active filters for metadata
 * @returns {string} CSV string
 */
export function generateTradeHistoryCSV(trades, filters = {}) {
  if (!trades || !Array.isArray(trades) || trades.length === 0) {
    return '';
  }

  // CSV headers
  const headers = [
    'Date/Time',
    'Pair',
    'Direction',
    'Entry Price',
    'Exit Price',
    'P/L',
    'Duration',
    'Exit Reason',
    'Bot'
  ];

  // Build CSV rows
  const rows = trades.map((trade) => {
    const dateStr = trade.closed_at
      ? new Date(trade.closed_at).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      : 'N/A';

    return [
      dateStr,
      trade.instrument || 'N/A',
      trade.side || 'N/A',
      trade.entry_price?.toFixed(5) || '0',
      trade.exit_price?.toFixed(5) || '0',
      trade.realized_pl?.toFixed(2) || '0',
      formatTradeDuration(trade.duration_seconds),
      trade.exit_reason || '-',
      trade.bot_name || '-'
    ];
  });

  // Escape CSV cells and combine
  const escapeCell = (cell) => {
    if (cell === null || cell === undefined) return '';
    const cellStr = String(cell);
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
      return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return cellStr;
  };

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => escapeCell(cell)).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Trigger browser download of CSV file
 * @param {string} csvString - CSV content string
 * @param {string} filename - Name for the downloaded file
 */
export function downloadCSV(csvString, filename = 'trade_history.csv') {
  if (!csvString) {
    console.warn('No CSV content to download');
    return;
  }

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Calculate daily P/L from trades array
 * @param {Array} trades - Array of trade history objects
 * @returns {Object} { total: number, count: number }
 */
export function calculateDailyPL(trades) {
  if (!trades || !Array.isArray(trades)) {
    return { total: 0, count: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyTrades = trades.filter(t => {
    if (!t.closed_at) return false;
    const tradeDate = new Date(t.closed_at);
    return tradeDate >= today;
  });

  const total = dailyTrades.reduce((sum, t) => sum + (t.realized_pl || 0), 0);

  return {
    total: Math.round(total * 100) / 100,
    count: dailyTrades.length
  };
}

/**
 * Calculate weekly P/L from trades array
 * @param {Array} trades - Array of trade history objects
 * @returns {Object} { total: number, count: number }
 */
export function calculateWeeklyPL(trades) {
  if (!trades || !Array.isArray(trades)) {
    return { total: 0, count: 0 };
  }

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Monday
  weekStart.setHours(0, 0, 0, 0);

  const weeklyTrades = trades.filter(t => {
    if (!t.closed_at) return false;
    const tradeDate = new Date(t.closed_at);
    return tradeDate >= weekStart;
  });

  const total = weeklyTrades.reduce((sum, t) => sum + (t.realized_pl || 0), 0);

  return {
    total: Math.round(total * 100) / 100,
    count: weeklyTrades.length
  };
}

/**
 * Client-side filter trades function for performance
 * @param {Array} trades - Array of trade history objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered trades
 */
export function filterTrades(trades, filters = {}) {
  if (!trades || !Array.isArray(trades)) return [];

  const { bot, pair, direction, outcome, startDate, endDate } = filters;

  return trades.filter(trade => {
    // Filter by bot
    if (bot && trade.bot_name !== bot) return false;

    // Filter by pair
    if (pair && trade.instrument !== pair) return false;

    // Filter by direction
    if (direction && direction !== 'both') {
      const tradeSide = (trade.side || '').toLowerCase();
      if (direction === 'long' && !['buy', 'long'].includes(tradeSide)) return false;
      if (direction === 'short' && !['sell', 'short'].includes(tradeSide)) return false;
    }

    // Filter by outcome
    if (outcome && outcome !== 'all') {
      const pl = trade.realized_pl || 0;
      if (outcome === 'winners' && pl <= 0) return false;
      if (outcome === 'losers' && pl >= 0) return false;
    }

    // Filter by date range
    if (startDate && trade.closed_at) {
      const tradeDate = new Date(trade.closed_at);
      const filterStart = new Date(startDate);
      filterStart.setHours(0, 0, 0, 0);
      if (tradeDate < filterStart) return false;
    }

    if (endDate && trade.closed_at) {
      const tradeDate = new Date(trade.closed_at);
      const filterEnd = new Date(endDate);
      filterEnd.setHours(23, 59, 59, 999);
      if (tradeDate > filterEnd) return false;
    }

    return true;
  });
}

/**
 * Sort trades by column
 * @param {Array} trades - Array of trade history objects
 * @param {string} sortColumn - Column to sort by
 * @param {string} sortDirection - 'asc' or 'desc'
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
      case 'date':
      case 'closed_at':
        aVal = a.closed_at ? new Date(a.closed_at).getTime() : 0;
        bVal = b.closed_at ? new Date(b.closed_at).getTime() : 0;
        break;

      case 'instrument':
      case 'pair':
        aVal = a.instrument || '';
        bVal = b.instrument || '';
        break;

      case 'direction':
      case 'side':
        aVal = a.side || '';
        bVal = b.side || '';
        break;

      case 'entry_price':
        aVal = a.entry_price || 0;
        bVal = b.entry_price || 0;
        break;

      case 'exit_price':
        aVal = a.exit_price || 0;
        bVal = b.exit_price || 0;
        break;

      case 'realized_pl':
      case 'pl':
        aVal = a.realized_pl || 0;
        bVal = b.realized_pl || 0;
        break;

      case 'duration':
      case 'duration_seconds':
        aVal = a.duration_seconds || 0;
        bVal = b.duration_seconds || 0;
        break;

      case 'exit_reason':
        aVal = a.exit_reason || '';
        bVal = b.exit_reason || '';
        break;

      case 'bot_name':
      case 'bot':
        aVal = a.bot_name || '';
        bVal = b.bot_name || '';
        break;

      default:
        return 0;
    }

    if (aVal < bVal) return -1 * multiplier;
    if (aVal > bVal) return 1 * multiplier;
    return 0;
  });

  return sorted;
}

/**
 * Get unique values from trades for filter dropdowns
 * @param {Array} trades - Array of trade history objects
 * @returns {Object} { bots: Array, pairs: Array }
 */
export function getUniqueFilterOptions(trades) {
  if (!trades || !Array.isArray(trades)) {
    return { bots: [], pairs: [] };
  }

  const botsSet = new Set();
  const pairsSet = new Set();

  trades.forEach(trade => {
    if (trade.bot_name) botsSet.add(trade.bot_name);
    if (trade.instrument) pairsSet.add(trade.instrument);
  });

  return {
    bots: Array.from(botsSet).sort(),
    pairs: Array.from(pairsSet).sort()
  };
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
 * Generate filename for CSV export with date range
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {string} Filename
 */
export function generateExportFilename(startDate, endDate) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const start = formatDate(startDate) || 'start';
  const end = formatDate(endDate) || 'end';

  return `trade_history_${start}_${end}.csv`;
}
