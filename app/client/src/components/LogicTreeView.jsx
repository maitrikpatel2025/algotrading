import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  ChevronRight,
  ChevronDown,
  GitBranch,
  Circle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  GROUP_OPERATOR_LABELS,
  CONDITION_SECTION_LABELS,
} from '../app/constants';
import {
  buildLogicTree,
  formatNaturalLanguageCondition,
} from '../app/conditionDefaults';

/**
 * LogicTreeView Component
 *
 * Tree-based visualization of condition logic structure.
 * Shows hierarchical AND/OR groups with expand/collapse functionality.
 *
 * @param {Array} conditions - All conditions
 * @param {Array} groups - All groups
 * @param {string} section - The section to display
 * @param {Function} onConditionSelect - Callback when condition is clicked
 * @param {Object} evaluationResults - Optional evaluation results for pass/fail display
 */
function LogicTreeView({
  conditions,
  groups,
  section,
  onConditionSelect,
  evaluationResults = null,
}) {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  // Memoize tree structure to prevent unnecessary recomputation
  const tree = useMemo(
    () => buildLogicTree(conditions, groups, section),
    [conditions, groups, section]
  );

  // Toggle node expansion
  const toggleNode = useCallback((nodeId) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // Get evaluation result for an item
  const getEvaluationResult = useCallback((itemId, itemType) => {
    if (!evaluationResults || !evaluationResults.itemResults) return null;

    const findResult = (results) => {
      for (const result of results) {
        if (result.id === itemId) {
          return result;
        }
        if (result.childResults) {
          const childResult = findResult(result.childResults);
          if (childResult) return childResult;
        }
      }
      return null;
    };

    return findResult(evaluationResults.itemResults);
  }, [evaluationResults]);

  // Render a tree node (condition or group)
  const renderNode = (node, depth = 0) => {
    const isExpanded = expandedNodes.has(node.data.id);
    const evalResult = getEvaluationResult(node.data.id, node.type);

    if (node.type === 'condition') {
      const preview = formatNaturalLanguageCondition(node.data);
      const passed = evalResult?.result;
      const hasEvaluation = evalResult !== null;

      return (
        <div
          key={node.data.id}
          className={cn(
            "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer",
            "hover:bg-muted/50 transition-colors",
            "ml-" + Math.min(depth * 4, 16)
          )}
          style={{ marginLeft: `${depth * 16}px` }}
          onClick={() => onConditionSelect?.(node.data.id)}
        >
          {/* Status icon */}
          {hasEvaluation ? (
            passed ? (
              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            )
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}

          {/* Condition text */}
          <span className={cn(
            "text-sm truncate",
            hasEvaluation && (passed ? "text-success" : "text-destructive")
          )}>
            {preview || 'Incomplete condition'}
          </span>

          {/* Current values if available */}
          {evalResult && evalResult.leftValue !== undefined && (
            <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
              {typeof evalResult.leftValue === 'number'
                ? evalResult.leftValue.toFixed(2)
                : String(evalResult.leftValue)}
              {evalResult.rightValue !== null && evalResult.rightValue !== undefined && (
                <> vs {typeof evalResult.rightValue === 'number'
                  ? evalResult.rightValue.toFixed(2)
                  : String(evalResult.rightValue)}</>
              )}
            </span>
          )}
        </div>
      );
    }

    // Group node
    const groupData = node.data;
    const operatorLabel = GROUP_OPERATOR_LABELS[node.operator];
    const passed = evalResult?.result;
    const hasEvaluation = evalResult !== null;

    return (
      <div key={groupData.id} className="space-y-1">
        {/* Group header */}
        <div
          className={cn(
            "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer",
            "hover:bg-muted/50 transition-colors",
          )}
          style={{ marginLeft: `${depth * 16}px` }}
          onClick={() => toggleNode(groupData.id)}
        >
          {/* Expand/collapse icon */}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}

          {/* Branch icon */}
          <GitBranch className={cn(
            "h-4 w-4 flex-shrink-0",
            hasEvaluation && (passed ? "text-success" : "text-destructive"),
            !hasEvaluation && "text-muted-foreground"
          )} />

          {/* Operator badge */}
          <span
            className={cn(
              "px-2 py-0.5 rounded text-xs font-semibold",
              node.operator === 'and'
                ? "bg-blue-500/20 text-blue-600"
                : "bg-amber-500/20 text-amber-600"
            )}
          >
            {operatorLabel}
          </span>

          {/* Child count */}
          <span className="text-xs text-muted-foreground">
            ({node.children.length} items)
          </span>

          {/* Status indicator */}
          {hasEvaluation && (
            passed ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success ml-auto" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-destructive ml-auto" />
            )
          )}
        </div>

        {/* Children (if expanded) */}
        {isExpanded && node.children && (
          <div className="border-l border-border/50 ml-3" style={{ marginLeft: `${depth * 16 + 12}px` }}>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Create a stable string representation of group IDs for the dependency
  const groupIdsKey = useMemo(() => {
    const allGroupIds = [];
    const collectGroupIds = (nodes) => {
      nodes.forEach(node => {
        if (node.type === 'group') {
          allGroupIds.push(node.data.id);
          if (node.children) {
            collectGroupIds(node.children);
          }
        }
      });
    };
    collectGroupIds(tree.children);
    return allGroupIds.sort().join(',');
  }, [tree]);

  // Initialize all groups as expanded
  React.useEffect(() => {
    if (!groupIdsKey) return;

    const groupIdArray = groupIdsKey.split(',').filter(Boolean);
    const allGroupIds = new Set(groupIdArray);

    // Only update if there are new groups to expand
    setExpandedNodes(prev => {
      const hasNewGroups = groupIdArray.some(id => !prev.has(id));
      if (!hasNewGroups && prev.size === allGroupIds.size) {
        return prev; // No change needed
      }
      return allGroupIds;
    });
  }, [groupIdsKey]);

  if (tree.children.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        No conditions in this section
      </div>
    );
  }

  return (
    <div className="py-2 space-y-1">
      {/* Section header */}
      <div className="flex items-center gap-2 px-2 pb-2 border-b border-border/50">
        <GitBranch className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          {CONDITION_SECTION_LABELS[section] || section}
        </span>
        {evaluationResults && (
          <span className={cn(
            "ml-auto text-xs px-2 py-0.5 rounded-full",
            evaluationResults.result
              ? "bg-success/20 text-success"
              : "bg-destructive/20 text-destructive"
          )}>
            {evaluationResults.result ? 'Signal Active' : 'Signal Inactive'}
          </span>
        )}
      </div>

      {/* Tree nodes */}
      {tree.children.map(node => renderNode(node, 0))}
    </div>
  );
}

export default LogicTreeView;
