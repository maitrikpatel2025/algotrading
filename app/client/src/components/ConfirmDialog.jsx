import React, { useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmDialog Component - Precision Swiss Design System
 *
 * Clean modal dialog with white background.
 * No gradients, simple border styling.
 * Supports multiple action buttons for different confirmation options.
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
      firstButtonRef.current?.focus();

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

  // Variant-based styling - Precision Swiss Design
  const variantStyles = {
    warning: {
      icon: 'text-warning',
      iconBg: 'bg-warning-light',
    },
    danger: {
      icon: 'text-danger',
      iconBg: 'bg-danger-light',
    },
    info: {
      icon: 'text-primary',
      iconBg: 'bg-primary-light',
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
        className="absolute inset-0 bg-neutral-900/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative bg-white rounded-md shadow-elevated max-w-md w-full border border-neutral-200 animate-fade-in"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
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
                className="text-lg font-semibold text-neutral-900"
              >
                {title}
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
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
              className="btn btn-secondary"
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
                  "btn",
                  action.variant === 'danger' && "btn-danger",
                  action.variant === 'primary' && "btn-primary",
                  action.variant === 'secondary' && "btn-secondary",
                  !action.variant && "btn-primary"
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
