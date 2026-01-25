import React from 'react';
import { cn } from '../lib/utils';
import useDashboardData from '../hooks/useDashboardData';
import useDarkMode from '../hooks/useDarkMode';
import {
  AccountMetrics,
  AlertsPanel,
  BotStatusGrid,
  DashboardHeader,
  OpenPositions,
  RecentTrades,
} from '../components/LiveDashboard';
import BotStatus from '../components/BotStatus';
import Headlines from '../components/Headlines';
import { PriceFeedCard } from '../components/PriceFeed';

/**
 * Monitor Page - Live Trading Dashboard
 *
 * Comprehensive dashboard showing real-time trading activity:
 * - Account metrics (Balance, Equity, P/L, Margin)
 * - Bot Status Grid with all bots (replaces ActiveBotsGrid)
 * - Price Feed with real-time forex prices
 * - Open positions table
 * - Recent trades activity feed
 * - System alerts panel
 * - Connection status and auto-refresh (5 seconds)
 * - Dark mode support
 *
 * Precision Swiss Design System
 */
function Monitor() {
  const {
    account,
    openTrades,
    tradeHistory,
    botStatus,
    botsStatus,
    loading,
    isRefreshing,
    connectionStatus,
    lastUpdated,
    refresh,
  } = useDashboardData();

  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <div
      className={cn(
        'min-h-[calc(100vh-8rem)] animate-fade-in transition-colors',
        'bg-neutral-50 dark:bg-neutral-900'
      )}
    >
      <div className="container-swiss py-8 space-y-6">
        {/* Dashboard Header */}
        <DashboardHeader
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          connectionStatus={connectionStatus}
          onRefresh={refresh}
          isDark={isDark}
          onToggleDarkMode={toggleDarkMode}
        />

        {/* Account Metrics - Full Width */}
        <AccountMetrics account={account} loading={loading} />

        {/* Bot Status Grid - Full Width */}
        <BotStatusGrid botsStatus={botsStatus} loading={loading} onRefresh={refresh} />

        {/* Price Feed - Full Width */}
        <PriceFeedCard />

        {/* Main Content Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Alerts */}
          <div className="lg:col-span-1 space-y-6">
            <AlertsPanel
              connectionStatus={connectionStatus}
              botStatus={botStatus}
              account={account}
              loading={loading}
            />
          </div>

          {/* Right Column - Positions and Trades */}
          <div className="lg:col-span-2 space-y-6">
            <OpenPositions trades={openTrades} loading={loading} />
            <RecentTrades history={tradeHistory} loading={loading} />
          </div>
        </div>

        {/* Additional Sections - Bot Controls and Headlines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bot Status Card with Controls */}
          <div className="lg:col-span-1">
            <BotStatus />
          </div>

          {/* Headlines Card */}
          <div className="lg:col-span-2">
            <Headlines />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Monitor;
