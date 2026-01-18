import React, { useEffect, useState } from 'react';
import endPoints from '../app/api';
import OpenTrades from '../components/OpenTrades';
import TradeHistory from '../components/TradeHistory';
import { Briefcase, RefreshCw } from 'lucide-react';

function Account() {
  const [openTrades, setOpenTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [historyMessage, setHistoryMessage] = useState(null);
  const [historyError, setHistoryError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
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

      // Fetch data with Promise.allSettled to handle failures independently
      const [tradesResult, historyResult] = await Promise.allSettled([
        endPoints.openTrades(),
        Promise.race([endPoints.tradeHistory(), timeoutPromise])
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
          setHistoryMessage(historyResponse.message || null);
        } else {
          setTradeHistory([]);
          setHistoryError(historyResponse?.error || 'Failed to load trade history');
        }
      } else {
        // Handle timeout or network error
        setTradeHistory([]);
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
      setHistoryError('An unexpected error occurred.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadData(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="py-8 animate-fade-in">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium">Loading account data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-h2 text-foreground">Account</h1>
              <p className="text-muted-foreground">
                View your open trades and trade history
              </p>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-outline flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Open Trades Section */}
        <OpenTrades trades={openTrades} loading={refreshing} />

        {/* Trade History Section */}
        <TradeHistory
          history={tradeHistory}
          loading={refreshing}
          message={historyMessage}
          error={historyError}
          onRetry={handleRefresh}
        />
      </div>
    </div>
  );
}

export default Account;
