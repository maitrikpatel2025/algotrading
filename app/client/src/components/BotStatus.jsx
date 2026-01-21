import React, { useEffect, useState, useCallback } from 'react';
import endPoints from '../app/api';
import { cn } from '../lib/utils';
import { Bot, Activity, Clock, Signal, TrendingUp, AlertCircle, Play, Square, ChevronDown, ChevronUp, X, Loader2 } from 'lucide-react';

const POLL_INTERVAL = 30000; // 30 seconds

/**
 * Toast notification component - Precision Swiss Design
 * Clean white background with colored left border
 */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const borderColor = type === 'success' ? 'border-l-success' : 'border-l-danger';
  const textColor = type === 'success' ? 'text-success' : 'text-danger';

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-md shadow-elevated animate-fade-in border-l-4",
      borderColor
    )}>
      <span className={cn("text-sm font-medium", textColor)}>{message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Confirmation dialog component - Precision Swiss Design
 * Clean modal with no gradients
 */
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-neutral-900/50" onClick={onCancel} />
      <div className="relative bg-white border border-neutral-200 rounded-md shadow-elevated p-6 max-w-md w-full mx-4 animate-fade-in">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
        <p className="text-sm text-neutral-500 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="btn btn-secondary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="btn btn-danger disabled:opacity-50 flex items-center gap-2"
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
          bgColor: 'bg-success-light',
          textColor: 'text-success',
          borderColor: 'border-success',
          leftBorder: 'border-l-success',
          pulse: true,
        };
      case 'starting':
        return {
          label: 'Starting',
          bgColor: 'bg-warning-light',
          textColor: 'text-warning',
          borderColor: 'border-warning',
          leftBorder: 'border-l-warning',
          pulse: true,
        };
      case 'stopping':
        return {
          label: 'Stopping',
          bgColor: 'bg-warning-light',
          textColor: 'text-warning',
          borderColor: 'border-warning',
          leftBorder: 'border-l-warning',
          pulse: true,
        };
      case 'paused':
        return {
          label: 'Paused',
          bgColor: 'bg-warning-light',
          textColor: 'text-warning',
          borderColor: 'border-warning',
          leftBorder: 'border-l-warning',
          pulse: false,
        };
      case 'error':
        return {
          label: 'Error',
          bgColor: 'bg-danger-light',
          textColor: 'text-danger',
          borderColor: 'border-danger',
          leftBorder: 'border-l-danger',
          pulse: false,
        };
      case 'stopped':
      default:
        return {
          label: 'Stopped',
          bgColor: 'bg-neutral-100',
          textColor: 'text-neutral-500',
          borderColor: 'border-neutral-300',
          leftBorder: 'border-l-neutral-300',
          pulse: false,
        };
    }
  };

  // Loading skeleton - Precision Swiss Design
  if (loading) {
    return (
      <div className="card animate-fade-in">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-neutral-200 animate-pulse" />
            <div className="h-5 w-40 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
            <div className="h-6 w-24 bg-neutral-200 rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-100 rounded-md animate-pulse" />
            ))}
          </div>
          <div className="h-20 bg-neutral-100 rounded-md animate-pulse" />
          <div className="h-12 bg-neutral-200 rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state - Precision Swiss Design
  if (error && !botStatus) {
    return (
      <div className="card">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
              <Bot className="h-5 w-5 text-neutral-400" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900">Trading Bot Status</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 p-4 rounded-md bg-danger-light border-l-4 border-l-danger">
            <AlertCircle className="h-5 w-5 text-danger" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(botStatus?.status);
  const canStart = botStatus?.can_start && !isStarting && !isStopping;
  const canStop = botStatus?.can_stop && !isStarting && !isStopping;

  return (
    <div className={cn(
      "card animate-fade-in border-l-4",
      statusConfig.leftBorder
    )}>
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

      {/* Header - Precision Swiss Design */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-light">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Trading Bot</h3>
              <p className="text-xs text-neutral-500">Automated trading system</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full",
            statusConfig.bgColor
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
            <span className={cn("text-xs font-medium uppercase tracking-wider", statusConfig.textColor)}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Content - Precision Swiss Design */}
      <div className="p-4 space-y-4">
        {/* Control Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
              canStart
                ? "bg-success text-white hover:bg-success-hover"
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
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
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
              canStop
                ? "bg-danger text-white hover:bg-danger-hover"
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
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
          <div className="border border-neutral-200 rounded-md overflow-hidden">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
            >
              <span className="text-sm font-medium text-neutral-900">Configuration</span>
              {showConfig ? (
                <ChevronUp className="h-4 w-4 text-neutral-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              )}
            </button>

            {showConfig && (
              <div className="p-4 space-y-4 bg-white">
                {/* Strategy Selection */}
                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                    Strategy
                  </label>
                  <select
                    value={selectedStrategy}
                    onChange={(e) => setSelectedStrategy(e.target.value)}
                    className="input-field"
                  >
                    <option value="Bollinger Bands Strategy">Bollinger Bands Strategy</option>
                  </select>
                </div>

                {/* Timeframe Selection */}
                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                    Timeframe
                  </label>
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="input-field"
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
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                      Trading Pairs (from config)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {botStatus.monitored_pairs.map((pair, index) => (
                        <span
                          key={`config-${pair.symbol}-${index}`}
                          className="badge badge-primary"
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
          <div className="flex items-center gap-3 p-4 rounded-md bg-danger-light border-l-4 border-l-danger">
            <AlertCircle className="h-5 w-5 text-danger flex-shrink-0" />
            <p className="text-sm text-danger">{botStatus.error_message}</p>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Uptime */}
          <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-neutral-400" />
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Uptime</span>
            </div>
            <p className="text-lg font-semibold text-neutral-900 tabular-nums">
              {formatUptime(botStatus?.uptime_seconds)}
            </p>
          </div>

          {/* Last Signal */}
          <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-2 mb-1">
              <Signal className="h-4 w-4 text-neutral-400" />
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Last Signal</span>
            </div>
            <p className="text-lg font-semibold text-neutral-900 tabular-nums">
              {formatRelativeTime(botStatus?.last_signal_time)}
            </p>
            {botStatus?.last_signal_pair && botStatus?.last_signal_type && (
              <p className="text-xs text-neutral-500">
                {botStatus.last_signal_type} {botStatus.last_signal_pair}
              </p>
            )}
          </div>

          {/* Signals Today */}
          <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-neutral-400" />
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Signals Today</span>
            </div>
            <p className="text-lg font-semibold text-neutral-900 tabular-nums">
              {botStatus?.signals_today ?? 0}
            </p>
          </div>

          {/* Trades Today */}
          <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-neutral-400" />
              <span className="text-xs text-neutral-500 uppercase tracking-wider">Trades Today</span>
            </div>
            <p className="text-lg font-semibold text-neutral-900 tabular-nums">
              {botStatus?.trades_today ?? 0}
            </p>
          </div>
        </div>

        {/* Active Strategy */}
        {botStatus?.active_strategy && (
          <div className="p-4 rounded-md border border-neutral-200 bg-white">
            <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Active Strategy</h4>
            <p className="text-base font-semibold text-primary">
              {botStatus.active_strategy.name}
            </p>
            {botStatus.active_strategy.description && (
              <p className="text-sm text-neutral-500 mt-1">
                {botStatus.active_strategy.description}
              </p>
            )}
          </div>
        )}

        {/* Monitored Pairs */}
        {botStatus?.monitored_pairs && botStatus.monitored_pairs.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Monitored Pairs</h4>
            <div className="flex flex-wrap gap-2">
              {botStatus.monitored_pairs.map((pair, index) => (
                <div
                  key={`${pair.symbol}-${index}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                    pair.is_active
                      ? "bg-primary-light text-primary"
                      : "bg-neutral-100 text-neutral-500"
                  )}
                >
                  <span>{pair.symbol}</span>
                  <span className="opacity-70">{pair.timeframe}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PID Display (optional) */}
        {botStatus?.pid && (
          <div className="text-xs text-neutral-400 text-right tabular-nums">
            PID: {botStatus.pid}
          </div>
        )}
      </div>
    </div>
  );
}

export default BotStatus;
