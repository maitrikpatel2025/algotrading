import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import endPoints from '../app/api';
import { COUNTS, calculateCandleCount, GRANULARITY_SECONDS } from '../app/data';
import PriceChart from '../components/PriceChart';
import PairSelector from '../components/PairSelector';
import Technicals from '../components/Technicals';
// IndicatorLibrary sidebar removed - using IndicatorSearchPopup instead
import LogicPanel from '../components/LogicPanel';
import ConfirmDialog from '../components/ConfirmDialog';
import IndicatorSettingsDialog from '../components/IndicatorSettingsDialog';
import MultiTimeframeConditionDialog from '../components/MultiTimeframeConditionDialog';
import TimeFilterDialog from '../components/TimeFilterDialog';
// TradeDirectionSelector and CandleCloseToggle now integrated into StrategySettingsPopover
import SaveStrategyDialog from '../components/SaveStrategyDialog';
import LoadStrategyDialog from '../components/LoadStrategyDialog';
import ImportStrategyDialog from '../components/ImportStrategyDialog';
import Toast, { useToast } from '../components/Toast';
import { cn } from '../lib/utils';
import { BarChart3, AlertTriangle, Info, Sparkles, Save, Download, Upload, Copy, Edit2, ChevronLeft, Plus, X, FolderOpen, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '../components/ui/DropdownMenu';
import IndicatorSearchPopup from '../components/IndicatorSearchPopup';
import StrategySettingsPopover from '../components/StrategySettingsPopover';
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
  STRATEGY_DRAFT_STORAGE_KEY,
  STRATEGY_DRAFT_TIMESTAMP_KEY,
  AUTO_SAVE_INTERVAL_MS,
  STRATEGY_DRAFT_EXPIRY_MS,
  UNDO_TOAST_DURATION_MS,
} from '../app/constants';
import { DRAWING_TOOLS } from '../app/drawingTypes';
import {
  findConditionsUsingDrawing,
  serializeDrawings,
  deserializeDrawings,
  getDrawingDisplayName,
} from '../app/drawingUtils';
import DrawingPropertiesDialog from '../components/DrawingPropertiesDialog';
// DrawingToolbar removed - using dropdown menu for drawing tools

// localStorage keys for persisting preferences
const PREFERRED_TIMEFRAME_KEY = 'forex_dash_preferred_timeframe';
const LOGIC_PANEL_COLLAPSED_KEY = 'forex_dash_logic_panel_collapsed';

// Timeframe button definitions
const TIMEFRAME_BUTTONS = [
  { value: 'M1', label: '1m' },
  { value: 'M5', label: '5m' },
  { value: 'M15', label: '15m' },
  { value: 'H1', label: '1h' },
  { value: 'H4', label: '4h' },
  { value: 'D', label: '1d' },
];

// Indicator limits
const MAX_OVERLAY_INDICATORS = 5;
const MAX_SUBCHART_INDICATORS = 3;

