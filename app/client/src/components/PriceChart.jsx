import React, { useEffect } from 'react';
import Select from './Select';
import { COUNTS, CHART_TYPES, DATE_RANGES } from '../app/data';
import { drawChart } from '../app/chart';
import { LineChart, BarChart2 } from 'lucide-react';

function PriceChart({
  priceData,
  selectedPair,
  selectedGranularity,
  selectedCount,
  handleCountChange,
  chartType,
  onChartTypeChange,
  showVolume,
  onVolumeToggle,
  selectedDateRange,
  onDateRangeChange
}) {
  useEffect(() => {
    if (priceData) {
      drawChart(priceData, selectedPair, selectedGranularity, 'chartDiv', chartType, showVolume);
    }
  }, [priceData, selectedPair, selectedGranularity, chartType, showVolume]);

  return (
    <div className="card animate-fade-in">
      {/* Header */}
      <div className="card-header border-b border-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/20">
              <LineChart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="card-title">Price Chart</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedPair} • {selectedGranularity}
              </p>
            </div>
          </div>

          {/* Chart Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Chart Type Selector */}
            <Select
              name="chartType"
              title="Chart Type"
              options={CHART_TYPES}
              defaultValue={chartType}
              onSelected={onChartTypeChange}
              hideLabel
              className="w-32"
            />

            {/* Candle Count Selector */}
            <Select
              name="numrows"
              title="Candles"
              options={COUNTS}
              defaultValue={selectedCount}
              onSelected={handleCountChange}
              hideLabel
              className="w-24"
            />

            {/* Volume Toggle */}
            <button
              onClick={onVolumeToggle}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                showVolume
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              title={showVolume ? 'Hide Volume' : 'Show Volume'}
            >
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">Vol</span>
            </button>
          </div>
        </div>

        {/* Date Range Buttons */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground mr-2">Range:</span>
            {DATE_RANGES.map((range) => (
              <button
                key={range.key}
                onClick={() => onDateRangeChange(range.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedDateRange === range.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {range.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-4">
        <div
          id="chartDiv"
          className="w-full rounded-lg bg-muted/30 min-h-[500px]"
          style={{ height: 'calc(100vh - 450px)' }}
        />
      </div>
    </div>
  );
}

export default PriceChart;
