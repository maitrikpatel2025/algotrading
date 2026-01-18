import React, { useEffect, useState } from 'react';
import endPoints from '../app/api';
import { COUNTS, calculateCandleCount } from '../app/data';
import Button from '../components/Button';
import PriceChart from '../components/PriceChart';
import Select from '../components/Select';
import Technicals from '../components/Technicals';
import { Play, RefreshCw, BarChart3, AlertTriangle } from 'lucide-react';

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

  // New state for advanced chart features
  const [chartType, setChartType] = useState('candlestick');
  const [showVolume, setShowVolume] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  useEffect(() => {
    loadOptions();
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
    setSelectedGran(data.granularities[0].value);
    setSelectedPair(data.pairs[0].value);
    setLoading(false);
  };

  const loadPrices = async (count) => {
    try {
      const data = await endPoints.prices(selectedPair, selectedGran, count);
      setPriceData(data);
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
    <div className="py-8 space-y-6 animate-fade-in">
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
            <Select
              name="Currency"
              title="Currency Pair"
              options={options.pairs}
              defaultValue={selectedPair}
              onSelected={setSelectedPair}
              className="w-40"
            />
            <Select
              name="Granularity"
              title="Timeframe"
              options={options.granularities}
              defaultValue={selectedGran}
              onSelected={setSelectedGran}
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
  );
}

export default Strategy;
