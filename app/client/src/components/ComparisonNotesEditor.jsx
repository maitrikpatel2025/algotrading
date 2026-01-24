import React, { useState, useCallback, useEffect } from 'react';
import { FileText, Check } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * ComparisonNotesEditor Component
 *
 * Textarea for editing comparison notes with:
 * - Character counter (max 2000 characters)
 * - Auto-save indicator with debounce
 * - localStorage persistence handled by parent component
 */

const MAX_CHARACTERS = 2000;
const SAVE_DELAY_MS = 1500;

function ComparisonNotesEditor({ notes = '', onChange }) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Sync with parent when notes prop changes
  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  // Debounced save
  useEffect(() => {
    if (localNotes === notes) return;

    setIsSaving(true);
    const timeoutId = setTimeout(() => {
      onChange(localNotes);
      setIsSaving(false);
      setLastSaved(new Date());
    }, SAVE_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [localNotes, notes, onChange]);

  const handleChange = useCallback((e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTERS) {
      setLocalNotes(value);
    }
  }, []);

  const characterCount = localNotes.length;
  const isNearLimit = characterCount >= MAX_CHARACTERS * 0.9;
  const isAtLimit = characterCount >= MAX_CHARACTERS;

  return (
    <div className="p-4">
      <div className="relative">
        <textarea
          value={localNotes}
          onChange={handleChange}
          placeholder="Add your observations, analysis notes, or conclusions about this comparison..."
          className={cn(
            'w-full h-40 px-4 py-3 text-sm rounded-md border resize-none',
            'bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'placeholder:text-neutral-400 text-neutral-900',
            'transition-colors',
            isAtLimit ? 'border-danger' : 'border-neutral-200'
          )}
        />

        {/* Empty State Icon */}
        {!localNotes && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <FileText className="h-12 w-12 text-neutral-200" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        {/* Save Status */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          {isSaving ? (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              Saving...
            </span>
          ) : lastSaved ? (
            <span className="flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-success" />
              Saved
            </span>
          ) : null}
        </div>

        {/* Character Counter */}
        <div
          className={cn(
            'text-xs tabular-nums',
            isAtLimit
              ? 'text-danger font-medium'
              : isNearLimit
              ? 'text-warning'
              : 'text-neutral-400'
          )}
        >
          {characterCount.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default ComparisonNotesEditor;
