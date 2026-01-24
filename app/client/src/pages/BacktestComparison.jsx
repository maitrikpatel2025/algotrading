import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Download,
  GitCompare
} from 'lucide-react';
import endPoints from '../app/api';
import Toast from '../components/Toast';
import ComparisonMetricsTable from '../components/ComparisonMetricsTable';
import ComparisonEquityCurve from '../components/ComparisonEquityCurve';
import ComparisonStatistics from '../components/ComparisonStatistics';
import ComparisonNotesEditor from '../components/ComparisonNotesEditor';
import ComparisonExportDialog from '../components/ComparisonExportDialog';

/**
 * BacktestComparison Page
 *
 * Side-by-side comparison of 2-4 backtest results with:
 * - Metrics comparison table with best value highlighting
 * - Overlaid equity curves with distinct colors
 * - Statistical significance analysis
 * - Notes editor with localStorage persistence
 * - Export functionality (CSV, JSON, PDF)
 */

// Colors for each backtest in comparison
const COMPARISON_COLORS = [
  { line: '#3b82f6', fill: 'rgba(59, 130, 246, 0.1)', name: 'Blue' },
  { line: '#f97316', fill: 'rgba(249, 115, 22, 0.1)', name: 'Orange' },
  { line: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.1)', name: 'Purple' },
  { line: '#22c55e', fill: 'rgba(34, 197, 94, 0.1)', name: 'Green' },
];

function BacktestComparison() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Parse backtest IDs from URL - memoized to prevent recreation on every render
  const backtestIds = useMemo(() => {
    return searchParams.get('ids')?.split(',').filter(Boolean) || [];
  }, [searchParams]);

  // Load comparison data
  const loadComparison = useCallback(async () => {
    if (backtestIds.length < 2) {
      setError('At least 2 backtests are required for comparison');
      setLoading(false);
      return;
    }

    if (backtestIds.length > 4) {
      setError('Maximum of 4 backtests can be compared');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load notes from localStorage
      const storageKey = `comparison_notes_${[...backtestIds].sort().join('_')}`;
      const savedNotes = localStorage.getItem(storageKey) || '';
      setNotes(savedNotes);

      // Fetch comparison data
      const result = await endPoints.compareBacktests(backtestIds, savedNotes);

      if (result.success && result.comparison) {
        setComparison(result.comparison);
      } else {
        setError(result.error || 'Failed to load comparison data');
      }
    } catch (err) {
      console.error('Error loading comparison:', err);
      setError(err.message || 'Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  }, [backtestIds]);

  useEffect(() => {
    loadComparison();
  }, [loadComparison]);

  // Handle notes change with debounced localStorage save
  const handleNotesChange = useCallback((newNotes) => {
    setNotes(newNotes);

    // Save to localStorage
    const storageKey = `comparison_notes_${[...backtestIds].sort().join('_')}`;
    localStorage.setItem(storageKey, newNotes);
  }, [backtestIds]);

  // Navigate back to library
  const handleBackToLibrary = () => {
    navigate('/backtests');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-neutral-50 py-8 animate-fade-in">
        <div className="container-swiss">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-neutral-200 animate-pulse" />
              <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-neutral-500 font-medium">Loading comparison...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-neutral-50 py-8 animate-fade-in">
        <div className="container-swiss">
          <div className="card">
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="p-4 rounded-full bg-danger-light mb-4">
                <AlertCircle className="h-8 w-8 text-danger" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Comparison Error
              </h3>
              <p className="text-neutral-500 max-w-sm mb-6">
                {error}
              </p>
              <button
                onClick={handleBackToLibrary}
                className="btn btn-primary flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Library
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No comparison data
  if (!comparison || !comparison.backtests || comparison.backtests.length < 2) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-neutral-50 py-8 animate-fade-in">
        <div className="container-swiss">
          <div className="card">
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="p-4 rounded-full bg-neutral-100 mb-4">
                <GitCompare className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                No Comparison Data
              </h3>
              <p className="text-neutral-500 max-w-sm mb-6">
                Select 2-4 completed backtests to compare their results.
              </p>
              <button
                onClick={handleBackToLibrary}
                className="btn btn-primary flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Library
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-neutral-50 py-8 animate-fade-in">
      <div className="container-swiss space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToLibrary}
              className="p-2 rounded-md hover:bg-neutral-100 transition-colors"
              title="Back to Library"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-600" />
            </button>
            <div>
              <h1 className="heading-1 flex items-center gap-2">
                <GitCompare className="h-6 w-6 text-primary" />
                Backtest Comparison
              </h1>
              <p className="body-sm mt-1">
                Comparing {comparison.backtests.length} backtests
              </p>
            </div>
          </div>

          <button
            onClick={() => setExportDialogOpen(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {/* Backtests Overview */}
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-4">
            {comparison.backtests.map((backtest, index) => (
              <div
                key={backtest.id}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-md"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COMPARISON_COLORS[index]?.line }}
                />
                <span className="text-sm font-medium text-neutral-900">
                  {backtest.name}
                </span>
                <span className="text-xs text-neutral-500">
                  {backtest.pair} / {backtest.timeframe}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Comparison Table */}
        <div className="card">
          <div className="p-4 border-b border-neutral-100">
            <h2 className="heading-3">Metrics Comparison</h2>
            <p className="body-sm text-neutral-500">
              Side-by-side comparison of key performance metrics
            </p>
          </div>
          <ComparisonMetricsTable
            backtests={comparison.backtests}
            metricsComparison={comparison.metrics_comparison}
            bestValues={comparison.best_values}
            colors={COMPARISON_COLORS}
          />
        </div>

        {/* Equity Curves */}
        <div className="card">
          <div className="p-4 border-b border-neutral-100">
            <h2 className="heading-3">Equity Curves</h2>
            <p className="body-sm text-neutral-500">
              Overlay of portfolio equity over time
            </p>
          </div>
          <div className="p-4">
            <ComparisonEquityCurve
              backtests={comparison.backtests}
              colors={COMPARISON_COLORS}
            />
          </div>
        </div>

        {/* Statistical Significance */}
        {comparison.statistical_significance && comparison.statistical_significance.length > 0 && (
          <div className="card">
            <div className="p-4 border-b border-neutral-100">
              <h2 className="heading-3">Statistical Significance</h2>
              <p className="body-sm text-neutral-500">
                Analysis of metric differences between backtests
              </p>
            </div>
            <ComparisonStatistics
              statisticalSignificance={comparison.statistical_significance}
            />
          </div>
        )}

        {/* Notes Editor */}
        <div className="card">
          <div className="p-4 border-b border-neutral-100">
            <h2 className="heading-3">Comparison Notes</h2>
            <p className="body-sm text-neutral-500">
              Add observations and analysis notes
            </p>
          </div>
          <ComparisonNotesEditor
            notes={notes}
            onChange={handleNotesChange}
          />
        </div>

        {/* Toast */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}

        {/* Export Dialog */}
        <ComparisonExportDialog
          isOpen={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          backtestIds={backtestIds}
          notes={notes}
        />
      </div>
    </div>
  );
}

export default BacktestComparison;
