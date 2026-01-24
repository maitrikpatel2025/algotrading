import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowUpDown,
  FlaskConical,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3
} from 'lucide-react';
import { cn } from '../lib/utils';
import endPoints from '../app/api';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import BacktestConfigurationDialog from '../components/BacktestConfigurationDialog';

/**
 * BacktestLibrary Page
 *
 * Library view for managing backtests with filtering, sorting, and CRUD operations.
 */

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-neutral-500',
    bg: 'bg-neutral-100'
  },
  running: {
    label: 'Running',
    icon: Loader2,
    color: 'text-primary',
    bg: 'bg-primary-light',
    animate: true
  },
  cancelling: {
    label: 'Cancelling',
    icon: Loader2,
    color: 'text-warning',
    bg: 'bg-warning-light',
    animate: true
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-success',
    bg: 'bg-success/10'
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    color: 'text-danger',
    bg: 'bg-danger-light'
  }
};

function BacktestLibrary() {
  const navigate = useNavigate();

  // State
  const [backtests, setBacktests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openMenuId, setOpenMenuId] = useState(null);

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Configuration dialog state
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [editingBacktest, setEditingBacktest] = useState(null);
  const [strategies, setStrategies] = useState([]);

  // Load backtests
  const loadBacktests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await endPoints.listBacktests();
      setBacktests(data.backtests || []);
    } catch (error) {
      console.error('Error loading backtests:', error);
      showToast('Failed to load backtests', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBacktests();
    loadStrategies();
  }, [loadBacktests, loadStrategies]);

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

  // Poll for updates if any backtest is running
  useEffect(() => {
    const hasRunning = backtests.some(b => b.status === 'running' || b.status === 'cancelling');
    if (hasRunning) {
      const interval = setInterval(loadBacktests, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [backtests, loadBacktests]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Navigation handlers
  const handleNewBacktest = () => {
    setEditingBacktest(null);
    setConfigDialogOpen(true);
  };

  const handleEditBacktest = (id) => {
    // When clicking a backtest card, navigate to dashboard
    navigate(`/backtests/${id}`);
  };

  const handleEditConfiguration = (backtest, e) => {
    if (e) e.stopPropagation();
    setEditingBacktest(backtest);
    setConfigDialogOpen(true);
    setOpenMenuId(null);
  };

  // Backtest actions
  const handleDuplicate = async (backtest) => {
    try {
      const result = await endPoints.duplicateBacktest(backtest.id);
      if (result.success) {
        showToast(`Backtest duplicated as "${result.backtest_name}"`);
        loadBacktests();
      } else {
        showToast(result.error || 'Failed to duplicate backtest', 'error');
      }
    } catch (error) {
      console.error('Error duplicating backtest:', error);
      showToast('Failed to duplicate backtest', 'error');
    }
    setOpenMenuId(null);
  };

  const handleDeleteClick = (backtest) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Backtest',
      message: `Are you sure you want to delete "${backtest.name}"? This action cannot be undone.`,
      variant: 'danger',
      actions: [
        {
          label: 'Delete',
          variant: 'danger',
          onClick: () => handleDeleteConfirm(backtest.id)
        }
      ]
    });
    setOpenMenuId(null);
  };

  const handleDeleteConfirm = async (id) => {
    try {
      const result = await endPoints.deleteBacktest(id);
      if (result.success) {
        showToast('Backtest deleted');
        loadBacktests();
      } else {
        showToast(result.error || 'Failed to delete backtest', 'error');
      }
    } catch (error) {
      console.error('Error deleting backtest:', error);
      showToast('Failed to delete backtest', 'error');
    }
    setConfirmDialog({ isOpen: false });
  };

  // Handle save configuration from dialog
  const handleSaveConfig = async (backtestData) => {
    try {
      const result = await endPoints.saveBacktest(backtestData);

      if (result.success) {
        showToast('Backtest saved');
        setConfigDialogOpen(false);
        loadBacktests();
      } else {
        showToast(result.error || 'Failed to save backtest', 'error');
      }
    } catch (error) {
      console.error('Error saving backtest:', error);
      showToast('Failed to save backtest', 'error');
    }
  };

  // Handle save and run from dialog
  const handleSaveAndRun = async (backtestData) => {
    try {
      const result = await endPoints.saveBacktest(backtestData);

      if (result.success) {
        showToast('Backtest saved');
        setConfigDialogOpen(false);
        // Navigate to dashboard page
        const backtestId = result.backtest?.id || backtestData.id;
        navigate(`/backtests/${backtestId}`);
      } else {
        showToast(result.error || 'Failed to save backtest', 'error');
      }
    } catch (error) {
      console.error('Error saving backtest:', error);
      showToast('Failed to save backtest', 'error');
    }
  };

  // Filter and sort backtests
  const filteredBacktests = backtests
    .filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.strategy_name && b.strategy_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'updated':
        default:
          return new Date(b.updated_at) - new Date(a.updated_at);
      }
    });

  // Format date range
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    const symbols = { USD: '$', EUR: '\u20ac', GBP: '\u00a3' };
    return `${symbols[currency] || '$'}${amount.toLocaleString()}`;
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
            <p className="text-neutral-500 font-medium">Loading backtests...</p>
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
          <div>
            <h1 className="heading-1">Backtests</h1>
            <p className="body-sm mt-1">Manage your backtests</p>
          </div>

          <button
            onClick={handleNewBacktest}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Backtest
          </button>
        </div>

        {/* Filters Card */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search backtests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-md">
              {[
                { value: 'all', label: 'All' },
                { value: 'pending', label: 'Pending' },
                { value: 'running', label: 'Running' },
                { value: 'completed', label: 'Completed' },
                { value: 'failed', label: 'Failed' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterStatus(option.value)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded transition-colors",
                    filterStatus === option.value
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-neutral-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
              >
                <option value="updated">Last Modified</option>
                <option value="created">Date Created</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Backtests Grid */}
        {filteredBacktests.length === 0 ? (
          <div className="card">
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="p-4 rounded-full bg-neutral-100 mb-4">
                <FlaskConical className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'No backtests found' : 'No backtests yet'}
              </h3>
              <p className="text-neutral-500 max-w-sm mb-6">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first backtest to validate your trading strategy'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <button
                  onClick={handleNewBacktest}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Backtest
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBacktests.map((backtest) => {
              const statusConfig = STATUS_CONFIG[backtest.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={backtest.id}
                  className="card group hover:border-primary transition-colors cursor-pointer"
                  onClick={() => handleEditBacktest(backtest.id)}
                >
                  <div className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-neutral-900 truncate group-hover:text-primary transition-colors">
                          {backtest.name}
                        </h3>
                        {backtest.strategy_name && (
                          <p className="text-sm text-neutral-500 truncate">
                            {backtest.strategy_name}
                          </p>
                        )}
                      </div>

                      {/* Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === backtest.id ? null : backtest.id);
                          }}
                          className="p-1.5 rounded-md hover:bg-neutral-100 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="h-4 w-4 text-neutral-400" />
                        </button>

                        {openMenuId === backtest.id && (
                          <div
                            className="absolute right-0 top-8 z-50 bg-white border border-neutral-200 rounded-md shadow-elevated py-1 min-w-[140px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => handleEditConfiguration(backtest, e)}
                              className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit Configuration
                            </button>
                            <button
                              onClick={() => handleDuplicate(backtest)}
                              className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                            >
                              <Copy className="h-4 w-4" />
                              Duplicate
                            </button>
                            <hr className="my-1 border-neutral-200" />
                            <button
                              onClick={() => handleDeleteClick(backtest)}
                              className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-danger-light flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium",
                      statusConfig.bg,
                      statusConfig.color
                    )}>
                      <StatusIcon className={cn("h-3 w-3", statusConfig.animate && "animate-spin")} />
                      {statusConfig.label}
                    </div>

                    {/* Results Preview for Completed Backtests */}
                    {backtest.status === 'completed' && backtest.results && (
                      <div className="grid grid-cols-3 gap-2 p-2 bg-neutral-50 rounded-md">
                        {/* ROI */}
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {(backtest.results.return_on_investment || 0) >= 0 ? (
                              <TrendingUp className="h-3 w-3 text-success" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-danger" />
                            )}
                          </div>
                          <p className={cn(
                            "text-sm font-semibold tabular-nums",
                            (backtest.results.return_on_investment || 0) >= 0 ? "text-success" : "text-danger"
                          )}>
                            {(backtest.results.return_on_investment || 0) >= 0 ? '+' : ''}
                            {(backtest.results.return_on_investment || 0).toFixed(1)}%
                          </p>
                          <p className="text-[10px] text-neutral-500 uppercase">ROI</p>
                        </div>
                        {/* Win Rate */}
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Target className="h-3 w-3 text-neutral-400" />
                          </div>
                          <p className={cn(
                            "text-sm font-semibold tabular-nums",
                            (backtest.results.win_rate || 0) >= 50 ? "text-success" :
                            (backtest.results.win_rate || 0) < 40 ? "text-danger" : "text-neutral-900"
                          )}>
                            {(backtest.results.win_rate || 0).toFixed(1)}%
                          </p>
                          <p className="text-[10px] text-neutral-500 uppercase">Win</p>
                        </div>
                        {/* Total Trades */}
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <BarChart3 className="h-3 w-3 text-neutral-400" />
                          </div>
                          <p className="text-sm font-semibold tabular-nums text-neutral-900">
                            {backtest.results.total_trades || 0}
                          </p>
                          <p className="text-[10px] text-neutral-500 uppercase">Trades</p>
                        </div>
                      </div>
                    )}

                    {/* Info */}
                    <div className="space-y-2 text-xs text-neutral-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDateRange(backtest.start_date, backtest.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>{formatCurrency(backtest.initial_balance, backtest.currency)}</span>
                      </div>
                    </div>

                    {/* Description */}
                    {backtest.description && (
                      <p className="text-sm text-neutral-500 line-clamp-2">
                        {backtest.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="pt-3 border-t border-neutral-100">
                      <p className="text-xs text-neutral-400">
                        Updated {new Date(backtest.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ isOpen: false })}
          title={confirmDialog.title}
          message={confirmDialog.message}
          actions={confirmDialog.actions}
          variant={confirmDialog.variant}
        />

        {/* Toast */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}

        {/* Configuration Dialog */}
        <BacktestConfigurationDialog
          isOpen={configDialogOpen}
          onClose={() => setConfigDialogOpen(false)}
          onSave={handleSaveConfig}
          onSaveAndRun={handleSaveAndRun}
          editingBacktest={editingBacktest}
          strategies={strategies}
        />
      </div>
    </div>
  );
}

export default BacktestLibrary;
