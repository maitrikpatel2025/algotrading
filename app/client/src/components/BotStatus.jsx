import React, { useEffect, useState } from 'react';
import endPoints from '../app/api';
import { cn } from '../lib/utils';
import { Bot, Activity, Clock, Signal, TrendingUp, AlertCircle } from 'lucide-react';

const POLL_INTERVAL = 30000; // 30 seconds

function BotStatus() {
  const [botStatus, setBotStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBotStatus();

    const interval = setInterval(loadBotStatus, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const loadBotStatus = async () => {
    try {
      const data = await endPoints.botStatus();
      setBotStatus(data);
      setError(null);
    } catch (err) {
      console.error('Error loading bot status:', err);
      setError('Failed to load bot status');
      setBotStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    if (seconds === null || seconds === undefined) return '--';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'running':
        return {
          label: 'Running',
          bgColor: 'bg-success/10',
          textColor: 'text-success',
          borderColor: 'border-success/30',
          pulse: true,
        };
      case 'paused':
        return {
          label: 'Paused',
          bgColor: 'bg-warning/10',
          textColor: 'text-warning',
          borderColor: 'border-warning/30',
          pulse: false,
        };
      case 'error':
        return {
          label: 'Error',
          bgColor: 'bg-destructive/10',
          textColor: 'text-destructive',
          borderColor: 'border-destructive/30',
          pulse: false,
        };
      case 'stopped':
      default:
        return {
          label: 'Stopped',
          bgColor: 'bg-muted',
          textColor: 'text-muted-foreground',
          borderColor: 'border-border',
          pulse: false,
        };
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="card animate-fade-in">
        <div className="card-header border-b border-border">
          <div className="flex items-center gap-3">
            <div className="skeleton h-10 w-10 rounded-lg" />
            <div className="skeleton h-6 w-40" />
          </div>
        </div>
        <div className="card-content pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-6 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-lg" />
            ))}
          </div>
          <div className="skeleton h-20 rounded-lg" />
          <div className="skeleton h-12 rounded-lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !botStatus) {
    return (
      <div className="card">
        <div className="card-header border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Bot className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="card-title">Trading Bot Status</h3>
          </div>
        </div>
        <div className="card-content pt-6">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(botStatus?.status);

  return (
    <div className="card animate-fade-in">
      {/* Header */}
      <div className="card-header border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="card-title">Trading Bot Status</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Automated trading system</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border",
            statusConfig.bgColor,
            statusConfig.borderColor
          )}>
            {statusConfig.pulse && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
            )}
            <span className={cn("text-sm font-medium", statusConfig.textColor)}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card-content pt-6 space-y-6">
        {/* Error Banner */}
        {botStatus?.status === 'error' && botStatus?.error_message && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{botStatus.error_message}</p>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Uptime */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Uptime</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {formatUptime(botStatus?.uptime_seconds)}
            </p>
          </div>

          {/* Last Signal */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Signal className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Last Signal</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {formatRelativeTime(botStatus?.last_signal_time)}
            </p>
            {botStatus?.last_signal_pair && botStatus?.last_signal_type && (
              <p className="text-xs text-muted-foreground">
                {botStatus.last_signal_type} {botStatus.last_signal_pair}
              </p>
            )}
          </div>

          {/* Signals Today */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Signals Today</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {botStatus?.signals_today ?? 0}
            </p>
          </div>

          {/* Trades Today */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Trades Today</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {botStatus?.trades_today ?? 0}
            </p>
          </div>
        </div>

        {/* Active Strategy */}
        {botStatus?.active_strategy && (
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="text-sm font-semibold text-foreground mb-2">Active Strategy</h4>
            <p className="text-base font-medium text-primary">
              {botStatus.active_strategy.name}
            </p>
            {botStatus.active_strategy.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {botStatus.active_strategy.description}
              </p>
            )}
          </div>
        )}

        {/* Monitored Pairs */}
        {botStatus?.monitored_pairs && botStatus.monitored_pairs.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Monitored Pairs</h4>
            <div className="flex flex-wrap gap-2">
              {botStatus.monitored_pairs.map((pair, index) => (
                <div
                  key={`${pair.symbol}-${index}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border",
                    pair.is_active
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted text-muted-foreground border-border"
                  )}
                >
                  <span className="font-medium">{pair.symbol}</span>
                  <span className="text-xs opacity-70">{pair.timeframe}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BotStatus;
