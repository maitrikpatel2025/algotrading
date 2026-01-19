import React, { useEffect, useState, useRef, useCallback } from 'react';
import endPoints from '../app/api';
import { COUNTS, calculateCandleCount, GRANULARITY_SECONDS } from '../app/data';
import Button from '../components/Button';
import PriceChart from '../components/PriceChart';
import PairSelector from '../components/PairSelector';
import Select from '../components/Select';
import Technicals from '../components/Technicals';
import IndicatorLibrary from '../components/IndicatorLibrary';
import { cn } from '../lib/utils';
import { Play, RefreshCw, BarChart3, AlertTriangle, Info } from 'lucide-react';

// localStorage keys for persisting preferences
const PREFERRED_TIMEFRAME_KEY = 'forex_dash_preferred_timeframe';
const PANEL_COLLAPSED_KEY = 'forex_dash_indicator_panel_collapsed';

function Strategy() {
  const [selectedPair, setSelectedPair] = useState(null);
  const [selectedGran, setSelectedGran] = useState(null);
  const [technicalsData, setTechnicalsData] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [selectedCount, setSelectedCount] = useState(COUNTS[0].value);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  // Indicator panel state
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(PANEL_COLLAPSED_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  // New state for advanced chart features
  const [chartType, setChartType] = useState('candlestick');
  const [showVolume, setShowVolume] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  // Debounce timer ref for timeframe changes
  const debounceTimerRef = useRef(null);
  // Previous timeframe for zoom context preservation
  const previousGranRef = useRef(null);

  useEffect(() => {
    loadOptions();

    // Cleanup debounce timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleCountChange = (count) => {
    setSelectedCount(count);
    setSelectedDateRange(null); // Clear date range when manually setting count
    loadPrices(count);
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  const handleVolumeToggle = () => {
    setShowVolume(!showVolume);
  };

  const handleDateRangeChange = (dateRange) => {
    setSelectedDateRange(dateRange);
    // Calculate the appropriate candle count based on date range and granularity
    const candleCount = calculateCandleCount(dateRange, selectedGran);
    setSelectedCount(String(candleCount));
    loadPrices(String(candleCount));
  };

  const loadOptions = async () => {
    const data = await endPoints.options();
    setOptions(data);

    // Get available granularity values for validation
    const availableGranularities = data.granularities.map(g => g.value);

    // Try to restore preferred timeframe from localStorage
    const preferredTimeframe = localStorage.getItem(PREFERRED_TIMEFRAME_KEY);

    if (preferredTimeframe && availableGranularities.includes(preferredTimeframe)) {
      setSelectedGran(preferredTimeframe);
    } else {
      // Fallback to first available option
      if (preferredTimeframe) {
        console.warn(`Preferred timeframe "${preferredTimeframe}" not available, falling back to default`);
      }
      setSelectedGran(data.granularities[0].value);
    }

    setSelectedPair(data.pairs[0].value);
    setLoading(false);
  };

  // Handle timeframe change with localStorage persistence and debouncing
  const handleTimeframeChange = useCallback((newTimeframe) => {
    // Calculate zoom context preservation if we have data loaded
    if (priceData && selectedGran && GRANULARITY_SECONDS[selectedGran] && GRANULARITY_SECONDS[newTimeframe]) {
      const oldTfSeconds = GRANULARITY_SECONDS[selectedGran];
      const newTfSeconds = GRANULARITY_SECONDS[newTimeframe];
      const oldCandleCount = parseInt(selectedCount, 10);

      // Calculate new candle count to maintain similar time coverage
      let newCandleCount = Math.round(oldCandleCount * (oldTfSeconds / newTfSeconds));
      // Clamp to reasonable range
      newCandleCount = Math.max(50, Math.min(500, newCandleCount));

      setSelectedCount(String(newCandleCount));
    }

    // Store previous granularity for reference
    previousGranRef.current = selectedGran;

    // Update selected granularity immediately for UI responsiveness
    setSelectedGran(newTimeframe);

    // Persist to localStorage
    localStorage.setItem(PREFERRED_TIMEFRAME_KEY, newTimeframe);

    // If we have data loaded, debounce the reload
    if (priceData || technicalsData) {
      // Clear any pending debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Show loading state immediately
      setLoadingData(true);

      // Debounce the API call (300ms)
      debounceTimerRef.current = setTimeout(() => {
        loadTechnicals();
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceData, technicalsData, selectedGran, selectedCount]);

  const loadPrices = async (count, timeframe = selectedGran) => {
    // Validate timeframe exists in available options
    if (options && options.granularities) {
      const availableGranularities = options.granularities.map(g => g.value);
      if (!availableGranularities.includes(timeframe)) {
        console.warn(`Invalid timeframe "${timeframe}", resetting to default`);
        const defaultGran = options.granularities[0].value;
        setSelectedGran(defaultGran);
        timeframe = defaultGran;
      }
    }

    try {
      const data = await endPoints.prices(selectedPair, timeframe, count);
      setPriceData(data);

      // Check for insufficient historical data
      const requestedCount = parseInt(count, 10);
      const actualCount = data.time ? data.time.length : 0;
      if (actualCount < requestedCount && actualCount > 0) {
        setInfoMessage(`Showing ${actualCount} candles - insufficient historical data for ${requestedCount} candles`);
      } else {
        setInfoMessage(null);
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load price data';
      console.error('Error loading prices:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const loadTechnicals = async () => {
    setLoadingData(true);
    setError(null);

    const errors = [];

    try {
      // Load technicals data
      try {
        const techData = await endPoints.technicals(selectedPair, selectedGran);
        setTechnicalsData(techData);
      } catch (err) {
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to load technical analysis';
        console.error('Error loading technicals:', errorMessage);
        errors.push(`Technical analysis: ${errorMessage}`);
        setTechnicalsData(null);
      }

      // Load price data
      const priceResult = await loadPrices(selectedCount);
      if (!priceResult.success) {
        errors.push(`Price data: ${priceResult.error}`);
        setPriceData(null);
      }

      // Set combined error if any errors occurred
      if (errors.length > 0) {
        setError(errors.join(' | '));
      }
    } finally {
      setLoadingData(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearInfoMessage = () => {
    setInfoMessage(null);
  };

  // Handle panel collapse toggle with localStorage persistence
  const handlePanelToggle = useCallback(() => {
    setIsPanelCollapsed(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem(PANEL_COLLAPSED_KEY, String(newValue));
      } catch (e) {
        console.warn('Failed to save panel state to localStorage:', e);
      }
      return newValue;
    });
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="py-8 animate-fade-in">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium">Loading strategy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] animate-fade-in">
      {/* Indicator Library Panel - Left Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-shrink-0 transition-all duration-200 ease-out",
          isPanelCollapsed ? "w-10" : "w-64"
        )}
      >
        <IndicatorLibrary
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={handlePanelToggle}
        />
      </div>

      {/* Mobile Indicator Panel - Overlay */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 transition-opacity duration-200",
          !isPanelCollapsed ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={handlePanelToggle}
        />
        {/* Panel */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full transition-transform duration-200",
            !isPanelCollapsed ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <IndicatorLibrary
            isCollapsed={false}
            onToggleCollapse={handlePanelToggle}
          />
        </div>
      </div>

      {/* Mobile Panel Toggle Button */}
      <button
        type="button"
        onClick={handlePanelToggle}
        className={cn(
          "md:hidden fixed left-4 bottom-4 z-40",
          "flex items-center justify-center w-12 h-12",
          "bg-primary text-primary-foreground rounded-full shadow-lg",
          "hover:bg-primary/90 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
        aria-label="Toggle indicator library"
      >
        <BarChart3 className="h-5 w-5" />
      </button>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 py-8 px-4 md:px-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-h2 text-foreground">Strategy</h1>
            <p className="text-muted-foreground">
              Analyze currency pairs, timeframes, and technical indicators for trading decisions
            </p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="card p-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 flex-wrap">
            {/* Pair & Granularity Selectors */}
            <div className="flex flex-wrap items-end gap-4">
              <PairSelector
                options={options.pairs}
                defaultValue={selectedPair}
                onSelected={setSelectedPair}
                hasLoadedData={!!(technicalsData || priceData)}
                className="w-48"
              />
              <Select
                name="Granularity"
                title="Timeframe"
                options={options.granularities}
                defaultValue={selectedGran}
                onSelected={handleTimeframeChange}
                className="w-32"
              />
            </div>

            {/* Load Button */}
            <Button
              text={loadingData ? "Loading..." : "Load Data"}
              handleClick={() => loadTechnicals()}
              disabled={loadingData}
              icon={loadingData ? RefreshCw : Play}
              className={loadingData ? "[&_svg]:animate-spin" : ""}
            />
          </div>

          {/* Selected Info Badge */}
          {selectedPair && selectedGran && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>
                  Analyzing <span className="font-semibold text-foreground">{selectedPair}</span> on{' '}
                  <span className="font-semibold text-foreground">{selectedGran}</span> timeframe
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="card p-4 border-destructive bg-destructive/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-destructive mb-1">
                  Unable to Load Data
                </h3>
                <p className="text-sm text-muted-foreground">
                  {error}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  This may be due to external data sources being temporarily unavailable. Please try again later.
                </p>
              </div>
              <button
                onClick={clearError}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss error"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Info Message Display (for insufficient data etc.) */}
        {infoMessage && (
          <div className="card p-4 border-info bg-info/10">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {infoMessage}
                </p>
              </div>
              <button
                onClick={clearInfoMessage}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss info"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {(technicalsData || priceData) ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Technicals - Sidebar on large screens */}
            {technicalsData && (
              <div className="xl:col-span-1 xl:order-2">
                <Technicals data={technicalsData} />
              </div>
            )}

            {/* Price Chart - Main area */}
            {priceData && (
              <div className="xl:col-span-2 xl:order-1">
                <PriceChart
                  selectedCount={selectedCount}
                  selectedPair={selectedPair}
                  selectedGranularity={selectedGran}
                  handleCountChange={handleCountChange}
                  priceData={priceData}
                  chartType={chartType}
                  onChartTypeChange={handleChartTypeChange}
                  showVolume={showVolume}
                  onVolumeToggle={handleVolumeToggle}
                  selectedDateRange={selectedDateRange}
                  onDateRangeChange={handleDateRangeChange}
                  loading={loadingData}
                />
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="card">
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="p-4 rounded-full bg-muted mb-4">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Ready to Analyze
              </h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Select a currency pair and timeframe above, then click "Load Data" to view technical analysis and price charts.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  Real-time data
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Technical indicators
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Strategy;
