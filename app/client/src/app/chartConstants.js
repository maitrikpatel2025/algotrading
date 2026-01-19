/**
 * Chart styling constants
 */

// Preview mode styling
export const PREVIEW_LINE_DASH = 'dash';
export const PREVIEW_OPACITY = 0.6;
export const PREVIEW_LABEL_SUFFIX = ' (Preview)';

// Performance thresholds
export const PERFORMANCE_THRESHOLD_GOOD = 200; // ms - green indicator
export const PERFORMANCE_THRESHOLD_WARNING = 500; // ms - yellow indicator
export const PERFORMANCE_THRESHOLD_SLOW = 500; // ms - red indicator threshold

// Debounce delay for parameter changes
export const PREVIEW_DEBOUNCE_DELAY = 200; // ms

// Line styling options
export const LINE_WIDTH_OPTIONS = [1, 2, 3, 4];
export const LINE_STYLE_OPTIONS = {
  SOLID: 'solid',
  DASHED: 'dash',
  DOTTED: 'dot'
};
export const LINE_STYLE_LABELS = {
  solid: 'Solid',
  dash: 'Dashed',
  dot: 'Dotted'
};

// Default styling values
export const DEFAULT_LINE_WIDTH = 1.5;
export const DEFAULT_LINE_STYLE = 'solid';
export const DEFAULT_FILL_OPACITY = 0.2;
