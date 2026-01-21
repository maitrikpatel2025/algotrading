import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Badge Component - Precision Swiss Design System
 *
 * Status badges following the design system specifications.
 *
 * @param {Object} props
 * @param {'running' | 'stopped' | 'error' | 'warning' | 'info' | 'primary'} props.variant - Badge variant
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.children - Badge content
 */
function Badge({ variant = 'primary', className, children, ...props }) {
  const variantClasses = {
    running: 'badge-running',
    stopped: 'badge-stopped',
    error: 'badge-error',
    warning: 'badge-warning',
    info: 'badge-info',
    primary: 'badge-primary',
  };

  return (
    <span
      className={cn('badge', variantClasses[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
