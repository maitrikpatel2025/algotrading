import React, { useRef, useImperativeHandle } from 'react';
import { cn } from '../lib/utils';
import {
  ChevronUp,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  formatTradeDuration,
  formatExitReason,
  calculateTradePnlPercent,
  calculateTotalPages,
} from '../app/tradeUtils';

/**
 * BacktestTradeList Component
 *
 * Displays a comprehensive table of all trades from a backtest with:
 * - Sortable columns
 * - Row selection and highlighting
 * - Trade details formatting
 * - Pagination controls
 * - Empty state handling
 */
const BacktestTradeList = React.forwardRef(function BacktestTradeList({
  trades = [],
  onTradeClick,
  selectedTradeId = null,
  sortColumn = null,
  sortDirection = 'asc',
  onSort,
  currentPage = 1,
  pageSize = 50,
  onPageChange,
  onPageSizeChange,
  currency = '$',
}, ref) {
  // Refs for scrolling to specific trade rows
  const tradeRowRefs = useRef({});

  // Expose scrollToTrade method via ref
  useImperativeHandle(ref, () => ({
    scrollToTrade: (tradeNumber) => {
      const rowElement = tradeRowRefs.current[tradeNumber];
      if (rowElement) {
        rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add temporary flash animation
        rowElement.classList.add('animate-pulse');
        setTimeout(() => {
          rowElement.classList.remove('animate-pulse');
        }, 1000);
      }
    },
  }));
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format price with 5 decimals
  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 5,
      maximumFractionDigits: 5,
    });
  };

  // Format P/L value
  const formatPnl = (pnl) => {
    if (pnl === null || pnl === undefined) return 'N/A';
    const formatted = Math.abs(pnl).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return pnl >= 0 ? `+${currency}${formatted}` : `-${currency}${formatted}`;
  };

  // Format percentage
  const formatPercent = (percent) => {
    if (percent === null || percent === undefined || isNaN(percent)) return 'N/A';
    const formatted = Math.abs(percent).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return percent >= 0 ? `+${formatted}%` : `-${formatted}%`;
  };

  // Handle column sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction
      onSort(column, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      onSort(column, 'asc');
    }
  };

  // Render sort indicator
  const renderSortIndicator = (column) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-3 w-3 inline ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 inline ml-1" />
    );
  };

  // Calculate pagination values
  const totalPages = calculateTotalPages(trades.length, pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = pageSize === 0 ? trades.length : Math.min(startIndex + pageSize, trades.length);
  const visibleTrades = pageSize === 0 ? trades : trades.slice(startIndex, endIndex);

  // Empty state
  if (!trades || trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="p-3 rounded-full bg-neutral-100 mb-3">
          <TrendingUp className="h-6 w-6 text-neutral-400" />
        </div>
        <p className="text-neutral-600 font-medium">No trades to display</p>
        <p className="text-sm text-neutral-500 mt-1">
          No trades match the current filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Pagination Info & Controls (Top) */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-600">
          Showing {startIndex + 1}-{endIndex} of {trades.length} trades
        </span>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-600 text-xs">Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 text-xs border border-neutral-200 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={0}>All</option>
          </select>
        </div>
      </div>

      {/* Trade Table */}
      <div className="overflow-x-auto border border-neutral-200 rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 border-b border-neutral-200">
            <tr>
              <th
                onClick={() => handleSort('number')}
                className="px-3 py-2 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide cursor-pointer hover:bg-neutral-200 transition-colors"
              >
                # {renderSortIndicator('number')}
              </th>
              <th
                onClick={() => handleSort('entry_date')}
                className="px-3 py-2 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide cursor-pointer hover:bg-neutral-200 transition-colors"
              >
                Entry Date {renderSortIndicator('entry_date')}
              </th>
              <th
                onClick={() => handleSort('exit_date')}
                className="px-3 py-2 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide cursor-pointer hover:bg-neutral-200 transition-colors"
              >
                Exit Date {renderSortIndicator('exit_date')}
              </th>
              <th
                onClick={() => handleSort('direction')}
                className="px-3 py-2 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide cursor-pointer hover:bg-neutral-200 transition-colors"
              >
                Direction {renderSortIndicator('direction')}
              </th>
              <th
                onClick={() => handleSort('entry_price')}
                className="px-3 py-2 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wide cursor-pointer hover:bg-neutral-200 transition-colors"
              >
                Entry Price {renderSortIndicator('entry_price')}
              </th>
              <th
                onClick={() => handleSort('exit_price')}
                className="px-3 py-2 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wide cursor-pointer hover:bg-neutral-200 transition-colors"
              >
                Exit Price {renderSortIndicator('exit_price')}
              </th>
              <th
                onClick={() => handleSort('size')}
                className="px-3 py-2 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wide cursor-pointer hover:bg-neutral-200 transition-colors hidden md:table-cell"
              >
                Size {renderSortIndicator('size')}
              </th>
              <th
                onClick={() => handleSort('pnl')}
                className="px-3 py-2 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wide cursor-pointer hover:bg-neutral-200 transition-colors"
              >
                P/L ({currency}) {renderSortIndicator('pnl')}
              </th>
              <th
                onClick={() => handleSort('pnl_percent')}
                className="px-3 py-2 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wide cursor-pointer hover:bg-neutral-200 transition-colors"
              >
                P/L (%) {renderSortIndicator('pnl_percent')}
              </th>
              <th
                onClick={() => handleSort('duration')}
                className="px-3 py-2 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wide cursor-pointer hover:bg-neutral-200 transition-colors hidden lg:table-cell"
              >
                Duration {renderSortIndicator('duration')}
              </th>
              <th
                onClick={() => handleSort('exit_reason')}
                className="px-3 py-2 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide cursor-pointer hover:bg-neutral-200 transition-colors"
              >
                Exit Reason {renderSortIndicator('exit_reason')}
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleTrades.map((trade, index) => {
              const tradeNumber = startIndex + index + 1;
              const pnlPercent = calculateTradePnlPercent(
                trade.pnl,
                trade.entry_price,
                trade.size
              );
              const isProfit = trade.pnl >= 0;
              const isSelected = selectedTradeId === trade.id || selectedTradeId === tradeNumber;
              const isLong = trade.type === 'long';

              return (
                <tr
                  key={trade.id || tradeNumber}
                  ref={(el) => {
                    if (el) {
                      tradeRowRefs.current[tradeNumber] = el;
                    }
                  }}
                  onClick={() => onTradeClick?.(trade, tradeNumber)}
                  className={cn(
                    'border-b border-neutral-100 last:border-0 cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-primary-light'
                      : 'hover:bg-neutral-50'
                  )}
                >
                  <td className="px-3 py-2 text-neutral-600 font-medium">
                    {tradeNumber}
                  </td>
                  <td className="px-3 py-2 text-neutral-600 text-xs whitespace-nowrap">
                    {formatDate(trade.entry_time)}
                  </td>
                  <td className="px-3 py-2 text-neutral-600 text-xs whitespace-nowrap">
                    {formatDate(trade.exit_time)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold',
                        isLong
                          ? 'bg-success/10 text-success'
                          : 'bg-danger/10 text-danger'
                      )}
                    >
                      {isLong ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {trade.type ? trade.type.charAt(0).toUpperCase() + trade.type.slice(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-neutral-900">
                    {formatPrice(trade.entry_price)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-neutral-900">
                    {formatPrice(trade.exit_price)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-neutral-600 hidden md:table-cell">
                    {trade.size?.toLocaleString('en-US') || 'N/A'}
                  </td>
                  <td
                    className={cn(
                      'px-3 py-2 text-right tabular-nums font-semibold',
                      isProfit ? 'text-success' : 'text-danger',
                      trade.pnl === 0 && 'text-neutral-600'
                    )}
                  >
                    {formatPnl(trade.pnl)}
                  </td>
                  <td
                    className={cn(
                      'px-3 py-2 text-right tabular-nums font-semibold',
                      isProfit ? 'text-success' : 'text-danger',
                      trade.pnl === 0 && 'text-neutral-600'
                    )}
                  >
                    {formatPercent(pnlPercent)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-neutral-600 text-xs hidden lg:table-cell">
                    {formatTradeDuration(trade.entry_time, trade.exit_time)}
                  </td>
                  <td className="px-3 py-2 text-neutral-600 text-xs">
                    {formatExitReason(trade.exit_reason)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls (Bottom) */}
      {totalPages > 1 && pageSize !== 0 && (
        <div className="flex items-center justify-between">
          {/* Left: Page Navigation */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={cn(
                'p-1.5 rounded transition-colors',
                currentPage === 1
                  ? 'text-neutral-300 cursor-not-allowed'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                'p-1.5 rounded transition-colors',
                currentPage === 1
                  ? 'text-neutral-300 cursor-not-allowed'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded transition-colors',
                      currentPage === pageNum
                        ? 'bg-primary text-white'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-neutral-400">...</span>
                  <button
                    type="button"
                    onClick={() => onPageChange(totalPages)}
                    className="px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                'p-1.5 rounded transition-colors',
                currentPage === totalPages
                  ? 'text-neutral-300 cursor-not-allowed'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={cn(
                'p-1.5 rounded transition-colors',
                currentPage === totalPages
                  ? 'text-neutral-300 cursor-not-allowed'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>

          {/* Right: Jump to Page */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-600">Go to page:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = Number(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  onPageChange(page);
                }
              }}
              className="w-16 px-2 py-1 text-xs border border-neutral-200 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default BacktestTradeList;
