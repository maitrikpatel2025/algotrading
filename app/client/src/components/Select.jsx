import React from 'react';
import { cn } from '../lib/utils';
import { ChevronDown } from 'lucide-react';

function Select({ 
  options, 
  title, 
  name, 
  defaultValue, 
  onSelected,
  className,
  hideLabel = false,
}) {
  const handleChange = (e) => {
    onSelected(e.target.value);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {!hideLabel && title && (
        <label 
          htmlFor={name} 
          className="text-sm font-medium text-muted-foreground"
        >
          {title}
        </label>
      )}
      <div className="relative">
        <select
          className="select appearance-none cursor-pointer pr-10 bg-background hover:bg-muted/50 focus:bg-background transition-colors"
          value={defaultValue}
          name={name}
          id={name}
          onChange={handleChange}
          aria-label={hideLabel ? title : undefined}
        >
          {options.map(item => (
            <option key={item.key} value={item.value}>
              {item.text}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

export default Select;
