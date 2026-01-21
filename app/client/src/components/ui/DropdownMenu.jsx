import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { MoreHorizontal } from 'lucide-react';

/**
 * DropdownMenu Component - Precision Swiss Design System
 *
 * A simple dropdown menu component with click-outside-to-close and Escape key support.
 * Follows the Precision Swiss design language with neutral colors, subtle shadows, and clean typography.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.trigger - Custom trigger element (defaults to MoreHorizontal icon button)
 * @param {React.ReactNode} props.children - Dropdown menu content (use DropdownMenuItem components)
 * @param {string} props.align - Menu alignment: 'left' | 'right' (default: 'right')
 * @param {string} props.className - Additional classes for the container
 */
function DropdownMenu({ trigger, children, align = 'right', className }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {/* Trigger */}
      {trigger ? (
        <div onClick={handleToggle} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center justify-center p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
          aria-label="Open menu"
          aria-expanded={isOpen}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-1 z-50 min-w-[180px] py-1 bg-white border border-neutral-200 rounded-md shadow-md',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { onClose: handleClose });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
}

/**
 * DropdownMenuItem Component
 *
 * Individual menu item for the dropdown.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Optional icon element
 * @param {React.ReactNode} props.children - Menu item label
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Whether the item is disabled
 * @param {string} props.className - Additional classes
 * @param {Function} props.onClose - Internal: closes the menu (passed by parent)
 */
function DropdownMenuItem({ icon, children, onClick, disabled = false, className, onClose }) {
  const handleClick = useCallback(() => {
    if (disabled) return;
    if (onClick) onClick();
    if (onClose) onClose();
  }, [disabled, onClick, onClose]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors',
        disabled
          ? 'text-neutral-300 cursor-not-allowed'
          : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
        className
      )}
      role="menuitem"
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

/**
 * DropdownMenuSeparator Component
 *
 * Visual separator between menu items.
 */
function DropdownMenuSeparator() {
  return <div className="h-px my-1 bg-neutral-200" role="separator" />;
}

export { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator };
export default DropdownMenu;
