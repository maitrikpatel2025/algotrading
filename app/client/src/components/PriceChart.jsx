import React, { useEffect, useRef, useState, useCallback } from 'react';
import Plotly from 'plotly.js-dist';
import { drawChart, computeZoomedInRange, computeZoomedOutRange, computeScrolledRange } from '../app/chart';
import { getIndicatorDisplayName } from '../app/indicators';
import { getPatternDisplayName } from '../app/patterns';
import { X, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import IndicatorContextMenu from './IndicatorContextMenu';
import DrawingContextMenu from './DrawingContextMenu';
import {
  DRAWING_TOOLS,
  DRAWING_TOOL_SHORTCUTS,
  createDefaultHorizontalLine,
  createDefaultTrendline,
  createDefaultFibonacci,
  wouldExceedDrawingLimit,
  getDrawingLimitWarning,
} from '../app/drawingTypes';
import {
  generateDrawingId,
  findNearestOHLC,
} from '../app/drawingUtils';

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
  activePatterns = [],
  onIndicatorDrop,
  onRemoveIndicator,
  onEditIndicator,
  onPatternDrop,
  onRemovePattern,
  onIndicatorClick,
  onIndicatorConfigure,
  onIndicatorDuplicate,
  previewIndicator = null,
  comparisonMode = false,
  // Drawing props
  drawings = [],
  activeDrawingTool = DRAWING_TOOLS.POINTER,
  onDrawingToolChange,
  onDrawingAdd,
  onDrawingUpdate,
  onDrawingDelete,
  onDrawingEdit,
  onDrawingUseInCondition,
  conditionDrawingIds = [],
  conditions = [],
  drawingError = null,
  onDrawingErrorClear,
}) {
  const chartRef = useRef(null);
  const [visibleCandleCount, setVisibleCandleCount] = useState(null);
  const [showInteractionHint, setShowInteractionHint] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    indicatorInstanceId: null,
    indicatorName: '',
  });

  // Drawing state
  const [drawingContextMenu, setDrawingContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    drawing: null,
  });
  const [pendingDrawing, setPendingDrawing] = useState(null); // For multi-click drawings (trendline, fibonacci)
  // eslint-disable-next-line no-unused-vars
  const [snapEnabled, _setSnapEnabled] = useState(true); // Future: allow toggling snap behavior

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
      // Prepare indicators to render based on preview mode
      let indicatorsToRender = [...activeIndicators];

      if (previewIndicator) {
        if (comparisonMode) {
          // In comparison mode, show both original and preview
          indicatorsToRender = [...activeIndicators, previewIndicator];
        } else {
          // In preview mode without comparison, replace the editing indicator with preview
          indicatorsToRender = activeIndicators.map(ind =>
            ind.instanceId === previewIndicator.instanceId ? previewIndicator : ind
          );
        }
      }

      drawChart(priceData, selectedPair, selectedGranularity, 'chartDiv', chartType, showVolume, indicatorsToRender, activePatterns, drawings, conditionDrawingIds);

      // Get chart element reference
      const chartElement = document.getElementById('chartDiv');
      chartRef.current = chartElement;

      // DIAGNOSTIC: Verify indicator metadata integrity
      console.log('[PriceChart] Indicators passed to drawChart:', activeIndicators);
      if (chartElement && chartElement.data) {
        console.log('[PriceChart] Chart traces after render:', chartElement.data);
        const tracesWithMetadata = chartElement.data.filter(trace => trace.meta && trace.meta.instanceId);
        console.log(`[PriceChart] Traces with metadata: ${tracesWithMetadata.length} out of ${chartElement.data.length}`);
      }

      if (chartElement) {
        // Set initial candle count
        setVisibleCandleCount(priceData.time ? priceData.time.length : 0);

        // Listen for zoom updates from chart.js
        const handleZoomUpdate = (event) => {
          setVisibleCandleCount(event.detail.visibleCandleCount);
        };

        chartElement.addEventListener('chartZoomUpdate', handleZoomUpdate);

        // Handle left-click on indicator traces
        const handlePlotlyClick = (eventData) => {
          if (!eventData.points || eventData.points.length === 0) return;

          const point = eventData.points[0];
          // Check if the clicked trace has indicator metadata
          if (point.data && point.data.meta && point.data.meta.instanceId) {
            const instanceId = point.data.meta.instanceId;
            if (onIndicatorClick) {
              onIndicatorClick(instanceId);
            }
          }
        };

        // Handle right-click on indicator traces
        const handleContextMenu = (event) => {
          console.log('Context menu event triggered');

          // Use Plotly.Fx.hover() to trigger a synthetic hover event at the exact cursor position
          // This ensures accurate hit-testing instead of relying on stale hover data
          try {
            // Calculate cursor position relative to the chart element
            const rect = chartElement.getBoundingClientRect();
            const xPos = event.clientX - rect.left;
            const yPos = event.clientY - rect.top;

            // Trigger Plotly hover at the right-click coordinates
            if (window.Plotly && window.Plotly.Fx && window.Plotly.Fx.hover) {
              window.Plotly.Fx.hover(chartElement, [{ curveNumber: 0, pointNumber: 0 }], [xPos, yPos]);
            }

            // Now check if hover data contains an indicator trace
            let indicatorAtPosition = null;
            if (chartElement._hoverdata && chartElement._hoverdata.length > 0) {
              const hoverPoint = chartElement._hoverdata[0];
              if (hoverPoint.data && hoverPoint.data.meta && hoverPoint.data.meta.instanceId) {
                indicatorAtPosition = {
                  instanceId: hoverPoint.data.meta.instanceId,
                  name: hoverPoint.data.name,
                };
              }
            }

            if (indicatorAtPosition) {
              console.log('Indicator found at position:', indicatorAtPosition);
              event.preventDefault();
              setContextMenu({
                isOpen: true,
                position: { x: event.clientX, y: event.clientY },
                indicatorInstanceId: indicatorAtPosition.instanceId,
                indicatorName: indicatorAtPosition.name,
              });
            } else {
              console.log('No indicator found at cursor position. Hover data:', chartElement._hoverdata);
            }
          } catch (error) {
            console.error('Error in context menu hit-testing:', error);
          }
        };

        // Attach both Plotly click and contextmenu event listeners after a short delay
        // to ensure Plotly has fully rendered and won't replace DOM elements
        setTimeout(() => {
          if (chartElement.on) {
            chartElement.on('plotly_click', handlePlotlyClick);
          }
          console.log('Attaching contextmenu listener to chartElement');
          chartElement.addEventListener('contextmenu', handleContextMenu);
        }, 100);

        // Cleanup
        return () => {
          chartElement.removeEventListener('chartZoomUpdate', handleZoomUpdate);
          chartElement.removeEventListener('contextmenu', handleContextMenu);
          // Remove Plotly event listener if it exists
          if (chartElement.removeAllListeners) {
            chartElement.removeAllListeners('plotly_click');
          }
        };
      }
    }
  }, [priceData, selectedPair, selectedGranularity, chartType, showVolume, loading, activeIndicators, activePatterns, onIndicatorClick, previewIndicator, comparisonMode, drawings, conditionDrawingIds]);

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

      // Check for drawing tool shortcuts first
      const drawingShortcutKey = event.key.toUpperCase();
      if (DRAWING_TOOL_SHORTCUTS[drawingShortcutKey] && onDrawingToolChange) {
        event.preventDefault();
        onDrawingToolChange(DRAWING_TOOL_SHORTCUTS[drawingShortcutKey]);
        // Cancel any pending drawing when switching tools
        setPendingDrawing(null);
        return;
      }

      // Escape key handling - cancel drawing or switch to pointer
      if (event.key === 'Escape') {
        event.preventDefault();
        if (pendingDrawing) {
          setPendingDrawing(null);
        } else if (activeDrawingTool !== DRAWING_TOOLS.POINTER && onDrawingToolChange) {
          onDrawingToolChange(DRAWING_TOOLS.POINTER);
        }
        return;
      }

      // Delete key - delete selected drawing (future feature)
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Could implement drawing selection and deletion here in the future
        return;
      }

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
  }, [priceData, activeDrawingTool, pendingDrawing, onDrawingToolChange]);

  // Dismiss interaction hint
  const dismissInteractionHint = () => {
    localStorage.setItem('chart-interaction-hint-dismissed', 'true');
    setShowInteractionHint(false);
  };

  // Handle chart click for drawing tools
  const handleChartDrawingClick = useCallback((event) => {
    // Only handle if a drawing tool is active
    if (activeDrawingTool === DRAWING_TOOLS.POINTER || activeDrawingTool === DRAWING_TOOLS.CROSSHAIR || !priceData || !onDrawingAdd) {
      return;
    }

    const chartElement = document.getElementById('chartDiv');
    if (!chartElement) return;

    // Get chart layout
    const layout = chartElement.layout;
    if (!layout || !layout.xaxis || !layout.yaxis) return;

    // Calculate click position relative to chart
    const rect = chartElement.getBoundingClientRect();
    const xPx = event.clientX - rect.left;
    const yPx = event.clientY - rect.top;

    // Get the plot area dimensions (rough approximation)
    const margin = layout.margin || { l: 60, r: 60, t: 50, b: 50 };
    const plotWidth = rect.width - margin.l - margin.r;
    const plotHeight = rect.height - margin.t - margin.b;

    // Calculate relative position within plot area
    const relX = (xPx - margin.l) / plotWidth;
    const relY = (yPx - margin.t) / plotHeight;

    // Check if click is within plot area
    if (relX < 0 || relX > 1 || relY < 0 || relY > 1) return;

    // Get axis ranges
    const xRange = layout.xaxis.range || [priceData.time[0], priceData.time[priceData.time.length - 1]];
    const yRange = layout.yaxis.range || [Math.min(...priceData.mid_l), Math.max(...priceData.mid_h)];

    // Calculate price from pixel position (y-axis is inverted)
    const clickedPrice = yRange[1] - relY * (yRange[1] - yRange[0]);

    // Calculate time from pixel position
    const startTime = new Date(xRange[0]).getTime();
    const endTime = new Date(xRange[1]).getTime();
    const clickedTime = new Date(startTime + relX * (endTime - startTime)).toISOString();

    // Apply snap-to-price if enabled
    let finalPrice = clickedPrice;
    let finalTime = clickedTime;

    if (snapEnabled) {
      const snapResult = findNearestOHLC(new Date(clickedTime).getTime(), clickedPrice, priceData);
      if (snapResult.didSnap) {
        finalPrice = snapResult.snappedPrice;
      }
      if (snapResult.candle) {
        finalTime = snapResult.candle.time;
      }
    }

    // Check for drawing limits
    if (wouldExceedDrawingLimit(drawings, activeDrawingTool)) {
      console.warn(getDrawingLimitWarning(activeDrawingTool));
      return;
    }

    // Handle different drawing tool types
    switch (activeDrawingTool) {
      case DRAWING_TOOLS.HORIZONTAL_LINE: {
        // Horizontal line is single-click
        const newDrawing = {
          id: generateDrawingId(),
          ...createDefaultHorizontalLine(finalPrice),
        };
        onDrawingAdd(newDrawing);
        break;
      }

      case DRAWING_TOOLS.TRENDLINE: {
        if (!pendingDrawing) {
          // First click - set starting point
          setPendingDrawing({
            type: DRAWING_TOOLS.TRENDLINE,
            point1: { time: finalTime, price: finalPrice },
          });
        } else {
          // Second click - complete the trendline
          const newDrawing = {
            id: generateDrawingId(),
            ...createDefaultTrendline(
              pendingDrawing.point1,
              { time: finalTime, price: finalPrice }
            ),
          };
          onDrawingAdd(newDrawing);
          setPendingDrawing(null);
        }
        break;
      }

      case DRAWING_TOOLS.FIBONACCI: {
        if (!pendingDrawing) {
          // First click - set starting point
          setPendingDrawing({
            type: DRAWING_TOOLS.FIBONACCI,
            startPoint: { time: finalTime, price: finalPrice },
          });
        } else {
          // Second click - complete the fibonacci
          const newDrawing = {
            id: generateDrawingId(),
            ...createDefaultFibonacci(
              pendingDrawing.startPoint,
              { time: finalTime, price: finalPrice }
            ),
          };
          onDrawingAdd(newDrawing);
          setPendingDrawing(null);
        }
        break;
      }

      default:
        // Pointer tool or unknown tool - do nothing
        break;
    }
  }, [activeDrawingTool, priceData, onDrawingAdd, drawings, pendingDrawing, snapEnabled]);

  // Handle drawing context menu (for future: chart right-click detection on drawings)
  // eslint-disable-next-line no-unused-vars
  const handleDrawingContextMenu = useCallback((event, drawing) => {
    event.preventDefault();
    setDrawingContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      drawing,
    });
  }, []);

  // Close drawing context menu
  const closeDrawingContextMenu = useCallback(() => {
    setDrawingContextMenu(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Handle drawing flip (fibonacci)
  const handleDrawingFlip = useCallback(() => {
    const drawing = drawingContextMenu.drawing;
    if (!drawing || drawing.type !== DRAWING_TOOLS.FIBONACCI || !onDrawingUpdate) return;

    // Swap start and end points
    const flipped = {
      ...drawing,
      startPoint: drawing.endPoint,
      endPoint: drawing.startPoint,
    };
    onDrawingUpdate(flipped);
  }, [drawingContextMenu.drawing, onDrawingUpdate]);

  // Check if drawing is used in a condition
  const isDrawingUsedInCondition = useCallback((drawingId) => {
    return conditionDrawingIds.includes(drawingId);
  }, [conditionDrawingIds]);

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
      const itemData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (itemData) {
        // Validate pattern data integrity before passing to handler
        if (itemData.isPattern) {
          if (!itemData.id || !itemData.name) {
            console.error('Pattern drop error: Missing id or name in pattern data', itemData);
            return;
          }
          // Create a defensive copy to prevent any mutation
          const patternData = { ...itemData };
          if (onPatternDrop) {
            onPatternDrop(patternData);
          }
        } else if (onIndicatorDrop) {
          onIndicatorDrop(itemData);
        }
      }
    } catch (err) {
      console.error('Failed to parse dropped item data:', err);
    }
  }, [onIndicatorDrop, onPatternDrop]);

  return (
    <div className="relative animate-fade-in">
      {/* Chart Container - No Card Wrapper for Clean TradingView Look */}
      <div className="relative">
        {loading ? (
          /* Loading Skeleton State */
          <div className="w-full rounded-lg bg-muted/30 min-h-[500px] flex items-center justify-center" style={{ height: 'calc(100vh - 280px)' }}>
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
            {/* Chart Legend Overlay - TradingView Style */}
            <div className="absolute top-3 left-3 z-30 pointer-events-none">
              <div className="flex flex-col gap-1">
                {/* Symbol and Timeframe */}
                <div className="flex items-center gap-2 pointer-events-auto">
                  <span className="text-sm font-semibold text-foreground bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded">
                    {selectedPair} <span className="text-muted-foreground">·</span> {selectedGranularity}
                  </span>
                </div>

                {/* Active Indicators */}
                {activeIndicators.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap pointer-events-auto">
                    {activeIndicators.map((indicator) => {
                      const displayName = getIndicatorDisplayName(indicator, indicator.params || indicator.defaultParams);
                      const isPreview = indicator.isPreview;
                      const isBeingPreviewed = previewIndicator && previewIndicator.instanceId === indicator.instanceId && !comparisonMode;

                      // Skip rendering the original if it's being replaced by preview
                      if (isBeingPreviewed && !indicator.isPreview) {
                        return null;
                      }

                      return (
                        <span
                          key={indicator.instanceId}
                          className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-background/80 backdrop-blur-sm cursor-pointer hover:bg-background/90 transition-colors group",
                            isPreview && "border border-dashed border-amber-500/50"
                          )}
                          style={{ borderLeft: `2px solid ${indicator.color}` }}
                          onClick={(e) => {
                            // Don't trigger edit when clicking the remove button
                            if (e.target.closest('button')) return;
                            if (onEditIndicator && !isPreview) {
                              onEditIndicator(indicator.instanceId);
                            }
                          }}
                          title={onEditIndicator && !isPreview ? `Click to edit ${displayName}` : displayName}
                        >
                          {displayName}
                          {isPreview && <span className="text-amber-500">(P)</span>}
                          {onEditIndicator && !isPreview && (
                            <Settings className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                          {onRemoveIndicator && !isPreview && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveIndicator(indicator.instanceId);
                              }}
                              className="p-0.5 rounded hover:bg-muted-foreground/20 transition-colors"
                              title={`Remove ${displayName}`}
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Active Patterns */}
                {activePatterns.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap pointer-events-auto">
                    {activePatterns.map((pattern) => {
                      const displayName = getPatternDisplayName(pattern);
                      const patternCount = pattern.detectedCount || 0;
                      return (
                        <span
                          key={pattern.instanceId}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-background/80 backdrop-blur-sm"
                          style={{ borderLeft: `2px solid ${pattern.color}` }}
                          title={`${displayName} - ${patternCount} detected`}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: pattern.color }}
                          />
                          {patternCount} {displayName}
                          {onRemovePattern && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemovePattern(pattern.instanceId);
                              }}
                              className="p-0.5 rounded hover:bg-muted-foreground/20 transition-colors"
                              title={`Remove ${displayName}`}
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

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
              className={cn(
                "w-full rounded-lg bg-muted/30 min-h-[500px]",
                activeDrawingTool !== DRAWING_TOOLS.POINTER && activeDrawingTool !== DRAWING_TOOLS.CROSSHAIR && "cursor-crosshair",
                activeDrawingTool === DRAWING_TOOLS.CROSSHAIR && "cursor-crosshair"
              )}
              style={{ height: 'calc(100vh - 280px)' }}
              onClick={handleChartDrawingClick}
            />

            {/* Pending drawing indicator */}
            {pendingDrawing && (
              <div className="absolute top-3 right-3 z-40 bg-amber-500/90 text-white px-3 py-2 rounded-md shadow-lg text-sm font-medium flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                Click to set {pendingDrawing.type === DRAWING_TOOLS.TRENDLINE ? 'end point' : 'end point'} · Press Esc to cancel
              </div>
            )}

            {/* Interaction Hints Tooltip */}
            {showInteractionHint && (
              <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
                <div className="bg-black/90 text-white rounded-md px-4 py-3 shadow-lg max-w-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm">
                      {isTouchDevice ? (
                        <p>
                          <span className="font-semibold">Pinch to zoom</span> · <span className="font-semibold">Drag to pan</span> · <span className="font-semibold">Double-tap to reset</span>
                        </p>
                      ) : (
                        <p>
                          <span className="font-semibold">Scroll to zoom</span> · <span className="font-semibold">Drag to pan</span> · <span className="font-semibold">Double-click to reset</span>
                          <br />
                          <span className="text-xs text-white/80 mt-1 inline-block">Keyboard: +/- to zoom, arrows to scroll</span>
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
              <div className="absolute bottom-3 left-3 z-30">
                <span className="text-xs text-muted-foreground font-medium bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
                  {visibleCandleCount} candle{visibleCandleCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Indicator Context Menu */}
      <IndicatorContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        indicatorName={contextMenu.indicatorName}
        onConfigure={() => {
          if (onIndicatorConfigure) {
            onIndicatorConfigure(contextMenu.indicatorInstanceId);
          }
        }}
        onRemove={() => {
          if (onRemoveIndicator) {
            onRemoveIndicator(contextMenu.indicatorInstanceId);
          }
        }}
        onDuplicate={() => {
          if (onIndicatorDuplicate) {
            onIndicatorDuplicate(contextMenu.indicatorInstanceId);
          }
        }}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
      />

      {/* Drawing Context Menu */}
      <DrawingContextMenu
        isOpen={drawingContextMenu.isOpen}
        position={drawingContextMenu.position}
        drawing={drawingContextMenu.drawing}
        onEdit={() => {
          if (onDrawingEdit && drawingContextMenu.drawing) {
            onDrawingEdit(drawingContextMenu.drawing);
          }
        }}
        onDuplicate={() => {
          if (onDrawingAdd && drawingContextMenu.drawing) {
            const duplicate = {
              ...drawingContextMenu.drawing,
              id: generateDrawingId(),
              label: '', // Clear label for duplicate
            };
            onDrawingAdd(duplicate);
          }
        }}
        onDelete={() => {
          if (onDrawingDelete && drawingContextMenu.drawing) {
            onDrawingDelete(drawingContextMenu.drawing.id);
          }
        }}
        onUseInCondition={() => {
          if (onDrawingUseInCondition && drawingContextMenu.drawing) {
            onDrawingUseInCondition(drawingContextMenu.drawing);
          }
        }}
        onFlip={handleDrawingFlip}
        onClose={closeDrawingContextMenu}
        isUsedInCondition={drawingContextMenu.drawing ? isDrawingUsedInCondition(drawingContextMenu.drawing.id) : false}
      />
    </div>
  );
}

export default PriceChart;
