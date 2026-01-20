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
