import React from 'react';
import { cn } from '../lib/utils';

/**
 * Button Component - Precision Swiss Design System
 *
 * Follows the Swiss design system specifications:
 * - Primary: #2563EB background, white text, hover #1D4ED8
 * - Secondary: transparent with neutral-200 border, hover neutral-100 bg
 * - Danger: #DC2626 background, white text, hover #B91C1C
 * - Consistent 12px 24px padding, 6px radius, 500 weight, 14px font
 * - Active state with scale(0.98) transform
 */

const variants = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  danger: 'btn btn-danger',
  destructive: 'btn btn-danger', // Alias for compatibility
  success: 'btn btn-success',
  ghost: 'btn btn-ghost',
  outline: 'btn btn-secondary', // Alias for compatibility
};

const sizes = {
  default: '',
  sm: 'btn-sm',
  lg: 'btn-lg',
};

function Button({
  text,
  handleClick,
  variant = 'primary',
  size = 'default',
  disabled = false,
  className,
  children,
  icon: Icon,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        variants[variant] || variants.primary,
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {text || children}
    </button>
  );
}

export default Button;
