import React, { useEffect, useState, useRef, useCallback } from 'react';
import endPoints from '../app/api';
import { COUNTS, calculateCandleCount, GRANULARITY_SECONDS } from '../app/data';
import Button from '../components/Button';
import PriceChart from '../components/PriceChart';
import PairSelector from '../components/PairSelector';
import Select from '../components/Select';
import Technicals from '../components/Technicals';
import IndicatorLibrary from '../components/IndicatorLibrary';
import LogicPanel from '../components/LogicPanel';
import ConfirmDialog from '../components/ConfirmDialog';
import IndicatorSettingsDialog from '../components/IndicatorSettingsDialog';
import { cn } from '../lib/utils';
import { Play, RefreshCw, BarChart3, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { INDICATOR_TYPES, getIndicatorDisplayName } from '../app/indicators';
import { getPatternDisplayName } from '../app/patterns';
import { detectPattern } from '../app/patternDetection';
import { createConditionFromIndicator, createConditionFromPattern } from '../app/conditionDefaults';

// localStorage keys for persisting preferences
const PREFERRED_TIMEFRAME_KEY = 'forex_dash_preferred_timeframe';
const PANEL_COLLAPSED_KEY = 'forex_dash_indicator_panel_collapsed';

// Indicator limits
const MAX_OVERLAY_INDICATORS = 5;
const MAX_SUBCHART_INDICATORS = 3;

function Strategy() {
  const [selectedPair, setSelectedPair] = useState(null);
  const [selectedGran, setSelectedGran] = useState(null);
  const [technicalsData, setTechnicalsData] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [selectedCount, setSelectedCount] = useState(COUNTS[0].value);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  // Indicator panel state
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(PANEL_COLLAPSED_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  // New state for advanced chart features
  const [chartType, setChartType] = useState('candlestick');
  const [showVolume, setShowVolume] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  // Indicator state management
  const [activeIndicators, setActiveIndicators] = useState([]);
  const [indicatorHistory, setIndicatorHistory] = useState([]);
  const [indicatorError, setIndicatorError] = useState(null);

  // Pattern state management
  const [activePatterns, setActivePatterns] = useState([]);
  const [patternHistory, setPatternHistory] = useState([]);

  // Condition state management
  const [conditions, setConditions] = useState([]);
  const [conditionHistory, setConditionHistory] = useState([]);

  // Hover highlight state for visual connections
  const [highlightedIndicatorId, setHighlightedIndicatorId] = useState(null);

  // Logic Panel mobile state
  const [isLogicPanelMobileOpen, setIsLogicPanelMobileOpen] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    actions: [],
    variant: 'warning',
  });

  // Indicator settings dialog state
  const [settingsDialog, setSettingsDialog] = useState({
    isOpen: false,
    indicator: null,
    isEditMode: false,
    editingInstanceId: null,
    initialParams: null,
    initialColor: null,
  });

  // Preview mode state for real-time parameter adjustment
  const [previewIndicator, setPreviewIndicator] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);

  // Debounce timer ref for timeframe changes
  const debounceTimerRef = useRef(null);
  // Previous timeframe for zoom context preservation
  const previousGranRef = useRef(null);

  useEffect(() => {
    loadOptions();

    // Cleanup debounce timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleCountChange = (count) => {
    setSelectedCount(count);
    setSelectedDateRange(null); // Clear date range when manually setting count
    loadPrices(count);
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  const handleVolumeToggle = () => {
    setShowVolume(!showVolume);
  };

  const handleDateRangeChange = (dateRange) => {
    setSelectedDateRange(dateRange);
    // Calculate the appropriate candle count based on date range and granularity
    const candleCount = calculateCandleCount(dateRange, selectedGran);
    setSelectedCount(String(candleCount));
    loadPrices(String(candleCount));
  };

  const loadOptions = async () => {
    const data = await endPoints.options();
    setOptions(data);

    // Get available granularity values for validation
    const availableGranularities = data.granularities.map(g => g.value);

    // Try to restore preferred timeframe from localStorage
    const preferredTimeframe = localStorage.getItem(PREFERRED_TIMEFRAME_KEY);

    if (preferredTimeframe && availableGranularities.includes(preferredTimeframe)) {
      setSelectedGran(preferredTimeframe);
    } else {
      // Fallback to first available option
      if (preferredTimeframe) {
        console.warn(`Preferred timeframe "${preferredTimeframe}" not available, falling back to default`);
      }
      setSelectedGran(data.granularities[0].value);
    }

    setSelectedPair(data.pairs[0].value);
    setLoading(false);
  };

  // Handle timeframe change with localStorage persistence and debouncing
  const handleTimeframeChange = useCallback((newTimeframe) => {
    // Calculate zoom context preservation if we have data loaded
    if (priceData && selectedGran && GRANULARITY_SECONDS[selectedGran] && GRANULARITY_SECONDS[newTimeframe]) {
      const oldTfSeconds = GRANULARITY_SECONDS[selectedGran];
      const newTfSeconds = GRANULARITY_SECONDS[newTimeframe];
      const oldCandleCount = parseInt(selectedCount, 10);

      // Calculate new candle count to maintain similar time coverage
      let newCandleCount = Math.round(oldCandleCount * (oldTfSeconds / newTfSeconds));
      // Clamp to reasonable range
      newCandleCount = Math.max(50, Math.min(500, newCandleCount));

      setSelectedCount(String(newCandleCount));
    }

    // Store previous granularity for reference
    previousGranRef.current = selectedGran;

    // Update selected granularity immediately for UI responsiveness
    setSelectedGran(newTimeframe);

    // Persist to localStorage
    localStorage.setItem(PREFERRED_TIMEFRAME_KEY, newTimeframe);

    // If we have data loaded, debounce the reload
    if (priceData || technicalsData) {
      // Clear any pending debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Show loading state immediately
      setLoadingData(true);

      // Debounce the API call (300ms)
      debounceTimerRef.current = setTimeout(() => {
        loadTechnicals();
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceData, technicalsData, selectedGran, selectedCount]);

  const loadPrices = async (count, timeframe = selectedGran) => {
    // Validate timeframe exists in available options
    if (options && options.granularities) {
      const availableGranularities = options.granularities.map(g => g.value);
      if (!availableGranularities.includes(timeframe)) {
        console.warn(`Invalid timeframe "${timeframe}", resetting to default`);
        const defaultGran = options.granularities[0].value;
        setSelectedGran(defaultGran);
        timeframe = defaultGran;
      }
    }

    try {
      const data = await endPoints.prices(selectedPair, timeframe, count);
      setPriceData(data);

      // Check for insufficient historical data
      const requestedCount = parseInt(count, 10);
      const actualCount = data.time ? data.time.length : 0;
      if (actualCount < requestedCount && actualCount > 0) {
        setInfoMessage(`Showing ${actualCount} candles - insufficient historical data for ${requestedCount} candles`);
      } else {
        setInfoMessage(null);
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load price data';
      console.error('Error loading prices:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const loadTechnicals = async () => {
    setLoadingData(true);
    setError(null);

    const errors = [];

    try {
      // Load technicals data
      try {
        const techData = await endPoints.technicals(selectedPair, selectedGran);
        setTechnicalsData(techData);
      } catch (err) {
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to load technical analysis';
        console.error('Error loading technicals:', errorMessage);
        errors.push(`Technical analysis: ${errorMessage}`);
        setTechnicalsData(null);
      }

      // Load price data
      const priceResult = await loadPrices(selectedCount);
      if (!priceResult.success) {
        errors.push(`Price data: ${priceResult.error}`);
        setPriceData(null);
      }

      // Set combined error if any errors occurred
      if (errors.length > 0) {
        setError(errors.join(' | '));
      }
    } finally {
      setLoadingData(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearInfoMessage = () => {
    setInfoMessage(null);
  };

  // Handle panel collapse toggle with localStorage persistence
  const handlePanelToggle = useCallback(() => {
    setIsPanelCollapsed(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem(PANEL_COLLAPSED_KEY, String(newValue));
      } catch (e) {
        console.warn('Failed to save panel state to localStorage:', e);
      }
      return newValue;
    });
  }, []);

  // Helper to get indicator display name - use custom params if available
  const getDisplayName = useCallback((indicator) => {
    const params = indicator.params || indicator.defaultParams;
    return getIndicatorDisplayName(indicator, params);
  }, []);

  // Handle indicator drop from IndicatorLibrary - opens settings dialog
  const handleIndicatorDrop = useCallback((indicator) => {
    // Check limits based on indicator type
    const overlayCount = activeIndicators.filter(ind => ind.type === INDICATOR_TYPES.OVERLAY).length;
    const subchartCount = activeIndicators.filter(ind => ind.type === INDICATOR_TYPES.SUBCHART).length;

    if (indicator.type === INDICATOR_TYPES.OVERLAY && overlayCount >= MAX_OVERLAY_INDICATORS) {
      setIndicatorError('Maximum indicators reached. Remove one to add another.');
      return;
    }

    if (indicator.type === INDICATOR_TYPES.SUBCHART && subchartCount >= MAX_SUBCHART_INDICATORS) {
      setIndicatorError('Maximum indicators reached. Remove one to add another.');
      return;
    }

    // Open settings dialog instead of immediately adding
    setSettingsDialog({
      isOpen: true,
      indicator: indicator,
      isEditMode: false,
      editingInstanceId: null,
      initialParams: null,
      initialColor: null,
    });
    setIndicatorError(null);
  }, [activeIndicators]);

  // Handle settings dialog confirm - add indicator with custom params
  const handleSettingsConfirm = useCallback((params, color) => {
    const indicator = settingsDialog.indicator;

    if (settingsDialog.isEditMode && settingsDialog.editingInstanceId) {
      // Edit mode - update existing indicator
      setActiveIndicators(prev => prev.map(ind => {
        if (ind.instanceId === settingsDialog.editingInstanceId) {
          const updatedIndicator = {
            ...ind,
            params: params,
            color: color,
            isPreview: false, // Ensure preview flag is removed
          };
          return updatedIndicator;
        }
        return ind;
      }));

      // Update related conditions with new display name
      const updatedIndicator = activeIndicators.find(ind => ind.instanceId === settingsDialog.editingInstanceId);
      if (updatedIndicator) {
        const displayName = getIndicatorDisplayName({ ...updatedIndicator, params, color }, params);
        setConditions(prev => prev.map(c => {
          if (c.indicatorInstanceId === settingsDialog.editingInstanceId) {
            return { ...c, indicatorDisplayName: displayName };
          }
          return c;
        }));
      }
    } else {
      // Add mode - create new indicator instance
      const newIndicator = {
        ...indicator,
        instanceId: `${indicator.id}-${Date.now()}`,
        params: params,
        color: color,
      };

      // Create display name for the indicator using custom params
      const displayName = getIndicatorDisplayName(newIndicator, params);

      // Create a condition for the indicator
      const newCondition = createConditionFromIndicator(newIndicator, displayName);

      setActiveIndicators(prev => [...prev, newIndicator]);
      setIndicatorHistory(prev => [...prev, { type: 'indicator', item: newIndicator }]);
      setConditions(prev => [...prev, newCondition]);
      setConditionHistory(prev => [...prev, { type: 'condition', item: newCondition }]);
    }

    // Clear preview state
    setPreviewIndicator(null);
    setComparisonMode(false);

    // Close dialog
    setSettingsDialog(prev => ({ ...prev, isOpen: false }));
  }, [settingsDialog, activeIndicators]);

  // Handle settings dialog close/cancel
  const handleSettingsCancel = useCallback(() => {
    setSettingsDialog(prev => ({ ...prev, isOpen: false }));
    // Clear preview state when dialog is closed
    setPreviewIndicator(null);
    setComparisonMode(false);
  }, []);

  // Handle preview update - called when parameters change in real-time
  const handlePreviewUpdate = useCallback((previewParams, previewColor) => {
    if (!settingsDialog.isEditMode || !settingsDialog.editingInstanceId) {
      return;
    }

    const indicator = activeIndicators.find(ind => ind.instanceId === settingsDialog.editingInstanceId);
    if (!indicator) return;

    // Create preview indicator instance with updated params
    const preview = {
      ...indicator,
      params: previewParams,
      color: previewColor,
      isPreview: true,
    };

    setPreviewIndicator(preview);
  }, [settingsDialog.isEditMode, settingsDialog.editingInstanceId, activeIndicators]);

  // Handle comparison mode toggle
  const handleComparisonToggle = useCallback(() => {
    setComparisonMode(prev => !prev);
  }, []);

  // Handle edit indicator - open settings dialog with existing values
  const handleEditIndicator = useCallback((instanceId) => {
    const indicator = activeIndicators.find(ind => ind.instanceId === instanceId);
    if (!indicator) return;

    setSettingsDialog({
      isOpen: true,
      indicator: indicator,
      isEditMode: true,
      editingInstanceId: instanceId,
      initialParams: indicator.params || indicator.defaultParams,
      initialColor: indicator.color,
    });
  }, [activeIndicators]);

  // Handle indicator click from chart - opens settings dialog
  const handleIndicatorClick = useCallback((instanceId) => {
    handleEditIndicator(instanceId);
  }, [handleEditIndicator]);

  // Handle indicator configure from context menu - same as click
  const handleIndicatorConfigure = useCallback((instanceId) => {
    handleEditIndicator(instanceId);
  }, [handleEditIndicator]);

  // Handle indicator duplicate from context menu
  const handleIndicatorDuplicate = useCallback((instanceId) => {
    const indicator = activeIndicators.find(ind => ind.instanceId === instanceId);
    if (!indicator) return;

    // Create a new instance with same params and color but new unique instanceId
    const newIndicator = {
      ...indicator,
      instanceId: `${indicator.id}-${Date.now()}`,
      params: indicator.params || indicator.defaultParams,
    };

    // Add to active indicators
    setActiveIndicators(prev => [...prev, newIndicator]);
    setIndicatorHistory(prev => [...prev, { type: 'indicator', item: newIndicator }]);

    // Auto-create a condition for the new instance
    const newCondition = createConditionFromIndicator(newIndicator);
    setConditions(prev => [...prev, newCondition]);
    setConditionHistory(prev => [...prev, { type: 'condition', item: newCondition }]);

    setIndicatorError(null);
  }, [activeIndicators]);

  // Handle indicator removal with confirmation
  const handleRemoveIndicator = useCallback((instanceId) => {
    // Find conditions using this indicator
    const relatedConditions = conditions.filter(c => c.indicatorInstanceId === instanceId);
    const indicator = activeIndicators.find(ind => ind.instanceId === instanceId);
    const displayName = indicator ? getDisplayName(indicator) : 'this indicator';

    if (relatedConditions.length > 0) {
      // Show confirmation dialog
      setConfirmDialog({
        isOpen: true,
        title: 'Remove Indicator',
        message: `"${displayName}" is used in ${relatedConditions.length} condition${relatedConditions.length !== 1 ? 's' : ''}. What would you like to do?`,
        variant: 'warning',
        actions: [
          {
            label: 'Remove All',
            variant: 'danger',
            onClick: () => {
              setActiveIndicators(prev => prev.filter(ind => ind.instanceId !== instanceId));
              setConditions(prev => prev.filter(c => c.indicatorInstanceId !== instanceId));
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            },
          },
          {
            label: 'Keep Conditions',
            variant: 'secondary',
            onClick: () => {
              setActiveIndicators(prev => prev.filter(ind => ind.instanceId !== instanceId));
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            },
          },
        ],
      });
    } else {
      // No related conditions, just remove
      setActiveIndicators(prev => prev.filter(ind => ind.instanceId !== instanceId));
    }
    setIndicatorError(null);
  }, [conditions, activeIndicators, getDisplayName]);

  // Handle pattern drop from IndicatorLibrary
  const handlePatternDrop = useCallback((pattern) => {
    if (!priceData) {
      setIndicatorError('Load price data first to detect patterns.');
      return;
    }

    // Validate pattern object integrity
    if (!pattern || !pattern.id || !pattern.name) {
      console.error('Invalid pattern object received:', pattern);
      setIndicatorError('Invalid pattern data. Please try again.');
      return;
    }

    // Log pattern being processed (development debugging)
    if (process.env.NODE_ENV === 'development') {
      console.log('Pattern drop - processing pattern:', { id: pattern.id, name: pattern.name });
    }

    // Run pattern detection with validated pattern ID
    const patternId = pattern.id;
    const detectedPatterns = detectPattern(
      patternId,
      priceData.mid_o,
      priceData.mid_h,
      priceData.mid_l,
      priceData.mid_c
    );

    // Create pattern instance with detected patterns
    // IMPORTANT: Spread pattern first, then override with our values
    const newPattern = {
      ...pattern,
      instanceId: `${patternId}-${Date.now()}`,
      detectedPatterns: detectedPatterns,
      detectedCount: detectedPatterns.length,
    };

    // Verify pattern integrity after creation
    if (process.env.NODE_ENV === 'development') {
      console.log('Pattern drop - created newPattern:', { id: newPattern.id, name: newPattern.name, count: newPattern.detectedCount });
    }

    // Create a condition for the pattern
    const newCondition = createConditionFromPattern(newPattern);

    setActivePatterns(prev => [...prev, newPattern]);
    setPatternHistory(prev => [...prev, { type: 'pattern', item: newPattern }]);
    setConditions(prev => [...prev, newCondition]);
    setConditionHistory(prev => [...prev, { type: 'condition', item: newCondition }]);
    setIndicatorError(null);
  }, [priceData]);

  // Handle pattern removal
  const handleRemovePattern = useCallback((instanceId) => {
    // Find conditions using this pattern
    const relatedConditions = conditions.filter(c => c.patternInstanceId === instanceId);
    const pattern = activePatterns.find(p => p.instanceId === instanceId);
    const displayName = pattern ? getPatternDisplayName(pattern) : 'this pattern';

    if (relatedConditions.length > 0) {
      // Show confirmation dialog
      setConfirmDialog({
        isOpen: true,
        title: 'Remove Pattern',
        message: `"${displayName}" is used in ${relatedConditions.length} condition${relatedConditions.length !== 1 ? 's' : ''}. What would you like to do?`,
        variant: 'warning',
        actions: [
          {
            label: 'Remove All',
            variant: 'danger',
            onClick: () => {
              setActivePatterns(prev => prev.filter(p => p.instanceId !== instanceId));
              setConditions(prev => prev.filter(c => c.patternInstanceId !== instanceId));
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            },
          },
          {
            label: 'Keep Conditions',
            variant: 'secondary',
            onClick: () => {
              setActivePatterns(prev => prev.filter(p => p.instanceId !== instanceId));
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            },
          },
        ],
      });
    } else {
      // No related conditions, just remove
      setActivePatterns(prev => prev.filter(p => p.instanceId !== instanceId));
    }
  }, [conditions, activePatterns]);

  // Handle condition update
  const handleConditionUpdate = useCallback((updatedCondition) => {
    setConditions(prev => prev.map(c =>
      c.id === updatedCondition.id ? updatedCondition : c
    ));
  }, []);

  // Handle condition deletion with confirmation
  const handleConditionDelete = useCallback((conditionId) => {
    const condition = conditions.find(c => c.id === conditionId);
    const indicator = activeIndicators.find(ind => ind.instanceId === condition?.indicatorInstanceId);
    const displayName = indicator ? getDisplayName(indicator) : 'the indicator';

    setConfirmDialog({
      isOpen: true,
      title: 'Remove Condition',
      message: `Remove this condition? "${displayName}" will remain on the chart.`,
      variant: 'warning',
      actions: [
        {
          label: 'Remove Condition',
          variant: 'danger',
          onClick: () => {
            setConditions(prev => prev.filter(c => c.id !== conditionId));
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          },
        },
      ],
    });
  }, [conditions, activeIndicators, getDisplayName]);

  // Handle moving condition between sections
  const handleConditionMove = useCallback((conditionId, targetSection) => {
    setConditions(prev => prev.map(c =>
      c.id === conditionId ? { ...c, section: targetSection } : c
    ));
  }, []);

  // Handle hover for visual connections
  const handleIndicatorHover = useCallback((instanceId) => {
    setHighlightedIndicatorId(instanceId);
  }, []);

  // Close confirmation dialog
  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Handle undo (Ctrl+Z) - supports indicators, patterns, and conditions
  const handleUndo = useCallback(() => {
    // Check condition history first (most recent action)
    if (conditionHistory.length > 0) {
      const lastEntry = conditionHistory[conditionHistory.length - 1];
      setConditionHistory(prev => prev.slice(0, -1));

      if (lastEntry.type === 'condition') {
        setConditions(prev => prev.filter(c => c.id !== lastEntry.item.id));
      }
    }

    // Check pattern history
    if (patternHistory.length > 0) {
      const lastEntry = patternHistory[patternHistory.length - 1];
      setPatternHistory(prev => prev.slice(0, -1));

      if (lastEntry.type === 'pattern') {
        setActivePatterns(prev => prev.filter(p => p.instanceId !== lastEntry.item.instanceId));
        // Also remove related conditions
        setConditions(prev => prev.filter(c => c.patternInstanceId !== lastEntry.item.instanceId));
      }
    }

    // Then check indicator history
    if (indicatorHistory.length > 0) {
      const lastEntry = indicatorHistory[indicatorHistory.length - 1];
      setIndicatorHistory(prev => prev.slice(0, -1));

      if (lastEntry.type === 'indicator') {
        setActiveIndicators(prev => prev.filter(ind => ind.instanceId !== lastEntry.item.instanceId));
        // Also remove related conditions
        setConditions(prev => prev.filter(c => c.indicatorInstanceId !== lastEntry.item.instanceId));
      }
    }

    setIndicatorError(null);
  }, [indicatorHistory, conditionHistory, patternHistory]);

  // Clear indicator error after 5 seconds
  useEffect(() => {
    if (indicatorError) {
      const timer = setTimeout(() => {
        setIndicatorError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [indicatorError]);

  // Keyboard listener for Ctrl+Z undo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger when typing in inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  // Loading state
  if (loading) {
    return (
      <div className="py-8 animate-fade-in">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium">Loading strategy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] animate-fade-in">
      {/* Indicator Library Panel - Left Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-shrink-0 transition-all duration-200 ease-out",
          isPanelCollapsed ? "w-10" : "w-64"
        )}
      >
        <IndicatorLibrary
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={handlePanelToggle}
        />
      </div>

      {/* Mobile Indicator Panel - Overlay */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 transition-opacity duration-200",
          !isPanelCollapsed ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={handlePanelToggle}
        />
        {/* Panel */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full transition-transform duration-200",
            !isPanelCollapsed ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <IndicatorLibrary
            isCollapsed={false}
            onToggleCollapse={handlePanelToggle}
          />
        </div>
      </div>

      {/* Mobile Panel Toggle Buttons */}
      <div className="md:hidden fixed bottom-6 z-40 flex gap-4 left-4 right-4 justify-between pointer-events-none">
        <button
          type="button"
          onClick={handlePanelToggle}
          className={cn(
            "flex items-center justify-center w-14 h-14 pointer-events-auto",
            "bg-primary text-primary-foreground rounded-full shadow-xl",
            "hover:bg-primary/90 transition-all hover:scale-105 active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
          aria-label="Toggle indicator library"
        >
          <BarChart3 className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setIsLogicPanelMobileOpen(true)}
          className={cn(
            "flex items-center justify-center w-14 h-14 pointer-events-auto",
            "bg-accent text-accent-foreground rounded-full shadow-xl",
            "hover:bg-accent/90 transition-all hover:scale-105 active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          )}
          aria-label="Toggle logic panel"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 py-8 px-4 md:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-h2 text-foreground">Strategy</h1>
            <p className="text-muted-foreground">
              Analyze currency pairs, timeframes, and technical indicators for trading decisions
            </p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="card p-6 lg:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 flex-wrap">
            {/* Pair & Granularity Selectors */}
            <div className="flex flex-wrap items-end gap-4">
              <PairSelector
                options={options.pairs}
                defaultValue={selectedPair}
                onSelected={setSelectedPair}
                hasLoadedData={!!(technicalsData || priceData)}
                className="w-48"
              />
              <Select
                name="Granularity"
                title="Timeframe"
                options={options.granularities}
                defaultValue={selectedGran}
                onSelected={handleTimeframeChange}
                className="w-32"
              />
            </div>

            {/* Load Button */}
            <Button
              text={loadingData ? "Loading..." : "Load Data"}
              handleClick={() => loadTechnicals()}
              disabled={loadingData}
              icon={loadingData ? RefreshCw : Play}
              className={loadingData ? "[&_svg]:animate-spin" : ""}
            />
          </div>

          {/* Selected Info Badge */}
          {selectedPair && selectedGran && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>
                  Analyzing <span className="font-semibold text-foreground">{selectedPair}</span> on{' '}
                  <span className="font-semibold text-foreground">{selectedGran}</span> timeframe
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="card p-5 border-destructive bg-destructive/10">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-destructive mb-1">
                  Unable to Load Data
                </h3>
                <p className="text-sm text-muted-foreground">
                  {error}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  This may be due to external data sources being temporarily unavailable. Please try again later.
                </p>
              </div>
              <button
                onClick={clearError}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss error"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Indicator Error Display */}
        {indicatorError && (
          <div className="card p-5 border-amber-500 bg-amber-500/10">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-foreground">
                  {indicatorError}
                </p>
              </div>
              <button
                onClick={() => setIndicatorError(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss warning"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Info Message Display (for insufficient data etc.) */}
        {infoMessage && (
          <div className="card p-5 border-info bg-info/10">
            <div className="flex items-start gap-4">
              <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {infoMessage}
                </p>
              </div>
              <button
                onClick={clearInfoMessage}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss info"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {(technicalsData || priceData) ? (
          <div className="space-y-8">
            {/* Price Chart - Full Width Priority */}
            {priceData && (
              <div>
                <PriceChart
                  selectedCount={selectedCount}
                  selectedPair={selectedPair}
                  selectedGranularity={selectedGran}
                  handleCountChange={handleCountChange}
                  priceData={priceData}
                  chartType={chartType}
                  onChartTypeChange={handleChartTypeChange}
                  showVolume={showVolume}
                  onVolumeToggle={handleVolumeToggle}
                  selectedDateRange={selectedDateRange}
                  onDateRangeChange={handleDateRangeChange}
                  loading={loadingData}
                  activeIndicators={activeIndicators}
                  activePatterns={activePatterns}
                  onIndicatorDrop={handleIndicatorDrop}
                  onRemoveIndicator={handleRemoveIndicator}
                  onEditIndicator={handleEditIndicator}
                  onPatternDrop={handlePatternDrop}
                  onRemovePattern={handleRemovePattern}
                  onIndicatorClick={handleIndicatorClick}
                  onIndicatorConfigure={handleIndicatorConfigure}
                  onIndicatorDuplicate={handleIndicatorDuplicate}
                  previewIndicator={previewIndicator}
                  comparisonMode={comparisonMode}
                />
              </div>
            )}

            {/* Technicals - Full Width Below Chart */}
            {technicalsData && (
              <div>
                <Technicals data={technicalsData} />
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="card">
            <div className="flex flex-col items-center justify-center py-20 lg:py-24 px-6 text-center">
              <div className="p-5 rounded-full bg-muted mb-6">
                <BarChart3 className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Ready to Analyze
              </h3>
              <p className="text-muted-foreground max-w-md mb-8">
                Select a currency pair and timeframe above, then click "Load Data" to view technical analysis and price charts.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  Real-time data
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Technical indicators
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logic Panel - Right Sidebar (Desktop) */}
      <div className="hidden md:flex flex-shrink-0">
        <LogicPanel
          conditions={conditions}
          activeIndicators={activeIndicators}
          getIndicatorDisplayName={getDisplayName}
          onConditionUpdate={handleConditionUpdate}
          onConditionDelete={handleConditionDelete}
          onConditionMove={handleConditionMove}
          onIndicatorHover={handleIndicatorHover}
          highlightedIndicatorId={highlightedIndicatorId}
        />
      </div>

      {/* Mobile Logic Panel - Overlay */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 transition-opacity duration-200",
          isLogicPanelMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsLogicPanelMobileOpen(false)}
        />
        {/* Panel */}
        <div
          className={cn(
            "absolute right-0 top-0 h-full transition-transform duration-200",
            isLogicPanelMobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <LogicPanel
            conditions={conditions}
            activeIndicators={activeIndicators}
            getIndicatorDisplayName={getDisplayName}
            onConditionUpdate={handleConditionUpdate}
            onConditionDelete={handleConditionDelete}
            onConditionMove={handleConditionMove}
            onIndicatorHover={handleIndicatorHover}
            highlightedIndicatorId={highlightedIndicatorId}
          />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        title={confirmDialog.title}
        message={confirmDialog.message}
        actions={confirmDialog.actions}
        variant={confirmDialog.variant}
      />

      {/* Indicator Settings Dialog */}
      <IndicatorSettingsDialog
        isOpen={settingsDialog.isOpen}
        onClose={handleSettingsCancel}
        onConfirm={handleSettingsConfirm}
        indicator={settingsDialog.indicator}
        initialParams={settingsDialog.initialParams}
        initialColor={settingsDialog.initialColor}
        isEditMode={settingsDialog.isEditMode}
        onPreviewUpdate={handlePreviewUpdate}
        comparisonMode={comparisonMode}
        onComparisonToggle={handleComparisonToggle}
      />
    </div>
  );
}

export default Strategy;
