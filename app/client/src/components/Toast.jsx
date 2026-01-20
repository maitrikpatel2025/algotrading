import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Toast Notification Component
 *
 * A dismissible notification that appears in the bottom-right corner.
 * Supports multiple types: success, error, warning, info.
 * Auto-dismisses after configurable duration.
 *
 * @param {string} type - Toast type: 'success' | 'error' | 'warning' | 'info'
 * @param {string} message - Toast message to display
 * @param {boolean} isVisible - Whether the toast is visible
 * @param {Function} onClose - Callback when toast is closed
 * @param {number} duration - Auto-dismiss duration in ms (default 5000, 0 to disable)
 */
function Toast({
  type = 'info',
  message,
  isVisible,
  onClose,
  duration = 5000,
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle auto-dismiss
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  // Handle enter animation
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  // Type-based styling
  const typeStyles = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
  };

  const styles = typeStyles[type] || typeStyles.info;
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "flex items-center gap-3",
        "px-4 py-3 rounded-lg shadow-lg",
        "border bg-card",
        styles.borderColor,
        isAnimating ? "animate-slide-in-right" : ""
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={cn("flex-shrink-0", styles.iconColor)}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Message */}
      <p className="text-sm text-foreground flex-1 pr-2">
        {message}
      </p>

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className={cn(
          "flex-shrink-0 p-1 rounded-md",
          "text-muted-foreground hover:text-foreground",
          "hover:bg-muted transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary/50"
        )}
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * ToastContainer Component
 *
 * A container for managing multiple toasts with stacking support.
 * Use this when you need to display multiple toasts simultaneously.
 *
 * @param {Array} toasts - Array of toast objects: { id, type, message }
 * @param {Function} onRemove - Callback to remove a toast by id
 */
export function ToastContainer({ toasts = [], onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ transform: `translateY(-${index * 4}px)` }}
        >
          <Toast
            type={toast.type}
            message={toast.message}
            isVisible={true}
            onClose={() => onRemove(toast.id)}
            duration={toast.duration}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * useToast Hook
 *
 * A custom hook for managing toast state.
 * Returns functions to show different types of toasts.
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (type, message, duration = 5000) => {
    setToast({ type, message, duration });
  };

  const hideToast = () => {
    setToast(null);
  };

  const success = (message, duration) => showToast('success', message, duration);
  const error = (message, duration) => showToast('error', message, duration);
  const warning = (message, duration) => showToast('warning', message, duration);
  const info = (message, duration) => showToast('info', message, duration);

  return {
    toast,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
  };
}

export default Toast;
