import Plotly from 'plotly.js-dist';

// Style guide colors for charts - exact hex values matching ui_style_guide.md
const CHART_COLORS = {
  bullish: '#22c55e',      // Success green (dark mode: #22C55E)
  bearish: '#ef4444',      // Destructive red (dark mode: #EF4444)
  grid: 'rgba(228, 228, 231, 0.3)',
  text: '#71717A',         // Muted foreground
  background: 'transparent',
  volumeBullish: 'rgba(34, 197, 94, 0.5)',  // Semi-transparent green
  volumeBearish: 'rgba(239, 68, 68, 0.5)',  // Semi-transparent red
  line: '#3B82F6',         // Blue for line chart
  areaFill: 'rgba(59, 130, 246, 0.2)',      // Semi-transparent blue
};

/**
 * Calculate the number of visible candles based on X-axis range
 * @param {Array} xaxisRange - [start, end] timestamps for X-axis
 * @param {Object} chartData - Chart data with time array
 * @returns {number} Number of candles visible in the range
 */
function getVisibleCandleCount(xaxisRange, chartData) {
  if (!xaxisRange || !chartData || !chartData.time) {
    return 0;
  }

  const [start, end] = xaxisRange;
  let count = 0;

  for (let i = 0; i < chartData.time.length; i++) {
    const timestamp = new Date(chartData.time[i]).getTime();
    if (timestamp >= new Date(start).getTime() && timestamp <= new Date(end).getTime()) {
      count++;
    }
  }

  return count;
}

/**
 * Clamp zoom range to enforce min/max visible candle constraints
 * @param {Array} newRange - [start, end] proposed range
 * @param {Object} chartData - Chart data with time array
 * @param {number} minCandles - Minimum candles to show (default 50)
 * @param {number} maxCandles - Maximum candles to show (default 500)
 * @returns {Array} Clamped [start, end] range
 */
function clampZoomRange(newRange, chartData, minCandles = 50, maxCandles = 500) {
  if (!newRange || !chartData || !chartData.time || chartData.time.length === 0) {
    return newRange;
  }

  const totalCandles = chartData.time.length;

  // If dataset has fewer than minCandles, don't enforce minimum constraint
  if (totalCandles < minCandles) {
    return newRange;
  }

  const visibleCount = getVisibleCandleCount(newRange, chartData);

  // If within constraints, return as-is
  if (visibleCount >= minCandles && visibleCount <= maxCandles) {
    return newRange;
  }

  const [start, end] = newRange;
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const center = (startTime + endTime) / 2;

  // Calculate average time between candles
  const timeDeltas = [];
  for (let i = 1; i < chartData.time.length; i++) {
    timeDeltas.push(new Date(chartData.time[i]).getTime() - new Date(chartData.time[i - 1]).getTime());
  }
  const avgDelta = timeDeltas.reduce((a, b) => a + b, 0) / timeDeltas.length;

  let targetCandles;
  if (visibleCount < minCandles) {
    targetCandles = minCandles;
  } else {
    targetCandles = maxCandles;
  }

  const targetRange = avgDelta * targetCandles;
  const newStart = new Date(center - targetRange / 2);
  const newEnd = new Date(center + targetRange / 2);

  // Ensure we don't go beyond data boundaries
  const dataStart = new Date(chartData.time[0]);
  const dataEnd = new Date(chartData.time[chartData.time.length - 1]);

  let clampedStart = newStart < dataStart ? dataStart : newStart;
  let clampedEnd = newEnd > dataEnd ? dataEnd : newEnd;

  return [clampedStart.toISOString(), clampedEnd.toISOString()];
}

/**
 * Compute zoomed-in range (reduce visible range by zoom factor)
 * @param {Array} currentRange - [start, end] current range
 * @param {number} zoomFactor - Factor to zoom by (0.8 = 20% zoom in)
 * @param {number} pivotX - Relative position (0-1) to center zoom on
 * @returns {Array} New [start, end] range
 */
