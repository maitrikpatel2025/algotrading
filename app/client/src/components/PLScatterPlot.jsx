import React, { useEffect, useRef, useMemo } from 'react';
import { createChart, LineSeries, createSeriesMarkers } from 'lightweight-charts';
import { cn } from '../lib/utils';

/**
 * PLScatterPlot Component
 *
 * Displays a scatter plot of trade P/L over time.
 * X-axis shows entry dates, Y-axis shows P/L values.
 * Green markers for winning trades, red for losing trades.
 * Includes a reference line at y=0.
 */
function PLScatterPlot({ data = [], currency = '$', height = 280, className }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const tooltipRef = useRef(null);

  // Sort data by entry time
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort(
      (a, b) => new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()
    );
  }, [data]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return sortedData.map((trade) => ({
      time: new Date(trade.entry_time).getTime() / 1000,
      value: trade.pnl,
      isWinner: trade.is_winner,
    }));
  }, [sortedData]);


  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || chartData.length < 1) {
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

    // Create line series for the scatter plot (we'll use markers)
    const pnlSeries = chart.addSeries(LineSeries, {
      color: 'transparent',
      lineWidth: 0,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // Set data
    pnlSeries.setData(chartData);

    // Create markers for each point (lightweight-charts v5 API)
    const markers = chartData.map((point) => ({
      time: point.time,
      position: 'inBar',
      color: point.isWinner ? '#22c55e' : '#ef4444',
      shape: 'circle',
      size: 1.5,
    }));
    createSeriesMarkers(pnlSeries, markers);

    // Add reference line at y=0
    pnlSeries.createPriceLine({
      price: 0,
      color: '#9ca3af',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      axisLabelVisible: false,
      title: '',
    });

    // Fit content
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

      // Find the closest data point
      const timeValue = param.time;
      const dataPoint = chartData.find((d) => d.time === timeValue);

      if (!dataPoint) {
        tooltipRef.current.style.display = 'none';
        return;
      }

      // Format date
      const date = new Date(timeValue * 1000);
      const dateStr = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // Format P/L
      const pnlFormatted = Math.abs(dataPoint.value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const pnlStr =
        dataPoint.value >= 0 ? `+${currency}${pnlFormatted}` : `-${currency}${pnlFormatted}`;

      // Update tooltip
      tooltipRef.current.innerHTML = `
        <div class="text-xs text-neutral-600 mb-1 font-medium">${dateStr}</div>
        <div class="flex items-center justify-between gap-3">
          <span class="text-neutral-500">P/L:</span>
          <span class="font-semibold ${dataPoint.isWinner ? 'text-success' : 'text-danger'}">${pnlStr}</span>
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
      tooltipRef.current.style.top = `${Math.max(10, param.point.y - 60)}px`;
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartData, currency]);

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'bg-neutral-50 rounded-md flex items-center justify-center',
          className
        )}
        style={{ height }}
      >
        <span className="text-sm text-neutral-400">No P/L scatter data available</span>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Chart Title */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          P/L Over Time
        </span>
        <span className="text-xs text-neutral-400">{data.length} trades</span>
      </div>

      {/* Chart Container */}
      <div className="relative bg-neutral-50 rounded-md overflow-hidden">
        <div ref={chartContainerRef} style={{ height }} />

        {/* Custom Tooltip */}
        <div
          ref={tooltipRef}
          className="absolute z-50 bg-white border border-neutral-200 rounded-md shadow-lg p-2 pointer-events-none"
          style={{ display: 'none' }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-success" />
          <span className="text-xs text-neutral-600">Winners</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-danger" />
          <span className="text-xs text-neutral-600">Losers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-px bg-neutral-400" style={{ borderTop: '1px dashed #9ca3af' }} />
          <span className="text-xs text-neutral-600">Zero Line</span>
        </div>
      </div>
    </div>
  );
}

export default PLScatterPlot;
