import React, { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { formatMonthLabel } from '../app/tradeUtils';

/**
 * MonthlyPerformanceTable Component
 *
 * Displays monthly performance breakdown with sortable columns
 * and best/worst month highlighting.
 */
function MonthlyPerformanceTable({ data = [], currency = '$' }) {
  const [sortColumn, setSortColumn] = useState('month');
  const [sortDirection, setSortDirection] = useState('asc');

  // Sort data based on current sort settings
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const sorted = [...data];
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      let aVal, bVal;

      switch (sortColumn) {
        case 'month':
          aVal = a.month || '';
          bVal = b.month || '';
          break;
        case 'trades':
          aVal = a.trades || 0;
          bVal = b.trades || 0;
          break;
        case 'win_rate':
          aVal = a.win_rate || 0;
          bVal = b.win_rate || 0;
          break;
        case 'net_pnl':
          aVal = a.net_pnl || 0;
          bVal = b.net_pnl || 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return -1 * multiplier;
      if (aVal > bVal) return 1 * multiplier;
      return 0;
    });

    return sorted;
  }, [data, sortColumn, sortDirection]);

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

  // Format P/L value
  const formatPnl = (pnl) => {
    if (pnl === null || pnl === undefined) return 'N/A';
    const formatted = Math.abs(pnl).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return pnl >= 0 ? `+${currency}${formatted}` : `-${currency}${formatted}`;
  };

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="text-neutral-500 text-sm">No monthly data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            <th
              onClick={() => handleSort('month')}
              className="px-3 py-2 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide cursor-pointer hover:bg-neutral-100 transition-colors"
            >
              Month {renderSortIndicator('month')}
            </th>
            <th
              onClick={() => handleSort('trades')}
              className="px-3 py-2 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wide cursor-pointer hover:bg-neutral-100 transition-colors"
            >
              # Trades {renderSortIndicator('trades')}
            </th>
            <th
              onClick={() => handleSort('win_rate')}
              className="px-3 py-2 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wide cursor-pointer hover:bg-neutral-100 transition-colors"
            >
              Win Rate {renderSortIndicator('win_rate')}
            </th>
            <th
              onClick={() => handleSort('net_pnl')}
              className="px-3 py-2 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wide cursor-pointer hover:bg-neutral-100 transition-colors"
            >
              Net P/L {renderSortIndicator('net_pnl')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => {
            const isProfit = row.net_pnl >= 0;

            return (
              <tr
                key={row.month || index}
                className={cn(
                  'border-b border-neutral-100 last:border-0 transition-colors',
                  row.is_best && 'bg-success/5 border-l-2 border-l-success',
                  row.is_worst && 'bg-danger/5 border-l-2 border-l-danger'
                )}
              >
                <td className="px-3 py-2 text-neutral-900 font-medium">
                  <div className="flex items-center gap-2">
                    {formatMonthLabel(row.month)}
                    {row.is_best && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-success/10 text-success rounded font-semibold">
                        BEST
                      </span>
                    )}
                    {row.is_worst && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-danger/10 text-danger rounded font-semibold">
                        WORST
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-neutral-600">
                  {row.trades}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-neutral-600">
                  {row.win_rate.toFixed(1)}%
                </td>
                <td
                  className={cn(
                    'px-3 py-2 text-right tabular-nums font-semibold',
                    isProfit ? 'text-success' : 'text-danger',
                    row.net_pnl === 0 && 'text-neutral-600'
                  )}
                >
                  {formatPnl(row.net_pnl)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default MonthlyPerformanceTable;
