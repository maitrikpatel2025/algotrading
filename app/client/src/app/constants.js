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
