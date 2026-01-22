import React, { useState, useEffect } from 'react';
import { ChevronDown, Loader2, TrendingUp, TrendingDown, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import endPoints from '../app/api';

/**
 * StrategySelector Component
 *
 * Dropdown component for selecting saved strategies with preview.
 * Shows strategy details including pair, direction, and indicator count.
 */

function StrategySelector({ value, onChange, className }) {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch strategies on mount
  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await endPoints.listStrategiesExtended();
        setStrategies(data.strategies || []);
      } catch (err) {
        console.error('Error fetching strategies:', err);
        setError('Failed to load strategies');
      } finally {
        setLoading(false);
      }
    };

    fetchStrategies();
  }, []);

  // Get selected strategy
  const selectedStrategy = strategies.find(s => s.id === value);

  // Direction icon helper
  const getDirectionIcon = (direction) => {
    switch (direction) {
      case 'long':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'short':
        return <TrendingDown className="h-4 w-4 text-danger" />;
      case 'both':
      default:
        return <ArrowLeftRight className="h-4 w-4 text-primary" />;
    }
  };

  // Handle selection
  const handleSelect = (strategy) => {
    onChange({
      strategy_id: strategy.id,
      strategy_name: strategy.name,
      pair: strategy.pair,
      timeframe: strategy.timeframe,
      trade_direction: strategy.trade_direction
    });
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.strategy-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={cn("strategy-selector relative", className)}>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
        Strategy
      </label>

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 text-left",
          "border border-neutral-300 rounded-md bg-white",
          "hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          "transition-colors",
          loading && "opacity-50 cursor-not-allowed"
        )}
      >
        {loading ? (
          <span className="flex items-center gap-2 text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading strategies...
          </span>
        ) : error ? (
          <span className="flex items-center gap-2 text-danger">
            <AlertCircle className="h-4 w-4" />
            {error}
          </span>
        ) : selectedStrategy ? (
          <span className="flex items-center gap-2">
            {getDirectionIcon(selectedStrategy.trade_direction)}
            <span className="font-medium text-neutral-900">{selectedStrategy.name}</span>
            {selectedStrategy.pair && (
              <span className="text-neutral-500">({selectedStrategy.pair})</span>
            )}
          </span>
        ) : (
          <span className="text-neutral-500">Select a strategy...</span>
        )}
        <ChevronDown className={cn(
          "h-5 w-5 text-neutral-400 transition-transform",
          isOpen && "transform rotate-180"
        )} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !loading && !error && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-md shadow-elevated max-h-64 overflow-auto">
          {strategies.length === 0 ? (
            <div className="px-4 py-6 text-center text-neutral-500">
              <p className="font-medium">No strategies found</p>
              <p className="text-sm mt-1">Create a strategy first to use it in a backtest</p>
            </div>
          ) : (
            strategies.map((strategy) => (
              <button
                key={strategy.id}
                type="button"
                onClick={() => handleSelect(strategy)}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors",
                  "border-b border-neutral-100 last:border-b-0",
                  strategy.id === value && "bg-primary-light"
                )}
              >
                <div className="flex items-center gap-2">
                  {getDirectionIcon(strategy.trade_direction)}
                  <span className="font-medium text-neutral-900">{strategy.name}</span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-neutral-500">
                  {strategy.pair && <span>{strategy.pair}</span>}
                  {strategy.timeframe && <span>{strategy.timeframe}</span>}
                  <span className="capitalize">{strategy.trade_direction}</span>
                  {strategy.indicator_count > 0 && (
                    <span>{strategy.indicator_count} indicator{strategy.indicator_count !== 1 ? 's' : ''}</span>
                  )}
                  {strategy.condition_count > 0 && (
                    <span>{strategy.condition_count} rule{strategy.condition_count !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Selected Strategy Preview */}
      {selectedStrategy && (
        <div className="mt-3 p-3 bg-neutral-50 rounded-md border border-neutral-200">
          <div className="flex items-center gap-2 mb-2">
            {getDirectionIcon(selectedStrategy.trade_direction)}
            <span className="font-medium text-neutral-900">{selectedStrategy.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-neutral-500">Pair:</span>{' '}
              <span className="text-neutral-900">{selectedStrategy.pair || 'Any'}</span>
            </div>
            <div>
              <span className="text-neutral-500">Timeframe:</span>{' '}
              <span className="text-neutral-900">{selectedStrategy.timeframe || 'Any'}</span>
            </div>
            <div>
              <span className="text-neutral-500">Direction:</span>{' '}
              <span className="text-neutral-900 capitalize">{selectedStrategy.trade_direction}</span>
            </div>
            <div>
              <span className="text-neutral-500">Indicators:</span>{' '}
              <span className="text-neutral-900">{selectedStrategy.indicator_count || 0}</span>
            </div>
          </div>
          {selectedStrategy.description && (
            <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
              {selectedStrategy.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default StrategySelector;
