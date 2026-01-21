import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  Download,
  Upload,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Layers
} from 'lucide-react';
import { cn } from '../lib/utils';
import endPoints from '../app/api';
import ConfirmDialog from '../components/ConfirmDialog';
import ImportStrategyDialog from '../components/ImportStrategyDialog';
import Toast from '../components/Toast';

/**
 * Strategy Library Page - Precision Swiss Design System
 *
 * Clean grid layout with card-based strategy items.
 * No gradients, white cards with subtle borders.
 * Primary blue for CTAs only.
 */

function StrategyLibrary() {
  const navigate = useNavigate();

  // State
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated'); // 'updated', 'name', 'created'
  const [filterDirection, setFilterDirection] = useState('all'); // 'all', 'long', 'short', 'both'
  const [openMenuId, setOpenMenuId] = useState(null);

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Load strategies
  const loadStrategies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await endPoints.listStrategiesExtended();
      setStrategies(data.strategies || []);
    } catch (error) {
      console.error('Error loading strategies:', error);
      showToast('Failed to load strategies', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStrategies();
  }, [loadStrategies]);

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
  const handleNewStrategy = () => {
    navigate('/strategies/new');
  };

  const handleEditStrategy = (id) => {
    navigate(`/strategies/${id}/edit`);
  };

  // Strategy actions
  const handleDuplicate = async (strategy) => {
    try {
      const result = await endPoints.duplicateStrategy(strategy.id);
      showToast(`Strategy duplicated as "${result.strategy.name}"`);
      loadStrategies();
      navigate(`/strategies/${result.strategy.id}/edit`);
    } catch (error) {
      console.error('Error duplicating strategy:', error);
      showToast('Failed to duplicate strategy', 'error');
    }
    setOpenMenuId(null);
  };

  const handleExport = async (strategy) => {
    try {
      const exportData = await endPoints.exportStrategy(strategy.id);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
      a.href = url;
      a.download = `strategy_${strategy.name.replace(/[^a-z0-9]/gi, '_')}_${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Strategy exported successfully');
    } catch (error) {
      console.error('Error exporting strategy:', error);
      showToast('Failed to export strategy', 'error');
    }
    setOpenMenuId(null);
  };

  const handleDeleteClick = (strategy) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Strategy',
      message: `Are you sure you want to delete "${strategy.name}"? This action cannot be undone.`,
      variant: 'danger',
      actions: [
        {
          label: 'Delete',
          variant: 'danger',
          onClick: () => handleDeleteConfirm(strategy.id)
        }
      ]
    });
    setOpenMenuId(null);
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await endPoints.deleteStrategy(id);
      showToast('Strategy deleted');
      loadStrategies();
    } catch (error) {
      console.error('Error deleting strategy:', error);
      showToast('Failed to delete strategy', 'error');
    }
    setConfirmDialog({ isOpen: false });
  };

  // Import handlers
  const handleImportSuccess = (importedStrategy) => {
    showToast(`Strategy "${importedStrategy.name}" imported successfully`);
    loadStrategies();
    setImportDialogOpen(false);
  };

  // Filter and sort strategies
  const filteredStrategies = strategies
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesDirection = filterDirection === 'all' || s.trade_direction === filterDirection;
      return matchesSearch && matchesDirection;
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

  // Direction icon helper
  const getDirectionIcon = (direction) => {
    switch (direction) {
      case 'long':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'short':
        return <TrendingDown className="h-4 w-4 text-danger" />;
      case 'both':
      default:
        return <ArrowLeftRight className="h-4 w-4 text-primary" />;
    }
  };

  // Loading state - Precision Swiss Design
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-neutral-50 py-8 animate-fade-in">
        <div className="container-swiss">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-neutral-200 animate-pulse" />
              <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-neutral-500 font-medium">Loading strategies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-neutral-50 py-8 animate-fade-in">
      <div className="container-swiss space-y-6">
        {/* Page Header - Precision Swiss Design */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="heading-1">Strategies</h1>
            <p className="body-sm mt-1">Manage your trading strategies</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setImportDialogOpen(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button
              onClick={handleNewStrategy}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Strategy
            </button>
          </div>
        </div>

        {/* Filters Card - Precision Swiss Design */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search strategies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Direction Filter */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-md">
              {[
                { value: 'all', label: 'All' },
                { value: 'long', label: 'Long' },
                { value: 'short', label: 'Short' },
                { value: 'both', label: 'Both' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterDirection(option.value)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded transition-colors",
                    filterDirection === option.value
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

        {/* Strategy Grid */}
        {filteredStrategies.length === 0 ? (
          <div className="card">
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="p-4 rounded-full bg-neutral-100 mb-4">
                <Layers className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {searchTerm || filterDirection !== 'all' ? 'No strategies found' : 'No strategies yet'}
              </h3>
              <p className="text-neutral-500 max-w-sm mb-6">
                {searchTerm || filterDirection !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first trading strategy to get started'
                }
              </p>
              {!searchTerm && filterDirection === 'all' && (
                <button
                  onClick={handleNewStrategy}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Strategy
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStrategies.map((strategy) => (
              <div
                key={strategy.id}
                className="card group hover:border-primary transition-colors cursor-pointer"
                onClick={() => handleEditStrategy(strategy.id)}
              >
                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 truncate group-hover:text-primary transition-colors">
                        {strategy.name}
                      </h3>
                      {strategy.pair && (
                        <p className="text-sm text-neutral-500">{strategy.pair}</p>
                      )}
                    </div>

                    {/* Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === strategy.id ? null : strategy.id);
                        }}
                        className="p-1.5 rounded-md hover:bg-neutral-100 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="h-4 w-4 text-neutral-400" />
                      </button>

                      {openMenuId === strategy.id && (
                        <div
                          className="absolute right-0 top-8 z-50 bg-white border border-neutral-200 rounded-md shadow-elevated py-1 min-w-[140px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleEditStrategy(strategy.id)}
                            className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDuplicate(strategy)}
                            className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleExport(strategy)}
                            className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Export
                          </button>
                          <hr className="my-1 border-neutral-200" />
                          <button
                            onClick={() => handleDeleteClick(strategy)}
                            className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-danger-light flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {strategy.description && (
                    <p className="text-sm text-neutral-500 line-clamp-2">
                      {strategy.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <div className="flex items-center gap-1">
                      {getDirectionIcon(strategy.trade_direction)}
                      <span className="capitalize">{strategy.trade_direction || 'both'}</span>
                    </div>
                    {strategy.indicator_count > 0 && (
                      <span>{strategy.indicator_count} indicator{strategy.indicator_count !== 1 ? 's' : ''}</span>
                    )}
                    {strategy.condition_count > 0 && (
                      <span>{strategy.condition_count} rule{strategy.condition_count !== 1 ? 's' : ''}</span>
                    )}
                  </div>

                  {/* Tags */}
                  {strategy.tags && strategy.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {strategy.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {strategy.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-neutral-400">
                          +{strategy.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-3 border-t border-neutral-100">
                    <p className="text-xs text-neutral-400">
                      Updated {new Date(strategy.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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

        {/* Import Dialog */}
        <ImportStrategyDialog
          isOpen={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          onImportSuccess={handleImportSuccess}
        />

        {/* Toast */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
      </div>
    </div>
  );
}

export default StrategyLibrary;
