import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import endPoints from '../app/api';

const BacktestNotesEditor = ({ backtestId, initialNotes = '', onNotesUpdated }) => {
    const [notes, setNotes] = useState(initialNotes || '');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const maxLength = 2000;

    // Initialize notes from prop
    useEffect(() => {
        setNotes(initialNotes || '');
    }, [initialNotes]);

    // Auto-save with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (notes !== initialNotes && !isSaving) {
                handleSave();
            }
        }, 2000); // 2-second debounce

        return () => clearTimeout(timer);
    }, [notes, initialNotes]);

    const handleSave = useCallback(async () => {
        if (notes === initialNotes) return;

        setIsSaving(true);
        try {
            const response = await endPoints.updateBacktestNotes(backtestId, notes);

            if (response.success) {
                setLastSaved(new Date());
                toast.success('Notes saved successfully', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
                if (onNotesUpdated) {
                    onNotesUpdated(notes);
                }
            } else {
                toast.error(response.error || 'Failed to save notes', {
                    position: 'bottom-right',
                });
            }
        } catch (error) {
            console.error('Failed to save notes:', error);
            toast.error('Failed to save notes. Please try again.', {
                position: 'bottom-right',
            });
        } finally {
            setIsSaving(false);
        }
    }, [backtestId, notes, initialNotes, onNotesUpdated]);

    const handleChange = (e) => {
        const value = e.target.value;
        if (value.length <= maxLength) {
            setNotes(value);
        }
    };

    const formatLastSaved = () => {
        if (!lastSaved) return null;
        const now = new Date();
        const diff = Math.floor((now - lastSaved) / 1000); // seconds

        if (diff < 60) return 'Saved just now';
        if (diff < 3600) return `Saved ${Math.floor(diff / 60)} minutes ago`;
        return `Saved ${lastSaved.toLocaleTimeString()}`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notes
                </label>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {isSaving && (
                        <span className="flex items-center gap-1">
                            <svg className="animate-spin h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </span>
                    )}
                    {!isSaving && lastSaved && (
                        <span className="text-green-600 dark:text-green-400">
                            {formatLastSaved()}
                        </span>
                    )}
                    <span className={notes.length >= maxLength ? 'text-red-500' : ''}>
                        {notes.length}/{maxLength}
                    </span>
                </div>
            </div>
            <textarea
                value={notes}
                onChange={handleChange}
                placeholder="Add notes about this backtest (e.g., observations, strategy tweaks, market conditions...)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                rows={4}
                maxLength={maxLength}
            />
            <div className="mt-2 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving || notes === initialNotes}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        isSaving || notes === initialNotes
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    {isSaving ? 'Saving...' : 'Save Notes'}
                </button>
            </div>
        </div>
    );
};

export default BacktestNotesEditor;
