import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Briefcase, TrendingUp, TrendingDown, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import PositionCloseDialog from './PositionCloseDialog';

function OpenTrades({ trades = [], loading = false, onTradeClose }) {
  const navigate = useNavigate();
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

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

  // Format duration for display
  const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return '-';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    }
    return '< 1m';
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

  // Get sort icon for column header
  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  // Sort trades based on current sort state
  const sortedTrades = useMemo(() => {
    if (!sortColumn || !trades || trades.length === 0) return trades;

    return [...trades].sort((a, b) => {
      let aValue, bValue;

      switch (sortColumn) {
        case 'instrument':
          aValue = a.instrument || '';
          bValue = b.instrument || '';
          break;
        case 'side':
          aValue = a.initial_amount > 0 ? 1 : -1;
          bValue = b.initial_amount > 0 ? 1 : -1;
          break;
        case 'amount':
          aValue = Math.abs(a.initial_amount || 0);
          bValue = Math.abs(b.initial_amount || 0);
          break;
        case 'entry_price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'current_price':
          aValue = a.current_price || 0;
          bValue = b.current_price || 0;
          break;
        case 'unrealized_pl':
          aValue = a.unrealized_pl || 0;
          bValue = b.unrealized_pl || 0;
          break;
        case 'pips_pl':
          aValue = a.pips_pl || 0;
          bValue = b.pips_pl || 0;
          break;
        case 'duration':
          aValue = a.duration_seconds || 0;
          bValue = b.duration_seconds || 0;
          break;
        case 'bot_name':
          aValue = a.bot_name || 'Manual';
          bValue = b.bot_name || 'Manual';
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [trades, sortColumn, sortDirection]);

  // Calculate totals for summary row
  const totals = useMemo(() => {
    if (!trades || trades.length === 0) return { totalPl: 0, totalPips: 0 };

    const totalPl = trades.reduce((sum, trade) => sum + (trade.unrealized_pl || 0), 0);
    const totalPips = trades.reduce((sum, trade) => sum + (trade.pips_pl || 0), 0);

    return { totalPl, totalPips };
  }, [trades]);

  // Handle close button click
  const handleCloseClick = (e, trade) => {
    e.stopPropagation();
    setSelectedPosition(trade);
    setCloseDialogOpen(true);
  };

  // Handle successful close
  const handleCloseSuccess = (response) => {
    onTradeClose?.(response);
  };

  // Handle row click to navigate to chart
  const handleRowClick = (trade) => {
    // Format instrument for strategy page (e.g., EURUSD -> EUR_USD)
    let pair = trade.instrument;
    if (pair && pair.length === 6 && !pair.includes('_')) {
      pair = `${pair.slice(0, 3)}_${pair.slice(3)}`;
    }

    navigate('/strategy', {
      state: {
        selectedPair: pair,
        highlightPrice: trade.price,
        position: trade
      }
    });
  };

  // Sortable column header component
  const SortableHeader = ({ column, children, className }) => (
    <th
      className={cn("table-head cursor-pointer hover:bg-muted/50 select-none", className)}
      onClick={() => handleSort(column)}
    >
      <span className="inline-flex items-center">
        {children}
        {getSortIcon(column)}
      </span>
    </th>
  );

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

  // Empty state
  if (!trades || trades.length === 0) {
    return (
      <div className="card">
        <div className="card-header border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="card-title">Open Trades</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Currently active positions</p>
            </div>
          </div>
        </div>
        <div className="card-content pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-muted mb-3">
              <Briefcase className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No open positions</p>
            <p className="text-xs text-muted-foreground mt-1">Your active positions will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card animate-fade-in">
        {/* Header */}
        <div className="card-header border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="card-title">Open Trades</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Currently active positions</p>
              </div>
            </div>
            <span className="badge-default">{trades.length} active</span>
          </div>
        </div>

        {/* Table */}
        <div className="card-content pt-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr className="table-row">
                  <SortableHeader column="instrument">Instrument</SortableHeader>
                  <SortableHeader column="side">Side</SortableHeader>
                  <SortableHeader column="amount" className="text-right">Size</SortableHeader>
                  <SortableHeader column="entry_price" className="text-right">Entry</SortableHeader>
                  <SortableHeader column="current_price" className="text-right">Current</SortableHeader>
                  <SortableHeader column="unrealized_pl" className="text-right">P/L ($)</SortableHeader>
                  <SortableHeader column="pips_pl" className="text-right">P/L (pips)</SortableHeader>
                  <th className="table-head text-right">SL</th>
                  <th className="table-head text-right">TP</th>
                  <SortableHeader column="duration" className="text-right">Duration</SortableHeader>
                  <SortableHeader column="bot_name">Bot</SortableHeader>
                  <th className="table-head text-center w-12">Close</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {sortedTrades.map((trade) => {
                  const isProfit = trade.unrealized_pl >= 0;
                  const isPipsProfit = (trade.pips_pl || 0) >= 0;
                  const side = trade.initial_amount > 0 ? 'Buy' : 'Sell';
                  const isBuy = side === 'Buy';

                  return (
                    <tr
                      key={trade.id}
                      className="table-row cursor-pointer hover:bg-muted/30"
                      onClick={() => handleRowClick(trade)}
                    >
                      <td className="table-cell font-medium">{trade.instrument}</td>
                      <td className="table-cell">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold",
                          isBuy ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        )}>
                          {isBuy ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {side}
                        </span>
                      </td>
                      <td className="table-cell text-right tabular-nums">
                        {formatValue(Math.abs(trade.initial_amount), 0)}
                      </td>
                      <td className="table-cell text-right tabular-nums">
                        {formatPrice(trade.price)}
                      </td>
                      <td className="table-cell text-right tabular-nums">
                        {formatPrice(trade.current_price)}
                      </td>
                      <td className={cn(
                        "table-cell text-right tabular-nums font-semibold",
                        isProfit ? "text-success" : "text-destructive"
                      )}>
                        {isProfit && '+'}{formatValue(trade.unrealized_pl)}
                      </td>
                      <td className={cn(
                        "table-cell text-right tabular-nums font-semibold",
                        isPipsProfit ? "text-success" : "text-destructive"
                      )}>
                        {isPipsProfit && '+'}{formatValue(trade.pips_pl, 1)}
                      </td>
                      <td className="table-cell text-right tabular-nums text-muted-foreground">
                        {formatPrice(trade.stop_loss)}
                      </td>
                      <td className="table-cell text-right tabular-nums text-muted-foreground">
                        {formatPrice(trade.take_profit)}
                      </td>
                      <td className="table-cell text-right tabular-nums text-muted-foreground">
                        {formatDuration(trade.duration_seconds)}
                      </td>
                      <td className="table-cell text-muted-foreground">
                        {trade.bot_name || 'Manual'}
                      </td>
                      <td className="table-cell text-center">
                        <button
                          onClick={(e) => handleCloseClick(e, trade)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Close position"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Summary Row */}
              <tfoot>
                <tr className="bg-muted/30 font-semibold">
                  <td colSpan={5} className="table-cell text-right">
                    Total P/L:
                  </td>
                  <td className={cn(
                    "table-cell text-right tabular-nums",
                    totals.totalPl >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {totals.totalPl >= 0 && '+'}{formatValue(totals.totalPl)}
                  </td>
                  <td className={cn(
                    "table-cell text-right tabular-nums",
                    totals.totalPips >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {totals.totalPips >= 0 && '+'}{formatValue(totals.totalPips, 1)}
                  </td>
                  <td colSpan={5} className="table-cell"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Close Position Dialog */}
      <PositionCloseDialog
        isOpen={closeDialogOpen}
        onClose={() => {
          setCloseDialogOpen(false);
          setSelectedPosition(null);
        }}
        position={selectedPosition}
        onSuccess={handleCloseSuccess}
      />
    </>
  );
}

export default OpenTrades;
