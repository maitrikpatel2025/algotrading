import React from 'react';
import { cn } from '../lib/utils';
import { ChevronDown, Check } from 'lucide-react';

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

  // Find selected option for display
  const selectedOption = options.find(opt => opt.value === defaultValue);

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
        {/* Active indicator - shows checkmark for selected state */}
        {selectedOption && (
          <Check className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-primary pointer-events-none z-10" />
        )}
        <select
          className={cn(
            "select appearance-none cursor-pointer pr-10 bg-background hover:bg-muted/50 focus:bg-background transition-colors",
            selectedOption && "pl-7"
          )}
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
