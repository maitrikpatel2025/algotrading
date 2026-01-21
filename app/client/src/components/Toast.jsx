import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Toast Notification Component - Precision Swiss Design System
 *
 * Clean white background with colored left border.
 * No gradients, simple typography.
 * Auto-dismisses after configurable duration.
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

  // Type-based styling - Precision Swiss Design
  const typeStyles = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-success',
      borderColor: 'border-l-success',
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-danger',
      borderColor: 'border-l-danger',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-warning',
      borderColor: 'border-l-warning',
    },
    info: {
      icon: Info,
      iconColor: 'text-primary',
      borderColor: 'border-l-primary',
    },
  };

  const styles = typeStyles[type] || typeStyles.info;
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "flex items-center gap-3",
        "px-4 py-3 rounded-md shadow-elevated",
        "bg-white border border-neutral-200 border-l-4",
        styles.borderColor,
        isAnimating ? "animate-slide-in" : ""
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={cn("flex-shrink-0", styles.iconColor)}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Message */}
      <p className="text-sm text-neutral-900 flex-1 pr-2">
        {message}
      </p>

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
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
