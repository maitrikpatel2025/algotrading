import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
import MultiTimeframeConditionDialog from '../components/MultiTimeframeConditionDialog';
import TimeFilterDialog from '../components/TimeFilterDialog';
import TradeDirectionSelector from '../components/TradeDirectionSelector';
import CandleCloseToggle from '../components/CandleCloseToggle';
import { cn } from '../lib/utils';
import { Play, RefreshCw, BarChart3, AlertTriangle, Info, Sparkles, Clock, Zap } from 'lucide-react';
import { INDICATOR_TYPES, getIndicatorDisplayName, INDICATORS } from '../app/indicators';
import { getPatternDisplayName } from '../app/patterns';
import { detectPattern } from '../app/patternDetection';
import {
  createConditionFromIndicator,
  createConditionFromPattern,
  createStandaloneCondition,
  CONDITION_SECTIONS_V2,
  getDefaultSection,
  migrateSectionToV2,
  createConditionGroup,
  removeConditionFromGroup,
  addConditionToGroup,
  reorderConditionInGroup,
  findConditionsUsingReferenceIndicator,
} from '../app/conditionDefaults';
import {
  TRADE_DIRECTIONS,
  TRADE_DIRECTION_STORAGE_KEY,
  CANDLE_CLOSE_CONFIRMATION,
  CANDLE_CLOSE_CONFIRMATION_STORAGE_KEY,
  CANDLE_CLOSE_CONFIRMATION_DEFAULT,
  CONDITION_GROUPS_STORAGE_KEY,
  GROUP_OPERATORS,
  REFERENCE_INDICATORS_STORAGE_KEY,
  TIME_FILTER_STORAGE_KEY,
  DEFAULT_TIME_FILTER,
  DRAWINGS_STORAGE_KEY,
} from '../app/constants';
import { DRAWING_TOOLS } from '../app/drawingTypes';
import {
  findConditionsUsingDrawing,
  serializeDrawings,
  deserializeDrawings,
  getDrawingDisplayName,
} from '../app/drawingUtils';
import DrawingPropertiesDialog from '../components/DrawingPropertiesDialog';

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

  // Group state management for AND/OR logic
  const [groups, setGroups] = useState(() => {
    try {
      const stored = localStorage.getItem(CONDITION_GROUPS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // Ignore
    }
    return [];
  });
  // eslint-disable-next-line no-unused-vars
  const [groupHistory, setGroupHistory] = useState([]);

  // Reference indicators state management for multi-timeframe conditions
  const [referenceIndicators, setReferenceIndicators] = useState(() => {
    try {
      const stored = localStorage.getItem(REFERENCE_INDICATORS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // Ignore
    }
    return [];
  });
  const [referenceIndicatorValues, setReferenceIndicatorValues] = useState({});
  const [referenceDataLoading, setReferenceDataLoading] = useState(false);

  // Time filter state management
  const [timeFilter, setTimeFilter] = useState(() => {
    try {
      const stored = localStorage.getItem(TIME_FILTER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed && typeof parsed === 'object' ? parsed : { ...DEFAULT_TIME_FILTER };
      }
    } catch {
      // Ignore
    }
    return { ...DEFAULT_TIME_FILTER };
  });
  const [timeFilterDialogOpen, setTimeFilterDialogOpen] = useState(false);

  // Trade direction state management
  const [tradeDirection, setTradeDirection] = useState(() => {
    try {
      const stored = localStorage.getItem(TRADE_DIRECTION_STORAGE_KEY);
      return stored && Object.values(TRADE_DIRECTIONS).includes(stored)
        ? stored
        : TRADE_DIRECTIONS.BOTH;
    } catch {
      return TRADE_DIRECTIONS.BOTH;
    }
  });

  // Candle close confirmation state management
  const [confirmOnCandleClose, setConfirmOnCandleClose] = useState(() => {
    try {
      const stored = localStorage.getItem(CANDLE_CLOSE_CONFIRMATION_STORAGE_KEY);
      return stored && Object.values(CANDLE_CLOSE_CONFIRMATION).includes(stored)
        ? stored
        : CANDLE_CLOSE_CONFIRMATION_DEFAULT;
    } catch {
      return CANDLE_CLOSE_CONFIRMATION_DEFAULT;
    }
  });

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
    initialLineWidth: null,
    initialLineStyle: null,
    initialFillOpacity: null,
  });

  // Multi-timeframe condition dialog state
  const [multiTimeframeDialog, setMultiTimeframeDialog] = useState({
    isOpen: false,
    section: null,
  });

  // Preview mode state for real-time parameter adjustment
  const [previewIndicator, setPreviewIndicator] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);

  // Drawing state management
  const [drawings, setDrawings] = useState(() => {
    try {
      const stored = localStorage.getItem(DRAWINGS_STORAGE_KEY);
      if (stored) {
        return deserializeDrawings(stored);
      }
    } catch {
      // Ignore
    }
    return [];
  });
  const [activeDrawingTool, setActiveDrawingTool] = useState(DRAWING_TOOLS.POINTER);
  const [drawingError, setDrawingError] = useState(null);

  // Drawing properties dialog state
  const [drawingDialog, setDrawingDialog] = useState({
    isOpen: false,
    drawing: null,
  });

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
      initialLineWidth: null,
      initialLineStyle: null,
      initialFillOpacity: null,
    });
    setIndicatorError(null);
  }, [activeIndicators]);

  // Handle settings dialog confirm - add indicator with custom params
  const handleSettingsConfirm = useCallback((params, color, lineWidth, lineStyle, fillOpacity) => {
    const indicator = settingsDialog.indicator;

    if (settingsDialog.isEditMode && settingsDialog.editingInstanceId) {
      // Edit mode - update existing indicator
      setActiveIndicators(prev => prev.map(ind => {
        if (ind.instanceId === settingsDialog.editingInstanceId) {
          const updatedIndicator = {
            ...ind,
            params: params,
            color: color,
            lineWidth: lineWidth,
            lineStyle: lineStyle,
            fillOpacity: fillOpacity,
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
        lineWidth: lineWidth,
        lineStyle: lineStyle,
        fillOpacity: fillOpacity,
      };

      // Create display name for the indicator using custom params
      const displayName = getIndicatorDisplayName(newIndicator, params);

      // Determine condition section based on trade direction (use V2 sections)
      const conditionSection = getDefaultSection(tradeDirection, 'entry');

      // Create a condition for the indicator
      const newCondition = createConditionFromIndicator(newIndicator, displayName, conditionSection);

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
  }, [settingsDialog, activeIndicators, tradeDirection]);

  // Handle settings dialog close/cancel
  const handleSettingsCancel = useCallback(() => {
    setSettingsDialog(prev => ({ ...prev, isOpen: false }));
    // Clear preview state when dialog is closed
    setPreviewIndicator(null);
    setComparisonMode(false);
  }, []);

  // Handle preview update - called when parameters change in real-time
  const handlePreviewUpdate = useCallback((previewParams, previewColor, previewLineWidth, previewLineStyle, previewFillOpacity) => {
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
      lineWidth: previewLineWidth,
      lineStyle: previewLineStyle,
      fillOpacity: previewFillOpacity,
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
      initialLineWidth: indicator.lineWidth,
      initialLineStyle: indicator.lineStyle,
      initialFillOpacity: indicator.fillOpacity,
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

    // Determine condition section based on trade direction (use V2 sections)
    const conditionSection = getDefaultSection(tradeDirection, 'entry');

    // Auto-create a condition for the new instance
    const displayName = getDisplayName(newIndicator);
    const newCondition = createConditionFromIndicator(newIndicator, displayName, conditionSection);
    setConditions(prev => [...prev, newCondition]);
    setConditionHistory(prev => [...prev, { type: 'condition', item: newCondition }]);

    setIndicatorError(null);
  }, [activeIndicators, tradeDirection, getDisplayName]);

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

    // Determine condition section based on trade direction (use V2 sections)
    const conditionSection = getDefaultSection(tradeDirection, 'entry');

    // Create a condition for the pattern
    const newCondition = createConditionFromPattern(newPattern, conditionSection);

    setActivePatterns(prev => [...prev, newPattern]);
    setPatternHistory(prev => [...prev, { type: 'pattern', item: newPattern }]);
    setConditions(prev => [...prev, newCondition]);
    setConditionHistory(prev => [...prev, { type: 'condition', item: newCondition }]);
    setIndicatorError(null);
  }, [priceData, tradeDirection]);

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

  // Handle trade direction change
  const handleTradeDirectionChange = useCallback((newDirection) => {
    // Check if there are conditions that would be removed (using V2 sections)
    const hasLongConditions = conditions.some(c => {
      const section = migrateSectionToV2(c.section);
      return section === CONDITION_SECTIONS_V2.LONG_ENTRY || section === CONDITION_SECTIONS_V2.LONG_EXIT;
    });
    const hasShortConditions = conditions.some(c => {
      const section = migrateSectionToV2(c.section);
      return section === CONDITION_SECTIONS_V2.SHORT_ENTRY || section === CONDITION_SECTIONS_V2.SHORT_EXIT;
    });

    let needsConfirmation = false;
    let conditionsToRemove = [];
    let warningMessage = '';

    if (newDirection === TRADE_DIRECTIONS.LONG && hasShortConditions) {
      needsConfirmation = true;
      conditionsToRemove = conditions.filter(c => {
        const section = migrateSectionToV2(c.section);
        return section === CONDITION_SECTIONS_V2.SHORT_ENTRY || section === CONDITION_SECTIONS_V2.SHORT_EXIT;
      });
      warningMessage = `You have ${conditionsToRemove.length} Short condition${conditionsToRemove.length !== 1 ? 's' : ''} defined. Switching to Long Only will remove ${conditionsToRemove.length === 1 ? 'it' : 'them'}. Continue?`;
    } else if (newDirection === TRADE_DIRECTIONS.SHORT && hasLongConditions) {
      needsConfirmation = true;
      conditionsToRemove = conditions.filter(c => {
        const section = migrateSectionToV2(c.section);
        return section === CONDITION_SECTIONS_V2.LONG_ENTRY || section === CONDITION_SECTIONS_V2.LONG_EXIT;
      });
      warningMessage = `You have ${conditionsToRemove.length} Long condition${conditionsToRemove.length !== 1 ? 's' : ''} defined. Switching to Short Only will remove ${conditionsToRemove.length === 1 ? 'it' : 'them'}. Continue?`;
    }

    if (needsConfirmation) {
      // Show confirmation dialog
      setConfirmDialog({
        isOpen: true,
        title: 'Change Trade Direction',
        message: warningMessage,
        variant: 'warning',
        actions: [
          {
            label: 'Continue',
            variant: 'primary',
            onClick: () => {
              // Remove incompatible conditions
              setConditions(prev => prev.filter(c => !conditionsToRemove.find(cr => cr.id === c.id)));

              // Update trade direction
              setTradeDirection(newDirection);
              localStorage.setItem(TRADE_DIRECTION_STORAGE_KEY, newDirection);

              // Close dialog
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            },
          },
        ],
      });
    } else {
      // No confirmation needed, update directly
      setTradeDirection(newDirection);
      localStorage.setItem(TRADE_DIRECTION_STORAGE_KEY, newDirection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditions]);

  // Handle candle close confirmation change
  const handleCandleCloseChange = useCallback((newValue) => {
    setConfirmOnCandleClose(newValue);
    localStorage.setItem(CANDLE_CLOSE_CONFIRMATION_STORAGE_KEY, newValue);
  }, []);

  // Handle hover for visual connections
  const handleIndicatorHover = useCallback((instanceId) => {
    setHighlightedIndicatorId(instanceId);
  }, []);

  // Handle Add Condition button click from LogicPanel
  const handleAddCondition = useCallback((section, groupId = null) => {
    // Create a new standalone condition for the specified section
    const newCondition = createStandaloneCondition(section);

    // Add to conditions state
    setConditions(prev => [...prev, newCondition]);

    // If groupId is provided, add the condition to the group
    if (groupId) {
      setGroups(prev => addConditionToGroup(newCondition.id, groupId, prev));
    }

    // Add to history for undo support
    setConditionHistory(prev => [...prev, { type: 'condition', item: newCondition }]);
  }, []);

  // Handle Add Multi-Timeframe Condition button click - opens dialog
  const handleAddMultiTimeframeCondition = useCallback((section) => {
    setMultiTimeframeDialog({
      isOpen: true,
      section: section,
    });
  }, []);

  // Handle multi-timeframe condition dialog close
  const handleMultiTimeframeDialogClose = useCallback(() => {
    setMultiTimeframeDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Handle multi-timeframe condition added from dialog
  const handleMultiTimeframeConditionAdded = useCallback((condition, referenceIndicator) => {
    // Add the reference indicator if it doesn't exist
    setReferenceIndicators(prev => {
      // Check if an indicator with same timeframe, indicatorId, and params already exists
      const existingIdx = prev.findIndex(
        ri => ri.timeframe === referenceIndicator.timeframe &&
              ri.indicatorId === referenceIndicator.indicatorId &&
              JSON.stringify(ri.params) === JSON.stringify(referenceIndicator.params)
      );

      if (existingIdx !== -1) {
        // Use existing reference indicator - update condition to use existing ID
        condition.leftOperand.referenceIndicatorId = prev[existingIdx].id;
        return prev;
      }

      // Add new reference indicator
      return [...prev, referenceIndicator];
    });

    // Add the condition
    setConditions(prev => [...prev, condition]);

    // Add to history for undo support
    setConditionHistory(prev => [...prev, { type: 'condition', item: condition }]);

    // Close dialog
    setMultiTimeframeDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Handle delete reference indicator
  const handleDeleteReferenceIndicator = useCallback((referenceIndicatorId) => {
    // Find conditions using this reference indicator
    const relatedConditions = findConditionsUsingReferenceIndicator(referenceIndicatorId, conditions);
    const refIndicator = referenceIndicators.find(ri => ri.id === referenceIndicatorId);
    const displayName = refIndicator
      ? `[${refIndicator.timeframe}] ${getIndicatorDisplayName(
          INDICATORS.find(i => i.id === refIndicator.indicatorId) || { shortName: refIndicator.indicatorId },
          refIndicator.params
        )}`
      : 'this reference indicator';

    if (relatedConditions.length > 0) {
      // Show confirmation dialog
      setConfirmDialog({
        isOpen: true,
        title: 'Remove Reference Indicator',
        message: `"${displayName}" is used in ${relatedConditions.length} condition${relatedConditions.length !== 1 ? 's' : ''}. Removing it will mark those conditions as invalid. Continue?`,
        variant: 'warning',
        actions: [
          {
            label: 'Remove',
            variant: 'danger',
            onClick: () => {
              setReferenceIndicators(prev => prev.filter(ri => ri.id !== referenceIndicatorId));
              setReferenceIndicatorValues(prev => {
                const newValues = { ...prev };
                delete newValues[referenceIndicatorId];
                return newValues;
              });
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            },
          },
        ],
      });
    } else {
      // No related conditions, just remove
      setReferenceIndicators(prev => prev.filter(ri => ri.id !== referenceIndicatorId));
      setReferenceIndicatorValues(prev => {
        const newValues = { ...prev };
        delete newValues[referenceIndicatorId];
        return newValues;
      });
    }
  }, [conditions, referenceIndicators]);

  // Get reference indicator display name
  const getReferenceDisplayName = useCallback((refIndicator) => {
    const indicatorDef = INDICATORS.find(i => i.id === refIndicator.indicatorId);
    if (!indicatorDef) return refIndicator.indicatorId;
    return getIndicatorDisplayName(indicatorDef, refIndicator.params);
  }, []);

  // Handle time filter clear
  const handleTimeFilterClear = useCallback(() => {
    setTimeFilter({ ...DEFAULT_TIME_FILTER });
  }, []);

  // Handle time filter edit (open dialog)
  const handleTimeFilterEdit = useCallback(() => {
    setTimeFilterDialogOpen(true);
  }, []);

  // Handle time filter dialog close
  const handleTimeFilterDialogClose = useCallback(() => {
    setTimeFilterDialogOpen(false);
  }, []);

  // Handle time filter save from dialog
  const handleTimeFilterSave = useCallback((newFilter) => {
    setTimeFilter(newFilter);
    setTimeFilterDialogOpen(false);
  }, []);

  // =============================================================================
  // DRAWING HANDLERS
  // =============================================================================

  // Persist drawings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DRAWINGS_STORAGE_KEY, serializeDrawings(drawings));
    } catch (e) {
      console.warn('Failed to save drawings to localStorage:', e);
    }
  }, [drawings]);

  // Handle drawing tool change
  const handleDrawingToolChange = useCallback((tool) => {
    setActiveDrawingTool(tool);
    setDrawingError(null);
  }, []);

  // Handle adding a new drawing
  const handleDrawingAdd = useCallback((drawing) => {
    setDrawings(prev => [...prev, drawing]);
    // Switch back to pointer tool after single-click drawings
    if (drawing.type === DRAWING_TOOLS.HORIZONTAL_LINE) {
      // Optionally keep the tool active for rapid drawing
      // setActiveDrawingTool(DRAWING_TOOLS.POINTER);
    }
  }, []);

  // Handle updating an existing drawing
  const handleDrawingUpdate = useCallback((updatedDrawing) => {
    setDrawings(prev => prev.map(d =>
      d.id === updatedDrawing.id ? updatedDrawing : d
    ));
    setDrawingDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Handle deleting a drawing with confirmation for condition-linked drawings
  const handleDrawingDelete = useCallback((drawingId) => {
    const drawing = drawings.find(d => d.id === drawingId);
    if (!drawing) return;

    // Check if drawing is used in conditions
    const relatedConditions = findConditionsUsingDrawing(drawingId, conditions);

    if (relatedConditions.length > 0) {
      // Show confirmation dialog
      setConfirmDialog({
        isOpen: true,
        title: 'Delete Drawing',
        message: `"${getDrawingDisplayName(drawing)}" is used in ${relatedConditions.length} condition${relatedConditions.length !== 1 ? 's' : ''}. Deleting this drawing will also remove the related conditions. Continue?`,
        variant: 'warning',
        actions: [
          {
            label: 'Delete All',
            variant: 'danger',
            onClick: () => {
              setDrawings(prev => prev.filter(d => d.id !== drawingId));
              // Remove related conditions
              setConditions(prev => prev.filter(c =>
                !(c.leftOperand?.type === 'horizontalLine' && c.leftOperand?.drawingId === drawingId) &&
                !(c.rightOperand?.type === 'horizontalLine' && c.rightOperand?.drawingId === drawingId)
              ));
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            },
          },
        ],
      });
    } else {
      // No related conditions, just delete
      setDrawings(prev => prev.filter(d => d.id !== drawingId));
    }
  }, [drawings, conditions]);

  // Handle editing a drawing (open properties dialog)
  const handleDrawingEdit = useCallback((drawing) => {
    setDrawingDialog({
      isOpen: true,
      drawing,
    });
  }, []);

  // Handle closing drawing properties dialog
  const handleDrawingDialogClose = useCallback(() => {
    setDrawingDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Handle drawing properties dialog confirm
  const handleDrawingDialogConfirm = useCallback((updates) => {
    if (!drawingDialog.drawing) return;

    const updatedDrawing = {
      ...drawingDialog.drawing,
      ...updates,
    };

    setDrawings(prev => prev.map(d =>
      d.id === updatedDrawing.id ? updatedDrawing : d
    ));
    setDrawingDialog(prev => ({ ...prev, isOpen: false }));
  }, [drawingDialog.drawing]);

  // Handle using a horizontal line in a condition
  const handleDrawingUseInCondition = useCallback((drawing) => {
    if (drawing.type !== DRAWING_TOOLS.HORIZONTAL_LINE) {
      setDrawingError('Only horizontal lines can be used in conditions.');
      return;
    }

    // Determine condition section based on trade direction
    const conditionSection = getDefaultSection(tradeDirection, 'entry');

    // Create a condition with the horizontal line as a reference
    const newCondition = createStandaloneCondition('price', conditionSection);
    newCondition.rightOperand = {
      type: 'horizontalLine',
      drawingId: drawing.id,
      price: drawing.price,
      label: drawing.label || `Line @ ${drawing.price.toFixed(5)}`,
    };
    newCondition.operator = 'crosses_above';

    setConditions(prev => [...prev, newCondition]);
    setConditionHistory(prev => [...prev, { type: 'condition', item: newCondition }]);
  }, [tradeDirection]);

  // Get drawing IDs that are used in conditions
  const conditionDrawingIds = useMemo(() => {
    const ids = new Set();
    conditions.forEach(c => {
      if (c.leftOperand?.type === 'horizontalLine' && c.leftOperand?.drawingId) {
        ids.add(c.leftOperand.drawingId);
      }
      if (c.rightOperand?.type === 'horizontalLine' && c.rightOperand?.drawingId) {
        ids.add(c.rightOperand.drawingId);
      }
    });
    return Array.from(ids);
  }, [conditions]);

  // Clear drawing error
  const handleDrawingErrorClear = useCallback(() => {
    setDrawingError(null);
  }, []);

  // Handle creating a new group from selected conditions
  const handleGroupCreate = useCallback((conditionIds, operator = GROUP_OPERATORS.AND, section, parentGroupId = null) => {
    if (conditionIds.length < 2) return;

    const newGroup = createConditionGroup(operator, section, conditionIds, parentGroupId);

    // If this is a nested group, add it to the parent's conditionIds
    if (parentGroupId) {
      setGroups(prev => {
        // Remove the condition IDs from the parent (they're now in the subgroup)
        const updatedGroups = prev.map(g => {
          if (g.id === parentGroupId) {
            const remainingIds = g.conditionIds.filter(id => !conditionIds.includes(id));
            return {
              ...g,
              conditionIds: [...remainingIds, newGroup.id],
            };
          }
          return g;
        });
        return [...updatedGroups, newGroup];
      });
    } else {
      setGroups(prev => [...prev, newGroup]);
    }

    setGroupHistory(prev => [...prev, { type: 'group', item: newGroup }]);
  }, []);

  // Handle updating a group
  const handleGroupUpdate = useCallback((groupId, updates) => {
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, ...updates } : g
    ));
  }, []);

  // Handle deleting a group (keeps conditions as ungrouped)
  const handleGroupDelete = useCallback((groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    // If this is a nested group, remove it from parent's conditionIds and move its conditions up
    setGroups(prev => {
      let updatedGroups = prev.filter(g => g.id !== groupId);

      // If parent exists, add the group's conditions to parent
      if (group.parentGroupId) {
        updatedGroups = updatedGroups.map(g => {
          if (g.id === group.parentGroupId) {
            // Replace the group ID with its condition IDs
            const newConditionIds = g.conditionIds.flatMap(id =>
              id === groupId ? group.conditionIds : [id]
            );
            return { ...g, conditionIds: newConditionIds };
          }
          return g;
        });
      }

      return updatedGroups;
    });
  }, [groups]);

  // Handle toggling group operator (AND <-> OR)
  const handleGroupOperatorChange = useCallback((groupId, newOperator) => {
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, operator: newOperator } : g
    ));
  }, []);

  // Handle ungrouping - flatten conditions back to parent level
  const handleUngroup = useCallback((groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    setGroups(prev => {
      // Remove the group
      let updatedGroups = prev.filter(g => g.id !== groupId);

      // If this group has a parent, move conditions to parent
      if (group.parentGroupId) {
        updatedGroups = updatedGroups.map(g => {
          if (g.id === group.parentGroupId) {
            // Replace the group ID with its condition IDs
            const newConditionIds = g.conditionIds.flatMap(id =>
              id === groupId ? group.conditionIds : [id]
            );
            return { ...g, conditionIds: newConditionIds };
          }
          return g;
        });
      }

      return updatedGroups;
    });
  }, [groups]);

  // Handle reordering condition within or between groups
  const handleConditionReorderInGroup = useCallback((conditionId, targetGroupId, targetIndex, sourceGroupId) => {
    setGroups(prev => {
      let updatedGroups = [...prev];

      // Remove from source group if specified
      if (sourceGroupId && sourceGroupId !== targetGroupId) {
        updatedGroups = removeConditionFromGroup(conditionId, updatedGroups);
      }

      // Add to target group
      if (sourceGroupId === targetGroupId) {
        // Reorder within same group
        updatedGroups = reorderConditionInGroup(conditionId, targetGroupId, targetIndex, updatedGroups);
      } else {
        // Moving to different group
        updatedGroups = addConditionToGroup(conditionId, targetGroupId, updatedGroups, targetIndex);
      }

      return updatedGroups;
    });
  }, []);

  // Handle Test Logic button - prepare data for evaluation
  const handleTestLogic = useCallback((section) => {
    // This callback can be used to prepare/refresh data before showing the dialog
    // The actual evaluation happens in the TestLogicDialog component
  }, []);

  // Prepare test logic data from current state
  const testLogicData = useMemo(() => {
    if (!priceData) return null;

    // Get current candle data (last candle)
    const lastIndex = priceData.time.length - 1;
    if (lastIndex < 0) return null;

    const candleData = {
      open: priceData.mid_o[lastIndex],
      high: priceData.mid_h[lastIndex],
      low: priceData.mid_l[lastIndex],
      close: priceData.mid_c[lastIndex],
      time: priceData.time[lastIndex],
    };

    // Get previous candle data
    const prevIndex = lastIndex - 1;
    const previousCandleData = prevIndex >= 0 ? {
      open: priceData.mid_o[prevIndex],
      high: priceData.mid_h[prevIndex],
      low: priceData.mid_l[prevIndex],
      close: priceData.mid_c[prevIndex],
      time: priceData.time[prevIndex],
    } : null;

    // Build indicator values map - this would need to be populated from actual indicator calculations
    // For now, we'll return a placeholder structure
    const indicatorValues = {};
    activeIndicators.forEach(indicator => {
      // Placeholder - actual values would come from indicator calculation
      indicatorValues[indicator.instanceId] = null;
    });

    // Build pattern detections map
    const patternDetections = {};
    activePatterns.forEach(pattern => {
      // Check if pattern is detected on the current candle
      patternDetections[pattern.instanceId] = pattern.detectedPatterns?.some(
        dp => dp.endIndex === lastIndex
      ) ?? false;
    });

    return {
      candleData,
      previousCandleData,
      indicatorValues,
      patternDetections,
      previousIndicatorValues: {},
    };
  }, [priceData, activeIndicators, activePatterns]);

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

  // Persist groups to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CONDITION_GROUPS_STORAGE_KEY, JSON.stringify(groups));
    } catch (e) {
      console.warn('Failed to save groups to localStorage:', e);
    }
  }, [groups]);

  // Persist reference indicators to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(REFERENCE_INDICATORS_STORAGE_KEY, JSON.stringify(referenceIndicators));
    } catch (e) {
      console.warn('Failed to save reference indicators to localStorage:', e);
    }
  }, [referenceIndicators]);

  // Persist time filter to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TIME_FILTER_STORAGE_KEY, JSON.stringify(timeFilter));
    } catch (e) {
      console.warn('Failed to save time filter to localStorage:', e);
    }
  }, [timeFilter]);

  // Calculate reference indicator values when data changes or reference indicators change
  useEffect(() => {
    const calculateReferenceValues = async () => {
      if (referenceIndicators.length === 0 || !selectedPair) {
        setReferenceIndicatorValues({});
        return;
      }

      setReferenceDataLoading(true);
      const newValues = {};

      // Group reference indicators by timeframe to minimize API calls
      const byTimeframe = {};
      referenceIndicators.forEach(ri => {
        if (!byTimeframe[ri.timeframe]) {
          byTimeframe[ri.timeframe] = [];
        }
        byTimeframe[ri.timeframe].push(ri);
      });

      // For each timeframe, fetch data and calculate indicators
      // Note: In a real implementation, this would fetch actual candle data
      // and run the indicator calculations. For now, we simulate with placeholder values.
      try {
        for (const [, indicators] of Object.entries(byTimeframe)) {
          for (const ri of indicators) {
            // Generate a placeholder value based on the indicator type
            // In production, this would use actual API data and indicator calculation
            let value = null;
            const indicatorDef = INDICATORS.find(i => i.id === ri.indicatorId);

            if (indicatorDef) {
              // Simulate indicator values (in production, calculate from real data)
              switch (ri.indicatorId) {
                case 'rsi':
                  value = 45 + Math.random() * 30; // RSI: 45-75 range
                  break;
                case 'macd':
                  value = {
                    'MACD Line': (Math.random() - 0.5) * 0.01,
                    'Signal Line': (Math.random() - 0.5) * 0.01,
                    'Histogram': (Math.random() - 0.5) * 0.005,
                  };
                  break;
                case 'ema':
                case 'sma':
                  // For moving averages, use a price-like value
                  value = 1.08 + Math.random() * 0.02;
                  break;
                case 'bollinger_bands':
                  value = {
                    'Upper Band': 1.10,
                    'Middle Band': 1.08,
                    'Lower Band': 1.06,
                  };
                  break;
                case 'stochastic':
                  value = {
                    '%K': 30 + Math.random() * 40,
                    '%D': 30 + Math.random() * 40,
                  };
                  break;
                default:
                  value = Math.random() * 100;
              }
            }

            newValues[ri.id] = value;
          }
        }
      } catch (error) {
        console.warn('Error calculating reference indicator values:', error);
      }

      setReferenceIndicatorValues(newValues);
      setReferenceDataLoading(false);
    };

    calculateReferenceValues();
  }, [referenceIndicators, selectedPair, priceData]);

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

            {/* Trade Direction Selector */}
            <TradeDirectionSelector
              value={tradeDirection}
              onChange={handleTradeDirectionChange}
            />

            {/* Candle Close Confirmation Toggle */}
            <CandleCloseToggle
              value={confirmOnCandleClose}
              onChange={handleCandleCloseChange}
            />

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
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>
                    Analyzing <span className="font-semibold text-foreground">{selectedPair}</span> on{' '}
                    <span className="font-semibold text-foreground">{selectedGran}</span> timeframe
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {confirmOnCandleClose === CANDLE_CLOSE_CONFIRMATION.YES ? (
                    <>
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>Signals confirmed on candle close</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span>Real-time signal evaluation</span>
                    </>
                  )}
                </div>
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
                  // Drawing props
                  drawings={drawings}
                  activeDrawingTool={activeDrawingTool}
                  onDrawingToolChange={handleDrawingToolChange}
                  onDrawingAdd={handleDrawingAdd}
                  onDrawingUpdate={handleDrawingUpdate}
                  onDrawingDelete={handleDrawingDelete}
                  onDrawingEdit={handleDrawingEdit}
                  onDrawingUseInCondition={handleDrawingUseInCondition}
                  conditionDrawingIds={conditionDrawingIds}
                  conditions={conditions}
                  drawingError={drawingError}
                  onDrawingErrorClear={handleDrawingErrorClear}
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
          groups={groups}
          activeIndicators={activeIndicators}
          activePatterns={activePatterns}
          getIndicatorDisplayName={getDisplayName}
          onConditionUpdate={handleConditionUpdate}
          onConditionDelete={handleConditionDelete}
          onConditionMove={handleConditionMove}
          onIndicatorHover={handleIndicatorHover}
          highlightedIndicatorId={highlightedIndicatorId}
          tradeDirection={tradeDirection}
          onAddCondition={handleAddCondition}
          onAddMultiTimeframeCondition={handleAddMultiTimeframeCondition}
          onGroupCreate={handleGroupCreate}
          onGroupUpdate={handleGroupUpdate}
          onGroupDelete={handleGroupDelete}
          onGroupOperatorChange={handleGroupOperatorChange}
          onUngroup={handleUngroup}
          onConditionReorderInGroup={handleConditionReorderInGroup}
          onTestLogic={handleTestLogic}
          testLogicData={testLogicData}
          referenceIndicators={referenceIndicators}
          referenceIndicatorValues={referenceIndicatorValues}
          getReferenceDisplayName={getReferenceDisplayName}
          onDeleteReferenceIndicator={handleDeleteReferenceIndicator}
          referenceDataLoading={referenceDataLoading}
          timeFilter={timeFilter}
          onTimeFilterEdit={handleTimeFilterEdit}
          onTimeFilterClear={handleTimeFilterClear}
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
            groups={groups}
            activeIndicators={activeIndicators}
            activePatterns={activePatterns}
            getIndicatorDisplayName={getDisplayName}
            onConditionUpdate={handleConditionUpdate}
            onConditionDelete={handleConditionDelete}
            onConditionMove={handleConditionMove}
            onIndicatorHover={handleIndicatorHover}
            highlightedIndicatorId={highlightedIndicatorId}
            tradeDirection={tradeDirection}
            onAddCondition={handleAddCondition}
            onAddMultiTimeframeCondition={handleAddMultiTimeframeCondition}
            onGroupCreate={handleGroupCreate}
            onGroupUpdate={handleGroupUpdate}
            onGroupDelete={handleGroupDelete}
            onGroupOperatorChange={handleGroupOperatorChange}
            onUngroup={handleUngroup}
            referenceIndicators={referenceIndicators}
            referenceIndicatorValues={referenceIndicatorValues}
            getReferenceDisplayName={getReferenceDisplayName}
            onDeleteReferenceIndicator={handleDeleteReferenceIndicator}
            referenceDataLoading={referenceDataLoading}
            onConditionReorderInGroup={handleConditionReorderInGroup}
            onTestLogic={handleTestLogic}
            testLogicData={testLogicData}
            timeFilter={timeFilter}
            onTimeFilterEdit={handleTimeFilterEdit}
            onTimeFilterClear={handleTimeFilterClear}
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
        initialLineWidth={settingsDialog.initialLineWidth}
        initialLineStyle={settingsDialog.initialLineStyle}
        initialFillOpacity={settingsDialog.initialFillOpacity}
        isEditMode={settingsDialog.isEditMode}
        onPreviewUpdate={handlePreviewUpdate}
        comparisonMode={comparisonMode}
        onComparisonToggle={handleComparisonToggle}
      />

      {/* Multi-Timeframe Condition Dialog */}
      <MultiTimeframeConditionDialog
        isOpen={multiTimeframeDialog.isOpen}
        onClose={handleMultiTimeframeDialogClose}
        onAddCondition={handleMultiTimeframeConditionAdded}
        currentTimeframe={selectedGran}
        section={multiTimeframeDialog.section}
        referenceIndicators={referenceIndicators}
      />

      {/* Time Filter Dialog */}
      <TimeFilterDialog
        isOpen={timeFilterDialogOpen}
        onClose={handleTimeFilterDialogClose}
        onSave={handleTimeFilterSave}
        initialFilter={timeFilter}
      />

      {/* Drawing Properties Dialog */}
      <DrawingPropertiesDialog
        isOpen={drawingDialog.isOpen}
        onClose={handleDrawingDialogClose}
        onConfirm={handleDrawingDialogConfirm}
        drawing={drawingDialog.drawing}
      />
    </div>
  );
}

export default Strategy;
