import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Card Component - Precision Swiss Design System
 *
 * @param {Object} props
 * @param {boolean} props.elevated - Use elevated style with shadow
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.children - Card content
 */
function Card({ elevated = false, className, children, ...props }) {
  return (
    <div
      className={cn(
        elevated ? 'card-elevated' : 'card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card Header
 */
function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('card-header', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Card Title
 */
function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('card-title', className)} {...props}>
      {children}
    </h3>
  );
}

/**
 * Card Description
 */
function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('card-description', className)} {...props}>
      {children}
    </p>
  );
}

/**
 * Card Content
 */
function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('card-content', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Card Footer
 */
function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('card-footer', className)} {...props}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
