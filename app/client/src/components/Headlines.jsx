import React, { useEffect, useState } from 'react';
import endPoints from '../app/api';
import Headline from './Headline';
import { Newspaper, RefreshCw } from 'lucide-react';

/**
 * Headlines Component - Precision Swiss Design System
 *
 * Clean card layout with no gradients.
 * Simple header with icon, title, and refresh button.
 * Clean divider between headlines.
 */

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

  // Loading skeleton - Precision Swiss Design
  if (loading) {
    return (
      <div className="card animate-fade-in">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-neutral-200 animate-pulse" />
            <div className="h-5 w-32 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-neutral-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      {/* Header - Precision Swiss Design */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-light">
              <Newspaper className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Market Headlines</h3>
              <p className="text-xs text-neutral-500">Latest forex news</p>
            </div>
          </div>
          <button
            onClick={() => loadHeadlines(true)}
            disabled={refreshing}
            className="p-2 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-50"
            aria-label="Refresh headlines"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {headlines && headlines.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {headlines.map((item, index) => (
              <Headline data={item} key={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Newspaper className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
            <p className="text-neutral-500">No headlines available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Headlines;
