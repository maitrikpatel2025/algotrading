/**
 * PriceChart Component (TradingView Lightweight Charts + WebSocket)
 * ===================================================================
 * Displays real-time price charts using TradingView Lightweight Charts.
 * Connects to backend WebSocket for live price updates.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Settings, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useWebSocket, CONNECTION_STATUS } from '../hooks/useWebSocket';
import { useCandleAggregator } from '../hooks/useCandleAggregator';
import {
  createTradingViewChart,
  addCandlestickSeries,
  addLineSeries,
  addPriceLine,
  updateLastCandle,
  fitChartContent,
  destroyChart,
  convertApiDataToCandles,
} from '../app/tradingViewChart';
import { getIndicatorDisplayName } from '../app/indicators';
import IndicatorContextMenu from './IndicatorContextMenu';

function PriceChart({
  priceData,
  selectedPair,
  selectedGranularity,
  selectedCount,
  handleCountChange,
  loading,
  activeIndicators = [],
  onRemoveIndicator,
  onEditIndicator,
  onIndicatorClick,
  onIndicatorConfigure,
  onIndicatorDuplicate,
  previewIndicator = null,
  onIndicatorDrop,
}) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const indicatorSeriesRef = useRef({}); // Store indicator series by instance ID

  const [isDragOver, setIsDragOver] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    indicatorInstanceId: null,
    indicatorName: '',
  });

  // WebSocket URL construction
  const wsUrl = selectedPair && selectedGranularity
    ? `ws://localhost:8000/ws/prices/${selectedPair}/${selectedGranularity}`
    : null;

  // Candle aggregator hook
  const candleAggregator = useCandleAggregator(selectedGranularity, []);

  // WebSocket hook
  const {
    status: wsStatus,
    error: wsError,
    isConnected,
    connect: wsConnect,
    disconnect: wsDisconnect,
  } = useWebSocket(wsUrl, {
    autoConnect: true,
    autoReconnect: true,
    onMessage: handleWebSocketMessage,
    onOpen: () => {
      console.log('[PriceChart] WebSocket connected');
    },
    onClose: () => {
      console.log('[PriceChart] WebSocket disconnected');
    },
    onError: (error) => {
      console.error('[PriceChart] WebSocket error:', error);
    },
  });

  /**
   * Handle incoming WebSocket messages.
   */
  function handleWebSocketMessage(message) {
    const { type, data } = message;

    switch (type) {
      case 'connection_status':
        console.log('[PriceChart] Connection status:', data.status);
        break;

      case 'candle_completed':
        // Add completed candle to aggregator
        candleAggregator.addCompletedCandle(data);
        updateChartData();
        break;

      case 'candle_update':
        // Update current candle
        candleAggregator.updateCurrentCandle(data);
        updateCurrentCandle(data);
        break;

      case 'error':
        console.error('[PriceChart] WebSocket error message:', data.message);
        break;

      default:
        console.debug('[PriceChart] Unknown message type:', type);
    }
  }

  /**
   * Update chart with all candles (historical + current).
   */
  function updateChartData() {
    if (!candlestickSeriesRef.current) return;

    const formattedCandles = candleAggregator.getFormattedCandles();
    if (formattedCandles.length > 0) {
      candlestickSeriesRef.current.setData(formattedCandles);
    }
  }

  /**
   * Update only the last (current) candle for real-time updates.
   */
  function updateCurrentCandle(candle) {
    if (!candlestickSeriesRef.current || !candle) return;

    const formattedCandle = {
      time: parseTimeString(candle.time),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    };

    updateLastCandle(candlestickSeriesRef.current, formattedCandle);
  }

  /**
   * Initialize chart on mount.
   */
  useEffect(() => {
    if (!chartContainerRef.current) return;

    console.log('[PriceChart] Initializing TradingView chart');
    chartRef.current = createTradingViewChart(chartContainerRef.current);
    candlestickSeriesRef.current = addCandlestickSeries(chartRef.current);

    // Cleanup on unmount
    return () => {
      console.log('[PriceChart] Cleaning up chart');
      if (chartRef.current) {
        destroyChart(chartRef.current);
        chartRef.current = null;
        candlestickSeriesRef.current = null;
      }
    };
  }, []);

  /**
   * Load historical data when priceData changes.
   */
  useEffect(() => {
    if (!priceData || loading) return;

    console.log('[PriceChart] Loading historical price data');
    const candles = convertApiDataToCandles(priceData);

    // Set historical candles in aggregator
    candleAggregator.setHistoricalCandles(candles);

    // Update chart
    if (candlestickSeriesRef.current) {
      candlestickSeriesRef.current.setData(candles);
      fitChartContent(chartRef.current);
    }
  }, [priceData, loading]);

  /**
   * Reconnect WebSocket when pair or granularity changes.
   */
  useEffect(() => {
    if (!selectedPair || !selectedGranularity) return;

    console.log(`[PriceChart] Pair/granularity changed: ${selectedPair}/${selectedGranularity}`);

    // Reset candle aggregator
    candleAggregator.reset();

    // WebSocket will auto-reconnect via useWebSocket hook
  }, [selectedPair, selectedGranularity]);

  /**
   * Render active indicators on the chart.
   */
  useEffect(() => {
    if (!chartRef.current || !candlestickSeriesRef.current) return;

    // Remove old indicator series
    Object.values(indicatorSeriesRef.current).forEach((series) => {
      try {
        chartRef.current.removeSeries(series);
      } catch (err) {
        console.warn('[PriceChart] Error removing series:', err);
      }
    });
    indicatorSeriesRef.current = {};

    // Add new indicator series
    activeIndicators.forEach((indicator) => {
      if (!indicator.data || indicator.data.length === 0) return;

      try {
        // Create line series for each indicator
        const color = indicator.color || '#3b82f6';
        const series = addLineSeries(chartRef.current, indicator.data, {
          color,
          lineWidth: 2,
          title: getIndicatorDisplayName(indicator.name),
        });

        indicatorSeriesRef.current[indicator.instanceId] = series;
      } catch (err) {
        console.error('[PriceChart] Error adding indicator:', err);
      }
    });
  }, [activeIndicators]);

  /**
   * Handle drag and drop for indicators.
   */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const indicatorData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (indicatorData && onIndicatorDrop) {
        onIndicatorDrop(indicatorData);
      }
    } catch (err) {
      console.error('[PriceChart] Error handling drop:', err);
    }
  }, [onIndicatorDrop]);

  /**
   * Handle indicator context menu.
   */
  const handleIndicatorContextMenu = useCallback((e, indicatorInstanceId, indicatorName) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      indicatorInstanceId,
      indicatorName,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      indicatorInstanceId: null,
      indicatorName: '',
    });
  }, []);

  /**
   * Get connection status badge.
   */
  function getConnectionStatusBadge() {
    const statusConfig = {
      [CONNECTION_STATUS.CONNECTED]: {
        icon: Wifi,
        label: 'Connected',
        color: 'bg-green-500',
      },
      [CONNECTION_STATUS.CONNECTING]: {
        icon: RefreshCw,
        label: 'Connecting',
        color: 'bg-yellow-500',
        spin: true,
      },
      [CONNECTION_STATUS.RECONNECTING]: {
        icon: RefreshCw,
        label: 'Reconnecting',
        color: 'bg-yellow-500',
        spin: true,
      },
      [CONNECTION_STATUS.DISCONNECTED]: {
        icon: WifiOff,
        label: 'Disconnected',
        color: 'bg-gray-500',
      },
      [CONNECTION_STATUS.ERROR]: {
        icon: WifiOff,
        label: 'Error',
        color: 'bg-red-500',
      },
    };

    const config = statusConfig[wsStatus] || statusConfig[CONNECTION_STATUS.DISCONNECTED];
    const Icon = config.icon;

    return (
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-md shadow-lg">
        <Icon
          size={16}
          className={cn(
            'text-white',
            config.spin && 'animate-spin'
          )}
        />
        <div className={cn('w-2 h-2 rounded-full', config.color)} />
        <span className="text-sm text-slate-300 font-medium">{config.label}</span>
      </div>
    );
  }

  /**
   * Render active indicators list.
   */
  function renderActiveIndicators() {
    if (activeIndicators.length === 0) return null;

    return (
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-xs">
        {activeIndicators.map((indicator) => (
          <div
            key={indicator.instanceId}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-md shadow-md cursor-pointer hover:bg-slate-700/90 transition-colors"
            onClick={(e) => onIndicatorClick?.(indicator.instanceId)}
            onContextMenu={(e) => handleIndicatorContextMenu(e, indicator.instanceId, indicator.name)}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: indicator.color || '#3b82f6' }}
            />
            <span className="text-sm text-slate-300 font-medium flex-1">
              {getIndicatorDisplayName(indicator.name)}
            </span>
            <Settings size={14} className="text-slate-400 hover:text-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Connection Status Badge */}
      {getConnectionStatusBadge()}

      {/* Active Indicators */}
      {renderActiveIndicators()}

      {/* Chart Container */}
      <div
        ref={chartContainerRef}
        className={cn(
          'w-full h-full',
          isDragOver && 'ring-2 ring-blue-500 ring-opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={32} className="text-blue-500 animate-spin" />
            <p className="text-slate-300 font-medium">Loading chart data...</p>
          </div>
        </div>
      )}

      {/* Drag Over Hint */}
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm border-2 border-dashed border-blue-500 rounded-lg z-15 pointer-events-none">
          <div className="text-center">
            <p className="text-blue-400 font-semibold text-lg">Drop indicator here</p>
            <p className="text-blue-300 text-sm mt-1">Release to add to chart</p>
          </div>
        </div>
      )}

      {/* WebSocket Error */}
      {wsError && (
        <div className="absolute bottom-4 right-4 z-10 max-w-sm px-4 py-3 bg-red-900/90 border border-red-700 rounded-md shadow-lg">
          <div className="flex items-start gap-3">
            <X size={20} className="text-red-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-100">WebSocket Error</p>
              <p className="text-xs text-red-200 mt-1">{wsError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Indicator Context Menu */}
      {contextMenu.isOpen && (
        <IndicatorContextMenu
          position={contextMenu.position}
          indicatorInstanceId={contextMenu.indicatorInstanceId}
          indicatorName={contextMenu.indicatorName}
          onClose={closeContextMenu}
          onConfigure={() => {
            onIndicatorConfigure?.(contextMenu.indicatorInstanceId);
            closeContextMenu();
          }}
          onDuplicate={() => {
            onIndicatorDuplicate?.(contextMenu.indicatorInstanceId);
            closeContextMenu();
          }}
          onRemove={() => {
            onRemoveIndicator?.(contextMenu.indicatorInstanceId);
            closeContextMenu();
          }}
        />
      )}
    </div>
  );
}

/**
 * Parse time string to Unix timestamp (seconds).
 */
function parseTimeString(timeStr) {
  if (typeof timeStr === 'number') {
    return timeStr;
  }

  try {
    // Parse format: "26-01-21 02:30"
    const [datePart, timePart] = timeStr.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    // Construct date (assuming 20XX century)
    const date = new Date(2000 + year, month - 1, day, hour, minute, 0);

    // Return Unix timestamp in seconds
    return Math.floor(date.getTime() / 1000);
  } catch (err) {
    console.error('[PriceChart] Error parsing time:', timeStr, err);
    return Math.floor(Date.now() / 1000);
  }
}

export default PriceChart;
