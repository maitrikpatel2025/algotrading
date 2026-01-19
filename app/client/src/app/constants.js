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
