import React, { useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { Settings2, X, Copy, GitBranch, FlipVertical, Sparkles } from 'lucide-react';
import { DRAWING_TOOLS, DRAWING_TOOL_LABELS } from '../app/drawingTypes';

/**
 * DrawingContextMenu Component
 *
 * A context menu for drawing-specific actions like Edit, Duplicate, Delete,
 * and drawing type-specific actions like Create Parallel (trendline) and
 * Use in Condition (horizontal line).
 *
 * @param {boolean} isOpen - Whether the menu is visible
 * @param {Object} position - Menu position { x, y }
 * @param {Object} drawing - The drawing object
 * @param {Function} onEdit - Callback when Edit is clicked
 * @param {Function} onDuplicate - Callback when Duplicate is clicked
 * @param {Function} onDelete - Callback when Delete is clicked
 * @param {Function} onUseInCondition - Callback when Use in Condition is clicked (horizontal line only)
 * @param {Function} onCreateParallel - Callback when Create Parallel is clicked (trendline only)
 * @param {Function} onFlip - Callback when Flip is clicked (fibonacci only)
 * @param {Function} onClose - Callback when menu should close
 * @param {boolean} isUsedInCondition - Whether this drawing is used in a condition
 */
function DrawingContextMenu({
  isOpen,
  position = { x: 0, y: 0 },
  drawing,
  onEdit,
  onDuplicate,
  onDelete,
  onUseInCondition,
  onCreateParallel,
  onFlip,
  onClose,
  isUsedInCondition = false,
}) {
  const menuRef = useRef(null);

  // Handle escape key and click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Calculate menu position to stay within viewport bounds
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      // Adjust horizontal position if menu goes off right edge
      if (adjustedX + rect.width > viewportWidth - 10) {
        adjustedX = viewportWidth - rect.width - 10;
      }

      // Adjust vertical position if menu goes off bottom edge
      if (adjustedY + rect.height > viewportHeight - 10) {
        adjustedY = viewportHeight - rect.height - 10;
      }

      // Ensure menu doesn't go off left or top edge
      adjustedX = Math.max(10, adjustedX);
      adjustedY = Math.max(10, adjustedY);

      menu.style.left = `${adjustedX}px`;
      menu.style.top = `${adjustedY}px`;
    }
  }, [isOpen, position]);

  if (!isOpen || !drawing) return null;

  const handleAction = (action) => {
    if (action) {
      action();
    }
    onClose();
  };

  // Build menu items based on drawing type
  const menuItems = [
    {
      label: 'Edit',
      icon: Settings2,
      onClick: () => handleAction(onEdit),
      className: 'hover:bg-muted',
      show: true,
    },
    {
      label: 'Duplicate',
      icon: Copy,
      onClick: () => handleAction(onDuplicate),
      className: 'hover:bg-muted',
      show: true,
    },
    // Horizontal line specific: Use in Condition
    {
      label: isUsedInCondition ? 'Used in Condition' : 'Use in Condition',
      icon: Sparkles,
      onClick: () => !isUsedInCondition && handleAction(onUseInCondition),
      className: isUsedInCondition
        ? 'text-success cursor-default'
        : 'hover:bg-muted',
      show: drawing.type === DRAWING_TOOLS.HORIZONTAL_LINE && onUseInCondition,
      disabled: isUsedInCondition,
    },
    // Trendline specific: Create Parallel
    {
      label: 'Create Parallel',
      icon: GitBranch,
      onClick: () => handleAction(onCreateParallel),
      className: 'hover:bg-muted',
      show: drawing.type === DRAWING_TOOLS.TRENDLINE && onCreateParallel,
    },
    // Fibonacci specific: Flip
    {
      label: 'Flip Direction',
      icon: FlipVertical,
      onClick: () => handleAction(onFlip),
      className: 'hover:bg-muted',
      show: drawing.type === DRAWING_TOOLS.FIBONACCI && onFlip,
    },
    // Separator
    { separator: true, show: true },
    // Delete (always last)
    {
      label: 'Delete',
      icon: X,
      onClick: () => handleAction(onDelete),
      className: 'hover:bg-destructive/10 text-destructive hover:text-destructive',
      show: true,
    },
  ].filter(item => item.show);

  // Get display name for the drawing
  const drawingName = drawing.label || DRAWING_TOOL_LABELS[drawing.type] || 'Drawing';

  return (
    <div
      ref={menuRef}
      className={cn(
        "fixed z-50 min-w-[180px]",
        "bg-card rounded-lg shadow-xl border border-border",
        "py-1 animate-fade-in"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      role="menu"
      aria-label={`${drawingName} context menu`}
    >
      {/* Menu Header */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: drawing.color }}
          />
          <p className="text-xs font-medium text-muted-foreground truncate">
            {drawingName}
          </p>
        </div>
        {isUsedInCondition && (
          <p className="text-[10px] text-success mt-1 flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" />
            Used in condition
          </p>
        )}
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {menuItems.map((item, index) => {
          if (item.separator) {
            return <div key={`sep-${index}`} className="my-1 border-t border-border" />;
          }

          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2",
                "text-sm font-medium text-foreground",
                "transition-colors",
                "focus:outline-none focus:bg-muted",
                item.className,
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
              role="menuitem"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DrawingContextMenu;
