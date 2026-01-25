import React, { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  History,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  Download,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import TradeHistoryFilters from './TradeHistoryFilters';
import TradeHistorySummary from './TradeHistorySummary';
import TradeHistoryPagination from './TradeHistoryPagination';
import {
  formatTradeDuration,
  generateTradeHistoryCSV,
  downloadCSV,
  filterTrades,
  sortTrades,
  getUniqueFilterOptions,
  generateExportFilename,
} from '../app/tradeHistoryUtils';

function TradeHistory({
  history = [],
  loading = false,
  message = null,
  error = null,
  onRetry = null,
  summary = null,
  filters = {},
  onFilterChange = null,
}) {
  // Local state for sorting and pagination
  const [sortColumn, setSortColumn] = useState('closed_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [exporting, setExporting] = useState(false);

  // Get unique filter options from history
  const filterOptions = useMemo(() => getUniqueFilterOptions(history), [history]);

  // Apply client-side filtering if no server-side filter change handler
  const filteredHistory = useMemo(() => {
    if (onFilterChange) {
      // Server-side filtering - history already filtered
      return history;
    }
    return filterTrades(history, filters);
  }, [history, filters, onFilterChange]);

  // Apply sorting
  const sortedHistory = useMemo(
    () => sortTrades(filteredHistory, sortColumn, sortDirection),
    [filteredHistory, sortColumn, sortDirection]
  );

  // Apply pagination
  const paginatedHistory = useMemo(() => {
    if (pageSize === 0) return sortedHistory;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedHistory.slice(startIndex, startIndex + pageSize);
  }, [sortedHistory, currentPage, pageSize]);

  const formatValue = (value, decimals = 2) => {
    if (value === undefined || value === null) return '-';
    if (typeof value !== 'number') return String(value);
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatPrice = (value) => {
    if (value === undefined || value === null || value === 0) return '-';
    return formatValue(value, 5);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle column sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
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

  // Handle pagination changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setCurrentPage(1); // Reset to first page when filters change
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Handle CSV export
  const handleExport = async () => {
    setExporting(true);
    try {
      const csvContent = generateTradeHistoryCSV(sortedHistory, filters);
      const filename = generateExportFilename(filters.startDate, filters.endDate);
      downloadCSV(csvContent, filename);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="card animate-fade-in">
        <div className="card-header border-b border-border">
          <div className="flex items-center gap-3">
            <div className="skeleton h-10 w-10 rounded-lg" />
            <div className="skeleton h-6 w-32" />
          </div>
        </div>
        <div className="card-content pt-6">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="skeleton h-8 flex-1" />
                <div className="skeleton h-8 flex-1" />
                <div className="skeleton h-8 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="card">
        <div className="card-header border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/20">
              <History className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="card-title">Trade History</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Closed trades and transaction history</p>
            </div>
          </div>
        </div>
        <div className="card-content pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-destructive/10 mb-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-destructive font-medium">Error Loading Trade History</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="btn-outline mt-4 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      {/* Header */}
      <div className="card-header border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/20">
              <History className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="card-title">Trade History</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Closed trades and transaction history</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-secondary">{sortedHistory.length} trades</span>
            <button
              onClick={handleExport}
              disabled={exporting || sortedHistory.length === 0}
              className="btn btn-secondary flex items-center gap-2 text-sm"
            >
              <Download className={cn('h-4 w-4', exporting && 'animate-pulse')} />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>

      <div className="card-content pt-4 space-y-4">
        {/* P/L Summary */}
        {summary && <TradeHistorySummary summary={summary} />}

        {/* Filters */}
        <TradeHistoryFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          availableBots={filterOptions.bots}
          availablePairs={filterOptions.pairs}
        />

        {/* Empty state */}
        {(!sortedHistory || sortedHistory.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-muted mb-3">
              <History className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No trade history</p>
            {message ? (
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">{message}</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Your closed trades will appear here</p>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th
                      onClick={() => handleSort('closed_at')}
                      className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:bg-muted transition-colors"
                    >
                      Date/Time {renderSortIndicator('closed_at')}
                    </th>
                    <th
                      onClick={() => handleSort('instrument')}
                      className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:bg-muted transition-colors"
                    >
                      Pair {renderSortIndicator('instrument')}
                    </th>
                    <th
                      onClick={() => handleSort('side')}
                      className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:bg-muted transition-colors"
                    >
                      Direction {renderSortIndicator('side')}
                    </th>
                    <th
                      onClick={() => handleSort('entry_price')}
                      className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:bg-muted transition-colors"
                    >
                      Entry {renderSortIndicator('entry_price')}
                    </th>
                    <th
                      onClick={() => handleSort('exit_price')}
                      className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:bg-muted transition-colors"
                    >
                      Exit {renderSortIndicator('exit_price')}
                    </th>
                    <th
                      onClick={() => handleSort('realized_pl')}
                      className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:bg-muted transition-colors"
                    >
                      P/L {renderSortIndicator('realized_pl')}
                    </th>
                    <th
                      onClick={() => handleSort('duration_seconds')}
                      className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:bg-muted transition-colors hidden md:table-cell"
                    >
                      Duration {renderSortIndicator('duration_seconds')}
                    </th>
                    <th
                      onClick={() => handleSort('exit_reason')}
                      className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:bg-muted transition-colors hidden lg:table-cell"
                    >
                      Exit Reason {renderSortIndicator('exit_reason')}
                    </th>
                    <th
                      onClick={() => handleSort('bot_name')}
                      className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:bg-muted transition-colors hidden xl:table-cell"
                    >
                      Bot {renderSortIndicator('bot_name')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((trade) => {
                    const isProfit = trade.realized_pl >= 0;
                    const isBuy = trade.side === 'Buy' || trade.side === 'buy' || trade.side === 'Long' || trade.side === 'long';

                    return (
                      <tr
                        key={trade.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-2 text-muted-foreground text-sm whitespace-nowrap">
                          {formatDate(trade.closed_at)}
                        </td>
                        <td className="px-3 py-2 font-medium">{trade.instrument || '-'}</td>
                        <td className="px-3 py-2">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold",
                            isBuy ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                          )}>
                            {isBuy ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {trade.side || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatPrice(trade.entry_price)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatPrice(trade.exit_price)}
                        </td>
                        <td className={cn(
                          "px-3 py-2 text-right tabular-nums font-semibold",
                          isProfit ? "text-success" : "text-destructive"
                        )}>
                          {isProfit && '+'}{formatValue(trade.realized_pl)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground hidden md:table-cell">
                          {formatTradeDuration(trade.duration_seconds)}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground text-sm hidden lg:table-cell">
                          {trade.exit_reason || '-'}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground text-sm hidden xl:table-cell">
                          {trade.bot_name || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <TradeHistoryPagination
              totalTrades={sortedHistory.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default TradeHistory;
