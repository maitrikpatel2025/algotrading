import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Bell, AlertTriangle, Info, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * AlertsPanel Component - Precision Swiss Design System
 *
 * Displays system alerts in a collapsible panel:
 * - Alert icon (warning/info/error)
 * - Alert message
 * - Timestamp
 * - Dismiss button
 *
 * Generates alerts for:
 * - Connection issues
 * - Bot errors
 * - Margin warnings (if margin level < 150%)
 */
function AlertsPanel({ connectionStatus, botStatus, account, loading = false }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  // Generate alerts based on current state
  const alerts = useMemo(() => {
    const generatedAlerts = [];
    const now = new Date();

    // Connection alerts
    if (connectionStatus === 'disconnected') {
      generatedAlerts.push({
        id: 'connection-disconnected',
        type: 'error',
        message: 'Connection lost. Unable to fetch live data.',
        timestamp: now,
      });
    } else if (connectionStatus === 'reconnecting') {
      generatedAlerts.push({
        id: 'connection-reconnecting',
        type: 'warning',
        message: 'Reconnecting to server...',
        timestamp: now,
      });
    }

    // Bot error alerts
    if (botStatus?.status === 'error' && botStatus?.error_message) {
      generatedAlerts.push({
        id: 'bot-error',
        type: 'error',
        message: `Bot error: ${botStatus.error_message}`,
        timestamp: now,
      });
    }

    // Margin level warning (< 150%)
    if (account?.MarginLevel && account.MarginLevel < 150 && account.MarginLevel > 0) {
      generatedAlerts.push({
        id: 'margin-warning',
        type: 'warning',
        message: `Low margin level: ${account.MarginLevel.toFixed(2)}%. Consider reducing positions.`,
        timestamp: now,
      });
    }

    // Filter out dismissed alerts
    return generatedAlerts.filter((alert) => !dismissedAlerts.has(alert.id));
  }, [connectionStatus, botStatus, account, dismissedAlerts]);

  const handleDismiss = (alertId) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
  };

  const getAlertConfig = (type) => {
    switch (type) {
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-danger-light dark:bg-danger/20',
          textColor: 'text-danger',
          borderColor: 'border-l-danger',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-warning-light dark:bg-warning/20',
          textColor: 'text-warning',
          borderColor: 'border-l-warning',
        };
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: 'bg-info-light dark:bg-info/20',
          textColor: 'text-info',
          borderColor: 'border-l-info',
        };
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="card animate-fade-in dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="p-4">
          <div className="h-16 bg-neutral-100 dark:bg-neutral-700 rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="card dark:bg-neutral-800 dark:border-neutral-700">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-md',
              alerts.length > 0
                ? 'bg-warning-light dark:bg-warning/20'
                : 'bg-neutral-100 dark:bg-neutral-700'
            )}
          >
            <Bell
              className={cn(
                'h-5 w-5',
                alerts.length > 0
                  ? 'text-warning'
                  : 'text-neutral-400 dark:text-neutral-500'
              )}
            />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              Alerts
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {alerts.length > 0 ? `${alerts.length} active` : 'No active alerts'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
        )}
      </button>

      {/* Alerts List */}
      {isExpanded && (
        <div className="p-4">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-700 mb-3">
                <Bell className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
              </div>
              <p className="text-neutral-500 dark:text-neutral-400">No active alerts</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                System notifications will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const config = getAlertConfig(alert.type);
                const Icon = config.icon;

                return (
                  <div
                    key={alert.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-md border-l-4',
                      config.bgColor,
                      config.borderColor
                    )}
                  >
                    <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.textColor)} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium', config.textColor)}>
                        {alert.message}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {formatTime(alert.timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-600/50 transition-colors"
                      aria-label="Dismiss alert"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AlertsPanel;
