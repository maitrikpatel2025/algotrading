import React, { useEffect, useRef, useState } from 'react';
import { createChart, LineSeries } from 'lightweight-charts';
import { Eye, EyeOff, Download, Percent, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * ComparisonEquityCurve Component
 *
 * Overlays equity curves from multiple backtests on a single chart.
 * Features:
 * - Distinct colors for each backtest
 * - Toggle visibility of individual curves
 * - Normalized view (percentage returns) option
 * - Interactive crosshair with multi-backtest tooltips
 * - PNG export functionality
 * - Zoom and pan support
 */
function ComparisonEquityCurve({
  backtests = [],
  colors = [],
  height = 400,
  className,
}) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRefs = useRef([]);
  const tooltipRef = useRef(null);

  const [visibleBacktests, setVisibleBacktests] = useState(
    () => new Set(backtests.map((b) => b.id))
  );
  const [isNormalized, setIsNormalized] = useState(false);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || backtests.length === 0) {
      return;
    }

    // Check if any backtest has equity curve data
    const hasData = backtests.some(
      (b) => b.results?.equity_curve && b.results.equity_curve.length >= 2
    );
    if (!hasData) {
      return;
    }

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#fafafa' },
        textColor: '#737373',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#e5e7eb' },
        horzLines: { color: '#e5e7eb' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#6b7280',
          width: 1,
          style: 3,
          labelBackgroundColor: '#6b7280',
        },
        horzLine: {
          color: '#6b7280',
          width: 1,
          style: 3,
          labelBackgroundColor: '#6b7280',
        },
      },
      timeScale: {
        borderColor: '#d1d5db',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#d1d5db',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;
    seriesRefs.current = [];

    // Add series for each backtest
    backtests.forEach((backtest, index) => {
      if (!visibleBacktests.has(backtest.id)) {
        seriesRefs.current.push(null);
        return;
      }

      const equityCurve = backtest.results?.equity_curve || [];
      const equityCurveDates = backtest.results?.equity_curve_dates || [];
      const initialBalance = backtest.initial_balance || 10000;

      if (equityCurve.length < 2) {
        seriesRefs.current.push(null);
        return;
      }

      // Prepare data
      const data = equityCurve.map((value, i) => {
        let time;
        if (equityCurveDates && equityCurveDates[i]) {
          time = new Date(equityCurveDates[i]).getTime() / 1000;
        } else {
          time = i;
        }

        // Calculate value based on normalization mode
        let displayValue;
        if (isNormalized) {
          // Percentage return from initial balance
          displayValue = ((value - initialBalance) / initialBalance) * 100;
        } else {
          displayValue = value;
        }

        return { time, value: displayValue };
      });

      // Create line series
      const color = colors[index] || colors[0];
      const series = chart.addSeries(LineSeries, {
        color: color.line,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        priceLineVisible: false,
      });

      series.setData(data);
      seriesRefs.current.push({ series, data, backtest, color, initialBalance });
    });

    // Fit content initially
    chart.timeScale().fitContent();

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Custom tooltip handler
    chart.subscribeCrosshairMove((param) => {
      if (!tooltipRef.current) return;

      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.y < 0
      ) {
        tooltipRef.current.style.display = 'none';
        return;
      }

      // Build tooltip content with values from all visible series
      const tooltipLines = [];

      // Find date from first series with data
      let dateStr = 'N/A';
      for (const ref of seriesRefs.current) {
        if (ref && ref.data) {
          const dataPoint = ref.data.find((d) => d.time === param.time);
          if (dataPoint && ref.backtest.results?.equity_curve_dates) {
            const index = ref.data.indexOf(dataPoint);
            if (ref.backtest.results.equity_curve_dates[index]) {
              const date = new Date(ref.backtest.results.equity_curve_dates[index]);
              dateStr = date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
            }
            break;
          }
        }
      }

      tooltipLines.push(`<div class="text-xs text-neutral-600 mb-1.5 font-medium">${dateStr}</div>`);

      // Add values for each visible backtest
      for (const ref of seriesRefs.current) {
        if (ref && ref.data && ref.series) {
          const dataPoint = ref.data.find((d) => d.time === param.time);
          if (dataPoint) {
            let valueStr;
            if (isNormalized) {
              valueStr = `${dataPoint.value >= 0 ? '+' : ''}${dataPoint.value.toFixed(2)}%`;
            } else {
              valueStr = `$${dataPoint.value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`;
            }

            tooltipLines.push(`
              <div class="flex items-center justify-between gap-4 mb-0.5">
                <div class="flex items-center gap-1.5">
                  <div class="w-2 h-2 rounded-full" style="background-color: ${ref.color.line}"></div>
                  <span class="text-neutral-500 text-xs truncate max-w-[80px]">${ref.backtest.name}</span>
                </div>
                <span class="font-semibold text-xs tabular-nums ${
                  isNormalized
                    ? dataPoint.value >= 0
                      ? 'text-success'
                      : 'text-danger'
                    : 'text-neutral-900'
                }">${valueStr}</span>
              </div>
            `);
          }
        }
      }

      tooltipRef.current.innerHTML = tooltipLines.join('');
      tooltipRef.current.style.display = 'block';

      // Position tooltip
      const tooltipWidth = tooltipRef.current.clientWidth;
      const containerWidth = chartContainerRef.current.clientWidth;

      let left = param.point.x;
      if (left > containerWidth - tooltipWidth - 20) {
        left = param.point.x - tooltipWidth - 20;
      } else {
        left = param.point.x + 20;
      }

      tooltipRef.current.style.left = `${left}px`;
      tooltipRef.current.style.top = `${Math.max(10, param.point.y - 80)}px`;
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [backtests, colors, visibleBacktests, isNormalized]);

  // Toggle backtest visibility
  const handleToggleVisibility = (backtestId) => {
    setVisibleBacktests((prev) => {
      const next = new Set(prev);
      if (next.has(backtestId)) {
        next.delete(backtestId);
      } else {
        next.add(backtestId);
      }
      return next;
    });
  };

  // Export PNG handler
  const handleExportPNG = () => {
    if (!chartRef.current) return;

    try {
      const canvas = chartRef.current.takeScreenshot();
      const dataUrl = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `equity-comparison-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to export chart:', error);
    }
  };

  // No data state
  const hasData = backtests.some(
    (b) => b.results?.equity_curve && b.results.equity_curve.length >= 2
  );
  if (!hasData) {
    return (
      <div
        className={cn(
          'bg-neutral-50 rounded-md flex items-center justify-center',
          className
        )}
        style={{ height }}
      >
        <span className="text-sm text-neutral-400">
          Equity curve data not available
        </span>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        {/* Backtest visibility toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {backtests.map((backtest, index) => {
            const color = colors[index] || colors[0];
            const isVisible = visibleBacktests.has(backtest.id);

            return (
              <button
                key={backtest.id}
                onClick={() => handleToggleVisibility(backtest.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  isVisible
                    ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                    : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                )}
              >
                <div
                  className={cn('w-2 h-2 rounded-full', !isVisible && 'opacity-40')}
                  style={{ backgroundColor: color.line }}
                />
                {isVisible ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
                <span className="truncate max-w-[80px]">{backtest.name}</span>
              </button>
            );
          })}
        </div>

        {/* Mode and export controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNormalized(!isNormalized)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              isNormalized
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            )}
            title={isNormalized ? 'Show absolute values' : 'Show percentage returns'}
          >
            {isNormalized ? (
              <Percent className="w-3.5 h-3.5" />
            ) : (
              <DollarSign className="w-3.5 h-3.5" />
            )}
            {isNormalized ? 'Normalized' : 'Absolute'}
          </button>

          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export PNG
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative bg-neutral-50 rounded-md overflow-hidden">
        <div ref={chartContainerRef} style={{ height }} />

        {/* Custom Tooltip */}
        <div
          ref={tooltipRef}
          className="absolute z-50 bg-white border border-neutral-200 rounded-md shadow-lg p-2.5 pointer-events-none"
          style={{ display: 'none', minWidth: '180px' }}
        />
      </div>
    </div>
  );
}

export default ComparisonEquityCurve;
