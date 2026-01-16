import React, { useEffect } from 'react';
import Select from './Select';
import { COUNTS } from '../app/data';
import { drawChart } from '../app/chart';
import { LineChart } from 'lucide-react';

function PriceChart({ 
  priceData, 
  selectedPair, 
  selectedGranularity,
  selectedCount, 
  handleCountChange 
}) {
  useEffect(() => {
    if (priceData) {
      drawChart(priceData, selectedPair, selectedGranularity, 'chartDiv');
    }
  }, [priceData, selectedPair, selectedGranularity]);
  
  return (
    <div className="card animate-fade-in">
      {/* Header */}
      <div className="card-header border-b border-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/20">
              <LineChart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="card-title">Price Chart</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedPair} • {selectedGranularity}
              </p>
            </div>
          </div>
          
          {/* Chart Controls */}
          <div className="flex items-center gap-3">
            <Select
              name="numrows"
              title="Candles"
              options={COUNTS}
              defaultValue={selectedCount}
              onSelected={handleCountChange}
              hideLabel
              className="w-24"
            />
          </div>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="p-4">
        <div 
          id="chartDiv" 
          className="w-full rounded-lg bg-muted/30 min-h-[500px]"
          style={{ height: 'calc(100vh - 450px)' }}
        />
      </div>
    </div>
  );
}

export default PriceChart;
