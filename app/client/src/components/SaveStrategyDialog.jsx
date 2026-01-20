import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';
import { X, Save, Tag } from 'lucide-react';
import {
  STRATEGY_NAME_MAX_LENGTH,
  STRATEGY_DESCRIPTION_MAX_LENGTH,
} from '../app/constants';

/**
 * SaveStrategyDialog Component
 *
 * A modal dialog for saving a strategy with name, description, and tags.
 *
 * @param {boolean} isOpen - Whether the dialog is visible
 * @param {Function} onClose - Callback when dialog is closed/cancelled
 * @param {Function} onSave - Callback when save is confirmed (name, description, tags)
 * @param {string} existingName - Pre-fill name for editing existing strategy
 * @param {string} existingDescription - Pre-fill description for editing
 * @param {string[]} existingTags - Pre-fill tags for editing
 * @param {boolean} isSaving - Whether a save operation is in progress
 */
function SaveStrategyDialog({
  isOpen,
  onClose,
  onSave,
  existingName = '',
  existingDescription = '',
  existingTags = [],
  isSaving = false,
}) {
  const dialogRef = useRef(null);
  const nameInputRef = useRef(null);

  const [name, setName] = useState(existingName);
  const [description, setDescription] = useState(existingDescription);
  const [tagsInput, setTagsInput] = useState(existingTags.join(', '));
  const [nameError, setNameError] = useState('');

  // Reset form when dialog opens with new values
  useEffect(() => {
    if (isOpen) {
      setName(existingName);
      setDescription(existingDescription);
      setTagsInput(existingTags.join(', '));
      setNameError('');
      // Focus name input when dialog opens
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, existingName, existingDescription, existingTags]);

  // Focus management and escape key handler
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value.length <= STRATEGY_NAME_MAX_LENGTH) {
      setName(value);
      // Clear error when user starts typing
      if (nameError) setNameError('');
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= STRATEGY_DESCRIPTION_MAX_LENGTH) {
      setDescription(value);
    }
  };

  const validateName = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Strategy name is required');
      return false;
    }
    if (trimmedName.length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateName()) return;

    // Parse tags from comma-separated input
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    onSave(name.trim(), description.trim(), tags);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const isNameValid = name.trim().length >= 2;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-strategy-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={cn(
          "relative bg-card rounded-lg shadow-xl max-w-md w-full",
          "border border-border",
          "animate-fade-in"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            <h2
              id="save-strategy-dialog-title"
              className="text-lg font-semibold text-foreground"
            >
              Save Strategy
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "p-1.5 rounded-md",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-muted transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Strategy Name */}
          <div className="space-y-2">
            <label
              htmlFor="strategy-name"
              className="block text-sm font-medium text-foreground"
            >
              Strategy Name <span className="text-destructive">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="strategy-name"
              type="text"
              value={name}
              onChange={handleNameChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter strategy name"
              className={cn(
                "w-full px-3 py-2 rounded-md",
                "bg-background border",
                nameError ? "border-destructive" : "border-input",
                "text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              disabled={isSaving}
              maxLength={STRATEGY_NAME_MAX_LENGTH}
            />
            <div className="flex justify-between items-center">
              {nameError ? (
                <span className="text-xs text-destructive">{nameError}</span>
              ) : (
                <span className="text-xs text-muted-foreground">Required</span>
              )}
              <span className={cn(
                "text-xs",
                name.length >= STRATEGY_NAME_MAX_LENGTH - 5
                  ? "text-amber-500"
                  : "text-muted-foreground"
              )}>
                {name.length}/{STRATEGY_NAME_MAX_LENGTH}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="strategy-description"
              className="block text-sm font-medium text-foreground"
            >
              Description <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="strategy-description"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Describe your strategy..."
              rows={3}
              className={cn(
                "w-full px-3 py-2 rounded-md",
                "bg-background border border-input",
                "text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "resize-none",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              disabled={isSaving}
              maxLength={STRATEGY_DESCRIPTION_MAX_LENGTH}
            />
            <div className="flex justify-end">
              <span className={cn(
                "text-xs",
                description.length >= STRATEGY_DESCRIPTION_MAX_LENGTH - 20
                  ? "text-amber-500"
                  : "text-muted-foreground"
              )}>
                {description.length}/{STRATEGY_DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label
              htmlFor="strategy-tags"
              className="block text-sm font-medium text-foreground"
            >
              <div className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Tags <span className="text-muted-foreground">(optional)</span>
              </div>
            </label>
            <input
              id="strategy-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="trend, momentum, scalping (comma-separated)"
              className={cn(
                "w-full px-3 py-2 rounded-md",
                "bg-background border border-input",
                "text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              disabled={isSaving}
            />
            <span className="text-xs text-muted-foreground">
              Separate tags with commas
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              "bg-muted text-foreground",
              "hover:bg-muted/80 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isNameValid || isSaving}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2"
            )}
          >
            {isSaving ? (
              <>
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Strategy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveStrategyDialog;
