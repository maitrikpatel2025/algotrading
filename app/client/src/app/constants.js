// Trade Direction Constants
export const TRADE_DIRECTIONS = {
  LONG: 'long',
  SHORT: 'short',
  BOTH: 'both',
};

export const TRADE_DIRECTION_LABELS = {
  [TRADE_DIRECTIONS.LONG]: 'Long Only',
  [TRADE_DIRECTIONS.SHORT]: 'Short Only',
  [TRADE_DIRECTIONS.BOTH]: 'Both',
};

export const TRADE_DIRECTION_ICONS = {
  [TRADE_DIRECTIONS.LONG]: '↑',
  [TRADE_DIRECTIONS.SHORT]: '↓',
  [TRADE_DIRECTIONS.BOTH]: '↕',
};

export const TRADE_DIRECTION_STORAGE_KEY = 'forex_dash_trade_direction';

// Condition Section Types (V2 - Four Sections)
export const CONDITION_SECTIONS_V2 = {
  LONG_ENTRY: 'long_entry',
  LONG_EXIT: 'long_exit',
  SHORT_ENTRY: 'short_entry',
  SHORT_EXIT: 'short_exit',
};

// Section Labels for display
export const CONDITION_SECTION_LABELS = {
  [CONDITION_SECTIONS_V2.LONG_ENTRY]: 'Long Entry Conditions',
  [CONDITION_SECTIONS_V2.LONG_EXIT]: 'Long Exit Conditions',
  [CONDITION_SECTIONS_V2.SHORT_ENTRY]: 'Short Entry Conditions',
  [CONDITION_SECTIONS_V2.SHORT_EXIT]: 'Short Exit Conditions',
};

// Section Colors for visual distinction
export const CONDITION_SECTION_COLORS = {
  [CONDITION_SECTIONS_V2.LONG_ENTRY]: 'success',  // Green
  [CONDITION_SECTIONS_V2.LONG_EXIT]: 'success',   // Green
  [CONDITION_SECTIONS_V2.SHORT_ENTRY]: 'destructive', // Red
  [CONDITION_SECTIONS_V2.SHORT_EXIT]: 'destructive',  // Red
};

// Section Types (entry vs exit)
export const CONDITION_SECTION_TYPES = {
  [CONDITION_SECTIONS_V2.LONG_ENTRY]: 'entry',
  [CONDITION_SECTIONS_V2.LONG_EXIT]: 'exit',
  [CONDITION_SECTIONS_V2.SHORT_ENTRY]: 'entry',
  [CONDITION_SECTIONS_V2.SHORT_EXIT]: 'exit',
};

// localStorage key for panel width
export const LOGIC_PANEL_WIDTH_KEY = 'forex_dash_logic_panel_width';

// Panel width constraints
export const LOGIC_PANEL_MIN_WIDTH = 200;
export const LOGIC_PANEL_MAX_WIDTH = 480;
export const LOGIC_PANEL_DEFAULT_WIDTH = 288; // w-72 = 18rem = 288px

// Candle Close Confirmation Constants
export const CANDLE_CLOSE_CONFIRMATION = {
  YES: 'yes',
  NO: 'no',
};

export const CANDLE_CLOSE_CONFIRMATION_LABELS = {
  [CANDLE_CLOSE_CONFIRMATION.YES]: 'Yes - Wait for close',
  [CANDLE_CLOSE_CONFIRMATION.NO]: 'No - Real-time',
};

export const CANDLE_CLOSE_CONFIRMATION_STORAGE_KEY = 'forex_dash_candle_close_confirmation';
export const CANDLE_CLOSE_CONFIRMATION_DEFAULT = CANDLE_CLOSE_CONFIRMATION.YES;
export const CANDLE_CLOSE_CONFIRMATION_TOOLTIP = 'Waiting for candle close reduces false signals but may delay entries';

// Group Operator Constants for AND/OR Logic
export const GROUP_OPERATORS = {
  AND: 'and',
  OR: 'or',
};

export const GROUP_OPERATOR_LABELS = {
  [GROUP_OPERATORS.AND]: 'AND',
  [GROUP_OPERATORS.OR]: 'OR',
};

// Maximum nesting depth for condition groups
export const MAX_NESTING_DEPTH = 3;

// Logic view mode constants
export const LOGIC_VIEW_MODES = {
  INLINE: 'inline',
  TREE: 'tree',
};

// localStorage key for logic view mode
export const LOGIC_VIEW_MODE_STORAGE_KEY = 'forex_dash_logic_view_mode';

// localStorage key for condition groups
export const CONDITION_GROUPS_STORAGE_KEY = 'forex_dash_condition_groups';

// Multi-Timeframe Conditions Constants

// Available timeframes for reference indicators
export const AVAILABLE_TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D', 'W1'];

// Timeframe display labels
export const TIMEFRAME_LABELS = {
  M1: '1 Minute',
  M5: '5 Minutes',
  M15: '15 Minutes',
  M30: '30 Minutes',
  H1: '1 Hour',
  H4: '4 Hours',
  D: 'Daily',
  W1: 'Weekly',
};

// Maximum number of different reference timeframes allowed per strategy
export const MAX_REFERENCE_TIMEFRAMES = 3;

// localStorage key for reference indicators persistence
export const REFERENCE_INDICATORS_STORAGE_KEY = 'forex_dash_reference_indicators';

// Performance warning message for multi-timeframe conditions
export const MULTI_TIMEFRAME_WARNING_TEXT = 'Multi-timeframe conditions may increase backtest time';

// =============================================================================
// TIME FILTER CONSTANTS - Session-based trading time restrictions
// =============================================================================

