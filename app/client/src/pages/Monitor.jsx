import React from 'react';
import BotStatus from '../components/BotStatus';
import Headlines from '../components/Headlines';
import { TrendingUp, BarChart3 } from 'lucide-react';

/**
 * Monitor Page - Precision Swiss Design System
 *
 * Clean layout with no gradient hero section.
 * Bot status cards with left-border status indicators.
 * KPI cards for quick stats.
 */

function Monitor() {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-neutral-50 animate-fade-in">
      <div className="container-swiss py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="heading-1">Monitor</h1>
            <p className="body-sm mt-1">Real-time bot status and market news</p>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-3">
            <div className="card flex items-center gap-3 !py-3 !px-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success-light">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Market</p>
                <p className="text-sm font-semibold text-neutral-900">Open</p>
              </div>
            </div>
            <div className="card flex items-center gap-3 !py-3 !px-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-light">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Session</p>
                <p className="text-sm font-semibold text-neutral-900">London</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bot Status Card */}
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
