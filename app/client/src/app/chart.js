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
  }
}
