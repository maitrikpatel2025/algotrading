import React, { useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { Settings2, X, Copy } from 'lucide-react';

/**
 * IndicatorContextMenu Component
 *
 * A context menu for quick indicator actions like Configure, Remove, Duplicate.
 * Displays near the click point and positions itself to stay within viewport bounds.
 *
 * @param {boolean} isOpen - Whether the menu is visible
 * @param {Object} position - Menu position { x, y }
 * @param {string} indicatorName - Display name of the indicator
 * @param {Function} onConfigure - Callback when Configure is clicked
 * @param {Function} onRemove - Callback when Remove is clicked
 * @param {Function} onDuplicate - Callback when Duplicate is clicked
 * @param {Function} onClose - Callback when menu should close
 */
function IndicatorContextMenu({
  isOpen,
  position = { x: 0, y: 0 },
  indicatorName,
  onConfigure,
  onRemove,
  onDuplicate,
  onClose,
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

  if (!isOpen) return null;

  const handleAction = (action) => {
    action();
    onClose();
  };

  const menuItems = [
    {
      label: 'Configure',
      icon: Settings2,
      onClick: () => handleAction(onConfigure),
      className: 'hover:bg-muted',
    },
    {
      label: 'Duplicate',
      icon: Copy,
      onClick: () => handleAction(onDuplicate),
      className: 'hover:bg-muted',
    },
    {
      label: 'Remove',
      icon: X,
      onClick: () => handleAction(onRemove),
      className: 'hover:bg-destructive/10 text-destructive hover:text-destructive',
    },
  ];

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
      aria-label={`${indicatorName} context menu`}
    >
      {/* Menu Header */}
      <div className="px-3 py-2 border-b border-border">
        <p className="text-xs font-medium text-muted-foreground truncate">
          {indicatorName}
        </p>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2",
              "text-sm font-medium text-foreground",
              "transition-colors",
              "focus:outline-none focus:bg-muted",
              item.className
            )}
            role="menuitem"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default IndicatorContextMenu;
