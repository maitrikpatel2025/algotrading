import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Calendar, ChevronDown, ChevronUp, Download, BarChart2, Grid, Clock } from 'lucide-react';
import MonthlyPerformanceTable from './MonthlyPerformanceTable';
import DayOfWeekHeatmap from './DayOfWeekHeatmap';
import HourlyPerformanceChart from './HourlyPerformanceChart';
import { exportTimePeriodDataToCSV } from '../app/tradeUtils';

/**
 * PerformanceByTimePeriod Component
 *
 * Comprehensive time-based performance analysis with three sub-sections:
 * - Monthly Performance Table
 * - Day of Week Heatmap
 * - Hour of Day Bar Chart
 *
 * Follows the collapsible section pattern from BacktestResultsSummary.
 */
function PerformanceByTimePeriod({
  monthlyPerformance = [],
  dayOfWeekPerformance = [],
  hourlyPerformance = [],
  dayHourHeatmap = [],
  backtestName = 'backtest',
  currency = '$',
  className,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMonthlyExpanded, setIsMonthlyExpanded] = useState(true);
  const [isDayOfWeekExpanded, setIsDayOfWeekExpanded] = useState(true);
  const [isHourlyExpanded, setIsHourlyExpanded] = useState(true);

  // Check if we have any data to display
  const hasData =
    (monthlyPerformance && monthlyPerformance.length > 0) ||
    (dayOfWeekPerformance && dayOfWeekPerformance.length > 0) ||
    (hourlyPerformance && hourlyPerformance.length > 0);

  // Handle CSV export
  const handleExportCSV = (e) => {
    e.stopPropagation();
    exportTimePeriodDataToCSV(
      monthlyPerformance,
      dayOfWeekPerformance,
      hourlyPerformance,
      backtestName
    );
  };

  // Don't render if no data
  if (!hasData) {
    return null;
  }

  return (
    <div
      className={cn(
        'bg-white border border-neutral-200 rounded-md',
        className
      )}
    >
      {/* Section Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-neutral-500" />
          <h4 className="text-sm font-semibold text-neutral-900">
            Performance by Time Period
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
            >
              <Download className="h-3 w-3" />
              Export CSV
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-neutral-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-neutral-500" />
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Monthly Performance Sub-section */}
          {monthlyPerformance && monthlyPerformance.length > 0 && (
            <div className="border border-neutral-200 rounded-md">
              <div
                className="flex items-center justify-between p-3 border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => setIsMonthlyExpanded(!isMonthlyExpanded)}
              >
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm font-medium text-neutral-900">
                    Monthly Performance
                  </span>
                  <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-neutral-100 text-neutral-600">
                    {monthlyPerformance.length} months
                  </span>
                </div>
                {isMonthlyExpanded ? (
                  <ChevronUp className="h-4 w-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                )}
              </div>
              {isMonthlyExpanded && (
                <div className="p-3">
                  <MonthlyPerformanceTable data={monthlyPerformance} currency={currency} />
                </div>
              )}
            </div>
          )}

          {/* Day of Week Analysis Sub-section */}
          {dayHourHeatmap && dayHourHeatmap.length > 0 && (
            <div className="border border-neutral-200 rounded-md">
              <div
                className="flex items-center justify-between p-3 border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => setIsDayOfWeekExpanded(!isDayOfWeekExpanded)}
              >
                <div className="flex items-center gap-2">
                  <Grid className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm font-medium text-neutral-900">
                    Day of Week Analysis
                  </span>
                </div>
                {isDayOfWeekExpanded ? (
                  <ChevronUp className="h-4 w-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                )}
              </div>
              {isDayOfWeekExpanded && (
                <div className="p-3">
                  <DayOfWeekHeatmap
                    heatmapData={dayHourHeatmap}
                    dayOfWeekData={dayOfWeekPerformance}
                    currency={currency}
                  />
                </div>
              )}
            </div>
          )}

          {/* Hour of Day Analysis Sub-section */}
          {hourlyPerformance && hourlyPerformance.length > 0 && (
            <div className="border border-neutral-200 rounded-md">
              <div
                className="flex items-center justify-between p-3 border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => setIsHourlyExpanded(!isHourlyExpanded)}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm font-medium text-neutral-900">
                    Hour of Day Analysis
                  </span>
                </div>
                {isHourlyExpanded ? (
                  <ChevronUp className="h-4 w-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                )}
              </div>
              {isHourlyExpanded && (
                <div className="p-3">
                  <HourlyPerformanceChart data={hourlyPerformance} currency={currency} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PerformanceByTimePeriod;