export function computeZoomedInRange(currentRange, zoomFactor = 0.8, pivotX = 0.5) {
  const [start, end] = currentRange;
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const currentSpan = endTime - startTime;
  const newSpan = currentSpan * zoomFactor;

  // Calculate zoom center based on pivot point
  const pivotTime = startTime + currentSpan * pivotX;
  const newStart = new Date(pivotTime - newSpan * pivotX);
  const newEnd = new Date(pivotTime + newSpan * (1 - pivotX));

  return [newStart.toISOString(), newEnd.toISOString()];
}

/**
 * Compute zoomed-out range (increase visible range by zoom factor)
 * @param {Array} currentRange - [start, end] current range
 * @param {number} zoomFactor - Factor to zoom by (1.2 = 20% zoom out)
 * @param {number} pivotX - Relative position (0-1) to center zoom on
 * @returns {Array} New [start, end] range
 */
export function computeZoomedOutRange(currentRange, zoomFactor = 1.2, pivotX = 0.5) {
  return computeZoomedInRange(currentRange, zoomFactor, pivotX);
}

/**
 * Compute scrolled range (shift range left or right)
 * @param {Array} currentRange - [start, end] current range
 * @param {string} direction - 'left' or 'right'
 * @param {number} scrollPercent - Percentage of visible range to scroll (0.1 = 10%)
 * @param {Object} chartData - Chart data with time array for boundary checking
 * @returns {Array} New [start, end] range
 */
export function computeScrolledRange(currentRange, direction = 'left', scrollPercent = 0.1, chartData = null) {
  const [start, end] = currentRange;
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const span = endTime - startTime;
  const shift = span * scrollPercent * (direction === 'left' ? -1 : 1);

  let newStart = new Date(startTime + shift);
  let newEnd = new Date(endTime + shift);

  // Enforce data boundaries if chartData provided
  if (chartData && chartData.time && chartData.time.length > 0) {
    const dataStart = new Date(chartData.time[0]);
    const dataEnd = new Date(chartData.time[chartData.time.length - 1]);

    if (newStart < dataStart) {
      const overflow = dataStart.getTime() - newStart.getTime();
      newStart = dataStart;
      newEnd = new Date(newEnd.getTime() + overflow);
    }

    if (newEnd > dataEnd) {
      const overflow = newEnd.getTime() - dataEnd.getTime();
      newEnd = dataEnd;
      newStart = new Date(newStart.getTime() - overflow);
    }
  }

  return [newStart.toISOString(), newEnd.toISOString()];
}

/**
 * Create a candlestick trace
 */
function createCandlestickTrace(chartData, pairName) {
  return {
    x: chartData.time,
    close: chartData.mid_c,
    high: chartData.mid_h,
    low: chartData.mid_l,
    open: chartData.mid_o,
    type: 'candlestick',
    xaxis: 'x',
    yaxis: 'y',
    increasing: {
      line: { width: 1, color: CHART_COLORS.bullish },
      fillcolor: CHART_COLORS.bullish
    },
    decreasing: {
      line: { width: 1, color: CHART_COLORS.bearish },
      fillcolor: CHART_COLORS.bearish
    },
    name: pairName,
  };
}

/**
 * Create an OHLC trace
 */
function createOHLCTrace(chartData, pairName) {
  return {
    x: chartData.time,
    close: chartData.mid_c,
    high: chartData.mid_h,
    low: chartData.mid_l,
    open: chartData.mid_o,
    type: 'ohlc',
    xaxis: 'x',
    yaxis: 'y',
    increasing: {
      line: { width: 1, color: CHART_COLORS.bullish }
    },
    decreasing: {
      line: { width: 1, color: CHART_COLORS.bearish }
    },
    name: pairName,
  };
}

/**
 * Create a line trace (uses close prices)
 */
function createLineTrace(chartData, pairName) {
  return {
    x: chartData.time,
    y: chartData.mid_c,
    type: 'scatter',
    mode: 'lines',
    xaxis: 'x',
    yaxis: 'y',
    line: {
      color: CHART_COLORS.line,
      width: 2,
    },
    name: pairName,
  };
}

/**
 * Create an area trace (line with filled area below)
 */