function Strategy() {
  // Route params for editing existing strategy
  const { id: strategyIdFromUrl } = useParams();
  const navigate = useNavigate();
  const isNewStrategy = !strategyIdFromUrl;
  
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
  
  // Track if strategy has been loaded from URL
  const [hasLoadedFromUrl, setHasLoadedFromUrl] = useState(false);

  // Logic panel state (slide-out drawer) - closed by default
  const [isLogicPanelCollapsed, setIsLogicPanelCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(LOGIC_PANEL_COLLAPSED_KEY);
      // If explicitly set to 'false', expand it; otherwise default to collapsed
      return stored === 'false' ? false : true;
    } catch {
      return true;
    }
  });

  // Editable strategy name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState('');

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

  // Indicator Search Popup state (TradingView-style)
  const [isIndicatorSearchOpen, setIsIndicatorSearchOpen] = useState(false);

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

  // Save Strategy state management
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStrategyName, setCurrentStrategyName] = useState('');
  const [currentStrategyDescription, setCurrentStrategyDescription] = useState('');
  const [currentStrategyTags, setCurrentStrategyTags] = useState([]);
  const [existingStrategyId, setExistingStrategyId] = useState(null);

  // Overwrite confirmation dialog state
  const [overwriteDialog, setOverwriteDialog] = useState({
    isOpen: false,
    strategyName: '',
    strategyId: null,
  });

  // Draft recovery dialog state
  const [draftRecoveryDialog, setDraftRecoveryDialog] = useState({
    isOpen: false,
    draftTimestamp: null,
  });

  // Load Strategy Dialog state
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [strategiesList, setStrategiesList] = useState([]);
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(false);
  const [pendingDeleteStrategy, setPendingDeleteStrategy] = useState(null);
  const [undoDeleteTimeout, setUndoDeleteTimeout] = useState(null);

  // Import Strategy Dialog state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isValidatingImport, setIsValidatingImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Delete confirmation dialog state
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
    isOpen: false,
    strategyName: '',
    strategyId: null,
  });

  // Toast hook for notifications
  // eslint-disable-next-line no-unused-vars
  const { toast, showToast, hideToast, success: showSuccess, error: showError } = useToast();

  // Auto-save draft interval ref
  const autoSaveIntervalRef = useRef(null);

  // Debounce timer ref for timeframe changes
  const debounceTimerRef = useRef(null);
  // Previous timeframe for zoom context preservation
  const previousGranRef = useRef(null);
  // Track last loaded pair/gran to prevent duplicate loads
  const lastLoadedRef = useRef(null);

  useEffect(() => {
    loadOptions();

    // Cleanup debounce timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Load strategy from URL when editing an existing strategy
  useEffect(() => {
    const loadStrategyFromUrl = async () => {
      if (strategyIdFromUrl && !hasLoadedFromUrl && options) {
        try {
          const response = await endPoints.getStrategy(strategyIdFromUrl);
          if (response.success && response.strategy) {
            const strategy = response.strategy;

            // Update all state from loaded strategy
            setCurrentStrategyName(strategy.name || '');
            setCurrentStrategyDescription(strategy.description || '');
            setCurrentStrategyTags(strategy.tags || []);
            setExistingStrategyId(strategy.id);
            setTradeDirection(strategy.trade_direction || TRADE_DIRECTIONS.BOTH);
            setConfirmOnCandleClose(strategy.confirm_on_candle_close || CANDLE_CLOSE_CONFIRMATION_DEFAULT);

            if (strategy.pair) setSelectedPair(strategy.pair);
            if (strategy.timeframe) setSelectedGran(strategy.timeframe);
            if (strategy.candle_count) setSelectedCount(strategy.candle_count);

            // Restore indicators
            if (strategy.indicators && Array.isArray(strategy.indicators)) {
              const restoredIndicators = strategy.indicators.map(ind => {
                const indicatorDef = INDICATORS[ind.id];
                return {
                  ...indicatorDef,
                  instanceId: ind.instance_id || `${ind.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  params: ind.params || indicatorDef?.defaultParams,
                  color: ind.color || indicatorDef?.defaultColor,
                  lineWidth: ind.line_width || 2,
                  lineStyle: ind.line_style || 'solid',
                  fillOpacity: ind.fill_opacity || 0.2,
                };
              }).filter(Boolean);
              setActiveIndicators(restoredIndicators);
            }

            // Restore patterns
            if (strategy.patterns && Array.isArray(strategy.patterns)) {
              setActivePatterns(strategy.patterns.map(pat => ({
                ...pat,
                instanceId: pat.instance_id || `${pat.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              })));
            }

            // Restore conditions
            if (strategy.conditions && Array.isArray(strategy.conditions)) {
              setConditions(strategy.conditions.map(c => ({
                id: c.id,
                section: c.section,
                leftOperand: c.left_operand,
                operator: c.operator,
                rightOperand: c.right_operand,
                indicatorInstanceId: c.indicator_instance_id,
                indicatorDisplayName: c.indicator_display_name,
                patternInstanceId: c.pattern_instance_id,
                isPatternCondition: c.is_pattern_condition,
              })));
            }

            // Restore groups
            if (strategy.groups && Array.isArray(strategy.groups)) {
              setGroups(strategy.groups.map(g => ({
                id: g.id,
                operator: g.operator,
                conditionIds: g.condition_ids || [],
                parentId: g.parent_id,
                section: g.section,
              })));
            }

            // Restore reference indicators
            if (strategy.reference_indicators && Array.isArray(strategy.reference_indicators)) {
              setReferenceIndicators(strategy.reference_indicators);
            }

            // Restore time filter
            if (strategy.time_filter) {
              setTimeFilter(strategy.time_filter);
            }

            // Restore drawings
            if (strategy.drawings) {
              setDrawings(deserializeDrawings(JSON.stringify(strategy.drawings)));
            }

            setHasLoadedFromUrl(true);
          } else {
            console.error('Failed to load strategy:', response.error);
            // Navigate back to library if strategy not found
            navigate('/strategies');
          }
        } catch (error) {
          console.error('Error loading strategy from URL:', error);
          navigate('/strategies');
        }
      }
    };

    loadStrategyFromUrl();
  }, [strategyIdFromUrl, hasLoadedFromUrl, options, navigate]);

  // Navigate back to library
  const handleBackToLibrary = useCallback(() => {
    // Could add unsaved changes check here
    navigate('/strategies');
  }, [navigate]);

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

  // Handle logic panel toggle (slide-out drawer)
  const handleLogicPanelToggle = useCallback(() => {
    setIsLogicPanelCollapsed(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem(LOGIC_PANEL_COLLAPSED_KEY, String(newValue));
      } catch (e) {
        console.warn('Failed to save logic panel state to localStorage:', e);
      }
      return newValue;
    });
  }, []);

  // Handle strategy name editing
  const handleStartEditingName = useCallback(() => {
    setEditingNameValue(currentStrategyName || 'Untitled Strategy');
    setIsEditingName(true);
  }, [currentStrategyName]);

  const handleFinishEditingName = useCallback(() => {
    const trimmedName = editingNameValue.trim();
    if (trimmedName && trimmedName !== currentStrategyName) {
      setCurrentStrategyName(trimmedName);
    }
    setIsEditingName(false);
  }, [editingNameValue, currentStrategyName]);

  const handleNameKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFinishEditingName();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
    }
  }, [handleFinishEditingName]);

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

  // =============================================================================
  // SAVE STRATEGY HANDLERS
  // =============================================================================

  // Collect all strategy state for saving
  const collectStrategyState = useCallback(() => {
    return {
      name: currentStrategyName,
      description: currentStrategyDescription,
      tags: currentStrategyTags,
      trade_direction: tradeDirection,
      confirm_on_candle_close: confirmOnCandleClose,
      pair: selectedPair,
      timeframe: selectedGran,
      candle_count: selectedCount,
      indicators: activeIndicators.map(ind => ({
        id: ind.id,
        instance_id: ind.instanceId,
        params: ind.params || ind.defaultParams,
        color: ind.color,
        line_width: ind.lineWidth,
        line_style: ind.lineStyle,
        fill_opacity: ind.fillOpacity,
      })),
      patterns: activePatterns.map(pat => ({
        id: pat.id,
        instance_id: pat.instanceId,
        name: pat.name,
        description: pat.description,
        type: pat.type,
        color: pat.color,
      })),
      conditions: conditions.map(c => ({
        id: c.id,
        section: c.section,
        left_operand: c.leftOperand,
        operator: c.operator,
        right_operand: c.rightOperand,
        indicator_instance_id: c.indicatorInstanceId,
        indicator_display_name: c.indicatorDisplayName,
        pattern_instance_id: c.patternInstanceId,
        is_pattern_condition: c.isPatternCondition,
      })),
      groups: groups.map(g => ({
        id: g.id,
        operator: g.operator,
        section: g.section,
        condition_ids: g.conditionIds,
        parent_group_id: g.parentGroupId,
      })),
      reference_indicators: referenceIndicators.map(ri => ({
        id: ri.id,
        timeframe: ri.timeframe,
        indicator_id: ri.indicatorId,
        params: ri.params,
      })),
      time_filter: timeFilter.enabled ? {
        enabled: timeFilter.enabled,
        start_hour: timeFilter.startHour,
        start_minute: timeFilter.startMinute,
        end_hour: timeFilter.endHour,
        end_minute: timeFilter.endMinute,
        days_of_week: timeFilter.days,
        timezone: timeFilter.timezone,
      } : null,
      drawings: serializeDrawings(drawings),
    };
  }, [
    currentStrategyName, currentStrategyDescription, currentStrategyTags,
    tradeDirection, confirmOnCandleClose, selectedPair, selectedGran, selectedCount,
    activeIndicators, activePatterns, conditions, groups, referenceIndicators,
    timeFilter, drawings
  ]);

  // Handle opening save dialog
  const handleOpenSaveDialog = useCallback(() => {
    setSaveDialogOpen(true);
  }, []);

  // Handle closing save dialog
  const handleCloseSaveDialog = useCallback(() => {
    setSaveDialogOpen(false);
  }, []);

  // Handle save strategy
  const handleSaveStrategy = useCallback(async (name, description, tags) => {
    setIsSaving(true);

    try {
      // Check if name already exists
      const checkResponse = await endPoints.checkStrategyName(name);

      if (checkResponse.exists && checkResponse.strategy_id !== existingStrategyId) {
        // Name exists and it's not the current strategy - show overwrite dialog
        setOverwriteDialog({
          isOpen: true,
          strategyName: name,
          strategyId: checkResponse.strategy_id,
        });
        setCurrentStrategyName(name);
        setCurrentStrategyDescription(description);
        setCurrentStrategyTags(tags);
        setIsSaving(false);
        return;
      }

      // Proceed with save
      await performSave(name, description, tags, existingStrategyId || checkResponse.strategy_id);

    } catch (error) {
      console.error('Failed to save strategy:', error);
      showError('Failed to save strategy. Please try again.');
      setIsSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingStrategyId, showError]);

  // Perform the actual save operation
  const performSave = useCallback(async (name, description, tags, strategyId = null) => {
    try {
      const strategyState = collectStrategyState();
      const strategy = {
        ...strategyState,
        id: strategyId,
        name,
        description,
        tags,
      };

      const response = await endPoints.saveStrategy(strategy);

      if (response.success) {
        setExistingStrategyId(response.strategy_id);
        setCurrentStrategyName(name);
        setCurrentStrategyDescription(description);
        setCurrentStrategyTags(tags);
        setSaveDialogOpen(false);
        setOverwriteDialog({ isOpen: false, strategyName: '', strategyId: null });

        // Clear draft after successful save
        clearDraft();

        // Update URL to edit route if this was a new strategy
        if (isNewStrategy && response.strategy_id) {
          navigate(`/strategies/${response.strategy_id}/edit`, { replace: true });
        }

        showSuccess(`Strategy '${name}' saved successfully`);
      } else {
        showError(response.error || 'Failed to save strategy');
      }
    } catch (error) {
      console.error('Failed to save strategy:', error);
      showError('Failed to save strategy. Please try again.');
    } finally {
      setIsSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectStrategyState, showSuccess, showError, isNewStrategy, navigate]);

  // Handle overwrite confirmation
  const handleOverwriteConfirm = useCallback(() => {
    setOverwriteDialog(prev => ({ ...prev, isOpen: false }));
    setIsSaving(true);
    performSave(
      overwriteDialog.strategyName,
      currentStrategyDescription,
      currentStrategyTags,
      overwriteDialog.strategyId
    );
  }, [overwriteDialog, currentStrategyDescription, currentStrategyTags, performSave]);

  // Handle overwrite cancel
  const handleOverwriteCancel = useCallback(() => {
    setOverwriteDialog({ isOpen: false, strategyName: '', strategyId: null });
  }, []);

  // =============================================================================
  // STRATEGY MANAGEMENT HANDLERS (Load, Duplicate, Delete, Export, Import)
  // =============================================================================

  // Fetch strategies list for load dialog
  const fetchStrategiesList = useCallback(async () => {
    setIsLoadingStrategies(true);
    try {
      const response = await endPoints.listStrategiesExtended();
      if (response.success) {
        setStrategiesList(response.strategies || []);
      } else {
        showError(response.error || 'Failed to load strategies');
      }
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
      showError('Failed to load strategies');
    } finally {
      setIsLoadingStrategies(false);
    }
  }, [showError]);

  // Open load dialog - may be used via menu/shortcuts in future
  // eslint-disable-next-line no-unused-vars
  const handleOpenLoadDialog = useCallback(() => {
    setLoadDialogOpen(true);
    fetchStrategiesList();
  }, [fetchStrategiesList]);

  // Close load dialog
  const handleCloseLoadDialog = useCallback(() => {
    setLoadDialogOpen(false);
  }, []);

  // Load a strategy from the list
  const handleLoadStrategy = useCallback(async (strategyListItem) => {
    try {
      const response = await endPoints.getStrategy(strategyListItem.id);
      if (response.success && response.strategy) {
        const strategy = response.strategy;

        // Update all state from loaded strategy
        setCurrentStrategyName(strategy.name || '');
        setCurrentStrategyDescription(strategy.description || '');
        setCurrentStrategyTags(strategy.tags || []);
        setExistingStrategyId(strategy.id);
        setTradeDirection(strategy.trade_direction || TRADE_DIRECTIONS.BOTH);
        setConfirmOnCandleClose(strategy.confirm_on_candle_close || CANDLE_CLOSE_CONFIRMATION_DEFAULT);

        if (strategy.pair) setSelectedPair(strategy.pair);
        if (strategy.timeframe) setSelectedGran(strategy.timeframe);
        if (strategy.candle_count) setSelectedCount(strategy.candle_count);

        // Restore indicators
        if (strategy.indicators && Array.isArray(strategy.indicators)) {
          const restoredIndicators = strategy.indicators.map(ind => {
            const indicatorDef = INDICATORS[ind.id];
            return {
              ...indicatorDef,
              instanceId: ind.instance_id || `${ind.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              params: ind.params || indicatorDef?.defaultParams,
              color: ind.color || indicatorDef?.defaultColor,
              lineWidth: ind.line_width || 2,
              lineStyle: ind.line_style || 'solid',
              fillOpacity: ind.fill_opacity || 0.2,
            };
          }).filter(Boolean);
          setActiveIndicators(restoredIndicators);
        }

        // Restore patterns
        if (strategy.patterns && Array.isArray(strategy.patterns)) {
          setActivePatterns(strategy.patterns.map(pat => ({
            ...pat,
            instanceId: pat.instance_id || `${pat.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          })));
        }

        // Restore conditions
        if (strategy.conditions && Array.isArray(strategy.conditions)) {
          setConditions(strategy.conditions.map(c => ({
            id: c.id,
            section: c.section,
            leftOperand: c.left_operand,
            operator: c.operator,
            rightOperand: c.right_operand,
            indicatorInstanceId: c.indicator_instance_id,
            indicatorDisplayName: c.indicator_display_name,
            patternInstanceId: c.pattern_instance_id,
            isPatternCondition: c.is_pattern_condition,
          })));
        }

        // Restore groups
        if (strategy.groups && Array.isArray(strategy.groups)) {
          setGroups(strategy.groups.map(g => ({
            id: g.id,
            operator: g.operator,
            conditionIds: g.condition_ids || [],
            parentId: g.parent_id,
            section: g.section,
          })));
        }

        // Restore reference indicators
        if (strategy.reference_indicators && Array.isArray(strategy.reference_indicators)) {
          setReferenceIndicators(strategy.reference_indicators);
        }

        // Restore time filter
        if (strategy.time_filter) {
          setTimeFilter(strategy.time_filter);
        }

        // Restore drawings
        if (strategy.drawings) {
          setDrawings(deserializeDrawings(JSON.stringify(strategy.drawings)));
        }

        setLoadDialogOpen(false);
        showSuccess(`Strategy '${strategy.name}' loaded successfully`);

        // Optionally trigger data load for the strategy's pair/timeframe
        if (strategy.pair && strategy.timeframe) {
          loadTechnicals();
        }
      } else {
        showError(response.error || 'Failed to load strategy');
      }
    } catch (error) {
      console.error('Failed to load strategy:', error);
      showError('Failed to load strategy');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSuccess, showError]);

  // Duplicate a strategy
  const handleDuplicateStrategy = useCallback(async (strategy) => {
    try {
      const response = await endPoints.duplicateStrategy(strategy.id);
      if (response.success) {
        showSuccess(`Strategy duplicated as '${response.strategy_name}'`);
        // Refresh the list if dialog is open
        if (loadDialogOpen) {
          fetchStrategiesList();
        }
      } else {
        showError(response.error || 'Failed to duplicate strategy');
      }
    } catch (error) {
      console.error('Failed to duplicate strategy:', error);
      showError('Failed to duplicate strategy');
    }
  }, [loadDialogOpen, fetchStrategiesList, showSuccess, showError]);

  // Duplicate the current loaded strategy - may be used via menu/shortcuts in future
  // eslint-disable-next-line no-unused-vars
  const handleDuplicateCurrentStrategy = useCallback(async () => {
    if (!existingStrategyId) {
      showError('No strategy is currently loaded');
      return;
    }
    try {
      const response = await endPoints.duplicateStrategy(existingStrategyId);
      if (response.success) {
        setExistingStrategyId(response.strategy_id);
        setCurrentStrategyName(response.strategy_name);
        // Navigate to the duplicated strategy's edit page
        navigate(`/strategies/${response.strategy_id}/edit`, { replace: true });
        showSuccess(`Strategy duplicated as '${response.strategy_name}'`);
      } else {
        showError(response.error || 'Failed to duplicate strategy');
      }
    } catch (error) {
      console.error('Failed to duplicate strategy:', error);
      showError('Failed to duplicate strategy');
    }
  }, [existingStrategyId, showSuccess, showError, navigate]);

  // Delete strategy - show confirmation
  const handleDeleteStrategyConfirm = useCallback((strategy) => {
    setDeleteConfirmDialog({
      isOpen: true,
      strategyName: strategy.name,
      strategyId: strategy.id,
    });
  }, []);

  // Perform delete with undo support
  const handleDeleteStrategy = useCallback(async () => {
    const { strategyId, strategyName } = deleteConfirmDialog;

    // Store for potential undo
    const strategyToDelete = strategiesList.find(s => s.id === strategyId);
    setPendingDeleteStrategy(strategyToDelete);

    // Optimistically remove from list
    setStrategiesList(prev => prev.filter(s => s.id !== strategyId));
    setDeleteConfirmDialog({ isOpen: false, strategyName: '', strategyId: null });

    // Show undo toast
    showToast('warning', `Strategy '${strategyName}' deleted. Click to undo.`, UNDO_TOAST_DURATION_MS);

    // Set timeout for actual deletion
    const timeout = setTimeout(async () => {
      try {
        await endPoints.deleteStrategy(strategyId);
        setPendingDeleteStrategy(null);

        // Clear from current if it was loaded
        if (existingStrategyId === strategyId) {
          setExistingStrategyId(null);
          setCurrentStrategyName('');
          setCurrentStrategyDescription('');
          setCurrentStrategyTags([]);
        }
      } catch (error) {
        console.error('Failed to delete strategy:', error);
        // Restore to list on error
        if (strategyToDelete) {
          setStrategiesList(prev => [...prev, strategyToDelete]);
        }
        showError('Failed to delete strategy');
      }
    }, UNDO_TOAST_DURATION_MS);

    setUndoDeleteTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteConfirmDialog, strategiesList, existingStrategyId, showToast, showError]);

  // Undo delete
  const handleUndoDelete = useCallback(() => {
    if (undoDeleteTimeout) {
      clearTimeout(undoDeleteTimeout);
      setUndoDeleteTimeout(null);
    }

    if (pendingDeleteStrategy) {
      setStrategiesList(prev => [...prev, pendingDeleteStrategy].sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      ));
      setPendingDeleteStrategy(null);
      hideToast();
      showSuccess('Delete cancelled');
    }
  }, [undoDeleteTimeout, pendingDeleteStrategy, hideToast, showSuccess]);

  // Cancel delete confirmation
  const handleCancelDeleteConfirm = useCallback(() => {
    setDeleteConfirmDialog({ isOpen: false, strategyName: '', strategyId: null });
  }, []);

  // Export a strategy
  const handleExportStrategy = useCallback(async (strategy) => {
    try {
      const response = await endPoints.exportStrategy(strategy.id);

      // Create and download file
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      const safeName = strategy.name.replace(/[^a-z0-9]/gi, '_');
      const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
      link.download = `strategy_${safeName}_${date}.json`;
      link.href = url;
      link.click();

      URL.revokeObjectURL(url);
      showSuccess(`Strategy '${strategy.name}' exported`);
    } catch (error) {
      console.error('Failed to export strategy:', error);
      showError('Failed to export strategy');
    }
  }, [showSuccess, showError]);

  // Export the current loaded strategy
  const handleExportCurrentStrategy = useCallback(async () => {
    if (!existingStrategyId) {
      showError('No strategy is currently loaded');
      return;
    }
    await handleExportStrategy({ id: existingStrategyId, name: currentStrategyName });
  }, [existingStrategyId, currentStrategyName, handleExportStrategy, showError]);

  // Open import dialog - may be used via menu/shortcuts in future
  // eslint-disable-next-line no-unused-vars
  const handleOpenImportDialog = useCallback(() => {
    setImportDialogOpen(true);
  }, []);

  // Close import dialog
  const handleCloseImportDialog = useCallback(() => {
    setImportDialogOpen(false);
    setIsValidatingImport(false);
    setIsImporting(false);
  }, []);

  // Validate import data
  const handleValidateImport = useCallback(async (data) => {
    setIsValidatingImport(true);
    try {
      const response = await endPoints.validateImport(data);
      return response;
    } catch (error) {
      console.error('Failed to validate import:', error);
      return {
        valid: false,
        errors: [error.message || 'Validation failed'],
        warnings: [],
        strategy_preview: null,
        name_conflict: false,
      };
    } finally {
      setIsValidatingImport(false);
    }
  }, []);

  // Perform import
  const handleImportStrategy = useCallback(async (data, options) => {
    setIsImporting(true);
    try {
      const response = await endPoints.saveImport(data, options);
      if (response.success) {
        showSuccess(`Strategy '${response.strategy_name}' imported successfully`);
        setImportDialogOpen(false);
        // Refresh strategies list if load dialog opens next
        fetchStrategiesList();
      } else {
        showError(response.error || 'Failed to import strategy');
      }
    } catch (error) {
      console.error('Failed to import strategy:', error);
      showError('Failed to import strategy');
    } finally {
      setIsImporting(false);
    }
  }, [fetchStrategiesList, showSuccess, showError]);

  // Check if current strategy has unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    // Simple check: if we have indicators, conditions, or drawings but no saved strategy
    if (!existingStrategyId && (activeIndicators.length > 0 || conditions.length > 0 || drawings.length > 0)) {
      return true;
    }
    // More comprehensive check would compare current state with saved state
    return false;
  }, [existingStrategyId, activeIndicators.length, conditions.length, drawings.length]);

  // =============================================================================
  // AUTO-SAVE DRAFT HANDLERS
  // =============================================================================

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    try {
      const strategyState = collectStrategyState();
      localStorage.setItem(STRATEGY_DRAFT_STORAGE_KEY, JSON.stringify(strategyState));
      localStorage.setItem(STRATEGY_DRAFT_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.warn('Failed to save draft to localStorage:', error);
    }
  }, [collectStrategyState]);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STRATEGY_DRAFT_STORAGE_KEY);
      localStorage.removeItem(STRATEGY_DRAFT_TIMESTAMP_KEY);
    } catch (error) {
      console.warn('Failed to clear draft from localStorage:', error);
    }
  }, []);

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const draftTimestamp = localStorage.getItem(STRATEGY_DRAFT_TIMESTAMP_KEY);
      const draft = localStorage.getItem(STRATEGY_DRAFT_STORAGE_KEY);

      if (draft && draftTimestamp) {
        const timestamp = parseInt(draftTimestamp, 10);
        const age = Date.now() - timestamp;

        // Only show recovery if draft is less than 24 hours old
        if (age < STRATEGY_DRAFT_EXPIRY_MS) {
          setDraftRecoveryDialog({
            isOpen: true,
            draftTimestamp: new Date(timestamp),
          });
        } else {
          // Draft is too old, clear it
          clearDraft();
        }
      }
    } catch (error) {
      console.warn('Failed to check for draft:', error);
    }
  }, [clearDraft]);

  // Set up auto-save interval
  useEffect(() => {
    // Start auto-save interval
    autoSaveIntervalRef.current = setInterval(() => {
      // Only save if there's meaningful data
      if (activeIndicators.length > 0 || conditions.length > 0 || drawings.length > 0) {
        saveDraft();
      }
    }, AUTO_SAVE_INTERVAL_MS);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [activeIndicators.length, conditions.length, drawings.length, saveDraft]);

  // Handle draft recovery
  const handleRecoverDraft = useCallback(() => {
    try {
      const draft = localStorage.getItem(STRATEGY_DRAFT_STORAGE_KEY);
      if (draft) {
        const parsedDraft = JSON.parse(draft);

        // Restore strategy state from draft
        if (parsedDraft.name) setCurrentStrategyName(parsedDraft.name);
        if (parsedDraft.description) setCurrentStrategyDescription(parsedDraft.description);
        if (parsedDraft.tags) setCurrentStrategyTags(parsedDraft.tags);
        if (parsedDraft.trade_direction) setTradeDirection(parsedDraft.trade_direction);
        if (parsedDraft.confirm_on_candle_close) setConfirmOnCandleClose(parsedDraft.confirm_on_candle_close);
        if (parsedDraft.pair) setSelectedPair(parsedDraft.pair);
        if (parsedDraft.timeframe) setSelectedGran(parsedDraft.timeframe);
        if (parsedDraft.candle_count) setSelectedCount(parsedDraft.candle_count);

        // Note: Complex state like indicators, conditions, drawings would need
        // additional deserialization logic - keeping simple for initial implementation
      }

      setDraftRecoveryDialog({ isOpen: false, draftTimestamp: null });
      clearDraft();
    } catch (error) {
      console.error('Failed to recover draft:', error);
      showError('Failed to recover draft');
      setDraftRecoveryDialog({ isOpen: false, draftTimestamp: null });
    }
  }, [clearDraft, showError]);

  // Handle discard draft
  const handleDiscardDraft = useCallback(() => {
    clearDraft();
    setDraftRecoveryDialog({ isOpen: false, draftTimestamp: null });
  }, [clearDraft]);

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

  // Auto-load chart data when pair and timeframe are selected
  useEffect(() => {
    if (!selectedPair || !selectedGran) return;

    // Check if we've already loaded this combination
    const currentKey = `${selectedPair}_${selectedGran}`;
    if (lastLoadedRef.current === currentKey) return;

    // Mark as loaded and trigger load
    lastLoadedRef.current = currentKey;
    loadTechnicals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPair, selectedGran]);

  // Loading state - Precision Swiss Design
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-neutral-50 py-8 animate-fade-in">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-neutral-200 animate-pulse" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-neutral-500 font-medium">Loading strategy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] animate-fade-in bg-neutral-50">
      {/* Page Header - Matching other pages */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Title and Description */}
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <button
                  type="button"
                  onClick={handleBackToLibrary}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                  title="Back to Strategies"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {isEditingName ? (
                  <input
                    type="text"
                    value={editingNameValue}
                    onChange={(e) => setEditingNameValue(e.target.value)}
                    onBlur={handleFinishEditingName}
                    onKeyDown={handleNameKeyDown}
                    className="text-2xl font-semibold text-neutral-900 bg-transparent border-b-2 border-primary outline-none"
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEditingName}
                    className="flex items-center gap-2 text-2xl font-semibold text-neutral-900 hover:text-primary transition-colors group"
                  >
                    {currentStrategyName || 'Untitled Strategy'}
                    <Edit2 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
                {hasUnsavedChanges && (
                  <span className="text-xs text-warning bg-warning-light px-2 py-0.5 rounded">Unsaved</span>
                )}
              </div>
              <p className="text-neutral-500 ml-8">Build and test your trading strategy</p>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <DropdownMenu
                align="right"
                trigger={
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    More
                  </button>
                }
              >
                <DropdownMenuItem icon={<FolderOpen className="h-4 w-4" />} onClick={handleOpenLoadDialog}>
                  Load Strategy
                </DropdownMenuItem>
                <DropdownMenuItem icon={<Upload className="h-4 w-4" />} onClick={handleOpenImportDialog}>
                  Import
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem icon={<Copy className="h-4 w-4" />} onClick={handleDuplicateCurrentStrategy} disabled={!existingStrategyId}>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem icon={<Download className="h-4 w-4" />} onClick={handleExportCurrentStrategy} disabled={!existingStrategyId}>
                  Export
                </DropdownMenuItem>
              </DropdownMenu>
              <button
                type="button"
                onClick={handleOpenSaveDialog}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-hover transition-colors"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Chart Controls Bar - Single Row */}
        <div className="flex items-center gap-2 p-3 bg-white border border-neutral-200 rounded-lg mb-6">
          {/* Pair Selector */}
          <PairSelector
            options={options.pairs}
            defaultValue={selectedPair}
            onSelected={(pair) => {
              setSelectedPair(pair);
              if (pair && selectedGran) {
                setTimeout(() => loadTechnicals(), 100);
              }
            }}
            hasLoadedData={!!(technicalsData || priceData)}
            className="w-28"
          />

          {/* Timeframe Buttons */}
          <div className="flex items-center bg-neutral-100 rounded-md p-0.5">
            {TIMEFRAME_BUTTONS.map((tf) => (
              <button
                key={tf.value}
                type="button"
                onClick={() => {
                  handleTimeframeChange(tf.value);
                  if (selectedPair) {
                    setTimeout(() => loadTechnicals(), 100);
                  }
                }}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded transition-colors",
                  selectedGran === tf.value
                    ? "bg-primary text-white"
                    : "text-neutral-500 hover:text-neutral-900"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-neutral-200" />

          {/* Indicators */}
          <button
            type="button"
            onClick={() => setIsIndicatorSearchOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Indicators</span>
            {activeIndicators.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-primary text-white rounded-full">
                {activeIndicators.length}
              </span>
            )}
          </button>

          {/* Drawing Tools Dropdown */}
          <DropdownMenu
            align="left"
            trigger={
              <button
                type="button"
                disabled={!priceData || loadingData}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-md transition-colors",
                  activeDrawingTool
                    ? "bg-primary text-white"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100",
                  (!priceData || loadingData) && "opacity-50 cursor-not-allowed"
                )}
              >
                <Edit2 className="h-4 w-4" />
                <span className="hidden sm:inline">Draw</span>
                {drawings.length > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 text-[10px] rounded-full",
                    activeDrawingTool ? "bg-white/20" : "bg-neutral-200"
                  )}>
                    {drawings.length}
                  </span>
                )}
              </button>
            }
          >
            <DropdownMenuItem
              icon={<span className="text-xs">—</span>}
              onClick={() => handleDrawingToolChange('horizontal')}
            >
              Horizontal Line
            </DropdownMenuItem>
            <DropdownMenuItem
              icon={<span className="text-xs">↗</span>}
              onClick={() => handleDrawingToolChange('trendline')}
            >
              Trendline
            </DropdownMenuItem>
            <DropdownMenuItem
              icon={<span className="text-xs">⊟</span>}
              onClick={() => handleDrawingToolChange('fibonacci')}
            >
              Fibonacci
            </DropdownMenuItem>
            {activeDrawingTool && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  icon={<X className="h-3 w-3" />}
                  onClick={() => handleDrawingToolChange(null)}
                >
                  Cancel Drawing
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenu>

          <div className="flex-1" />

          {/* Active Indicators - Compact */}
          {activeIndicators.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {activeIndicators.slice(0, 3).map((indicator) => (
                <span
                  key={indicator.instanceId}
                  className="px-2 py-0.5 text-xs bg-neutral-100 rounded border-l-2"
                  style={{ borderLeftColor: indicator.color }}
                >
                  {indicator.shortName}
                </span>
              ))}
              {activeIndicators.length > 3 && (
                <span className="text-xs text-neutral-400">+{activeIndicators.length - 3}</span>
              )}
            </div>
          )}

          <div className="h-5 w-px bg-neutral-200" />

          {/* Settings */}
          <StrategySettingsPopover
            tradeDirection={tradeDirection}
            onTradeDirectionChange={handleTradeDirectionChange}
            candleCloseConfirmation={confirmOnCandleClose}
            onCandleCloseChange={handleCandleCloseChange}
          />

          {/* Logic Toggle */}
          <button
            type="button"
            onClick={handleLogicPanelToggle}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors",
              !isLogicPanelCollapsed
                ? "bg-primary text-white"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            )}
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Logic</span>
            {conditions.length > 0 && (
              <span className={cn(
                "px-1.5 py-0.5 text-[10px] rounded-full",
                !isLogicPanelCollapsed ? "bg-white/20 text-white" : "bg-primary text-white"
              )}>
                {conditions.length}
              </span>
            )}
          </button>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="card p-4 border-l-4 border-l-error bg-error-light mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-error shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-error">Unable to Load Data</p>
                <p className="text-sm text-neutral-600 mt-1">{error}</p>
              </div>
              <button onClick={clearError} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {indicatorError && (
          <div className="card p-4 border-l-4 border-l-warning bg-warning-light mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
              <p className="text-sm text-neutral-900 flex-1">{indicatorError}</p>
              <button onClick={() => setIndicatorError(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {infoMessage && (
          <div className="card p-4 border-l-4 border-l-primary bg-primary-light mb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary shrink-0" />
              <p className="text-sm text-neutral-600 flex-1">{infoMessage}</p>
              <button onClick={clearInfoMessage} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Chart Area */}
        {(technicalsData || priceData) ? (
          <div className="space-y-6">
            {priceData && (
              <div className="card p-4">
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

            {technicalsData && (
              <div className="card p-4">
                <Technicals data={technicalsData} />
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <div className="p-5 rounded-full bg-neutral-100 mb-6">
                <BarChart3 className="h-10 w-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Ready to Analyze</h3>
              <p className="text-neutral-500 max-w-md mb-8">
                Select a currency pair and timeframe above to view technical analysis and price charts.
              </p>
              <div className="flex items-center gap-6 text-sm text-neutral-500">
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

      {/* Logic Panel - Slide-out Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-200",
          !isLogicPanelCollapsed ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className="absolute inset-0 bg-black/30"
          onClick={handleLogicPanelToggle}
        />
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-1/4 min-w-[280px] max-w-[400px] bg-white shadow-xl transition-transform duration-200",
            !isLogicPanelCollapsed ? "translate-x-0" : "translate-x-full"
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
            isCollapsed={false}
            onToggleCollapse={handleLogicPanelToggle}
          />
        </div>
      </div>

      {/* Indicator Search Popup */}
      <IndicatorSearchPopup
        isOpen={isIndicatorSearchOpen}
        onClose={() => setIsIndicatorSearchOpen(false)}
        onSelect={handleIndicatorDrop}
      />

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

      {/* Save Strategy Dialog */}
      <SaveStrategyDialog
        isOpen={saveDialogOpen}
        onClose={handleCloseSaveDialog}
        onSave={handleSaveStrategy}
        existingName={currentStrategyName}
        existingDescription={currentStrategyDescription}
        existingTags={currentStrategyTags}
        isSaving={isSaving}
      />

      {/* Overwrite Confirmation Dialog */}
      <ConfirmDialog
        isOpen={overwriteDialog.isOpen}
        onClose={handleOverwriteCancel}
        title="Strategy Already Exists"
        message={`A strategy with the name "${overwriteDialog.strategyName}" already exists. Do you want to overwrite it?`}
        actions={[
          {
            label: 'Overwrite',
            variant: 'danger',
            onClick: handleOverwriteConfirm,
          },
        ]}
        variant="warning"
      />

      {/* Draft Recovery Dialog */}
      <ConfirmDialog
        isOpen={draftRecoveryDialog.isOpen}
        onClose={handleDiscardDraft}
        title="Unsaved Draft Found"
        message={`An unsaved draft was found${draftRecoveryDialog.draftTimestamp ? ` from ${draftRecoveryDialog.draftTimestamp.toLocaleString()}` : ''}. Would you like to recover it?`}
        actions={[
          {
            label: 'Recover',
            variant: 'primary',
            onClick: handleRecoverDraft,
          },
        ]}
        variant="info"
      />

      {/* Load Strategy Dialog */}
      <LoadStrategyDialog
        isOpen={loadDialogOpen}
        onClose={handleCloseLoadDialog}
        onLoad={handleLoadStrategy}
        onDuplicate={handleDuplicateStrategy}
        onDelete={handleDeleteStrategyConfirm}
        onExport={handleExportStrategy}
        strategies={strategiesList}
        isLoading={isLoadingStrategies}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Import Strategy Dialog */}
      <ImportStrategyDialog
        isOpen={importDialogOpen}
        onClose={handleCloseImportDialog}
        onImport={handleImportStrategy}
        onValidate={handleValidateImport}
        isValidating={isValidatingImport}
        isImporting={isImporting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmDialog.isOpen}
        onClose={handleCancelDeleteConfirm}
        title="Delete Strategy"
        message={`Are you sure you want to delete "${deleteConfirmDialog.strategyName}"? This action can be undone within 30 seconds.`}
        actions={[
          {
            label: 'Delete',
            variant: 'danger',
            onClick: handleDeleteStrategy,
          },
        ]}
        variant="danger"
      />

      {/* Toast Notification */}
      <Toast
        type={toast?.type || 'info'}
        message={toast?.message || ''}
        isVisible={!!toast}
        onClose={pendingDeleteStrategy ? handleUndoDelete : hideToast}
        duration={toast?.duration}
      />
    </div>
  );
}

export default Strategy;
