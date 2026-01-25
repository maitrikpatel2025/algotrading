import React from 'react';
import { cn } from '../../lib/utils';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

/**
 * LatencyIndicator Component
 *
 * Displays data freshness with color-coded latency:
 * - Green (< 500ms): Good connection
 * - Yellow (500ms-2000ms): Moderate delay
 * - Red (> 2000ms or error): High latency/connection issue
 *
 * Shows:
 * - "Live" indicator with pulsing dot when connected
 * - Latency in milliseconds
 * - "Delayed" warning when latency is high
 */
function LatencyIndicator({ latencyMs, error }) {
  // Determine status based on latency
  const getStatus = () => {
    if (error) return 'error';
    if (latencyMs === null || latencyMs === undefined) return 'loading';
    if (latencyMs < 500) return 'good';
    if (latencyMs < 2000) return 'moderate';
    return 'poor';
  };

  const status = getStatus();

  // Status configurations
  const statusConfig = {
    good: {
      label: 'Live',
      icon: Wifi,
      colorClass: 'text-success',
      bgClass: 'bg-success',
      description: 'Real-time data',
    },
    moderate: {
      label: 'Delayed',
      icon: AlertTriangle,
      colorClass: 'text-warning',
      bgClass: 'bg-warning',
      description: 'Some delay',
    },
    poor: {
      label: 'Delayed',
      icon: AlertTriangle,
      colorClass: 'text-danger',
      bgClass: 'bg-danger',
      description: 'High latency',
    },
    error: {
      label: 'Offline',
      icon: WifiOff,
      colorClass: 'text-danger',
      bgClass: 'bg-danger',
      description: 'Connection issue',
    },
    loading: {
      label: 'Connecting',
      icon: Wifi,
      colorClass: 'text-neutral-400',
      bgClass: 'bg-neutral-400',
      description: 'Fetching data',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className="flex items-center gap-2"
      title={`${config.description}${latencyMs !== null ? ` (${latencyMs}ms)` : ''}`}
    >
      {/* Pulsing dot indicator */}
      <div className="relative flex items-center">
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            config.bgClass,
            status === 'good' && 'animate-pulse'
          )}
        />
        {status === 'good' && (
          <span
            className={cn(
              'absolute h-2 w-2 rounded-full',
              config.bgClass,
              'animate-ping opacity-75'
            )}
          />
        )}
      </div>

      {/* Status label */}
      <span className={cn('text-xs font-medium', config.colorClass)}>
        {config.label}
      </span>

      {/* Latency value */}
      {latencyMs !== null && latencyMs !== undefined && (
        <span
          className={cn(
            'text-xs tabular-nums',
            status === 'good'
              ? 'text-neutral-400 dark:text-neutral-500'
              : config.colorClass
          )}
        >
          {latencyMs}ms
        </span>
      )}

      {/* Icon */}
      <Icon
        className={cn(
          'h-3.5 w-3.5',
          config.colorClass
        )}
      />
    </div>
  );
}

export default LatencyIndicator;
