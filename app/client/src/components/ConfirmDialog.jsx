import React, { useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmDialog Component
 *
 * A modal dialog for confirming destructive actions like deletion.
 * Supports multiple action buttons for different confirmation options.
 *
 * @param {boolean} isOpen - Whether the dialog is visible
 * @param {Function} onClose - Callback when dialog is closed
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message/description
 * @param {Array} actions - Array of action objects: { label, onClick, variant }
 * @param {string} variant - Dialog variant: 'warning' | 'danger' | 'info'
 */
function ConfirmDialog({
  isOpen,
  onClose,
  title,
  message,
  actions = [],
  variant = 'warning',
}) {
  const dialogRef = useRef(null);
  const firstButtonRef = useRef(null);

  // Focus management and escape key handler
  useEffect(() => {
    if (isOpen) {
      // Focus first button when dialog opens
      firstButtonRef.current?.focus();

      // Handle escape key
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Variant-based styling
  const variantStyles = {
    warning: {
      icon: 'text-amber-500',
      iconBg: 'bg-amber-500/10',
    },
    danger: {
      icon: 'text-destructive',
      iconBg: 'bg-destructive/10',
    },
    info: {
      icon: 'text-info',
      iconBg: 'bg-info/10',
    },
  };

  const styles = variantStyles[variant] || variantStyles.warning;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={cn(
          "relative bg-card rounded-lg shadow-xl max-w-md w-full",
          "border border-border",
          "animate-fade-in"
        )}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute top-3 right-3 p-1.5 rounded-md",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-muted transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary/50"
          )}
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-start gap-4">
            <div className={cn("p-2 rounded-full", styles.iconBg)}>
              <AlertTriangle className={cn("h-5 w-5", styles.icon)} />
            </div>
            <div className="flex-1">
              <h2
                id="confirm-dialog-title"
                className="text-lg font-semibold text-foreground"
              >
                {title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            {/* Cancel button */}
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md",
                "bg-muted text-foreground",
                "hover:bg-muted/80 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/50"
              )}
            >
              Cancel
            </button>

            {/* Action buttons */}
            {actions.map((action, index) => (
              <button
                key={action.label}
                ref={index === 0 ? firstButtonRef : null}
                type="button"
                onClick={action.onClick}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  action.variant === 'danger' && [
                    "bg-destructive text-destructive-foreground",
                    "hover:bg-destructive/90",
                    "focus:ring-destructive/50"
                  ],
                  action.variant === 'primary' && [
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90",
                    "focus:ring-primary/50"
                  ],
                  action.variant === 'secondary' && [
                    "bg-secondary text-secondary-foreground",
                    "hover:bg-secondary/80",
                    "focus:ring-secondary/50"
                  ],
                  !action.variant && [
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90",
                    "focus:ring-primary/50"
                  ]
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
