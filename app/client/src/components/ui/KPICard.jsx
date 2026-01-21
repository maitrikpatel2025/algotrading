import React from 'react';
import { cn } from '../../lib/utils';

/**
 * KPICard Component - Precision Swiss Design System
 *
 * Large number display for key performance indicators.
 * Label: 12px uppercase with letter-spacing
 * Value: 36px semibold tabular-nums
 *
 * @param {Object} props
 * @param {string} props.label - KPI label
 * @param {string | number} props.value - KPI value
 * @param {'positive' | 'negative' | 'neutral'} props.trend - Value trend for coloring
 * @param {string} props.prefix - Value prefix (e.g., "$", "+")
 * @param {string} props.suffix - Value suffix (e.g., "%")
 * @param {string} props.className - Additional classes
 */
function KPICard({
  label,
  value,
  trend = 'neutral',
  prefix = '',
  suffix = '',
  className,
  ...props
}) {
  const trendColors = {
    positive: 'pnl-positive',
    negative: 'pnl-negative',
    neutral: 'text-neutral-900',
  };

  return (
    <div className={cn('card', className)} {...props}>
      <p className="kpi-label">{label}</p>
      <p className={cn('kpi-number', trendColors[trend])}>
        {prefix}{value}{suffix}
      </p>
    </div>
  );
}

/**
 * Inline KPI - Smaller version for inline display
 */
function KPIInline({
  label,
  value,
  trend = 'neutral',
  prefix = '',
  suffix = '',
  className,
  ...props
}) {
  const trendColors = {
    positive: 'pnl-positive',
    negative: 'pnl-negative',
    neutral: 'text-neutral-600',
  };

  return (
    <div className={cn('space-y-1', className)} {...props}>
      <p className="text-xs uppercase tracking-wider text-neutral-500">{label}</p>
      <p className={cn('text-xl font-semibold tabular-nums', trendColors[trend])}>
        {prefix}{value}{suffix}
      </p>
    </div>
  );
}

export { KPICard, KPIInline };
export default KPICard;
