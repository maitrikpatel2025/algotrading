import { useState, useEffect, useCallback, useRef } from 'react';
import endPoints from '../app/api';

// localStorage key for watchlist
const WATCHLIST_KEY = 'forex_dash_price_feed_watchlist';
const DEFAULT_WATCHLIST = ['EUR_USD', 'GBP_USD', 'USD_JPY'];
const MAX_WATCHLIST_SIZE = 10;
const POLL_INTERVAL = 2000; // 2 seconds

/**
 * Custom hook for price feed data fetching and state management
 *
 * Features:
 * - Watchlist persistence in localStorage
 * - 2-second polling for price updates
 * - Price change tracking for flash animations
 * - Latency calculation from response timestamps
 */
export function usePriceFeed() {
  // Watchlist state (persisted to localStorage)
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.slice(0, MAX_WATCHLIST_SIZE) : DEFAULT_WATCHLIST;
      }
    } catch (e) {
      console.warn('Failed to load watchlist from localStorage:', e);
    }
    return DEFAULT_WATCHLIST;
  });

  // Price data state
  const [prices, setPrices] = useState({});
  const [previousPrices, setPreviousPrices] = useState({});
  const [priceChanges, setPriceChanges] = useState({}); // 'up', 'down', or null

  // Status state
  const [isLoading, setIsLoading] = useState(true);
  const [latencyMs, setLatencyMs] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  // Refs for tracking
  const pollIntervalRef = useRef(null);
  const requestStartTimeRef = useRef(null);

  // Save watchlist to localStorage
  const saveWatchlist = useCallback((newWatchlist) => {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newWatchlist));
    } catch (e) {
      console.warn('Failed to save watchlist to localStorage:', e);
    }
  }, []);

  // Add a pair to watchlist
  const addPair = useCallback((pair) => {
    setWatchlist((prev) => {
      if (prev.includes(pair)) return prev;
      if (prev.length >= MAX_WATCHLIST_SIZE) {
        console.warn(`Watchlist limit reached (${MAX_WATCHLIST_SIZE} pairs)`);
        return prev;
      }
      const updated = [...prev, pair];
      saveWatchlist(updated);
      return updated;
    });
  }, [saveWatchlist]);

  // Remove a pair from watchlist
  const removePair = useCallback((pair) => {
    setWatchlist((prev) => {
      const updated = prev.filter((p) => p !== pair);
      saveWatchlist(updated);
      return updated;
    });
  }, [saveWatchlist]);

  // Fetch price data for all pairs in watchlist
  const fetchPrices = useCallback(async () => {
    if (watchlist.length === 0) {
      setPrices({});
      setIsLoading(false);
      return;
    }

    requestStartTimeRef.current = performance.now();

    try {
      const response = await endPoints.spreads(watchlist);
      const requestEndTime = performance.now();

      // Calculate latency
      const latency = Math.round(requestEndTime - requestStartTimeRef.current);
      setLatencyMs(latency);

      if (response && response.spreads) {
        // Store previous prices for change detection
        setPreviousPrices(prices);

        // Build new prices object
        const newPrices = {};
        const changes = {};

        response.spreads.forEach((item) => {
          newPrices[item.pair] = {
            pair: item.pair,
            bid: item.bid,
            ask: item.ask,
            spread: item.spread,
            high: item.high,
            low: item.low,
            timestamp: item.timestamp,
            error: item.error,
          };

          // Detect price changes for flash animation
          const prevPrice = prices[item.pair];
          if (prevPrice && item.bid !== undefined && prevPrice.bid !== undefined) {
            if (item.bid > prevPrice.bid) {
              changes[item.pair] = 'up';
            } else if (item.bid < prevPrice.bid) {
              changes[item.pair] = 'down';
            }
          }
        });

        setPrices(newPrices);
        setPriceChanges(changes);

        // Clear changes after animation duration
        setTimeout(() => {
          setPriceChanges({});
        }, 500);

        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError('Failed to fetch price data');
    } finally {
      setIsLoading(false);
    }
  }, [watchlist, prices]);

  // Calculate change from previous day (mock calculation based on high/low)
  const calculateChange = useCallback((pair) => {
    const priceData = prices[pair];
    if (!priceData || priceData.bid === undefined || priceData.high === undefined) {
      return { pips: null, percent: null };
    }

    // Estimate daily open as midpoint of high/low (simplified)
    const estimatedOpen = (priceData.high + priceData.low) / 2;
    const currentMid = (priceData.bid + priceData.ask) / 2;

    // Calculate change
    const isJpyPair = pair.includes('JPY');
    const pipMultiplier = isJpyPair ? 100 : 10000;

    const changePips = (currentMid - estimatedOpen) * pipMultiplier;
    const changePercent = ((currentMid - estimatedOpen) / estimatedOpen) * 100;

    return {
      pips: Math.round(changePips * 10) / 10,
      percent: Math.round(changePercent * 100) / 100,
    };
  }, [prices]);

  // Setup polling
  useEffect(() => {
    // Initial fetch
    fetchPrices();

    // Setup polling interval
    pollIntervalRef.current = setInterval(fetchPrices, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchPrices]);

  return {
    // Data
    watchlist,
    prices,
    previousPrices,
    priceChanges,

    // Actions
    addPair,
    removePair,
    calculateChange,

    // Status
    isLoading,
    latencyMs,
    lastUpdated,
    error,

    // Constants
    maxWatchlistSize: MAX_WATCHLIST_SIZE,
  };
}

export default usePriceFeed;
