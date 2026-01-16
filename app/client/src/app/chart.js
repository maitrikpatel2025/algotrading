import Plotly from 'plotly.js-dist';

// Style guide colors for charts
const CHART_COLORS = {
  bullish: '#22C55E',      // Success green
  bearish: '#EF4444',      // Destructive red
  grid: 'rgba(228, 228, 231, 0.3)',
  text: '#71717A',         // Muted foreground
  background: 'transparent',
};

export function drawChart(chartData, p, g, divName) {
  const trace = {
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
    name: p,
  };

  const data = [trace];

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
      r: 20,
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
    },
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
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    toImageButtonOptions: {
      format: 'png',
      filename: `${p}_${g}_chart`,
    },
  };

  Plotly.newPlot(divName, data, layout, config);
  
  // Resize to fit container
  const chartElement = document.getElementById(divName);
  if (chartElement) {
    Plotly.Plots.resize(chartElement);
  }
}