function createAreaTrace(chartData, pairName) {
  return {
    x: chartData.time,
    y: chartData.mid_c,
    type: 'scatter',
    mode: 'lines',
    xaxis: 'x',
    yaxis: 'y',
    fill: 'tozeroy',
    fillcolor: CHART_COLORS.areaFill,
    line: {
      color: CHART_COLORS.line,
      width: 2,
    },
    name: pairName,
  };
}

/**
 * Create the main price trace based on chart type
 */
function createPriceTrace(chartData, pairName, chartType) {
  switch (chartType) {
    case 'ohlc':
      return createOHLCTrace(chartData, pairName);
    case 'line':
      return createLineTrace(chartData, pairName);
    case 'area':
      return createAreaTrace(chartData, pairName);
    case 'candlestick':
    default:
      return createCandlestickTrace(chartData, pairName);
  }
}

/**
 * Create volume trace with color coding based on price direction
 * Note: OpenFX API may not provide volume data. If not available,
 * we calculate a proxy volume based on candle range (high - low).
 */
function createVolumeTrace(chartData) {
  const volumes = [];
  const colors = [];

  for (let i = 0; i < chartData.time.length; i++) {
    // Use actual volume if available, otherwise calculate proxy from price range
    const volume = chartData.volume?.[i] ??
      Math.abs(chartData.mid_h[i] - chartData.mid_l[i]) * 1000000;
    volumes.push(volume);

    // Color based on whether close > open (bullish) or close < open (bearish)
    const isBullish = chartData.mid_c[i] >= chartData.mid_o[i];
    colors.push(isBullish ? CHART_COLORS.volumeBullish : CHART_COLORS.volumeBearish);
  }

  return {
    x: chartData.time,
    y: volumes,
    type: 'bar',
    xaxis: 'x',
    yaxis: 'y2',
    marker: {
      color: colors,
    },
    name: 'Volume',
    hovertemplate: 'Volume: %{y:,.0f}<extra></extra>',
  };
}

/**
 * Draw the chart with support for multiple chart types, volume subplot, and advanced interactions.
 * @param {Object} chartData - The chart data with time, mid_o, mid_h, mid_l, mid_c, and optionally volume
 * @param {string} p - Pair name (e.g., "EUR_USD")
 * @param {string} g - Granularity (e.g., "H1")
 * @param {string} divName - The ID of the div element to render the chart in
 * @param {string} chartType - Chart type: 'candlestick', 'ohlc', 'line', or 'area'
 * @param {boolean} showVolume - Whether to show the volume subplot
 */
