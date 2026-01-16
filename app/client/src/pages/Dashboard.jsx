import React, { useEffect, useState } from 'react';
import endPoints from '../app/api';
import { COUNTS } from '../app/data';
import Button from '../components/Button';
import PriceChart from '../components/PriceChart';
import Select from '../components/Select';
import Technicals from '../components/Technicals';
import { Play, RefreshCw, BarChart3 } from 'lucide-react';

function Dashboard() {
  const [selectedPair, setSelectedPair] = useState(null);
  const [selectedGran, setSelectedGran] = useState(null);
  const [technicalsData, setTechnicalsData] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [selectedCount, setSelectedCount] = useState(COUNTS[0].value);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    loadOptions();
  }, []);

  const handleCountChange = (count) => {
    setSelectedCount(count);
    loadPrices(count);
  };

  const loadOptions = async () => {
    const data = await endPoints.options();
    setOptions(data);
    setSelectedGran(data.granularities[0].value);
    setSelectedPair(data.pairs[0].value);
    setLoading(false);
  };

  const loadPrices = async (count) => {
    const data = await endPoints.prices(selectedPair, selectedGran, count);
    setPriceData(data);
  };

  const loadTechnicals = async () => {
    setLoadingData(true);
    try {
      const data = await endPoints.technicals(selectedPair, selectedGran);
      setTechnicalsData(data);
      await loadPrices(selectedCount);
    } finally {
      setLoadingData(false);
    }
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
          <p className="text-muted-foreground font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-h2 text-foreground">Trading Dashboard</h1>
          <p className="text-muted-foreground">
            Analyze currency pairs with technical indicators and live charts
          </p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 flex-wrap">
          {/* Pair & Granularity Selectors */}
          <div className="flex flex-wrap items-end gap-4">
            <Select 
              name="Currency"
              title="Currency Pair"
              options={options.pairs}
              defaultValue={selectedPair}
              onSelected={setSelectedPair}
              className="w-40"
            />
            <Select 
              name="Granularity"
              title="Timeframe"
              options={options.granularities}
              defaultValue={selectedGran}
              onSelected={setSelectedGran}
              className="w-32"
            />
          </div>
          
          {/* Load Button */}
          <Button 
            text={loadingData ? "Loading..." : "Load Data"}
            handleClick={() => loadTechnicals()}
            disabled={loadingData}
            icon={loadingData ? RefreshCw : Play}
            className={loadingData ? "[&_svg]:animate-spin" : ""}
          />
        </div>
        
        {/* Selected Info Badge */}
        {selectedPair && selectedGran && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>
                Analyzing <span className="font-semibold text-foreground">{selectedPair}</span> on{' '}
                <span className="font-semibold text-foreground">{selectedGran}</span> timeframe
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      {(technicalsData || priceData) ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Technicals - Sidebar on large screens */}
          {technicalsData && (
            <div className="xl:col-span-1 xl:order-2">
              <Technicals data={technicalsData} />
            </div>
          )}
          
          {/* Price Chart - Main area */}
          {priceData && (
            <div className="xl:col-span-2 xl:order-1">
              <PriceChart
                selectedCount={selectedCount}
                selectedPair={selectedPair}
                selectedGranularity={selectedGran}
                handleCountChange={handleCountChange}
                priceData={priceData}
              />
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="card">
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ready to Analyze
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Select a currency pair and timeframe above, then click "Load Data" to view technical analysis and price charts.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Real-time data
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Technical indicators
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
