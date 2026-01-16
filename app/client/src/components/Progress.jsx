import React from 'react';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

function Progress({ title, percentage, color, variant = "default" }) {
  // Parse percentage if it's a string like "75%"
  const numericPercentage = typeof percentage === 'string' 
    ? parseFloat(percentage) 
    : percentage;
  
  const isBullish = title?.toLowerCase().includes('bullish');
  const isBearish = title?.toLowerCase().includes('bearish');
  
  // Determine bar color
  const barColorClass = isBullish 
    ? 'bg-success' 
    : isBearish 
      ? 'bg-destructive' 
      : 'bg-primary';
  
  const textColorClass = isBullish 
    ? 'text-success' 
    : isBearish 
      ? 'text-destructive' 
      : 'text-primary';

  const Icon = isBullish ? TrendingUp : isBearish ? TrendingDown : null;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={cn("h-4 w-4", textColorClass)} />}
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <span className={cn("text-sm font-bold tabular-nums", textColorClass)}>
          {numericPercentage}%
        </span>
      </div>
      
      {/* Progress Bar */}
      <div 
        className="progress h-3 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={numericPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${title}: ${numericPercentage}%`}
      >
        <div 
          className={cn(
            "progress-indicator h-full rounded-full transition-all duration-500 ease-out",
            barColorClass
          )}
          style={{ width: `${numericPercentage}%` }}
        />
      </div>
    </div>
  );
}

export default Progress;