// Time filter mode (include = trade only during these times, exclude = blackout these times)
export const TIME_FILTER_MODES = {
  INCLUDE: 'include',
  EXCLUDE: 'exclude',
};

export const TIME_FILTER_MODE_LABELS = {
  [TIME_FILTER_MODES.INCLUDE]: 'Include (Trade Only During)',
  [TIME_FILTER_MODES.EXCLUDE]: 'Exclude (Blackout Period)',
};

// Trading session definitions with UTC times
// Note: Sessions that cross midnight have end time > 24 (e.g., 06:00 next day = 30:00)
export const TRADING_SESSIONS = {
  SYDNEY: {
    id: 'sydney',
    name: 'Sydney',
    startHour: 21, // 21:00 UTC
    endHour: 30, // 06:00 UTC next day (21:00 to 06:00)
    color: '#10B981', // emerald
  },
  TOKYO: {
    id: 'tokyo',
    name: 'Tokyo',
    startHour: 23, // 23:00 UTC (previous day)
    endHour: 32, // 08:00 UTC (23:00 to 08:00)
    color: '#F59E0B', // amber
  },
  LONDON: {
    id: 'london',
    name: 'London',
    startHour: 7, // 07:00 UTC
    endHour: 16, // 16:00 UTC
    color: '#3B82F6', // blue
  },
  NEW_YORK: {
    id: 'new_york',
    name: 'New York',
    startHour: 12, // 12:00 UTC
    endHour: 21, // 21:00 UTC
    color: '#8B5CF6', // violet
  },
};

// Session overlaps (high liquidity periods)
export const SESSION_OVERLAPS = {
  TOKYO_LONDON: {
    id: 'tokyo_london',
    name: 'Tokyo/London',
    startHour: 7,
    endHour: 8,
    description: 'Tokyo/London overlap - moderate liquidity',
  },
  LONDON_NEW_YORK: {
    id: 'london_new_york',
    name: 'London/New York',
    startHour: 12,
    endHour: 16,
    description: 'London/New York overlap - highest forex liquidity',
  },
};

// Timezone options
export const TIMEZONES = {
  UTC: {
    id: 'UTC',
    label: 'UTC',
    offset: 0,
    description: 'Coordinated Universal Time',
  },
  GMT: {
    id: 'GMT',
    label: 'GMT',
    offset: 0,
    description: 'Greenwich Mean Time (same as UTC)',
  },
  EST: {
    id: 'EST',
    label: 'EST',
    offset: -5,
    description: 'Eastern Standard Time (UTC-5)',
  },
  LOCAL: {
    id: 'LOCAL',
    label: 'Local',
    offset: null, // Calculated from browser
    description: 'Your local timezone',
  },
};

// Days of the week
export const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Monday', short: 'Mon', dayIndex: 1 },
  { id: 'tuesday', label: 'Tuesday', short: 'Tue', dayIndex: 2 },
  { id: 'wednesday', label: 'Wednesday', short: 'Wed', dayIndex: 3 },
  { id: 'thursday', label: 'Thursday', short: 'Thu', dayIndex: 4 },
  { id: 'friday', label: 'Friday', short: 'Fri', dayIndex: 5 },
  { id: 'saturday', label: 'Saturday', short: 'Sat', dayIndex: 6 },
  { id: 'sunday', label: 'Sunday', short: 'Sun', dayIndex: 0 },
];

// Default days (weekdays only)
export const DEFAULT_TRADING_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

// localStorage key for time filter persistence
export const TIME_FILTER_STORAGE_KEY = 'forex_dash_time_filter';

// Default time filter state (disabled)
export const DEFAULT_TIME_FILTER = {
  enabled: false,
  mode: TIME_FILTER_MODES.INCLUDE,
  sessions: [],
  customWindows: [],
  days: [...DEFAULT_TRADING_DAYS],
  timezone: 'UTC',
};

// =============================================================================
// DRAWING TOOL CONSTANTS - Chart annotation drawing tools
// =============================================================================

// localStorage key for drawings persistence
export const DRAWINGS_STORAGE_KEY = 'forex_dash_drawings';

// =============================================================================
// STRATEGY PERSISTENCE CONSTANTS - Save/load strategy functionality
// =============================================================================

// localStorage keys for strategy drafts (auto-save)
export const STRATEGY_DRAFT_STORAGE_KEY = 'forex_dash_strategy_draft';
export const STRATEGY_DRAFT_TIMESTAMP_KEY = 'forex_dash_strategy_draft_timestamp';

// Auto-save interval in milliseconds (60 seconds)
export const AUTO_SAVE_INTERVAL_MS = 60000;

// Strategy name and description limits
export const STRATEGY_NAME_MAX_LENGTH = 50;
export const STRATEGY_DESCRIPTION_MAX_LENGTH = 500;

// Draft expiry time in milliseconds (24 hours)
export const STRATEGY_DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000;

// =============================================================================
// STRATEGY MANAGEMENT CONSTANTS - Load/Duplicate/Delete/Export/Import
// =============================================================================

// Export schema version
export const EXPORT_SCHEMA_VERSION = "1.0";

// Fields to exclude from export (security sensitive)
export const STRATEGY_EXPORT_EXCLUDED_FIELDS = [
  'api_keys',
  'account_info',
  'credentials',
  'secrets',
  'internal_id',
];

// Undo toast duration for delete operations (30 seconds)
export const UNDO_TOAST_DURATION_MS = 30000;

// Strategy file extension
export const STRATEGY_FILE_EXTENSION = '.json';

// MIME type for strategy files
export const STRATEGY_FILE_MIME_TYPE = 'application/json';
