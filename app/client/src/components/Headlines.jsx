import React, { useEffect, useState } from 'react';
import endPoints from '../app/api';
import Headline from './Headline';
import { Newspaper, RefreshCw } from 'lucide-react';

function Headlines() {
  const [headlines, setHeadlines] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHeadlines();
  }, []);

  const loadHeadlines = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const data = await endPoints.headlines();
      setHeadlines(data?.headlines || []);
    } catch (error) {
      console.error('Error loading headlines:', error);
      setHeadlines([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="card animate-fade-in">
        <div className="card-header border-b border-border">
          <div className="flex items-center gap-3">
            <div className="skeleton h-10 w-10 rounded-lg" />
            <div className="skeleton h-6 w-32" />
          </div>
        </div>
        <div className="card-content pt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      {/* Header */}
      <div className="card-header border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-info to-info/70 shadow-lg shadow-info/20">
              <Newspaper className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="card-title">Market Headlines</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Latest forex news</p>
            </div>
          </div>
          <button 
            onClick={() => loadHeadlines(true)}
            disabled={refreshing}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            aria-label="Refresh headlines"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="card-content pt-4">
        {headlines && headlines.length > 0 ? (
          <div className="divide-y divide-border/50">
            {headlines.map((item, index) => (
              <Headline data={item} key={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No headlines available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Headlines;
