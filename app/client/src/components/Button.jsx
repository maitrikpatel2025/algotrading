import React from 'react';
import { cn } from '../lib/utils';

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  destructive: "btn-destructive",
  success: "btn-success",
  outline: "btn-outline",
  ghost: "btn-ghost",
};

const sizes = {
  default: "",
  sm: "btn-sm",
  lg: "btn-lg",
};

function Button({ 
  text, 
  handleClick, 
  variant = "primary", 
  size = "default",
  disabled = false,
  className,
  children,
  icon: Icon,
  ...props 
}) {
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        variants[variant],
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
