import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Download, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * EquityCurveChart Component - Interactive Equity Curve Visualization
 *
 * Features:
 * - Interactive chart using lightweight-charts library
 * - Zoom and pan capabilities
 * - Drawdown period highlighting with toggle
 * - Buy-and-hold comparison overlay with toggle
 * - Rich tooltips showing date, balance, drawdown %, trade count
 * - PNG export functionality
 * - Precision Swiss Design System styling
 */
function EquityCurveChart({
  equityCurve = [],
  buyHoldCurve = [],
  equityCurveDates = [],
  tradeCountsPerCandle = [],
  drawdownPeriods = [],
  initialBalance = 10000,
  height = 400,
  highlightedTrade = null,
  className,
}) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const equitySeriesRef = useRef(null);
  const buyHoldSeriesRef = useRef(null);
  const tooltipRef = useRef(null);

  const [showDrawdowns, setShowDrawdowns] = useState(true);
  const [showBuyHold, setShowBuyHold] = useState(true);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || !equityCurve || equityCurve.length < 2) {
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
        mode: 1, // Normal crosshair
        vertLine: {
          color: '#6b7280',
          width: 1,
          style: 3, // Dashed
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

    // Prepare equity curve data
    const equityData = equityCurve.map((value, index) => {
      let time;
      if (equityCurveDates && equityCurveDates[index]) {
        const dateStr = equityCurveDates[index];
        time = new Date(dateStr).getTime() / 1000;
      } else {
        // Fallback: use index as time (will show as numbers)
        time = index;
      }
      return { time, value };
    });

    // Create area series for equity curve
    const finalEquity = equityCurve[equityCurve.length - 1];
    const isProfit = finalEquity >= initialBalance;

    const equitySeries = chart.addAreaSeries({
      topColor: isProfit ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
      bottomColor: isProfit ? 'rgba(34, 197, 94, 0.02)' : 'rgba(239, 68, 68, 0.02)',
      lineColor: isProfit ? '#22c55e' : '#ef4444',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      priceLineVisible: false,
    });

    equitySeries.setData(equityData);
    equitySeriesRef.current = equitySeries;

    // Add buy-and-hold series if available
    if (buyHoldCurve && buyHoldCurve.length >= 2 && showBuyHold) {
      const buyHoldData = buyHoldCurve.map((value, index) => {
        let time;
        if (equityCurveDates && equityCurveDates[index]) {
          time = new Date(equityCurveDates[index]).getTime() / 1000;
        } else {
          time = index;
        }
        return { time, value };
      });

      const buyHoldSeries = chart.addLineSeries({
        color: '#9ca3af',
        lineWidth: 2,
        lineStyle: 2, // Dashed
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 3,
        priceLineVisible: false,
      });

      buyHoldSeries.setData(buyHoldData);
      buyHoldSeriesRef.current = buyHoldSeries;
    }

    // Prepare markers array
    const markers = [];

    // Add drawdown period markers if enabled
    if (showDrawdowns && drawdownPeriods && drawdownPeriods.length > 0) {
      drawdownPeriods.forEach((period) => {
        const startIndex = period.start_index;

        if (startIndex < equityData.length) {
          const startTime = equityData[startIndex].time;

          markers.push({
            time: startTime,
            position: 'belowBar',
            color: '#ef4444',
            shape: 'arrowDown',
            text: `DD: ${period.max_drawdown_pct.toFixed(2)}%`,
          });
        }
      });
    }

    // Add highlighted trade markers if a trade is selected
    if (highlightedTrade) {
      const { entry_time, exit_time, pnl } = highlightedTrade;
      const isProfit = pnl >= 0;

      // Find entry time in equity data
      if (entry_time && equityCurveDates && equityCurveDates.length > 0) {
        const entryTimestamp = new Date(entry_time).getTime();
        let entryIndex = -1;
        let closestDiff = Infinity;

        equityCurveDates.forEach((dateStr, index) => {
          const diff = Math.abs(new Date(dateStr).getTime() - entryTimestamp);
          if (diff < closestDiff) {
            closestDiff = diff;
            entryIndex = index;
          }
        });

        if (entryIndex >= 0 && entryIndex < equityData.length) {
          markers.push({
            time: equityData[entryIndex].time,
            position: 'belowBar',
            color: isProfit ? '#22c55e' : '#ef4444',
            shape: 'arrowUp',
            text: 'Entry',
          });
        }
      }

      // Find exit time in equity data
      if (exit_time && equityCurveDates && equityCurveDates.length > 0) {
        const exitTimestamp = new Date(exit_time).getTime();
        let exitIndex = -1;
        let closestDiff = Infinity;

        equityCurveDates.forEach((dateStr, index) => {
          const diff = Math.abs(new Date(dateStr).getTime() - exitTimestamp);
          if (diff < closestDiff) {
            closestDiff = diff;
            exitIndex = index;
          }
        });

        if (exitIndex >= 0 && exitIndex < equityData.length) {
          markers.push({
            time: equityData[exitIndex].time,
            position: 'aboveBar',
            color: isProfit ? '#22c55e' : '#ef4444',
            shape: 'arrowDown',
            text: `Exit: ${isProfit ? '+' : ''}$${pnl?.toFixed(2) || '0.00'}`,
          });

          // Scroll to the highlighted trade
          setTimeout(() => {
            if (chartRef.current) {
              chartRef.current.timeScale().scrollToPosition(-5, true);
            }
          }, 100);
        }
      }
    }

    // Set all markers at once
    if (markers.length > 0) {
      equitySeries.setMarkers(markers);
    }

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

      // Find the data index for this time
      const timeValue = param.time;
      let dataIndex = equityData.findIndex((d) => d.time === timeValue);

      if (dataIndex === -1) {
        tooltipRef.current.style.display = 'none';
        return;
      }

      // Get values
      const equityValue = equityCurve[dataIndex];
      const buyHoldValue = buyHoldCurve && buyHoldCurve[dataIndex] ? buyHoldCurve[dataIndex] : null;
      const tradeCount = tradeCountsPerCandle && tradeCountsPerCandle[dataIndex] ? tradeCountsPerCandle[dataIndex] : 0;

      // Calculate drawdown at this point
      let drawdownPct = 0;
      let peak = initialBalance;
      for (let i = 0; i <= dataIndex; i++) {
        if (equityCurve[i] > peak) peak = equityCurve[i];
      }
      if (peak > 0) {
        drawdownPct = ((peak - equityValue) / peak) * 100;
      }

      // Format date
      let dateStr = 'N/A';
      if (equityCurveDates && equityCurveDates[dataIndex]) {
        const date = new Date(equityCurveDates[dataIndex]);
        dateStr = date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      // Update tooltip content
      tooltipRef.current.innerHTML = `
        <div class="text-xs text-neutral-600 mb-1.5 font-medium">${dateStr}</div>
        <div class="flex items-center justify-between gap-4 mb-1">
          <span class="text-neutral-500">Balance:</span>
          <span class="font-semibold ${equityValue >= initialBalance ? 'text-success' : 'text-danger'}">
            $${equityValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        ${buyHoldValue !== null && showBuyHold ? `
          <div class="flex items-center justify-between gap-4 mb-1">
            <span class="text-neutral-500">Buy & Hold:</span>
            <span class="font-medium text-neutral-700">
              $${buyHoldValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ` : ''}
        <div class="flex items-center justify-between gap-4 mb-1">
          <span class="text-neutral-500">Drawdown:</span>
          <span class="font-medium ${drawdownPct > 0 ? 'text-danger' : 'text-neutral-700'}">
            ${drawdownPct.toFixed(2)}%
          </span>
        </div>
        <div class="flex items-center justify-between gap-4">
          <span class="text-neutral-500">Trades:</span>
          <span class="font-medium text-neutral-700">${tradeCount}</span>
        </div>
      `;

      // Position tooltip
      tooltipRef.current.style.display = 'block';
      const tooltipWidth = tooltipRef.current.clientWidth;
      const containerWidth = chartContainerRef.current.clientWidth;

      let left = param.point.x;
      if (left > containerWidth - tooltipWidth - 20) {
        left = param.point.x - tooltipWidth - 20;
      } else {
        left = param.point.x + 20;
      }

      tooltipRef.current.style.left = `${left}px`;
      tooltipRef.current.style.top = `${Math.max(10, param.point.y - 100)}px`;
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [equityCurve, buyHoldCurve, equityCurveDates, tradeCountsPerCandle, drawdownPeriods, initialBalance, showDrawdowns, showBuyHold, highlightedTrade]);

  // Export PNG handler
  const handleExportPNG = () => {
    if (!chartRef.current) return;

    try {
      const canvas = chartRef.current.takeScreenshot();
      const dataUrl = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `equity-curve-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to export chart:', error);
    }
  };

  // No data state
  if (!equityCurve || equityCurve.length < 2) {
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDrawdowns(!showDrawdowns)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              showDrawdowns
                ? 'bg-danger/10 text-danger hover:bg-danger/20'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            )}
          >
            {showDrawdowns ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Drawdowns
          </button>

          {buyHoldCurve && buyHoldCurve.length >= 2 && (
            <button
              onClick={() => setShowBuyHold(!showBuyHold)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                showBuyHold
                  ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Buy & Hold
            </button>
          )}
        </div>

        <button
          onClick={handleExportPNG}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export PNG
        </button>
      </div>

      {/* Chart Container */}
      <div className="relative bg-neutral-50 rounded-md overflow-hidden">
        <div
          ref={chartContainerRef}
          style={{ height }}
        />

        {/* Custom Tooltip */}
        <div
          ref={tooltipRef}
          className="absolute z-50 bg-white border border-neutral-200 rounded-md shadow-lg p-2.5 pointer-events-none"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

export default EquityCurveChart;
