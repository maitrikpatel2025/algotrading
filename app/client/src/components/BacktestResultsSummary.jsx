import React, { useState, useRef } from 'react';
import { cn } from '../lib/utils';
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Target,
  Scale,
  BarChart3,
  List,
  Download,
  Crosshair,
} from 'lucide-react';
import MetricCard from './MetricCard';
import EquityCurveChart from './EquityCurveChart';
import PriceChart from './PriceChart';
import BacktestTradeList from './BacktestTradeList';
import TradeFilterControls from './TradeFilterControls';
import BacktestNotesEditor from './BacktestNotesEditor';
import BacktestExportDialog from './BacktestExportDialog';
import {
  METRIC_DEFINITIONS,
  getMetricTrend,
  formatMetricValue,
} from '../app/metricDefinitions';
import {
  filterTrades,
  sortTrades,
  exportTradesToCSV,
} from '../app/tradeUtils';

/**
 * BacktestResultsSummary Component - Precision Swiss Design System
 *
 * Comprehensive display of backtest results including:
 * - KPI cards for primary metrics (Net P/L, ROI, Win Rate, Profit Factor)
 * - Equity curve chart with buy-and-hold comparison
 * - Trade statistics section
 * - Risk metrics section
 * - Benchmark comparison section
 * - Color coding and tooltips for all metrics
 */
