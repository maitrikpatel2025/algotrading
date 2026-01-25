import React from 'react';
import { cn } from '../lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { calculateTotalPages } from '../app/tradeHistoryUtils';

/**
 * TradeHistoryPagination Component
 *
 * Provides pagination controls for the trade history table:
 * - Page size selector: 25, 50, 100, All
 * - Pagination info: "Showing X-Y of Z trades"
 * - First/Previous/Next/Last page buttons with appropriate disabled states
 * - Page number buttons (smart display showing 5 pages max)
 * - Jump-to-page input field
 */
function TradeHistoryPagination({
  totalTrades,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = calculateTotalPages(totalTrades, pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = pageSize === 0 ? totalTrades : Math.min(startIndex + pageSize, totalTrades);

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    onPageSizeChange(newSize);
  };

  // Handle jump to page input
  const handleJumpToPage = (e) => {
    const page = Number(e.target.value);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (currentPage >= totalPages - 2) {
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
      {/* Left side: Pagination info and page size selector */}
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground">
          Showing {totalTrades > 0 ? startIndex + 1 : 0}-{endIndex} of {totalTrades} trades
        </span>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Per page:</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="px-2 py-1 text-xs border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={0}>All</option>
          </select>
        </div>
      </div>

      {/* Right side: Page navigation controls */}
      {totalPages > 1 && pageSize !== 0 && (
        <div className="flex items-center gap-2">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={cn(
                'p-1.5 rounded transition-colors',
                currentPage === 1
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 mx-1">
              {pageNumbers[0] > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => onPageChange(1)}
                    className="px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted rounded transition-colors"
                  >
                    1
                  </button>
                  {pageNumbers[0] > 2 && (
                    <span className="text-muted-foreground px-1">...</span>
                  )}
                </>
              )}

              {pageNumbers.map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded transition-colors',
                    currentPage === pageNum
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  {pageNum}
                </button>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <span className="text-muted-foreground px-1">...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => onPageChange(totalPages)}
                    className="px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted rounded transition-colors"
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
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>

          {/* Jump to Page */}
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-muted-foreground">Go to:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={handleJumpToPage}
              className="w-14 px-2 py-1 text-xs border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TradeHistoryPagination;
