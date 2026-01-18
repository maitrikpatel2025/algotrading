import React from 'react';
import BotStatus from '../components/BotStatus';
import Headlines from '../components/Headlines';
import { TrendingUp, BarChart3, Zap } from 'lucide-react';

function Monitor() {
  return (
    <div className="py-8 space-y-8 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Zap className="h-3 w-3" />
                Real-time Trading
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Monitor</span>
              </h1>
              <p className="text-slate-400 max-w-xl">
                Real-time monitoring of trading bot status and market news. Stay updated with live bot activity and breaking market headlines.
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-lg bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Market</p>
                  <p className="text-sm font-semibold text-white">Open</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Session</p>
                  <p className="text-sm font-semibold text-white">London</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
  );
}

export default Monitor;
