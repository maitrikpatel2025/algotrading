import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Play, Edit, BarChart3, Calendar, DollarSign } from 'lucide-react';
import endPoints from '../app/api';
import Toast from '../components/Toast';
import BacktestProgressModal from '../components/BacktestProgressModal';
import ConfirmDialog from '../components/ConfirmDialog';
import BacktestResultsSummary from '../components/BacktestResultsSummary';
import BacktestConfigurationDialog from '../components/BacktestConfigurationDialog';

/**
 * BacktestDashboard Page
 *
 * Dashboard for viewing, executing, and analyzing a backtest.
 * Configuration is done through BacktestConfigurationDialog.
 */

function BacktestDashboard() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Backtest state
  const [backtest, setBacktest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [backtestProgress, setBacktestProgress] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);
  const pollingIntervalRef = useRef(null);

  // Results state
  const [backtestResults, setBacktestResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Configuration dialog state
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [strategies, setStrategies] = useState([]);

  // Polling intervals
  const NORMAL_POLL_INTERVAL = 1500;  // 1.5 seconds
  const PERFORMANCE_POLL_INTERVAL = 5000;  // 5 seconds

  // Load backtest function
  const loadBacktest = useCallback(async () => {
    try {
      setLoading(true);
      const data = await endPoints.getBacktest(id);
      if (data.success && data.backtest) {
        setBacktest(data.backtest);

        // Check if backtest is completed and has results
        if (data.backtest.status === 'completed' && data.backtest.results) {
          setBacktestResults(data.backtest.results);
          setShowResults(true);
        } else if (data.backtest.status === 'running') {
          // If backtest is currently running, start polling
          setIsRunning(true);
          setShowProgressModal(true);
          startProgressPolling(id);
        }
      }
    } catch (error) {
      console.error('Error loading backtest:', error);
      showToast('Failed to load backtest', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load strategies for configuration dialog
  const loadStrategies = useCallback(async () => {
    try {
      const result = await endPoints.listStrategiesExtended();
      if (result.success) {
        setStrategies(result.strategies || []);
      }
    } catch (error) {
      console.error('Error loading strategies:', error);
    }
  }, []);

  // Load backtest on mount
  useEffect(() => {
    if (id) {
      loadBacktest();
      loadStrategies();
    }
  }, [id, loadBacktest, loadStrategies]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Stop polling helper (defined first to avoid circular dependency)
  const clearPollingInterval = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Start polling for progress
  const startProgressPolling = useCallback((backtestId, usePerformanceMode = false) => {
    // Clear any existing interval
    clearPollingInterval();

    const pollInterval = usePerformanceMode ? PERFORMANCE_POLL_INTERVAL : NORMAL_POLL_INTERVAL;

    const pollProgress = async () => {
      try {
        const result = await endPoints.getBacktestProgress(backtestId);
        if (result.success && result.progress) {
          setBacktestProgress(result.progress);

          // Check if completed or failed
          if (result.progress.status === 'completed') {
            clearPollingInterval();
            setIsRunning(false);
            showToast('Backtest completed successfully');
            // Reload the backtest to get the full results
            loadBacktest();
          } else if (result.progress.status === 'failed') {
            clearPollingInterval();
            setIsRunning(false);
            showToast(result.progress.error_message || 'Backtest failed', 'error');
          } else if (result.progress.status === 'pending' && isCancelling) {
            // Cancelled successfully
            clearPollingInterval();
            setIsRunning(false);
            setIsCancelling(false);
            setShowProgressModal(false);
            showToast('Backtest cancelled');
          }
        }
      } catch (error) {
        console.error('Error polling progress:', error);
      }
    };

    // Poll immediately, then at the configured interval
    pollProgress();
    pollingIntervalRef.current = setInterval(pollProgress, pollInterval);
  }, [isCancelling, clearPollingInterval, loadBacktest]);

  // Alias for external use
  const stopProgressPolling = clearPollingInterval;

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopProgressPolling();
    };
  }, [stopProgressPolling]);

  // Handle run backtest
  const handleRunBacktest = async () => {
    if (!id || !backtest) {
      showToast('Backtest not found', 'error');
      return;
    }

    // Validate strategy is selected
    if (!backtest.strategy_id) {
      showToast('Please configure a strategy before running', 'error');
      return;
    }

    try {
      setIsRunning(true);
      setShowProgressModal(true);
      setBacktestProgress({
        backtest_id: id,
        status: 'pending',
        progress_percentage: 0,
        candles_processed: 0,
        total_candles: 0,
        trade_count: 0,
      });

      const result = await endPoints.runBacktest(id);

      if (result.success) {
        startProgressPolling(id);
      } else {
        setIsRunning(false);
        setShowProgressModal(false);
        showToast(result.message || 'Failed to start backtest', 'error');
      }
    } catch (error) {
      console.error('Error running backtest:', error);
      setIsRunning(false);
      setShowProgressModal(false);
      showToast('Failed to start backtest', 'error');
    }
  };

  // Handle cancel button click (show confirmation)
  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  // Handle actual cancel
  const handleCancelBacktest = async (keepPartial = false) => {
    setShowCancelDialog(false);
    setIsCancelling(true);

    try {
      const result = await endPoints.cancelBacktest(id, keepPartial);

      if (result.success) {
        if (result.partial_results_saved) {
          showToast('Backtest cancelled - partial results saved');
        } else {
          showToast('Backtest cancelled');
        }
        stopProgressPolling();
        setIsRunning(false);
        setIsCancelling(false);
        setShowProgressModal(false);
      } else {
        showToast(result.message || 'Failed to cancel backtest', 'error');
        setIsCancelling(false);
      }
    } catch (error) {
      console.error('Error cancelling backtest:', error);
      showToast('Failed to cancel backtest', 'error');
      setIsCancelling(false);
    }
  };

  // Handle close progress modal
  const handleCloseProgressModal = () => {
    if (!isRunning || backtestProgress?.status === 'completed' || backtestProgress?.status === 'failed') {
      stopProgressPolling();
      setShowProgressModal(false);
      setBacktestProgress(null);
    }
  };

  // Handle performance mode change from modal
  const handlePerformanceModeChange = useCallback((enabled) => {
    setPerformanceMode(enabled);
    // Restart polling with new interval if running
    if (isRunning && id) {
      startProgressPolling(id, enabled);
    }
  }, [isRunning, id, startProgressPolling]);

  // Handle edit configuration
  const handleEditConfiguration = () => {
    setShowConfigDialog(true);
  };

  // Handle save configuration from dialog
  const handleSaveConfig = async (backtestData) => {
    try {
      const result = await endPoints.saveBacktest(backtestData);

      if (result.success) {
        showToast('Backtest updated successfully');
        setShowConfigDialog(false);
        // Reload backtest to get updated data
        loadBacktest();
      } else {
        showToast(result.error || 'Failed to update backtest', 'error');
      }
    } catch (error) {
      console.error('Error saving backtest:', error);
      showToast('Failed to update backtest', 'error');
    }
  };

  // Handle save and run from dialog
  const handleSaveAndRun = async (backtestData) => {
    try {
      const result = await endPoints.saveBacktest(backtestData);

      if (result.success) {
        showToast('Backtest updated successfully');
        setShowConfigDialog(false);
        // Reload backtest then run it
        await loadBacktest();
        setTimeout(() => handleRunBacktest(), 500);
      } else {
        showToast(result.error || 'Failed to update backtest', 'error');
      }
    } catch (error) {
      console.error('Error saving backtest:', error);
      showToast('Failed to update backtest', 'error');
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
            <p className="text-neutral-500 font-medium">Loading backtest...</p>
          </div>
        </div>
      </div>
    );
  }

  // Backtest not found
  if (!backtest) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-neutral-50 py-8 animate-fade-in">
        <div className="container-swiss">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <BarChart3 className="h-16 w-16 text-neutral-300" />
            <p className="text-neutral-500 font-medium">Backtest not found</p>
            <button
              onClick={() => navigate('/backtests')}
              className="btn btn-secondary"
            >
              Back to Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-neutral-50 py-8 animate-fade-in">
      <div className="container-swiss">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/backtests')}
              className="p-2 hover:bg-neutral-200 rounded-md transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-600" />
            </button>
            <div>
              <h1 className="heading-1">{backtest.name}</h1>
              <p className="body-sm mt-1 text-neutral-600">
                {backtest.description || 'Backtest Dashboard'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleEditConfiguration}
              disabled={isRunning}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Configuration
            </button>
            {backtest.status !== 'running' && (
              <button
                onClick={handleRunBacktest}
                disabled={isRunning || !backtest.strategy_id}
                className="btn btn-success flex items-center gap-2"
                title={!backtest.strategy_id ? 'Configure a strategy first' : 'Run Backtest'}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Backtest
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Backtest Metadata Card */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm font-medium text-neutral-500 mb-1">Strategy</div>
              <div className="text-base font-semibold text-neutral-900">
                {backtest.strategy_name || 'Not configured'}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-500 mb-1 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date Range
              </div>
              <div className="text-base font-semibold text-neutral-900">
                {formatDate(backtest.start_date)} - {formatDate(backtest.end_date)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-500 mb-1 flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Initial Balance
              </div>
              <div className="text-base font-semibold text-neutral-900">
                {backtest.currency === 'USD' ? '$' : backtest.currency === 'EUR' ? '€' : '£'}
                {backtest.initial_balance?.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-500 mb-1">Status</div>
              <div className="text-base font-semibold">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    backtest.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : backtest.status === 'running'
                      ? 'bg-blue-100 text-blue-800'
                      : backtest.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-neutral-100 text-neutral-800'
                  }`}
                >
                  {backtest.status ? backtest.status.charAt(0).toUpperCase() + backtest.status.slice(1) : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Backtest Results (shown after completion) */}
        {showResults && backtestResults && (
          <BacktestResultsSummary
            results={backtestResults}
            initialBalance={backtest.initial_balance}
          />
        )}

        {/* View Results Button (shown when completed but results hidden) */}
        {backtest.status === 'completed' && backtestResults && !showResults && (
          <button
            onClick={() => setShowResults(true)}
            className="w-full btn btn-secondary flex items-center justify-center gap-2 py-4"
          >
            <BarChart3 className="h-5 w-5" />
            View Results
          </button>
        )}

        {/* Pending State Message */}
        {backtest.status === 'pending' && !isRunning && (
          <div className="card p-8 text-center">
            <BarChart3 className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Ready to Run</h3>
            <p className="text-neutral-600 mb-4">
              Click "Run Backtest" to execute this backtest with your configured settings.
            </p>
          </div>
        )}

        {/* Toast */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}

        {/* Progress Modal */}
        <BacktestProgressModal
          isOpen={showProgressModal}
          onClose={handleCloseProgressModal}
          onCancel={handleCancelClick}
          progress={backtestProgress}
          isCancelling={isCancelling}
          onPerformanceModeChange={handlePerformanceModeChange}
        />

        {/* Cancel Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          title="Cancel Running Backtest?"
          message="Cancel backtest? Partial results will be discarded."
          variant="warning"
          actions={[
            {
              label: 'Continue Running',
              variant: 'secondary',
              onClick: () => setShowCancelDialog(false),
            },
            {
              label: 'Cancel and Keep Partial',
              variant: 'secondary',
              onClick: () => handleCancelBacktest(true),
            },
            {
              label: 'Cancel Backtest',
              variant: 'danger',
              onClick: () => handleCancelBacktest(false),
            },
          ]}
        />

        {/* Configuration Dialog */}
        <BacktestConfigurationDialog
          isOpen={showConfigDialog}
          onClose={() => setShowConfigDialog(false)}
          onSave={handleSaveConfig}
          onSaveAndRun={handleSaveAndRun}
          editingBacktest={backtest}
          strategies={strategies}
        />
      </div>
    </div>
  );
}

export default BacktestDashboard;
