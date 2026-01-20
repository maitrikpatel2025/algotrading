import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../lib/utils';
import { ChevronDown, Search, X, Percent } from 'lucide-react';

/**
 * ConditionDropdown Component
 *
 * A searchable dropdown with grouped options for selecting condition operands.
 * Supports price sources, indicator instances, custom numeric values, and percentages.
 *
 * @param {Object} value - Current selected value
 * @param {Array} options - Grouped options array
 * @param {Function} onChange - Callback when value changes
 * @param {string} placeholder - Placeholder text
 * @param {string} className - Additional CSS classes
 * @param {boolean} showPercentageToggle - Whether to show percentage toggle for numeric values
 * @param {Object} boundsValidation - Optional bounds validation { isValid, warningMessage, boundsDescription }
 */
function ConditionDropdown({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  className,
  showPercentageToggle = false,
  boundsValidation = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isPercentageMode, setIsPercentageMode] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setShowCustomInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter options based on search term
  const filteredOptions = options.map(group => ({
    ...group,
    options: group.options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(group => group.options.length > 0);

  const handleSelect = useCallback((option) => {
    if (option.isCustom) {
      setShowCustomInput(true);
      setCustomValue(value?.type === 'value' || value?.type === 'percentage' ? String(value.value) : '');
      // Set percentage mode based on option type
      setIsPercentageMode(option.isPercentage || false);
    } else {
      onChange(option);
      setIsOpen(false);
      setSearchTerm('');
    }
  }, [onChange, value]);

  const handleCustomValueSubmit = useCallback(() => {
    const numValue = parseFloat(customValue);
    if (!isNaN(numValue)) {
      if (isPercentageMode) {
        onChange({
          type: 'percentage',
          value: numValue,
          label: `${numValue}%`,
          isPercentage: true,
        });
      } else {
        onChange({
          type: 'value',
          value: numValue,
          label: String(numValue),
        });
      }
      setIsOpen(false);
      setSearchTerm('');
      setShowCustomInput(false);
    }
  }, [customValue, onChange, isPercentageMode]);

  const togglePercentageMode = useCallback(() => {
    setIsPercentageMode(prev => !prev);
  }, []);

  const handleCustomKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleCustomValueSubmit();
    } else if (e.key === 'Escape') {
      setShowCustomInput(false);
    }
  }, [handleCustomValueSubmit]);

  // Get display label for current value
  const getDisplayLabel = () => {
    if (!value) return placeholder;
    // Format percentage values with % suffix
    if (value.isPercentage && value.type === 'percentage') {
      return `${value.value}%`;
    }
    return value.label || placeholder;
  };

  // Check if current value has validation warnings
  const hasValidationWarning = boundsValidation && !boundsValidation.isValid;

  // Get color indicator for the value
  const getColorIndicator = () => {
    if (value?.color) {
      return (
        <span
          className="inline-block w-2 h-2 rounded-full mr-1.5 flex-shrink-0"
          style={{ backgroundColor: value.color }}
        />
      );
    }
    return null;
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-2.5 py-1.5",
          "text-sm bg-background border rounded-md",
          "hover:bg-muted/50 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          isOpen && "ring-2 ring-primary/50",
          hasValidationWarning ? "border-amber-500" : "border-border"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={hasValidationWarning ? boundsValidation.warningMessage : boundsValidation?.boundsDescription || undefined}
      >
        <span className="flex items-center truncate">
          {getColorIndicator()}
          <span className={cn("truncate", hasValidationWarning && "text-amber-600")}>
            {getDisplayLabel()}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground ml-1 flex-shrink-0 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full min-w-[200px]",
            "bg-popover border border-border rounded-md shadow-lg",
            "max-h-[300px] overflow-hidden"
          )}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className={cn(
                  "w-full pl-7 pr-7 py-1.5 text-sm",
                  "bg-background border border-border rounded",
                  "focus:outline-none focus:ring-1 focus:ring-primary/50",
                  "placeholder:text-muted-foreground"
                )}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Custom Value Input */}
          {showCustomInput && (
            <div className="p-2 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyDown={handleCustomKeyDown}
                    placeholder={isPercentageMode ? "Enter percentage..." : "Enter value..."}
                    className={cn(
                      "w-full px-2 py-1.5 text-sm",
                      "bg-background border border-border rounded",
                      "focus:outline-none focus:ring-1 focus:ring-primary/50",
                      isPercentageMode && "pr-8"
                    )}
                    autoFocus
                  />
                  {isPercentageMode && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      %
                    </span>
                  )}
                </div>
                {showPercentageToggle && (
                  <button
                    type="button"
                    onClick={togglePercentageMode}
                    className={cn(
                      "p-1.5 rounded transition-colors",
                      isPercentageMode
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                    title={isPercentageMode ? "Switch to absolute value" : "Switch to percentage"}
                  >
                    <Percent className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCustomValueSubmit}
                  className="px-2 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Set
                </button>
              </div>
              {boundsValidation?.boundsDescription && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {boundsValidation.boundsDescription}
                </p>
              )}
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-[220px]">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((group, groupIndex) => (
                <div key={group.group}>
                  {/* Group Header */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                    {group.group}
                  </div>

                  {/* Group Options */}
                  {group.options.map((option, optionIndex) => (
                    <button
                      key={`${groupIndex}-${optionIndex}`}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={cn(
                        "flex items-center w-full px-3 py-2 text-sm text-left",
                        "hover:bg-muted/50 transition-colors",
                        "focus:outline-none focus:bg-muted/50",
                        value?.label === option.label && "bg-primary/10"
                      )}
                    >
                      {option.color && (
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-2 flex-shrink-0"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      <span className="truncate">{option.label}</span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ConditionDropdown;
