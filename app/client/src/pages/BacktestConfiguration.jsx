import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import endPoints from '../app/api';
import StrategySelector from '../components/StrategySelector';
import DateRangePicker from '../components/DateRangePicker';
import PositionSizingForm from '../components/PositionSizingForm';
import RiskManagementForm from '../components/RiskManagementForm';
import RiskPreviewChart from '../components/RiskPreviewChart';
import Toast from '../components/Toast';

/**
 * BacktestConfiguration Page
 *
 * Comprehensive configuration page for creating and editing backtests.
 * Includes strategy selection, date range, initial balance, position sizing,
 * and risk management settings.
 */

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (\u20ac)' },
  { value: 'GBP', label: 'GBP (\u00a3)' },
];

const DEFAULT_FORM_STATE = {
  name: '',
  description: '',
  strategy_id: null,
  strategy_name: null,
  pair: null,
  timeframe: null,
  start_date: '',
  end_date: '',
  initial_balance: 10000,
  currency: 'USD',
  position_sizing: {
    method: 'percentage',
    value: 2,
    leverage: 1,
    max_position_size: null,
    compound: true
  },
  risk_management: {
    stop_loss: { type: 'none', value: null },
    take_profit: { type: 'none', value: null },
    trailing_stop: { type: 'none', value: null, break_even_trigger: null },
    partial_closes: { enabled: false, levels: [] }
  }
};

function BacktestConfiguration() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // Form state
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Load backtest function
  const loadBacktest = useCallback(async () => {
    try {
      setLoading(true);
      const data = await endPoints.getBacktest(id);
      if (data.success && data.backtest) {
        const backtest = data.backtest;
        setFormData({
          name: backtest.name || '',
          description: backtest.description || '',
          strategy_id: backtest.strategy_id,
          strategy_name: backtest.strategy_name,
          pair: backtest.pair,
          timeframe: backtest.timeframe,
          start_date: backtest.start_date ? backtest.start_date.split('T')[0] : '',
          end_date: backtest.end_date ? backtest.end_date.split('T')[0] : '',
          initial_balance: backtest.initial_balance || 10000,
          currency: backtest.currency || 'USD',
          position_sizing: backtest.position_sizing || DEFAULT_FORM_STATE.position_sizing,
          risk_management: backtest.risk_management || DEFAULT_FORM_STATE.risk_management
        });
      }
    } catch (error) {
      console.error('Error loading backtest:', error);
      showToast('Failed to load backtest', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load existing backtest for editing
  useEffect(() => {
    if (isEditing) {
      loadBacktest();
    } else {
      // Set default date range (last 3 months)
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      setFormData(prev => ({
        ...prev,
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0]
      }));
    }
  }, [isEditing, loadBacktest]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle strategy selection
  const handleStrategyChange = (strategyData) => {
    setFormData(prev => ({
      ...prev,
      strategy_id: strategyData.strategy_id,
      strategy_name: strategyData.strategy_name,
      pair: strategyData.pair || prev.pair,
      timeframe: strategyData.timeframe || prev.timeframe
    }));
  };

  // Handle date range change
  const handleDateRangeChange = ({ startDate, endDate }) => {
    setFormData(prev => ({
      ...prev,
      start_date: startDate,
      end_date: endDate
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      showToast('Please enter a backtest name', 'error');
      return false;
    }
    if (!formData.start_date || !formData.end_date) {
      showToast('Please select a date range', 'error');
      return false;
    }
    if (formData.initial_balance < 100 || formData.initial_balance > 10000000) {
      showToast('Initial balance must be between $100 and $10,000,000', 'error');
      return false;
    }
    return true;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const backtest = {
        id: isEditing ? id : undefined,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        strategy_id: formData.strategy_id,
        pair: formData.pair,
        timeframe: formData.timeframe,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        initial_balance: parseFloat(formData.initial_balance),
        currency: formData.currency,
        position_sizing: formData.position_sizing,
        risk_management: formData.risk_management,
        status: 'pending'
      };

      const result = await endPoints.saveBacktest(backtest);

      if (result.success) {
        showToast(isEditing ? 'Backtest updated successfully' : 'Backtest created successfully');
        setTimeout(() => navigate('/backtests'), 1000);
      } else {
        showToast(result.error || 'Failed to save backtest', 'error');
      }
    } catch (error) {
      console.error('Error saving backtest:', error);
      showToast('Failed to save backtest', 'error');
    } finally {
      setSaving(false);
    }
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
              <h1 className="heading-1">
                {isEditing ? 'Edit Backtest' : 'Configure Backtest'}
              </h1>
              <p className="body-sm mt-1">
                {isEditing ? 'Update your backtest configuration' : 'Create a new backtest to validate your strategy'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/backtests')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Backtest
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Info Card */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter backtest name"
                    maxLength={100}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Optional description"
                    rows={3}
                    maxLength={500}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Strategy Selection Card */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Strategy</h2>
              <StrategySelector
                value={formData.strategy_id}
                onChange={handleStrategyChange}
              />
            </div>

            {/* Date Range Card */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Backtest Period</h2>
              <DateRangePicker
                startDate={formData.start_date}
                endDate={formData.end_date}
                onChange={handleDateRangeChange}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Initial Balance Card */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Account Settings</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Initial Balance
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                      {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '\u20ac' : '\u00a3'}
                    </span>
                    <input
                      type="number"
                      value={formData.initial_balance}
                      onChange={(e) => handleChange('initial_balance', parseFloat(e.target.value) || 0)}
                      min={100}
                      max={10000000}
                      step={100}
                      className="input-field pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="input-field"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.value} value={curr.value}>
                        {curr.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Position Sizing Card */}
            <div className="card p-6">
              <PositionSizingForm
                value={formData.position_sizing}
                onChange={(val) => handleChange('position_sizing', val)}
              />
            </div>
          </div>

          {/* Full Width - Risk Management */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RiskManagementForm
                  value={formData.risk_management}
                  onChange={(val) => handleChange('risk_management', val)}
                />
                <RiskPreviewChart
                  riskManagement={formData.risk_management}
                />
              </div>
            </div>
          </div>
        </div>

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

export default BacktestConfiguration;
