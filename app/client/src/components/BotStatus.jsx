import React, { useEffect, useState, useCallback } from 'react';
import endPoints from '../app/api';
import { cn } from '../lib/utils';
import { Bot, Activity, Clock, Signal, TrendingUp, AlertCircle, Play, Square, ChevronDown, ChevronUp, X, Loader2 } from 'lucide-react';

const POLL_INTERVAL = 30000; // 30 seconds

// Toast notification component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30';
  const textColor = type === 'success' ? 'text-success' : 'text-destructive';

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-fade-in",
      bgColor
    )}>
      <span className={cn("text-sm font-medium", textColor)}>{message}</span>
      <button
        onClick={onClose}
        className={cn("p-1 rounded-full hover:bg-black/10", textColor)}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Confirmation dialog component
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-fade-in">
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function BotStatus() {
  const [botStatus, setBotStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [toast, setToast] = useState(null);

  // Configuration state
  const [selectedStrategy, setSelectedStrategy] = useState('Bollinger Bands Strategy');
  const [selectedTimeframe, setSelectedTimeframe] = useState('M1');

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

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

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const config = {
        strategy: selectedStrategy,
        timeframe: selectedTimeframe,
      };

      await endPoints.botStart(config);
      showToast('Bot started successfully', 'success');
      setShowConfig(false);
      await loadBotStatus();
    } catch (err) {
      console.error('Error starting bot:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to start bot';
      showToast(`Failed to start bot: ${errorMessage}`, 'error');
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopConfirm = async () => {
    setIsStopping(true);
    try {
      await endPoints.botStop();
      showToast('Bot stopped successfully', 'success');
      setShowConfirmDialog(false);
      await loadBotStatus();
    } catch (err) {
      console.error('Error stopping bot:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to stop bot';
      showToast(`Failed to stop bot: ${errorMessage}`, 'error');
    } finally {
      setIsStopping(false);
    }
  };

  const handleStop = () => {
    setShowConfirmDialog(true);
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
      case 'starting':
        return {
          label: 'Starting',
          bgColor: 'bg-warning/10',
          textColor: 'text-warning',
          borderColor: 'border-warning/30',
          pulse: true,
        };
      case 'stopping':
        return {
          label: 'Stopping',
          bgColor: 'bg-warning/10',
          textColor: 'text-warning',
          borderColor: 'border-warning/30',
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
  const canStart = botStatus?.can_start && !isStarting && !isStopping;
  const canStop = botStatus?.can_stop && !isStarting && !isStopping;

  return (
    <div className="card animate-fade-in">
      {/* Toast notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Confirmation dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Stop Trading Bot"
        message="Are you sure you want to stop the trading bot? Any active monitoring will be stopped."
        onConfirm={handleStopConfirm}
        onCancel={() => setShowConfirmDialog(false)}
        isLoading={isStopping}
      />

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
                <span className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  statusConfig.textColor === 'text-success' ? "bg-success" : "bg-warning"
                )} />
                <span className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  statusConfig.textColor === 'text-success' ? "bg-success" : "bg-warning"
                )} />
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
        {/* Control Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all",
              canStart
                ? "bg-success text-success-foreground hover:bg-success/90 shadow-lg shadow-success/20"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isStarting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isStarting ? 'Starting...' : 'Start Bot'}
          </button>

          <button
            onClick={handleStop}
            disabled={!canStop}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all",
              canStop
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isStopping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {isStopping ? 'Stopping...' : 'Stop Bot'}
          </button>
        </div>

        {/* Configuration Panel (shown when bot is stopped) */}
        {botStatus?.status === 'stopped' && (
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
            >
              <span className="text-sm font-medium text-foreground">Configuration</span>
              {showConfig ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {showConfig && (
              <div className="p-4 space-y-4 bg-card">
                {/* Strategy Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Strategy
                  </label>
                  <select
                    value={selectedStrategy}
                    onChange={(e) => setSelectedStrategy(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Bollinger Bands Strategy">Bollinger Bands Strategy</option>
                  </select>
                </div>

                {/* Timeframe Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Timeframe
                  </label>
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="M1">M1 (1 Minute)</option>
                    <option value="M5">M5 (5 Minutes)</option>
                    <option value="M15">M15 (15 Minutes)</option>
                    <option value="H1">H1 (1 Hour)</option>
                    <option value="H4">H4 (4 Hours)</option>
                    <option value="D">D (Daily)</option>
                  </select>
                </div>

                {/* Trading Pairs Info */}
                {botStatus?.monitored_pairs && botStatus.monitored_pairs.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Trading Pairs (from config)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {botStatus.monitored_pairs.map((pair, index) => (
                        <span
                          key={`config-${pair.symbol}-${index}`}
                          className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/30"
                        >
                          {pair.symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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

        {/* PID Display (optional) */}
        {botStatus?.pid && (
          <div className="text-xs text-muted-foreground text-right">
            PID: {botStatus.pid}
          </div>
        )}
      </div>
    </div>
  );
}

export default BotStatus;
