import React from 'react';
import { cn } from '../../lib/utils';

/**
 * ConnectionStatus Component - Precision Swiss Design System
 *
 * Displays connection status with animated indicator:
 * - Green pulsing dot for "connected"
 * - Yellow pulsing dot for "reconnecting"
 * - Red static dot for "disconnected"
 */
function ConnectionStatus({ status = 'connected' }) {
  const getStatusConfig = (currentStatus) => {
    switch (currentStatus) {
      case 'connected':
        return {
          label: 'Connected',
          dotColor: 'bg-success',
          textColor: 'text-success',
          pulse: true,
        };
      case 'reconnecting':
        return {
          label: 'Reconnecting',
          dotColor: 'bg-warning',
          textColor: 'text-warning',
          pulse: true,
        };
      case 'disconnected':
        return {
          label: 'Disconnected',
          dotColor: 'bg-danger',
          textColor: 'text-danger',
          pulse: false,
        };
      default:
        return {
          label: 'Unknown',
          dotColor: 'bg-neutral-400',
          textColor: 'text-neutral-500',
          pulse: false,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              config.dotColor
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            config.dotColor
          )}
        />
      </span>
      <span
        className={cn(
          'text-xs font-medium uppercase tracking-wider dark:opacity-90',
          config.textColor
        )}
      >
        {config.label}
      </span>
    </div>
  );
}

export default ConnectionStatus;
