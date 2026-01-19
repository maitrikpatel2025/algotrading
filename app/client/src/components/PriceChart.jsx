import React, { useEffect, useRef, useState, useCallback } from 'react';
import Plotly from 'plotly.js-dist';
import Select from './Select';
import { COUNTS, CHART_TYPES, DATE_RANGES } from '../app/data';
import { drawChart, computeZoomedInRange, computeZoomedOutRange, computeScrolledRange } from '../app/chart';
import { getIndicatorDisplayName } from '../app/indicators';
import { LineChart, BarChart2, X, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

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
  onDateRangeChange,
  loading,
  activeIndicators = [],
  onIndicatorDrop,
  onRemoveIndicator,
  onEditIndicator
}) {
  const chartRef = useRef(null);
  const [visibleCandleCount, setVisibleCandleCount] = useState(null);
  const [showInteractionHint, setShowInteractionHint] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Touch device detection and interaction hint initialization
  useEffect(() => {
    // Detect touch support
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);

    // Check if interaction hint has been dismissed
    const hintDismissed = localStorage.getItem('chart-interaction-hint-dismissed');
    if (!hintDismissed) {
      setShowInteractionHint(true);
    }
  }, []);

  // Draw chart and set up zoom event listener
  useEffect(() => {
    if (priceData && !loading) {
      drawChart(priceData, selectedPair, selectedGranularity, 'chartDiv', chartType, showVolume, activeIndicators);

      // Get chart element reference
      const chartElement = document.getElementById('chartDiv');
      chartRef.current = chartElement;

      if (chartElement) {
        // Set initial candle count
        setVisibleCandleCount(priceData.time ? priceData.time.length : 0);

        // Listen for zoom updates from chart.js
        const handleZoomUpdate = (event) => {
          setVisibleCandleCount(event.detail.visibleCandleCount);
        };

        chartElement.addEventListener('chartZoomUpdate', handleZoomUpdate);

        // Cleanup
        return () => {
          chartElement.removeEventListener('chartZoomUpdate', handleZoomUpdate);
        };
      }
    }
  }, [priceData, selectedPair, selectedGranularity, chartType, showVolume, loading, activeIndicators]);

  // Keyboard navigation with focus management
  useEffect(() => {
    if (!priceData) return;

    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when typing in inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      // Don't trigger if any modifier keys are pressed (except Shift for +)
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const chartElement = chartRef.current;
      if (!chartElement || !chartElement._chartData) return;

      const chartData = chartElement._chartData;

      // Get current axis range
      const getCurrentRange = () => {
        const layout = chartElement.layout;
        if (layout && layout.xaxis && layout.xaxis.range) {
          return layout.xaxis.range;
        }
        // Fallback to data range
        return [chartData.time[0], chartData.time[chartData.time.length - 1]];
      };

      let newRange = null;

      switch (event.key) {
        case '+':
        case '=':
          // Zoom in by 20%
          event.preventDefault();
          newRange = computeZoomedInRange(getCurrentRange(), 0.8, 0.5);
          break;

        case '-':
        case '_':
          // Zoom out by 20%
          event.preventDefault();
          newRange = computeZoomedOutRange(getCurrentRange(), 1.2, 0.5);
          break;

        case 'ArrowLeft':
          // Scroll left by 10%
          event.preventDefault();
          newRange = computeScrolledRange(getCurrentRange(), 'left', 0.1, chartData);
          break;

        case 'ArrowRight':
          // Scroll right by 10%
          event.preventDefault();
          newRange = computeScrolledRange(getCurrentRange(), 'right', 0.1, chartData);
          break;

        default:
          return;
      }

      if (newRange) {
        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
          Plotly.relayout(chartElement, {
            'xaxis.range': newRange
          }, {
            transition: {
              duration: 150,
              easing: 'cubic-in-out'
            }
          });
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [priceData]);

  // Dismiss interaction hint
  const dismissInteractionHint = () => {
    localStorage.setItem('chart-interaction-hint-dismissed', 'true');
    setShowInteractionHint(false);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    // Only set isDragOver to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const indicatorData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (indicatorData && onIndicatorDrop) {
        onIndicatorDrop(indicatorData);
      }
    } catch (err) {
      console.error('Failed to parse indicator data:', err);
    }
  }, [onIndicatorDrop]);

  return (
    <div className="card animate-fade-in">
      {/* Header */}
      <div className="card-header border-b border-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/20">
              <LineChart className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <div>
                <h3 className="card-title">Price Chart</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedPair}
                </p>
              </div>
              {/* Timeframe Badge Pill */}
              <span className="ml-2 px-2 py-1 rounded-md bg-primary text-primary-foreground text-xs font-bold">
                {selectedGranularity}
              </span>
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

        {/* Active Indicators */}
        {activeIndicators.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground mr-2">Active:</span>
              {activeIndicators.map((indicator) => {
                const displayName = getIndicatorDisplayName(indicator, indicator.params || indicator.defaultParams);
                return (
                  <span
                    key={indicator.instanceId}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-muted text-foreground",
                      onEditIndicator && "cursor-pointer hover:bg-muted/80 transition-colors group"
                    )}
                    style={{ borderLeft: `3px solid ${indicator.color}` }}
                    onClick={(e) => {
                      // Don't trigger edit when clicking the remove button
                      if (e.target.closest('button')) return;
                      if (onEditIndicator) {
                        onEditIndicator(indicator.instanceId);
                      }
                    }}
                    title={onEditIndicator ? `Click to edit ${displayName}` : displayName}
                  >
                    {displayName}
                    {onEditIndicator && (
                      <Settings className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    {onRemoveIndicator && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveIndicator(indicator.instanceId);
                        }}
                        className="ml-1 p-0.5 rounded hover:bg-muted-foreground/20 transition-colors"
                        title={`Remove ${displayName}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="p-4">
        {loading ? (
          /* Loading Skeleton State */
          <div className="w-full rounded-lg bg-muted/30 min-h-[500px] flex items-center justify-center" style={{ height: 'calc(100vh - 450px)' }}>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
                <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <p className="text-muted-foreground font-medium">Loading chart data...</p>
            </div>
          </div>
        ) : (
          /* Chart Display with Interaction Features */
          <div
            className={cn(
              "relative rounded-lg transition-all duration-200",
              isDragOver && "ring-2 ring-primary ring-dashed bg-primary/5"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drop zone overlay */}
            {isDragOver && (
              <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                <div className="bg-primary/90 text-primary-foreground px-4 py-2 rounded-md shadow-lg font-medium">
                  Drop to add indicator
                </div>
              </div>
            )}
            <div
              id="chartDiv"
              className="w-full rounded-lg bg-muted/30 min-h-[500px]"
              style={{ height: 'calc(100vh - 450px)' }}
            />

            {/* Interaction Hints Tooltip */}
            {showInteractionHint && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
                <div className="bg-black/90 text-white rounded-md px-4 py-3 shadow-lg max-w-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm">
                      {isTouchDevice ? (
                        <p>
                          <span className="font-semibold">Pinch to zoom</span> • <span className="font-semibold">Drag to pan</span> • <span className="font-semibold">Double-tap to reset</span>
                        </p>
                      ) : (
                        <p>
                          <span className="font-semibold">Scroll to zoom</span> • <span className="font-semibold">Drag to pan</span> • <span className="font-semibold">Double-click to reset</span>
                          <br />
                          <span className="text-xs text-white/80 mt-1 inline-block">Keyboard: +/- to zoom, ←/→ to scroll</span>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={dismissInteractionHint}
                      className="text-white/70 hover:text-white transition-colors flex-shrink-0"
                      title="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Zoom Level Indicator */}
            {visibleCandleCount !== null && (
              <div className="mt-2 text-center">
                <span className="text-sm text-muted-foreground font-medium">
                  Showing {visibleCandleCount} candle{visibleCandleCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PriceChart;
