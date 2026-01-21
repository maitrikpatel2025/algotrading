import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Input Component - Precision Swiss Design System
 *
 * Form input following the design system specifications.
 * Height: 44px, 16px horizontal padding, 6px radius
 * Focus: Blue border with 3px blue/10 ring
 *
 * @param {Object} props
 * @param {boolean} props.error - Show error state
 * @param {string} props.className - Additional classes
 */
const Input = React.forwardRef(({ error, className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'input',
        error && 'input-error',
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
