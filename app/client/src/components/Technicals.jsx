import React from 'react';
import Progress from './Progress';
import { cn } from '../lib/utils';
import { Activity, ArrowUpCircle, ArrowDownCircle, Target } from 'lucide-react';

const PIVOT_DATA = [
  { key: "R3", label: "R3", type: "resistance" },
  { key: "R2", label: "R2", type: "resistance" },
  { key: "R1", label: "R1", type: "resistance" },
  { key: "pivot", label: "Pivot", type: "pivot" },
  { key: "S1", label: "S1", type: "support" },
  { key: "S2", label: "S2", type: "support" },
  { key: "S3", label: "S3", type: "support" },
];

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
  // Safely parse percentages
  const bullishPercent = parseFloat(data?.percent_bullish) || 0;
  const bearishPercent = parseFloat(data?.percent_bearish) || 0;
  
  // Determine overall sentiment
  const sentiment = bullishPercent > bearishPercent ? 'bullish' : bullishPercent < bearishPercent ? 'bearish' : 'neutral';

  return (
    <div className="card animate-fade-in">
      {/* Header */}
      <div className="card-header border-b border-border">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg shadow-lg",
            sentiment === 'bullish' && "bg-gradient-to-br from-success to-success/70 shadow-success/20",
            sentiment === 'bearish' && "bg-gradient-to-br from-destructive to-destructive/70 shadow-destructive/20",
            sentiment === 'neutral' && "bg-gradient-to-br from-primary to-primary/70 shadow-primary/20"
          )}>
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="card-title">Technical Analysis</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Sentiment & pivot points</p>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="card-content pt-6 space-y-8">
        {/* Sentiment Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Target className="h-4 w-4" />
            Market Sentiment
          </div>
          
          {/* Sentiment Meters */}
          <div className="space-y-4">
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
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold",
              sentiment === 'bullish' && "bg-success/10 text-success",
              sentiment === 'bearish' && "bg-destructive/10 text-destructive",
              sentiment === 'neutral' && "bg-muted text-muted-foreground"
            )}>
              {sentiment === 'bullish' && <ArrowUpCircle className="h-4 w-4" />}
              {sentiment === 'bearish' && <ArrowDownCircle className="h-4 w-4" />}
              {sentiment === 'neutral' && <Target className="h-4 w-4" />}
              {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Sentiment
            </div>
          </div>
        </div>
        
        {/* Pivot Points Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Activity className="h-4 w-4" />
            Pivot Points
          </div>
          
          {/* Pivot Points Table */}
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="table">
              <thead className="table-header bg-muted/50">
                <tr className="table-row">
                  <th className="table-head text-center">Level</th>
                  <th className="table-head text-center">Type</th>
                  <th className="table-head text-right">Price</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {PIVOT_DATA.map((item) => (
                  <tr key={item.key} className="table-row">
                    <td className={cn(
                      "table-cell text-center font-semibold",
                      item.type === 'resistance' && "text-success",
                      item.type === 'support' && "text-destructive",
                      item.type === 'pivot' && "text-primary"
                    )}>
                      {item.label}
                    </td>
                    <td className="table-cell text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                        item.type === 'resistance' && "bg-success/10 text-success",
                        item.type === 'support' && "bg-destructive/10 text-destructive",
                        item.type === 'pivot' && "bg-primary/10 text-primary"
                      )}>
                        {item.type === 'resistance' && <ArrowUpCircle className="h-3 w-3" />}
                        {item.type === 'support' && <ArrowDownCircle className="h-3 w-3" />}
                        {item.type === 'pivot' && <Target className="h-3 w-3" />}
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                    </td>
                    <td className="table-cell text-right tabular-nums font-mono text-sm">
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
  );
}

export default Technicals;