export function drawChart(chartData, p, g, divName, chartType = 'candlestick', showVolume = false) {
  const data = [];

  // Add main price trace
  const priceTrace = createPriceTrace(chartData, p, chartType);
  data.push(priceTrace);

  // Add volume trace if enabled
  if (showVolume) {
    const volumeTrace = createVolumeTrace(chartData);
    data.push(volumeTrace);
  }

  // Calculate y-axis domain based on whether volume is shown
  const priceYAxisDomain = showVolume ? [0.25, 1] : [0, 1];
  const volumeYAxisDomain = [0, 0.2];

  const layout = {
    title: {
      text: `${p} • ${g}`,
      font: {
        family: 'Anek Odia, system-ui, sans-serif',
        size: 16,
        color: CHART_COLORS.text,
      },
      x: 0.01,
      xanchor: 'left',
    },
    height: '100%',
    autosize: true,
    showlegend: false,
    margin: {
      l: 60,
      r: 60,
      b: 50,
      t: 50,
      pad: 4,
    },
    paper_bgcolor: CHART_COLORS.background,
    plot_bgcolor: CHART_COLORS.background,
    xaxis: {
      rangeslider: {
        visible: false,
      },
      showgrid: true,
      gridcolor: CHART_COLORS.grid,
      gridwidth: 1,
      tickfont: {
        family: 'JetBrains Mono, monospace',
        size: 11,
        color: CHART_COLORS.text,
      },
      linecolor: CHART_COLORS.grid,
      linewidth: 1,
      // Crosshair spike line configuration
      showspikes: true,
      spikemode: 'across',
      spikesnap: 'cursor',
      spikecolor: '#71717A',
      spikethickness: 1,
      spikedash: 'dot',
    },
    yaxis: {
      side: 'right',
      showgrid: true,
      gridcolor: CHART_COLORS.grid,
      gridwidth: 1,
      tickfont: {
        family: 'JetBrains Mono, monospace',
        size: 11,
        color: CHART_COLORS.text,
      },
      linecolor: CHART_COLORS.grid,
      linewidth: 1,
      tickformat: '.5f',
      domain: priceYAxisDomain,
      // Crosshair spike line configuration
      showspikes: true,
      spikemode: 'across',
      spikesnap: 'cursor',
      spikecolor: '#71717A',
      spikethickness: 1,
      spikedash: 'dot',
    },
    // Configure hover mode for crosshair effect
    hovermode: 'x unified',
    hoverlabel: {
      bgcolor: '#18181B',
      bordercolor: '#3F3F46',
      font: {
        family: 'Anek Odia, system-ui, sans-serif',
        size: 12,
        color: '#FAFAFA',
      },
    },
    // Enable drag mode for panning
    dragmode: 'pan',
  };

  // Add volume y-axis if showing volume
  if (showVolume) {
    layout.yaxis2 = {
      side: 'right',
      showgrid: false,
      tickfont: {
        family: 'JetBrains Mono, monospace',
        size: 10,
        color: CHART_COLORS.text,
      },
      linecolor: CHART_COLORS.grid,
      linewidth: 1,
      domain: volumeYAxisDomain,
      tickformat: '.2s',
      title: {
        text: 'Vol',
        font: {
          size: 10,
          color: CHART_COLORS.text,
        },
        standoff: 5,
      },
    };
  }

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    toImageButtonOptions: {
      format: 'png',
      filename: `${p}_${g}_chart`,
    },
    // Enable scroll zoom for mouse wheel zoom
    scrollZoom: true,
    // Double-click to reset zoom
    doubleClick: 'reset',
  };

  Plotly.newPlot(divName, data, layout, config);

  // Resize to fit container
  const chartElement = document.getElementById(divName);
  if (chartElement) {
    Plotly.Plots.resize(chartElement);

    // Store chartData reference on element for event handlers
    chartElement._chartData = chartData;

    // Track ongoing relayout to prevent infinite loops
    let isRelayouting = false;

    // Add event listener for zoom constraint enforcement
    chartElement.on('plotly_relayout', (eventData) => {
      // Avoid infinite relayout loops
      if (isRelayouting) return;

      // Check if this is a zoom/pan operation (xaxis.range update)
      const hasXRange = eventData['xaxis.range[0]'] !== undefined && eventData['xaxis.range[1]'] !== undefined;
      const hasXAutorange = eventData['xaxis.autorange'] !== undefined;

      if (hasXRange) {
        const newRange = [eventData['xaxis.range[0]'], eventData['xaxis.range[1]']];
        const visibleCount = getVisibleCandleCount(newRange, chartData);

        // Apply constraints (50-500 candles)
        if (visibleCount < 50 || visibleCount > 500) {
          const clampedRange = clampZoomRange(newRange, chartData, 50, 500);

          // Use requestAnimationFrame to debounce and prevent layout thrashing
          requestAnimationFrame(() => {
            isRelayouting = true;
            Plotly.relayout(chartElement, {
              'xaxis.range': clampedRange
            }).then(() => {
              isRelayouting = false;
            }).catch(() => {
              isRelayouting = false;
            });
          });
        }

        // Dispatch custom event with visible candle count for UI updates
        const candleCountEvent = new CustomEvent('chartZoomUpdate', {
          detail: { visibleCandleCount: visibleCount }
        });
        chartElement.dispatchEvent(candleCountEvent);
      } else if (hasXAutorange) {
        // After reset, dispatch event with total candle count
        const totalCount = chartData.time ? chartData.time.length : 0;
        const candleCountEvent = new CustomEvent('chartZoomUpdate', {
          detail: { visibleCandleCount: totalCount }
        });
        chartElement.dispatchEvent(candleCountEvent);
      }
    });
  }
}
