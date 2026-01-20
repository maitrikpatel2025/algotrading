import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import {
  X,
  Upload,
  FileJson,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Tag,
} from 'lucide-react';
import { TRADE_DIRECTION_ICONS } from '../app/constants';

/**
 * ImportStrategyDialog Component
 *
 * A modal dialog for importing strategies from JSON files.
 *
 * @param {boolean} isOpen - Whether the dialog is visible
 * @param {Function} onClose - Callback when dialog is closed
 * @param {Function} onImport - Callback when import is confirmed (data, options)
 * @param {Function} onValidate - Callback to validate import data
 * @param {boolean} isValidating - Whether validation is in progress
 * @param {boolean} isImporting - Whether import is in progress
 */
function ImportStrategyDialog({
  isOpen,
  onClose,
  onImport,
  onValidate,
  isValidating = false,
  isImporting = false,
}) {
  const dialogRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [conflictResolution, setConflictResolution] = useState('keep_both');
  const [customName, setCustomName] = useState('');

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setFileContent(null);
      setValidationResult(null);
      setParseError(null);
      setConflictResolution('keep_both');
      setCustomName('');
      setIsDragging(false);
    }
  }, [isOpen]);

  // Keyboard handlers
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

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = async (file) => {
    // Reset previous state
    setParseError(null);
    setValidationResult(null);
    setCustomName('');

    // Validate file type
    if (!file.name.endsWith('.json')) {
      setParseError('Please select a JSON file (.json)');
      return;
    }

    setSelectedFile(file);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setFileContent(data);

      // Validate the import data
      if (onValidate) {
        const result = await onValidate(data);
        setValidationResult(result);
        if (result.strategy_preview?.name) {
          setCustomName(result.strategy_preview.name);
        }
      }
    } catch (err) {
      setParseError(`Failed to parse JSON: ${err.message}`);
      setFileContent(null);
    }
  };

  const handleImport = () => {
    if (!fileContent || !validationResult?.valid) return;

    const options = {
      conflict_resolution: validationResult.name_conflict ? conflictResolution : null,
      name_override: conflictResolution === 'rename' ? customName : null,
    };

    onImport(fileContent, options);
  };

  const canImport =
    fileContent &&
    validationResult?.valid &&
    !isValidating &&
    !isImporting &&
    (!validationResult.name_conflict || conflictResolution);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-strategy-dialog-title"
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
          "relative bg-card rounded-lg shadow-xl max-w-lg w-full",
          "border border-border",
          "animate-fade-in"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            <h2
              id="import-strategy-dialog-title"
              className="text-lg font-semibold text-foreground"
            >
              Import Strategy
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
          {/* File Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-input hover:border-primary/50 hover:bg-muted/50",
              selectedFile && "border-green-500 bg-green-500/5"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileInputChange}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <FileJson className="h-10 w-10 text-green-500" />
                <p className="text-sm font-medium text-foreground">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Click or drag to replace
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  Drop a JSON file here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Only .json files are supported
                </p>
              </div>
            )}
          </div>

          {/* Parse Error */}
          {parseError && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{parseError}</p>
            </div>
          )}

          {/* Validation Loading */}
          {isValidating && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
              <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Validating import data...</p>
            </div>
          )}

          {/* Validation Results */}
          {validationResult && !isValidating && (
            <div className="space-y-3">
              {/* Errors */}
              {validationResult.errors?.length > 0 && (
                <div className="p-3 rounded-md bg-destructive/10">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Validation Errors</span>
                  </div>
                  <ul className="space-y-1 ml-7">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className="text-sm text-destructive">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {validationResult.warnings?.length > 0 && (
                <div className="p-3 rounded-md bg-amber-500/10">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm font-medium">Warnings</span>
                  </div>
                  <ul className="space-y-1 ml-7">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-amber-600">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success */}
              {validationResult.valid && (
                <div className="p-3 rounded-md bg-green-500/10">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Validation Passed</span>
                  </div>
                </div>
              )}

              {/* Preview */}
              {validationResult.strategy_preview && (
                <div className="p-3 rounded-md bg-muted space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Strategy Preview
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {validationResult.strategy_preview.name}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium px-1.5 py-0.5 rounded",
                          validationResult.strategy_preview.trade_direction === 'long' && "bg-green-500/10 text-green-600",
                          validationResult.strategy_preview.trade_direction === 'short' && "bg-red-500/10 text-red-600",
                          validationResult.strategy_preview.trade_direction === 'both' && "bg-blue-500/10 text-blue-600"
                        )}
                      >
                        {TRADE_DIRECTION_ICONS[validationResult.strategy_preview.trade_direction]}
                      </span>
                    </div>
                    {validationResult.strategy_preview.description && (
                      <p className="text-sm text-muted-foreground">
                        {validationResult.strategy_preview.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BarChart3 className="h-3 w-3" />
                      {validationResult.strategy_preview.pair?.replace('_', '/') || 'N/A'} /{' '}
                      {validationResult.strategy_preview.timeframe || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600">
                        {validationResult.strategy_preview.indicator_count || 0} ind
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600">
                        {validationResult.strategy_preview.condition_count || 0} cond
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
                        {validationResult.strategy_preview.pattern_count || 0} pat
                      </span>
                    </div>
                    {validationResult.strategy_preview.tags?.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        {validationResult.strategy_preview.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Name Conflict Resolution */}
              {validationResult.name_conflict && (
                <div className="p-3 rounded-md bg-amber-500/10 space-y-3">
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm font-medium">Name Conflict</span>
                  </div>
                  <p className="text-sm text-amber-600 ml-7">
                    A strategy with this name already exists. Choose how to proceed:
                  </p>
                  <div className="space-y-2 ml-7">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="conflict-resolution"
                        value="keep_both"
                        checked={conflictResolution === 'keep_both'}
                        onChange={(e) => setConflictResolution(e.target.value)}
                        className="text-primary"
                      />
                      <span className="text-sm text-foreground">Keep both (auto-rename)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="conflict-resolution"
                        value="replace"
                        checked={conflictResolution === 'replace'}
                        onChange={(e) => setConflictResolution(e.target.value)}
                        className="text-primary"
                      />
                      <span className="text-sm text-foreground">Replace existing</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="conflict-resolution"
                        value="rename"
                        checked={conflictResolution === 'rename'}
                        onChange={(e) => setConflictResolution(e.target.value)}
                        className="text-primary"
                      />
                      <span className="text-sm text-foreground">Rename to:</span>
                    </label>
                    {conflictResolution === 'rename' && (
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Enter new name"
                        className={cn(
                          "ml-6 px-3 py-1.5 rounded-md",
                          "bg-background border border-input",
                          "text-sm text-foreground placeholder:text-muted-foreground",
                          "focus:outline-none focus:ring-2 focus:ring-primary/50"
                        )}
                        maxLength={50}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isImporting}
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
            onClick={handleImport}
            disabled={!canImport}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2"
            )}
          >
            {isImporting ? (
              <>
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import Strategy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportStrategyDialog;
