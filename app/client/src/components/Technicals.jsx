import React, { useState } from 'react';
import Progress from './Progress';
import { cn } from '../lib/utils';
import { Activity, ArrowUpCircle, ArrowDownCircle, Target, ChevronDown, ChevronUp } from 'lucide-react';

const PIVOT_DATA = [
  { key: "R3", label: "R3", type: "resistance" },
  { key: "R2", label: "R2", type: "resistance" },
  { key: "R1", label: "R1", type: "resistance" },
  { key: "pivot", label: "Pivot", type: "pivot" },
  { key: "S1", label: "S1", type: "support" },
  { key: "S2", label: "S2", type: "support" },
  { key: "S3", label: "S3", type: "support" },
];

// localStorage key for persisting collapsed state
const TECHNICALS_COLLAPSED_KEY = 'forex_dash_technicals_collapsed';

/**
 * Safely format a number value to fixed decimal places
 * @param {any} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted value or '-' if invalid
 */
function formatPrice(value, decimals = 5) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  // Try to convert to number if it's a string
  const num = typeof value === 'number' ? value : parseFloat(value);

  // Check if it's a valid number
  if (isNaN(num)) {
    return '-';
  }

  return num.toFixed(decimals);
}

function Technicals({ data }) {
  // Collapsed state - defaults to collapsed for maximum chart space
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(TECHNICALS_COLLAPSED_KEY);
      // Default to collapsed (true) unless explicitly set to 'false'
      return stored === 'false' ? false : true;
    } catch {
      return true;
    }
  });

  // Toggle collapsed state and persist
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    try {
      localStorage.setItem(TECHNICALS_COLLAPSED_KEY, String(newState));
    } catch {
      // Ignore storage errors
    }
  };

  // Safely parse percentages
  const bullishPercent = parseFloat(data?.percent_bullish) || 0;
  const bearishPercent = parseFloat(data?.percent_bearish) || 0;

  // Determine overall sentiment
  const sentiment = bullishPercent > bearishPercent ? 'bullish' : bullishPercent < bearishPercent ? 'bearish' : 'neutral';

  return (
    <div className="animate-fade-in">
      {/* Collapsible Header Bar */}
      <button
        type="button"
        onClick={toggleCollapsed}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2.5 bg-card border border-border rounded-lg transition-all hover:bg-muted/50",
          !isCollapsed && "rounded-b-none border-b-0"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md shadow-sm",
            sentiment === 'bullish' && "bg-success/10 text-success",
            sentiment === 'bearish' && "bg-destructive/10 text-destructive",
            sentiment === 'neutral' && "bg-primary/10 text-primary"
          )}>
            <Activity className="h-4 w-4" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-foreground">Technical Analysis</h3>
            <p className="text-xs text-muted-foreground">
              {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} · {bullishPercent.toFixed(0)}% Bull / {bearishPercent.toFixed(0)}% Bear
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick sentiment indicator when collapsed */}
          {isCollapsed && (
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
              sentiment === 'bullish' && "bg-success/10 text-success",
              sentiment === 'bearish' && "bg-destructive/10 text-destructive",
              sentiment === 'neutral' && "bg-muted text-muted-foreground"
            )}>
              {sentiment === 'bullish' && <ArrowUpCircle className="h-3 w-3" />}
              {sentiment === 'bearish' && <ArrowDownCircle className="h-3 w-3" />}
              {sentiment === 'neutral' && <Target className="h-3 w-3" />}
              {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
            </div>
          )}

          {isCollapsed ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          isCollapsed ? "max-h-0" : "max-h-[600px]"
        )}
      >
        <div className="bg-card border border-t-0 border-border rounded-b-lg">
          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Sentiment Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Target className="h-3.5 w-3.5" />
                Market Sentiment
              </div>

              {/* Sentiment Meters */}
              <div className="space-y-3">
                <Progress
                  title="Bullish"
                  percentage={bullishPercent}
                />
                <Progress
                  title="Bearish"
                  percentage={bearishPercent}
                />
              </div>

              {/* Sentiment Summary Badge */}
              <div className="flex justify-center">
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
                  sentiment === 'bullish' && "bg-success/10 text-success",
                  sentiment === 'bearish' && "bg-destructive/10 text-destructive",
                  sentiment === 'neutral' && "bg-muted text-muted-foreground"
                )}>
                  {sentiment === 'bullish' && <ArrowUpCircle className="h-3.5 w-3.5" />}
                  {sentiment === 'bearish' && <ArrowDownCircle className="h-3.5 w-3.5" />}
                  {sentiment === 'neutral' && <Target className="h-3.5 w-3.5" />}
                  {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Sentiment
                </div>
              </div>
            </div>

            {/* Pivot Points Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                Pivot Points
              </div>

              {/* Pivot Points Table - Compact */}
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Level</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Type</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {PIVOT_DATA.map((item) => (
                      <tr key={item.key} className="hover:bg-muted/30 transition-colors">
                        <td className={cn(
                          "px-3 py-1.5 text-center text-xs font-semibold",
                          item.type === 'resistance' && "text-success",
                          item.type === 'support' && "text-destructive",
                          item.type === 'pivot' && "text-primary"
                        )}>
                          {item.label}
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                            item.type === 'resistance' && "bg-success/10 text-success",
                            item.type === 'support' && "bg-destructive/10 text-destructive",
                            item.type === 'pivot' && "bg-primary/10 text-primary"
                          )}>
                            {item.type === 'resistance' && <ArrowUpCircle className="h-2.5 w-2.5" />}
                            {item.type === 'support' && <ArrowDownCircle className="h-2.5 w-2.5" />}
                            {item.type === 'pivot' && <Target className="h-2.5 w-2.5" />}
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums font-mono text-xs">
                          {formatPrice(data[item.key])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Technicals;
