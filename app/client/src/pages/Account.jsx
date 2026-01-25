import React, { useEffect, useState, useCallback } from 'react';
import endPoints from '../app/api';
import AccountSummary from '../components/AccountSummary';
import OpenTrades from '../components/OpenTrades';
import TradeHistory from '../components/TradeHistory';
import { RefreshCw } from 'lucide-react';

/**
 * Account Page - Precision Swiss Design System
 *
 * Clean layout with no gradient hero section.
 * Card-based sections with proper spacing.
 * Clean KPI display with tabular-nums.
 *
 * Enhanced Trade History feature includes:
 * - P/L Summary cards (daily, weekly, total)
 * - Advanced filtering (date range, bot, pair, direction, outcome)
 * - Pagination with configurable page sizes
 * - Column sorting
 * - CSV export functionality
 */

function Account() {
  const [openTrades, setOpenTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [historySummary, setHistorySummary] = useState(null);
  const [historyMessage, setHistoryMessage] = useState(null);
  const [historyError, setHistoryError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Trade history filters state
  const [historyFilters, setHistoryFilters] = useState({
    startDate: '',
    endDate: '',
    bot: '',
    pair: '',
    direction: 'both',
    outcome: 'all',
  });

  // Convert filter state to API parameters
  const getHistoryApiParams = useCallback((filters) => {
    const params = {};

    // Convert date strings to timestamps
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      params.timestamp_from = startDate.getTime();
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      params.timestamp_to = endDate.getTime();
    }

    // Add other filter params
    if (filters.bot) params.bot_name = filters.bot;
    if (filters.pair) params.pair = filters.pair;
    if (filters.direction && filters.direction !== 'both') {
      params.direction = filters.direction;
    }
    if (filters.outcome && filters.outcome !== 'all') {
      params.outcome = filters.outcome;
    }

    return params;
  }, []);

  // Load trade history with filters
  const loadTradeHistory = useCallback(async (filters) => {
    setHistoryError(null);

    try {
      // Create timeout promise for trade history (15 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 15000);
      });

      const apiParams = getHistoryApiParams(filters);
      const historyResponse = await Promise.race([
        endPoints.tradeHistory(apiParams),
        timeoutPromise
      ]);

      if (historyResponse && !historyResponse.error) {
        setTradeHistory(historyResponse.trades || []);
        setHistorySummary(historyResponse.summary || null);
        setHistoryMessage(historyResponse.message || null);
      } else {
        setTradeHistory([]);
        setHistorySummary(null);
        setHistoryError(historyResponse?.error || 'Failed to load trade history');
      }
    } catch (error) {
      setTradeHistory([]);
      setHistorySummary(null);
      const errorMsg = error.message || 'Failed to load trade history';
      if (errorMsg.includes('timed out')) {
        setHistoryError('Unable to load trade history. The request timed out.');
      } else {
        setHistoryError('Unable to load trade history. Please try again later.');
      }
    }
  }, [getHistoryApiParams]);

  // Initial data load
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }

    // Reset error state
    setHistoryError(null);

    try {
      // Create timeout promise for trade history (15 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 15000);
      });

      // Get history API params from current filters
      const historyApiParams = getHistoryApiParams(historyFilters);

      // Fetch data with Promise.allSettled to handle failures independently
      const [tradesResult, historyResult] = await Promise.allSettled([
        endPoints.openTrades(),
        Promise.race([endPoints.tradeHistory(historyApiParams), timeoutPromise])
      ]);

      // Handle open trades response
      if (tradesResult.status === 'fulfilled' && tradesResult.value && !tradesResult.value.error) {
        setOpenTrades(tradesResult.value.trades || []);
      } else {
        setOpenTrades([]);
      }

      // Handle trade history response
      if (historyResult.status === 'fulfilled') {
        const historyResponse = historyResult.value;
        if (historyResponse && !historyResponse.error) {
          setTradeHistory(historyResponse.trades || []);
          setHistorySummary(historyResponse.summary || null);
          setHistoryMessage(historyResponse.message || null);
        } else {
          setTradeHistory([]);
          setHistorySummary(null);
          setHistoryError(historyResponse?.error || 'Failed to load trade history');
        }
      } else {
        // Handle timeout or network error
        setTradeHistory([]);
        setHistorySummary(null);
        const errorMsg = historyResult.reason?.message || 'Failed to load trade history';
        if (errorMsg.includes('timed out')) {
          setHistoryError('Unable to load trade history. The request timed out.');
        } else {
          setHistoryError('Unable to load trade history. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Error loading account data:', error);
      setOpenTrades([]);
      setTradeHistory([]);
      setHistorySummary(null);
      setHistoryError('An unexpected error occurred.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadData(true);
  };

  // Handle successful trade close - refresh data to show updated positions
  const handleTradeClose = () => {
    loadData(true);
  };

  // Handle filter changes - reload trade history with new filters
  const handleFilterChange = useCallback((newFilters) => {
    setHistoryFilters(newFilters);
    loadTradeHistory(newFilters);
  }, [loadTradeHistory]);

  // Loading state - Precision Swiss Design
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-neutral-50 py-8 animate-fade-in">
        <div className="container-swiss">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-neutral-200 animate-pulse" />
              <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-neutral-500 font-medium">Loading account data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-neutral-50 py-8 animate-fade-in">
      <div className="container-swiss space-y-6">
        {/* Page Header - Precision Swiss Design */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="heading-1">Account</h1>
            <p className="body-sm mt-1">View your account summary, open trades, and trade history</p>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Account Summary Section */}
          <AccountSummary />

          {/* Open Trades Section */}
          <OpenTrades trades={openTrades} loading={refreshing} onTradeClose={handleTradeClose} />

          {/* Trade History Section with enhanced features */}
          <TradeHistory
            history={tradeHistory}
            loading={refreshing}
            message={historyMessage}
            error={historyError}
            onRetry={handleRefresh}
            summary={historySummary}
            filters={historyFilters}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>
    </div>
  );
}

export default Account;