function BacktestResultsSummary({
  results,
  backtest = null,
  priceData = null,
  initialBalance = 10000,
  onClose,
  className,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isTradeListExpanded, setIsTradeListExpanded] = useState(false);
  const [showTradesOnChart, setShowTradesOnChart] = useState(false);
  const tradeListRef = useRef(null);
  const [notes, setNotes] = useState(backtest?.notes || '');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState('csv');

  // Handler for notes updates
  const handleNotesUpdated = (updatedNotes) => {
    setNotes(updatedNotes);
  };

  // Trade list state
  const [filters, setFilters] = useState({
    outcome: 'all',
    direction: 'both',
    startDate: '',
    endDate: '',
  });
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedTradeId, setSelectedTradeId] = useState(null);
  const [highlightedTrade, setHighlightedTrade] = useState(null);

  // Handle missing or incomplete results
  if (!results) {
    return null;
  }

  // Helper to get metric value with default
  const getMetric = (key, defaultValue = 0) => {
    return results[key] ?? defaultValue;
  };

  // Get and process trades
  const allTrades = results.trades || [];
  const filteredTrades = filterTrades(allTrades, filters);
  const sortedTrades = sortTrades(filteredTrades, sortColumn, sortDirection);
  const displayedTrades = sortedTrades; // Pagination happens in BacktestTradeList

  // Handle trade list interactions
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSort = (column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleTradeClick = (trade, tradeNumber) => {
    // Toggle selection
    if (selectedTradeId === tradeNumber) {
      setSelectedTradeId(null);
      setHighlightedTrade(null);
    } else {
      setSelectedTradeId(tradeNumber);
      setHighlightedTrade({
        ...trade,
        tradeNumber,
        id: trade.id || `trade-${tradeNumber}`,
      });
    }
  };

  const handleTradeMarkerClickFromChart = (trade) => {
    // Find the trade number (index + 1) from the trade ID
    const tradeIndex = allTrades.findIndex(t => t.id === trade.id || t === trade);
    const tradeNumber = tradeIndex >= 0 ? tradeIndex + 1 : null;

    if (tradeNumber) {
      setSelectedTradeId(tradeNumber);
      setHighlightedTrade({
        ...trade,
        tradeNumber,
        id: trade.id || `trade-${tradeNumber}`,
      });

      // Expand trade list if collapsed
      setIsTradeListExpanded(true);

      // Scroll to trade in list after expansion
      setTimeout(() => {
        tradeListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleExportCSV = () => {
    const backtestName = results.strategy_name || 'backtest';
    exportTradesToCSV(allTrades, backtestName);
  };

  const handleExportClick = (format) => {
    setSelectedExportFormat(format);
    setIsExportDialogOpen(true);
  };

  const handleTradeCountClick = () => {
    setIsTradeListExpanded(true);
    // Scroll to trade list section after a brief delay for expansion animation
    setTimeout(() => {
      tradeListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Helper to render a metric row
  const renderMetricRow = (metricKey, label = null) => {
    const definition = METRIC_DEFINITIONS[metricKey] || {};
    const value = getMetric(metricKey);
    const trend = getMetricTrend(metricKey, value);
    const displayLabel = label || definition.label || metricKey;
    const formatted = formatMetricValue(
      definition.format,
      value,
      definition.prefix || '',
      definition.suffix || ''
    );

    return (
      <div className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
        <span className="text-sm text-neutral-600">{displayLabel}</span>
        <span
          className={cn(
            'text-sm font-semibold tabular-nums',
            trend === 'positive' && 'text-success',
            trend === 'negative' && 'text-danger',
            trend === 'neutral' && 'text-neutral-900'
          )}
        >
          {formatted}
        </span>
      </div>
    );
  };

  // Primary KPI values
  const netPnl = getMetric('total_net_profit');
  const roi = getMetric('return_on_investment');
  const winRate = getMetric('win_rate');
  const profitFactor = getMetric('profit_factor');

  return (
    <div
      className={cn(
        'bg-white border border-neutral-200 rounded-lg shadow-sm animate-fade-in',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-success-light">
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              Backtest Results
            </h3>
            <button
              type="button"
              onClick={handleTradeCountClick}
              className="text-sm text-neutral-500 hover:text-primary hover:underline cursor-pointer transition-colors"
              title="Click to view detailed trade list"
            >
              {getMetric('total_trades')} trades completed
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Button Group */}
          {backtest && (
            <div className="flex items-center gap-1 mr-2">
              <button
                type="button"
                onClick={() => handleExportClick('csv')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                title="Export as CSV"
              >
                <Download className="h-3 w-3" />
                CSV
              </button>
              <button
                type="button"
                onClick={() => handleExportClick('json')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                title="Export as JSON"
              >
                <Download className="h-3 w-3" />
                JSON
              </button>
              <button
                type="button"
                onClick={() => handleExportClick('pdf')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                title="Export as PDF"
              >
                <Download className="h-3 w-3" />
                PDF
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            aria-label={isExpanded ? 'Collapse results' : 'Expand results'}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Primary KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="Net P/L"
              value={netPnl}
              prefix="$"
              tooltip={METRIC_DEFINITIONS.total_net_profit?.tooltip}
              trend={getMetricTrend('total_net_profit', netPnl)}
              size="large"
            />
            <MetricCard
              label="ROI"
              value={roi}
              suffix="%"
              tooltip={METRIC_DEFINITIONS.return_on_investment?.tooltip}
              trend={getMetricTrend('return_on_investment', roi)}
              size="large"
            />
            <MetricCard
              label="Win Rate"
              value={winRate}
              suffix="%"
              tooltip={METRIC_DEFINITIONS.win_rate?.tooltip}
              trend={getMetricTrend('win_rate', winRate)}
              size="large"
            />
            <MetricCard
              label="Profit Factor"
              value={profitFactor}
              tooltip={METRIC_DEFINITIONS.profit_factor?.tooltip}
              trend={getMetricTrend('profit_factor', profitFactor)}
              size="large"
            />
          </div>

          {/* Equity Curve Chart */}
          <div className="bg-white border border-neutral-200 rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-neutral-500" />
              <h4 className="text-sm font-semibold text-neutral-900">
                Equity Curve
              </h4>
            </div>
            <EquityCurveChart
              equityCurve={results.equity_curve || []}
              buyHoldCurve={results.buy_hold_curve || []}
              equityCurveDates={results.equity_curve_dates || []}
              tradeCountsPerCandle={results.trade_counts_per_candle || []}
              drawdownPeriods={results.drawdown_periods || []}
              initialBalance={initialBalance}
              height={300}
              highlightedTrade={highlightedTrade}
            />
          </div>

          {/* Price Chart with Trade Markers */}
          {priceData && backtest && (
            <div className="bg-white border border-neutral-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Crosshair className="h-4 w-4 text-neutral-500" />
                  <h4 className="text-sm font-semibold text-neutral-900">
                    Price Chart
                  </h4>
                  <span className="text-xs text-neutral-500">
                    {backtest.pair} • {backtest.timeframe}
                  </span>
                </div>

                {/* Show Trades Toggle */}
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={showTradesOnChart}
                    onChange={(e) => setShowTradesOnChart(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary focus:ring-offset-0 transition-colors"
                  />
                  <span className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors">
                    Show Trades on Chart
                  </span>
                  <Target className="h-3.5 w-3.5 text-neutral-500 group-hover:text-primary transition-colors" />
                </label>
              </div>

              <PriceChart
                priceData={priceData}
                selectedPair={backtest.pair}
                selectedGranularity={backtest.timeframe}
                selectedCount={priceData?.time?.length || 100}
                chartType="candlestick"
                showVolume={false}
                loading={false}
                activeIndicators={[]}
                activePatterns={[]}
                drawings={[]}
                trades={showTradesOnChart ? displayedTrades : []}
                showTrades={showTradesOnChart}
                onTradeMarkerClick={handleTradeMarkerClickFromChart}
                highlightedTradeId={highlightedTrade?.id}
              />
            </div>
          )}

          {/* Two Column Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Trade Statistics */}
            <div className="bg-neutral-50 rounded-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-neutral-500" />
                <h4 className="text-sm font-semibold text-neutral-900">
                  Trade Statistics
                </h4>
              </div>
              <div>
                {renderMetricRow('total_trades', 'Total Trades')}
                <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                  <span className="text-sm text-neutral-600">Winners / Losers</span>
                  <span className="text-sm font-semibold tabular-nums text-neutral-900">
                    {getMetric('winning_trades')} / {getMetric('losing_trades')}
                  </span>
                </div>
                {renderMetricRow('average_win', 'Avg Win')}
                {renderMetricRow('average_loss', 'Avg Loss')}
                {renderMetricRow('win_loss_ratio', 'Win/Loss Ratio')}
                {renderMetricRow('largest_win', 'Largest Win')}
                {renderMetricRow('largest_loss', 'Largest Loss')}
                {renderMetricRow('average_trade_duration_minutes', 'Avg Duration')}
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="bg-neutral-50 rounded-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="h-4 w-4 text-neutral-500" />
                <h4 className="text-sm font-semibold text-neutral-900">
                  Risk Metrics
                </h4>
              </div>
              <div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                  <span className="text-sm text-neutral-600">Max Drawdown</span>
                  <span
                    className={cn(
                      'text-sm font-semibold tabular-nums',
                      getMetric('max_drawdown_percent') > 20
                        ? 'text-danger'
                        : getMetric('max_drawdown_percent') > 10
                        ? 'text-warning'
                        : 'text-neutral-900'
                    )}
                  >
                    ${getMetric('max_drawdown_dollars').toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    ({getMetric('max_drawdown_percent').toFixed(2)}%)
                  </span>
                </div>
                {renderMetricRow('recovery_factor', 'Recovery Factor')}
                {renderMetricRow('sharpe_ratio', 'Sharpe Ratio')}
                {renderMetricRow('sortino_ratio', 'Sortino Ratio')}
                {renderMetricRow('expectancy', 'Expectancy')}

                {/* Benchmark Comparison Section */}
                <div className="mt-4 pt-3 border-t border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                      Benchmark Comparison
                    </span>
                  </div>
                  {renderMetricRow('buy_hold_return', 'Buy & Hold Return')}
                  {renderMetricRow('strategy_vs_benchmark', 'Strategy vs B&H')}
                </div>
              </div>
            </div>
          </div>

          {/* Backtest Notes Editor */}
          {backtest && (
            <div className="space-y-6">
              <BacktestNotesEditor
                backtestId={backtest.id}
                initialNotes={backtest.notes || notes}
                onNotesUpdated={handleNotesUpdated}
              />
            </div>
          )}

          {/* Trade List Section */}
          {allTrades.length > 0 && (
            <div
              ref={tradeListRef}
              className="bg-white border border-neutral-200 rounded-md"
            >
              {/* Trade List Header */}
              <div
                className="flex items-center justify-between p-4 border-b border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => setIsTradeListExpanded(!isTradeListExpanded)}
              >
                <div className="flex items-center gap-3">
                  <List className="h-4 w-4 text-neutral-500" />
                  <h4 className="text-sm font-semibold text-neutral-900">
                    Trade List
                  </h4>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary text-white">
                    {allTrades.length}
                  </span>
                  {allTrades.length >= 100 && (
                    <span className="text-xs text-warning">
                      (Last 100 trades)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isTradeListExpanded && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportCSV();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      Export CSV
                    </button>
                  )}
                  {isTradeListExpanded ? (
                    <ChevronUp className="h-5 w-5 text-neutral-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-neutral-500" />
                  )}
                </div>
              </div>

              {/* Trade List Content */}
              {isTradeListExpanded && (
                <div className="p-4 space-y-4">
                  {/* Filter Controls */}
                  <TradeFilterControls
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />

                  {/* Trade Table */}
                  <BacktestTradeList
                    trades={displayedTrades}
                    onTradeClick={handleTradeClick}
                    selectedTradeId={selectedTradeId}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    currency="$"
                  />
                </div>
              )}
            </div>
          )}

          {/* Final Balance */}
          <div className="flex items-center justify-between p-4 bg-neutral-100 rounded-md">
            <span className="text-sm font-medium text-neutral-700">
              Final Balance
            </span>
            <span
              className={cn(
                'text-lg font-bold tabular-nums',
                getMetric('final_balance') >= initialBalance
                  ? 'text-success'
                  : 'text-danger'
              )}
            >
              $
              {getMetric('final_balance').toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {backtest && (
        <BacktestExportDialog
          backtestId={backtest.id}
          backtestName={results.strategy_name || 'Backtest'}
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          initialFormat={selectedExportFormat}
        />
      )}
    </div>
  );
}

export default BacktestResultsSummary;
