import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import { X, RotateCcw } from 'lucide-react';
import {
  DRAWING_TOOLS,
  DRAWING_TOOL_LABELS,
  DRAWING_LINE_STYLES,
  DRAWING_LINE_STYLE_LABELS,
  DRAWING_LINE_WIDTH_MIN,
  DRAWING_LINE_WIDTH_MAX,
  DRAWING_DEFAULT_LINE_WIDTH,
  DRAWING_DEFAULT_LINE_STYLE,
  DRAWING_DEFAULT_COLORS,
  FIBONACCI_DEFAULT_LEVELS,
  FIBONACCI_EXTENSION_LEVELS,
} from '../app/drawingTypes';

// Predefined color palette for drawings (from UI style guide)
const DRAWING_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'White', value: '#FFFFFF' },
];

/**
 * DrawingPropertiesDialog Component
 *
 * A modal dialog for editing drawing properties including color, line style,
 * line thickness, and type-specific properties.
 *
 * @param {boolean} isOpen - Whether the dialog is visible
 * @param {Function} onClose - Callback when dialog is closed/cancelled
 * @param {Function} onConfirm - Callback when settings are confirmed
 * @param {Object} drawing - The drawing object being edited
 */
function DrawingPropertiesDialog({
  isOpen,
  onClose,
  onConfirm,
  drawing,
}) {
  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);

  // Local state for editing
  const [color, setColor] = useState(DRAWING_DEFAULT_COLORS[DRAWING_TOOLS.HORIZONTAL_LINE]);
  const [lineWidth, setLineWidth] = useState(DRAWING_DEFAULT_LINE_WIDTH);
  const [lineStyle, setLineStyle] = useState(DRAWING_DEFAULT_LINE_STYLE);
  const [label, setLabel] = useState('');
  const [price, setPrice] = useState('');
  const [extendLeft, setExtendLeft] = useState(false);
  const [extendRight, setExtendRight] = useState(false);
  const [showPrices, setShowPrices] = useState(true);
  const [showPercentages, setShowPercentages] = useState(true);
  const [levels, setLevels] = useState([]);
  const [extensionLevels, setExtensionLevels] = useState([]);

  // Initialize state from drawing when dialog opens
  useEffect(() => {
    if (isOpen && drawing) {
      setColor(drawing.color || DRAWING_DEFAULT_COLORS[drawing.type] || DRAWING_DEFAULT_COLORS[DRAWING_TOOLS.HORIZONTAL_LINE]);
      setLineWidth(drawing.lineWidth ?? DRAWING_DEFAULT_LINE_WIDTH);
      setLineStyle(drawing.lineStyle || DRAWING_DEFAULT_LINE_STYLE);
      setLabel(drawing.label || '');

      if (drawing.type === DRAWING_TOOLS.HORIZONTAL_LINE) {
        setPrice(drawing.price?.toFixed(5) || '');
      }

      if (drawing.type === DRAWING_TOOLS.TRENDLINE) {
        setExtendLeft(drawing.extendLeft || false);
        setExtendRight(drawing.extendRight || false);
      }

      if (drawing.type === DRAWING_TOOLS.FIBONACCI) {
        setShowPrices(drawing.showPrices !== false);
        setShowPercentages(drawing.showPercentages !== false);
        setLevels(drawing.levels || FIBONACCI_DEFAULT_LEVELS.map(l => ({ ...l })));
        setExtensionLevels(drawing.extensionLevels || FIBONACCI_EXTENSION_LEVELS.map(l => ({ ...l })));
      }
    }
  }, [isOpen, drawing]);

  // Handle escape key and click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    // Focus first input
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    // Build updated drawing properties
    const updates = {
      color,
      lineWidth,
      lineStyle,
      label: label.trim(),
    };

    if (drawing.type === DRAWING_TOOLS.HORIZONTAL_LINE) {
      const parsedPrice = parseFloat(price);
      if (!isNaN(parsedPrice)) {
        updates.price = parsedPrice;
      }
    }

    if (drawing.type === DRAWING_TOOLS.TRENDLINE) {
      updates.extendLeft = extendLeft;
      updates.extendRight = extendRight;
    }

    if (drawing.type === DRAWING_TOOLS.FIBONACCI) {
      updates.showPrices = showPrices;
      updates.showPercentages = showPercentages;
      updates.levels = levels;
      updates.extensionLevels = extensionLevels;
    }

    onConfirm(updates);
  }, [drawing, color, lineWidth, lineStyle, label, price, extendLeft, extendRight, showPrices, showPercentages, levels, extensionLevels, onConfirm]);

  const handleReset = useCallback(() => {
    if (!drawing) return;

    setColor(DRAWING_DEFAULT_COLORS[drawing.type] || DRAWING_DEFAULT_COLORS[DRAWING_TOOLS.HORIZONTAL_LINE]);
    setLineWidth(DRAWING_DEFAULT_LINE_WIDTH);
    setLineStyle(DRAWING_DEFAULT_LINE_STYLE);
    setLabel('');

    if (drawing.type === DRAWING_TOOLS.FIBONACCI) {
      setShowPrices(true);
      setShowPercentages(true);
      setLevels(FIBONACCI_DEFAULT_LEVELS.map(l => ({ ...l })));
      setExtensionLevels(FIBONACCI_EXTENSION_LEVELS.map(l => ({ ...l })));
    }

    if (drawing.type === DRAWING_TOOLS.TRENDLINE) {
      setExtendLeft(false);
      setExtendRight(false);
    }
  }, [drawing]);

  const handleLevelToggle = useCallback((levelValue, isExtension = false) => {
    if (isExtension) {
      setExtensionLevels(prev => prev.map(l =>
        l.value === levelValue ? { ...l, enabled: !l.enabled } : l
      ));
    } else {
      setLevels(prev => prev.map(l =>
        l.value === levelValue ? { ...l, enabled: !l.enabled } : l
      ));
    }
  }, []);

  if (!isOpen || !drawing) return null;

  const dialogTitle = `Edit ${DRAWING_TOOL_LABELS[drawing.type] || 'Drawing'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={cn(
          "relative w-full max-w-md mx-4",
          "bg-card rounded-xl shadow-2xl border border-border",
          "animate-scale-in"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawing-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="drawing-dialog-title" className="text-lg font-semibold text-foreground">
            {dialogTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Common Properties Section */}
            <div className="space-y-4">
              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {DRAWING_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={cn(
                        "w-7 h-7 rounded-md border-2 transition-all",
                        color === c.value
                          ? "border-primary ring-2 ring-primary/30 scale-110"
                          : "border-transparent hover:border-muted-foreground/50"
                      )}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                      aria-label={`Select ${c.name} color`}
                    />
                  ))}
                </div>
              </div>

              {/* Line Style */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Line Style
                </label>
                <select
                  value={lineStyle}
                  onChange={(e) => setLineStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.values(DRAWING_LINE_STYLES).map((style) => (
                    <option key={style} value={style}>
                      {DRAWING_LINE_STYLE_LABELS[style]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Width */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Line Thickness: {lineWidth}px
                </label>
                <input
                  type="range"
                  min={DRAWING_LINE_WIDTH_MIN}
                  max={DRAWING_LINE_WIDTH_MAX}
                  value={lineWidth}
                  onChange={(e) => setLineWidth(parseInt(e.target.value, 10))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{DRAWING_LINE_WIDTH_MIN}px</span>
                  <span>{DRAWING_LINE_WIDTH_MAX}px</span>
                </div>
              </div>

              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Label (Optional)
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Custom label..."
                  maxLength={30}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Horizontal Line Specific */}
            {drawing.type === DRAWING_TOOLS.HORIZONTAL_LINE && (
              <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price Level
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {/* Trendline Specific */}
            {drawing.type === DRAWING_TOOLS.TRENDLINE && (
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={extendLeft}
                      onChange={(e) => setExtendLeft(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">Extend Left</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={extendRight}
                      onChange={(e) => setExtendRight(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">Extend Right</span>
                  </label>
                </div>
              </div>
            )}

            {/* Fibonacci Specific */}
            {drawing.type === DRAWING_TOOLS.FIBONACCI && (
              <div className="pt-4 border-t border-border space-y-4">
                {/* Display options */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPrices}
                      onChange={(e) => setShowPrices(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">Show Prices</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPercentages}
                      onChange={(e) => setShowPercentages(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">Show Percentages</span>
                  </label>
                </div>

                {/* Retracement Levels */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Retracement Levels
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {levels.map((level) => (
                      <label
                        key={level.value}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors",
                          level.enabled
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-muted text-muted-foreground border border-transparent hover:border-border"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={level.enabled}
                          onChange={() => handleLevelToggle(level.value, false)}
                          className="sr-only"
                        />
                        {level.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Extension Levels */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Extension Levels
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {extensionLevels.map((level) => (
                      <label
                        key={level.value}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors",
                          level.enabled
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            : "bg-muted text-muted-foreground border border-transparent hover:border-border"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={level.enabled}
                          onChange={() => handleLevelToggle(level.value, true)}
                          className="sr-only"
                        />
                        {level.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DrawingPropertiesDialog;
