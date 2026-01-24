import React, { useState } from 'react';
import { toast } from 'react-toastify';
import endPoints from '../app/api';

const BacktestExportDialog = ({ backtestId, backtestName, isOpen, onClose, initialFormat = 'csv' }) => {
    const [selectedFormat, setSelectedFormat] = useState(initialFormat);
    const [isExporting, setIsExporting] = useState(false);

    if (!isOpen) return null;

    const handleExport = async () => {
        setIsExporting(true);
        try {
            switch (selectedFormat) {
                case 'csv':
                    await endPoints.exportBacktestCSV(backtestId);
                    break;
                case 'json':
                    await endPoints.exportBacktestJSON(backtestId);
                    break;
                case 'pdf':
                    await endPoints.exportBacktestPDF(backtestId);
                    break;
                default:
                    throw new Error('Invalid export format');
            }

            toast.success(`Backtest exported as ${selectedFormat.toUpperCase()} successfully`, {
                position: 'bottom-right',
                autoClose: 3000,
            });
            onClose();
        } catch (error) {
            console.error('Export failed:', error);
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to export backtest';
            toast.error(errorMessage, {
                position: 'bottom-right',
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Export Backtest Results
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            disabled={isExporting}
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Backtest Name */}
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Backtest:</p>
                        <p className="text-base font-medium text-gray-900 dark:text-white truncate">
                            {backtestName}
                        </p>
                    </div>

                    {/* Format Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Export Format
                        </label>
                        <div className="space-y-2">
                            {/* CSV Option */}
                            <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <input
                                    type="radio"
                                    name="format"
                                    value="csv"
                                    checked={selectedFormat === 'csv'}
                                    onChange={(e) => setSelectedFormat(e.target.value)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    disabled={isExporting}
                                />
                                <div className="ml-3 flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">CSV</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Spreadsheet format with all metrics and trades
                                    </div>
                                </div>
                            </label>

                            {/* JSON Option */}
                            <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <input
                                    type="radio"
                                    name="format"
                                    value="json"
                                    checked={selectedFormat === 'json'}
                                    onChange={(e) => setSelectedFormat(e.target.value)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    disabled={isExporting}
                                />
                                <div className="ml-3 flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">JSON</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Complete data structure for programmatic use
                                    </div>
                                </div>
                            </label>

                            {/* PDF Option */}
                            <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <input
                                    type="radio"
                                    name="format"
                                    value="pdf"
                                    checked={selectedFormat === 'pdf'}
                                    onChange={(e) => setSelectedFormat(e.target.value)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    disabled={isExporting}
                                />
                                <div className="ml-3 flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">PDF</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Formatted report for printing and sharing
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            disabled={isExporting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        >
                            {isExporting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Export {selectedFormat.toUpperCase()}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BacktestExportDialog;
