import React, { useState, useMemo } from 'react';
import { cn } from '../lib/utils';

/**
 * EquityCurveChart Component - Precision Swiss Design System
 *
 * Responsive SVG chart showing strategy equity curve vs buy-and-hold benchmark.
 * Features:
 * - Strategy equity curve as primary line (blue/green/red based on performance)
 * - Buy-and-hold curve as secondary line (gray dashed)
 * - Break-even reference line at initial balance
 * - Hover tooltips showing value at each point
 * - Legend showing "Strategy" vs "Buy & Hold"
 */
function EquityCurveChart({
  equityCurve = [],
  buyHoldCurve = [],
  initialBalance = 10000,
  height = 200,
  className,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Calculate chart dimensions and scaling
  const chartData = useMemo(() => {
    if (!equityCurve || equityCurve.length < 2) {
      return null;
    }

    const width = 600;
    const padding = { top: 20, right: 60, bottom: 30, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Combine all values for min/max calculation
    const allValues = [
      ...equityCurve,
      ...(buyHoldCurve.length > 0 ? buyHoldCurve : []),
      initialBalance,
    ];
    const minValue = Math.min(...allValues) * 0.99;
    const maxValue = Math.max(...allValues) * 1.01;
    const valueRange = maxValue - minValue || 1;

    // Scale functions
    const scaleX = (index, dataLength) =>
      padding.left + (index / (dataLength - 1)) * chartWidth;
    const scaleY = (value) =>
      padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

    // Generate equity curve path
    const equityPathPoints = equityCurve
      .map((value, index) => {
        const x = scaleX(index, equityCurve.length);
        const y = scaleY(value);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    // Generate equity curve area fill path
    const equityAreaPath = `${equityPathPoints} L ${scaleX(equityCurve.length - 1, equityCurve.length)} ${scaleY(minValue)} L ${scaleX(0, equityCurve.length)} ${scaleY(minValue)} Z`;

    // Generate buy-hold path if available
    let buyHoldPathPoints = '';
    if (buyHoldCurve.length >= 2) {
      // Normalize buy-hold curve to match equity curve length if different
      const sampleRate = Math.max(1, Math.floor(buyHoldCurve.length / equityCurve.length));
      const sampledBuyHold = [];
      for (let i = 0; i < equityCurve.length; i++) {
        const bhIndex = Math.min(Math.floor(i * sampleRate), buyHoldCurve.length - 1);
        sampledBuyHold.push(buyHoldCurve[bhIndex]);
      }
      buyHoldPathPoints = sampledBuyHold
        .map((value, index) => {
          const x = scaleX(index, sampledBuyHold.length);
          const y = scaleY(value);
          return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');
    }

    // Break-even line
    const breakEvenY = scaleY(initialBalance);

    // Final equity
    const finalEquity = equityCurve[equityCurve.length - 1];
    const isProfit = finalEquity >= initialBalance;

    // Y-axis ticks
    const yTickCount = 5;
    const yTicks = [];
    for (let i = 0; i <= yTickCount; i++) {
      const value = minValue + (valueRange * i) / yTickCount;
      yTicks.push({
        value,
        y: scaleY(value),
        label: `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      });
    }

    return {
      width,
      height,
      padding,
      chartWidth,
      chartHeight,
      equityPathPoints,
      equityAreaPath,
      buyHoldPathPoints,
      breakEvenY,
      isProfit,
      finalEquity,
      scaleX,
      scaleY,
      yTicks,
      minValue,
      maxValue,
    };
  }, [equityCurve, buyHoldCurve, initialBalance, height]);

  // No data state
  if (!chartData) {
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

  // Format currency for tooltip
  const formatCurrency = (value) => {
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get value at hovered index
  const getHoverInfo = () => {
    if (hoveredIndex === null) return null;

    const equityValue = equityCurve[hoveredIndex];
    const buyHoldValue = buyHoldCurve.length > 0
      ? buyHoldCurve[Math.min(
          Math.floor(hoveredIndex * (buyHoldCurve.length / equityCurve.length)),
          buyHoldCurve.length - 1
        )]
      : null;

    return { equityValue, buyHoldValue };
  };

  const hoverInfo = getHoverInfo();

  return (
    <div className={cn('relative', className)}>
      {/* Legend */}
      <div className="flex items-center justify-end gap-4 mb-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              'w-4 h-0.5',
              chartData.isProfit ? 'bg-success' : 'bg-danger'
            )}
          />
          <span className="text-neutral-600">Strategy</span>
        </div>
        {buyHoldCurve.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 border-t border-dashed border-neutral-400" />
            <span className="text-neutral-600">Buy & Hold</span>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${chartData.width} ${chartData.height}`}
        className="w-full bg-neutral-50 rounded-md"
        style={{ height }}
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient
            id="equityGradientProfit"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.2" />
            <stop
              offset="100%"
              stopColor="rgb(34, 197, 94)"
              stopOpacity="0.02"
            />
          </linearGradient>
          <linearGradient
            id="equityGradientLoss"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.2" />
            <stop
              offset="100%"
              stopColor="rgb(239, 68, 68)"
              stopOpacity="0.02"
            />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines and labels */}
        {chartData.yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={chartData.padding.left}
              y1={tick.y}
              x2={chartData.width - chartData.padding.right}
              y2={tick.y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={chartData.padding.left - 8}
              y={tick.y}
              textAnchor="end"
              dominantBaseline="middle"
              className="text-[10px] fill-neutral-400"
            >
              {tick.label}
            </text>
          </g>
        ))}

        {/* Area fill under equity curve */}
        <path
          d={chartData.equityAreaPath}
          fill={
            chartData.isProfit
              ? 'url(#equityGradientProfit)'
              : 'url(#equityGradientLoss)'
          }
        />

        {/* Break-even reference line */}
        <line
          x1={chartData.padding.left}
          y1={chartData.breakEvenY}
          x2={chartData.width - chartData.padding.right}
          y2={chartData.breakEvenY}
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="6 3"
        />
        <text
          x={chartData.width - chartData.padding.right + 4}
          y={chartData.breakEvenY}
          dominantBaseline="middle"
          className="text-[9px] fill-neutral-400"
        >
          Initial
        </text>

        {/* Buy-and-hold curve (dashed gray) */}
        {chartData.buyHoldPathPoints && (
          <path
            d={chartData.buyHoldPathPoints}
            fill="none"
            stroke="#9ca3af"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />
        )}

        {/* Equity curve line */}
        <path
          d={chartData.equityPathPoints}
          fill="none"
          stroke={chartData.isProfit ? '#22c55e' : '#ef4444'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current point indicator */}
        <circle
          cx={chartData.scaleX(equityCurve.length - 1, equityCurve.length)}
          cy={chartData.scaleY(chartData.finalEquity)}
          r="4"
          fill={chartData.isProfit ? '#22c55e' : '#ef4444'}
        />

        {/* Hover detection areas */}
        {equityCurve.map((_, index) => {
          const x = chartData.scaleX(index, equityCurve.length);
          const segmentWidth = chartData.chartWidth / (equityCurve.length - 1);
          return (
            <rect
              key={index}
              x={x - segmentWidth / 2}
              y={chartData.padding.top}
              width={segmentWidth}
              height={chartData.chartHeight}
              fill="transparent"
              onMouseEnter={() => setHoveredIndex(index)}
            />
          );
        })}

        {/* Hover indicator */}
        {hoveredIndex !== null && (
          <>
            {/* Vertical line */}
            <line
              x1={chartData.scaleX(hoveredIndex, equityCurve.length)}
              y1={chartData.padding.top}
              x2={chartData.scaleX(hoveredIndex, equityCurve.length)}
              y2={chartData.height - chartData.padding.bottom}
              stroke="#6b7280"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {/* Equity point */}
            <circle
              cx={chartData.scaleX(hoveredIndex, equityCurve.length)}
              cy={chartData.scaleY(equityCurve[hoveredIndex])}
              r="5"
              fill={chartData.isProfit ? '#22c55e' : '#ef4444'}
              stroke="white"
              strokeWidth="2"
            />
          </>
        )}
      </svg>

      {/* Hover Tooltip */}
      {hoveredIndex !== null && hoverInfo && (
        <div
          className="absolute z-10 bg-white border border-neutral-200 rounded-md shadow-lg p-2 text-xs pointer-events-none"
          style={{
            left: `${((hoveredIndex / (equityCurve.length - 1)) * 100)}%`,
            top: '20%',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Strategy:</span>
              <span
                className={cn(
                  'font-medium',
                  hoverInfo.equityValue >= initialBalance
                    ? 'text-success'
                    : 'text-danger'
                )}
              >
                {formatCurrency(hoverInfo.equityValue)}
              </span>
            </div>
            {hoverInfo.buyHoldValue !== null && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-500">Buy & Hold:</span>
                <span className="font-medium text-neutral-700">
                  {formatCurrency(hoverInfo.buyHoldValue)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EquityCurveChart;
