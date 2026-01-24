import React, { useState } from 'react';
import { X, Download, FileText, FileJson, FileSpreadsheet, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import endPoints from '../app/api';

/**
 * ComparisonExportDialog Component
 *
 * Dialog for exporting comparison reports in various formats.
 * Features:
 * - Format selection (CSV, JSON, PDF)
 * - Option to include/exclude notes
 * - Loading state during export
 */

const EXPORT_FORMATS = [
  {
    id: 'csv',
    name: 'CSV',
    description: 'Spreadsheet-compatible format',
    icon: FileSpreadsheet,
    mimeType: 'text/csv',
  },
  {
    id: 'json',
    name: 'JSON',
    description: 'Structured data format',
    icon: FileJson,
    mimeType: 'application/json',
  },
  {
    id: 'pdf',
    name: 'PDF',
    description: 'Printable report format',
    icon: FileText,
    mimeType: 'application/pdf',
  },
];

function ComparisonExportDialog({
  isOpen,
  onClose,
  backtestIds = [],
  notes = '',
}) {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [includeNotes, setIncludeNotes] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      switch (selectedFormat) {
        case 'csv':
          await endPoints.exportComparisonCSV(backtestIds, notes, includeNotes);
          break;
        case 'json':
          await endPoints.exportComparisonJSON(backtestIds, notes, includeNotes);
          break;
        case 'pdf':
          await endPoints.exportComparisonPDF(backtestIds, notes, includeNotes);
          break;
        default:
          throw new Error(`Unknown format: ${selectedFormat}`);
      }

      onClose();
    } catch (err) {
      console.error('Export failed:', err);
      setError(err.message || 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-elevated w-full max-w-md mx-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-neutral-900">
              Export Comparison
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-neutral-100 transition-colors"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EXPORT_FORMATS.map((format) => {
                const Icon = format.icon;
                const isSelected = selectedFormat === format.id;

                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-md border-2 transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{format.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-neutral-500">
              {EXPORT_FORMATS.find((f) => f.id === selectedFormat)?.description}
            </p>
          </div>

          {/* Include Notes Toggle */}
          {notes && (
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-md">
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  Include Comparison Notes
                </p>
                <p className="text-xs text-neutral-500">
                  Add your notes to the export
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-neutral-200 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          )}

          {/* Export Info */}
          <div className="p-3 bg-neutral-50 rounded-md">
            <p className="text-xs text-neutral-500">
              Exporting comparison of {backtestIds.length} backtests.
              {includeNotes && notes && ' Notes will be included.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-danger-light rounded-md">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-neutral-100">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn btn-primary flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export {selectedFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComparisonExportDialog;
