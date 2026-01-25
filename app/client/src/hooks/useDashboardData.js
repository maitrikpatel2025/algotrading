import { useState, useEffect, useCallback, useRef } from 'react';
import endPoints from '../app/api';

const DEFAULT_POLL_INTERVAL = 10000; // 10 seconds

/**
 * Custom hook for coordinated dashboard data fetching with polling
 *
 * Fetches account data, open trades, trade history, and bot status
 * with configurable refresh interval and connection status tracking.
 */
export function useDashboardData(pollInterval = DEFAULT_POLL_INTERVAL) {
  // Data state
  const [account, setAccount] = useState(null);
  const [openTrades, setOpenTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [botStatus, setBotStatus] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Connection status: 'connected' | 'reconnecting' | 'disconnected'
  const [connectionStatus, setConnectionStatus] = useState('connected');

  // Last update timestamp
  const [lastUpdated, setLastUpdated] = useState(null);

  // Error tracking for retry logic
  const consecutiveErrors = useRef(0);
  const MAX_CONSECUTIVE_ERRORS = 3;

  // Fetch all dashboard data
  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }

    try {
      // Fetch all data in parallel
      const [accountData, openTradesData, historyData, botData] = await Promise.all([
        endPoints.account().catch(() => null),
        endPoints.openTrades().catch(() => ({ trades: [] })),
        endPoints.tradeHistory().catch(() => ({ trades: [] })),
        endPoints.botStatus().catch(() => null),
      ]);

      // Update state with fetched data
      setAccount(accountData);
      setOpenTrades(openTradesData?.trades || []);
      setTradeHistory(historyData?.trades || []);
      setBotStatus(botData);

      // Reset error count and update connection status
      consecutiveErrors.current = 0;
      setConnectionStatus('connected');
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      consecutiveErrors.current += 1;

      // Update connection status based on consecutive errors
      if (consecutiveErrors.current >= MAX_CONSECUTIVE_ERRORS) {
        setConnectionStatus('disconnected');
      } else {
        setConnectionStatus('reconnecting');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Initial fetch and polling setup
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [fetchData, pollInterval]);

  return {
    // Data
    account,
    openTrades,
    tradeHistory,
    botStatus,

    // Status
    loading,
    isRefreshing,
    connectionStatus,
    lastUpdated,

    // Actions
    refresh,
  };
}

export default useDashboardData;
