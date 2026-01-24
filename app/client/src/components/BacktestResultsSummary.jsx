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
  LineChart,
} from 'lucide-react';
import MetricCard from './MetricCard';
import EquityCurveChart from './EquityCurveChart';
import BacktestTradeList from './BacktestTradeList';
import TradeFilterControls from './TradeFilterControls';
import PriceChart from './PriceChart';
import TradeChartOverlay from './TradeChartOverlay';
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
  initialBalance = 10000,
  onClose,
  className,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isTradeListExpanded, setIsTradeListExpanded] = useState(false);
  const tradeListRef = useRef(null);
  const backtestTradeListRef = useRef(null);

  // Price chart view state
  const [showPriceChartView, setShowPriceChartView] = useState(false);
  const [priceChartData, setPriceChartData] = useState(null);
  const [priceChartLoading, setPriceChartLoading] = useState(false);
  const [priceChartError, setPriceChartError] = useState(null);
  const [tradesVisible, setTradesVisible] = useState(true);
  const [tradesFilter, setTradesFilter] = useState('all');

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
      });
    }
  };

  const handleExportCSV = () => {
    const backtestName = results.strategy_name || 'backtest';
    exportTradesToCSV(allTrades, backtestName);
  };

  const handleTradeCountClick = () => {
    setIsTradeListExpanded(true);
    // Scroll to trade list section after a brief delay for expansion animation
    setTimeout(() => {
      tradeListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Fetch price data for price chart view
  const fetchPriceDataForBacktest = async () => {
    if (!results.pair || !results.granularity || !results.start_date || !results.end_date) {
      setPriceChartError('Missing backtest parameters for price data fetch');
      return;
    }

    setPriceChartLoading(true);
    setPriceChartError(null);

    try {
      const params = new URLSearchParams({
        pair: results.pair,
        granularity: results.granularity,
        start_date: results.start_date,
        end_date: results.end_date,
      });

      const response = await fetch(`/api/prices?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch price data: ${response.statusText}`);
      }

      const data = await response.json();
      setPriceChartData(data);
    } catch (error) {
      console.error('Error fetching price data:', error);
      setPriceChartError(error.message || 'Failed to load price data');
    } finally {
      setPriceChartLoading(false);
    }
  };

  // Handle "View on Price Chart" button click
  const handleViewOnPriceChart = () => {
    setShowPriceChartView(true);
    if (!priceChartData) {
      fetchPriceDataForBacktest();
    }
  };

  // Handle trade marker click - scroll to trade in list
  const handleTradeMarkerClick = (trade, tradeNumber) => {
    // Expand trade list if not expanded
    if (!isTradeListExpanded) {
      setIsTradeListExpanded(true);
    }

    // Highlight the trade
    setSelectedTradeId(tradeNumber);
    setHighlightedTrade({
      ...trade,
      tradeNumber,
    });

    // Scroll to trade in list using ref
    if (backtestTradeListRef.current && backtestTradeListRef.current.scrollToTrade) {
      backtestTradeListRef.current.scrollToTrade(tradeNumber);
    }
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-neutral-500" />
                <h4 className="text-sm font-semibold text-neutral-900">
                  Equity Curve
                </h4>
              </div>
              {allTrades.length > 0 && (
                <button
                  type="button"
                  onClick={handleViewOnPriceChart}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <LineChart className="h-4 w-4" />
                  View on Price Chart
                </button>
              )}
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

          {/* Price Chart View with Trades */}
          {showPriceChartView && (
            <div className="bg-white border border-neutral-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-neutral-500" />
                  <h4 className="text-sm font-semibold text-neutral-900">
                    Price Chart with Trades
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {results.pair} · {results.granularity}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPriceChartView(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Hide
                </button>
              </div>

              {/* Trade Chart Overlay Controls */}
              <TradeChartOverlay
                trades={allTrades}
                visible={tradesVisible}
                filter={tradesFilter}
                onVisibilityChange={setTradesVisible}
                onFilterChange={setTradesFilter}
              />

              {/* Price Chart */}
              {priceChartLoading && (
                <div className="w-full min-h-[500px] flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
                      <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    </div>
                    <p className="text-muted-foreground font-medium">Loading price data...</p>
                  </div>
                </div>
              )}

              {priceChartError && (
                <div className="w-full min-h-[500px] flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <p className="text-destructive font-medium mb-2">Failed to load price data</p>
                    <p className="text-sm text-muted-foreground">{priceChartError}</p>
                    <button
                      type="button"
                      onClick={fetchPriceDataForBacktest}
                      className="mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {!priceChartLoading && !priceChartError && priceChartData && (
                <PriceChart
                  priceData={priceChartData}
                  selectedPair={results.pair}
                  selectedGranularity={results.granularity}
                  chartType="candlestick"
                  showVolume={false}
                  loading={false}
                  trades={allTrades}
                  tradesVisible={tradesVisible}
                  tradesFilter={tradesFilter}
                  onTradeMarkerClick={handleTradeMarkerClick}
                />
              )}

              {!priceChartLoading && !priceChartError && !priceChartData && (
                <div className="w-full min-h-[500px] flex items-center justify-center bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">No price data available</p>
                </div>
              )}
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
                    ref={backtestTradeListRef}
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
    </div>
  );
}

export default BacktestResultsSummary;
