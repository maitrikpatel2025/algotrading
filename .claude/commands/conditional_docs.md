# Conditional Documentation Guide

This prompt helps you determine what documentation you should read based on the specific changes you need to make in the codebase. Review the conditions below and read the relevant documentation before proceeding with your task.

## Instructions
- Review the task you've been asked to perform
- Check each documentation path in the Conditional Documentation section
- For each path, evaluate if any of the listed conditions apply to your task
  - IMPORTANT: Only read the documentation if any one of the conditions match your task
- IMPORTANT: You don't want to excessively read documentation. Only read the documentation if it's relevant to your task.

## Conditional Documentation

- README.md
  - Conditions:
    - When operating on anything under app/server
    - When operating on anything under app/client
    - When first understanding the project structure
    - When you want to learn the commands to start or stop the server or client

- .claude/commands/classify_adw.md
  - Conditions:
    - When adding or removing new `adws/adw_*.py` files

- adws/README.md
  - Conditions:
    - When you're operating in the `adws/` directory

- app/bot/
  - Conditions:
    - When working with the trading bot
    - When implementing trading strategies
    - When modifying bot configuration or settings

- app_docs/feature-bfd1a7d1-account-open-trades-order-history.md
  - Conditions:
    - When working with the Account page or trading account features
    - When implementing or modifying open trades display functionality
    - When implementing or modifying trade history functionality
    - When adding new API endpoints for trading data
    - When working with trading UI components (OpenTrades, OrderHistory)
    - When troubleshooting Account page issues or trade data display

- app_docs/feature-bbdb5a41-trade-history-api.md
  - Conditions:
    - When implementing or modifying trade history API endpoints
    - When integrating with FXOpen Trade History API (/api/v2/tradehistory)
    - When working with historical trade data or transaction history
    - When troubleshooting trade history endpoint timeout or error handling issues
    - When renaming or refactoring TradeHistory component
    - When adding pagination or date range filtering to trade history
    - When updating TradeHistoryItem data model or response structure

- app_docs/feature-7ce3e5be-trading-bot-status-dashboard.md
  - Conditions:
    - When working with trading bot status or operational monitoring
    - When implementing or modifying the BotStatus component
    - When working with the /api/bot/status endpoint
    - When adding new bot metrics or status indicators
    - When troubleshooting bot status display or auto-refresh issues
    - When integrating bot state changes with the status tracker

- app_docs/feature-edc8ccb5-bot-start-stop-control.md
  - Conditions:
    - When working with bot start/stop functionality
    - When implementing or modifying the BotController class
    - When working with /api/bot/start, /api/bot/stop, or /api/bot/restart endpoints
    - When troubleshooting bot process management or subprocess lifecycle issues
    - When modifying bot control UI buttons or confirmation dialogs
    - When working with lock file mechanism or PID tracking

- app_docs/feature-bbcca085-navigation-refactor.md
  - Conditions:
    - When working with application navigation or routing
    - When implementing or modifying the NavigationBar component
    - When renaming or restructuring pages in the application
    - When working with the Monitor, Strategy, or Account pages
    - When troubleshooting route navigation or URL structure
    - When reorganizing UI components across different pages
    - When understanding the workflow-based page structure (Monitor/Strategy/Account)

- app_docs/feature-dc50bbc5-interactive-ohlc-chart.md
  - Conditions:
    - When working with price charts or candlestick visualization
    - When implementing or modifying the PriceChart component
    - When working with chart.js or Plotly.js chart rendering
    - When adding chart types, volume indicators, or date range controls
    - When troubleshooting chart loading states, empty states, or error handling
    - When working with the Strategy page chart integration
    - When implementing interactive chart features (zoom, pan, hover tooltips)
    - When working with OHLC price data from /api/prices endpoint

- app_docs/feature-947a25d2-chart-zoom-scroll-controls.md
  - Conditions:
    - When implementing or modifying chart zoom and scroll functionality
    - When working with keyboard navigation for charts (zoom in/out, scroll left/right)
    - When implementing zoom constraints or boundary detection in charts
    - When adding zoom level indicators or interaction hints to charts
    - When working with cursor-centered zooming or touch device support
    - When troubleshooting chart interaction issues (keyboard focus, zoom limits)
    - When optimizing chart performance with requestAnimationFrame or Plotly transitions
    - When implementing plotly_relayout event handlers or custom chart events

- app_docs/feature-085c8952-timeframe-selector-persistence.md
  - Conditions:
    - When working with timeframe selection or granularity options
    - When implementing or modifying localStorage persistence for user preferences
    - When adding new timeframe options (M1, M5, M15, M30, H1, H4, D, W1)
    - When working with the Strategy page timeframe dropdown
    - When implementing debounced API calls or zoom context preservation
    - When troubleshooting timeframe persistence or validation issues
    - When modifying the Select component active state styling

- app_docs/feature-93082afa-searchable-pair-selector.md
  - Conditions:
    - When working with currency pair selection or the PairSelector component
    - When implementing or modifying searchable dropdown components
    - When working with pair categorization (Major, Minor, Exotic)
    - When implementing localStorage persistence for recent selections
    - When working with the /api/spread endpoint or spread data display
    - When adding keyboard navigation to dropdown components
    - When implementing confirmation dialogs for data-changing actions
    - When troubleshooting pair selector or spread fetching issues

- app_docs/bug-31ea75f5-strategy-candles-error-fix.md
  - Conditions:
    - When troubleshooting "Invalid time value" errors in chart functionality
    - When working with chart.js zoom range calculations (clampZoomRange, computeZoomedInRange, computeZoomedOutRange, computeScrolledRange)
    - When debugging NaN or invalid Date issues in chart time calculations
    - When implementing validation for chart data timestamps
    - When fixing errors that occur during candle count changes on Strategy page
    - When adding defensive programming to chart zoom/scroll functions
    - When working with Date.toISOString() calls in chart code

- app_docs/feature-4f076469-indicator-library-panel.md
  - Conditions:
    - When working with the indicator library panel or IndicatorLibrary component
    - When adding or modifying technical indicators in the catalog
    - When working with the Strategy page left sidebar
    - When implementing indicator selection or chart overlay functionality
    - When troubleshooting indicator search or category filtering
    - When modifying indicator data structure or categories

- app_docs/feature-2b739aad-drag-indicator-onto-chart.md
  - Conditions:
    - When implementing drag-and-drop functionality for indicators
    - When working with indicator calculations (SMA, EMA, RSI, MACD, Bollinger Bands, etc.)
    - When modifying indicator rendering on charts (overlay or subchart)
    - When working with indicatorCalculations.js calculation functions
    - When implementing indicator limits or undo functionality
    - When troubleshooting indicator drag-drop or chart rendering issues
    - When adding new technical indicator types to the system

- app_docs/feature-41bf1b05-auto-condition-block.md
  - Conditions:
    - When working with the Logic Panel or condition blocks
    - When implementing or modifying trading condition functionality
    - When working with indicator-condition relationships
    - When implementing confirmation dialogs for indicator/condition deletion
    - When working with condition dropdowns or operand selection
    - When modifying the Strategy page right sidebar
    - When troubleshooting condition creation or auto-population issues
    - When implementing visual connections between chart and logic panel

- app_docs/feature-b11af5b7-strategy-page-layout-redesign.md
  - Conditions:
    - When working with the Strategy page layout or responsive design
    - When implementing or modifying spacing, padding, or margins on the Strategy page
    - When troubleshooting visual crowding or layout density issues
    - When working with the chart and technicals section layout
    - When modifying mobile floating action buttons or mobile UX on Strategy page
    - When implementing responsive breakpoints for Strategy page components
    - When following the UI style guide for dashboard layouts
    - When reorganizing Strategy page component hierarchy or grid layouts

- app_docs/feature-38950e42-indicator-settings-customization.md
  - Conditions:
    - When working with indicator parameter customization or settings dialogs
    - When implementing or modifying the IndicatorSettingsDialog component
    - When adding new indicator types that need parameter configuration
    - When working with multiple indicator instances with different settings
    - When implementing indicator edit functionality
    - When troubleshooting indicator parameter validation or color picker issues
    - When extending candle count options for long-period indicators
    - When modifying how indicator parameters are passed to chart rendering

- app_docs/feature-ec8c6210-drag-pattern-recognition-chart.md
  - Conditions:
    - When working with candlestick pattern recognition or detection
    - When implementing or modifying the patterns.js or patternDetection.js files
    - When adding new candlestick patterns to the library
    - When working with pattern markers on the price chart
    - When implementing pattern-based trading conditions
    - When troubleshooting pattern detection algorithms or reliability scores
    - When extending the Patterns category in the IndicatorLibrary
    - When working with pattern drop handling or pattern state management

- app_docs/feature-32ef6eda-indicator-click-configuration.md
  - Conditions:
    - When implementing or modifying indicator click event handling
    - When working with Plotly click events (plotly_click) on chart traces
    - When implementing context menus for chart elements
    - When adding right-click functionality to indicators
    - When working with indicator trace metadata (customdata, meta fields)
    - When implementing indicator duplication functionality
    - When troubleshooting indicator click detection or hit-testing issues
    - When working with viewport-aware positioning for overlays or menus
    - When implementing click-to-configure patterns for chart elements

- app_docs/feature-a5444a1e-realtime-parameter-preview.md
  - Conditions:
    - When implementing or modifying real-time preview functionality for indicators
    - When working with debounced parameter updates or the useDebounce hook
    - When implementing preview visual styling (dashed lines, opacity changes)
    - When working with performance monitoring or the usePerformanceMonitor hook
    - When implementing before/after comparison mode for indicators
    - When working with preview state management in Strategy.jsx
    - When modifying chart rendering to support preview indicators
    - When troubleshooting preview calculation performance issues
    - When implementing apply/cancel logic for parameter changes
    - When working with chartConstants.js preview styling constants

- app_docs/feature-534b16b8-indicator-color-style-customization.md
  - Conditions:
    - When implementing or modifying indicator styling controls (line thickness, line style, fill opacity)
    - When working with indicator visual customization features
    - When modifying IndicatorSettingsDialog styling sections
    - When working with Plotly line styling properties (line.width, line.dash, fillcolor alpha)
    - When troubleshooting indicator rendering or styling issues
    - When adding new styling options or extending existing styling controls
    - When working with chartConstants.js styling constants (LINE_WIDTH_OPTIONS, LINE_STYLE_OPTIONS, DEFAULT_FILL_OPACITY)
    - When implementing Reset to Default functionality for indicator styling
    - When extending preview system to show styling changes
    - When working with indicator default styling properties in indicators.js

- app_docs/feature-45c86c3e-trade-direction.md
  - Conditions:
    - When working with trade direction configuration or the TradeDirectionSelector component
    - When implementing or modifying the Logic Panel section visibility (Entry/Exit conditions)
    - When working with trade direction state management or localStorage persistence
    - When implementing strategy persistence or StrategyConfig data models
    - When working with condition section filtering based on trade direction
    - When modifying auto-created condition logic for indicators and patterns
    - When implementing confirmation dialogs for direction changes
    - When troubleshooting trade direction persistence or section rendering issues
    - When extending strategy configuration with directional constraints
    - When working with constants.js trade direction constants (TRADE_DIRECTIONS, TRADE_DIRECTION_LABELS, TRADE_DIRECTION_ICONS)

- app_docs/feature-a73d36d3-logic-builder-panel.md
  - Conditions:
    - When working with the Logic Panel four-section layout (Long Entry, Long Exit, Short Entry, Short Exit)
    - When implementing or modifying LogicPanel.jsx component
    - When working with condition section types (CONDITION_SECTIONS_V2)
    - When implementing panel resize functionality or draggable borders
    - When working with trade direction-based section filtering
    - When migrating legacy condition sections to V2 format
    - When adding or modifying "Add Condition" button functionality
    - When troubleshooting Logic Panel collapse/expand or resize issues
    - When working with condition section color coding (green for long, red for short)
    - When implementing drag-and-drop between condition sections

- app_docs/feature-f5db94d8-price-based-conditions.md
  - Conditions:
    - When working with standalone price-based conditions in the Logic Panel
    - When implementing or modifying the "Add Condition" button functionality
    - When working with natural language condition previews
    - When implementing or modifying condition validation logic
    - When working with formatNaturalLanguageCondition or validateCondition functions
    - When implementing conditions that compare price elements (Open, High, Low, Close)
    - When troubleshooting condition validation or invalid condition warnings
    - When working with createStandaloneCondition in conditionDefaults.js
    - When implementing autocomplete/search for indicator references in conditions

- app_docs/feature-cc3d2663-indicator-based-conditions.md
  - Conditions:
    - When working with indicator-based conditions (RSI > 70, MACD Histogram > 0)
    - When implementing range conditions (between X and Y)
    - When working with indicator numeric bounds validation
    - When adding new operators to the condition system
    - When working with createIndicatorCondition or createRangeCondition functions
    - When implementing percentage value inputs for conditions
    - When troubleshooting out-of-bounds validation warnings
    - When extending buildOperandOptions with new operand types

- app_docs/feature-d3028e00-candle-close-confirmation.md
  - Conditions:
    - When working with candle close confirmation or signal timing settings
    - When implementing or modifying the CandleCloseToggle component
    - When working with entry condition evaluation timing
    - When adding new strategy configuration toggles to the Controls Card
    - When troubleshooting localStorage persistence for strategy settings
    - When implementing real-time vs candle-based signal evaluation

- app_docs/feature-6d049c54-combine-conditions-and-or-logic.md
  - Conditions:
    - When working with condition grouping or AND/OR logic operators
    - When implementing or modifying the ConditionGroup component
    - When working with nested condition groups or group depth limits
    - When implementing or modifying the LogicTreeView component
    - When working with the Test Logic dialog or condition evaluation
    - When troubleshooting group persistence or group state management
    - When implementing drag-and-drop within condition groups
    - When working with group operators (AND/OR toggle)
    - When extending the Logic Panel with grouping functionality

- app_docs/feature-27834e18-multi-timeframe-conditions.md
  - Conditions:
    - When working with multi-timeframe conditions or cross-timeframe analysis
    - When implementing or modifying the MultiTimeframeConditionDialog component
    - When working with reference indicators from different timeframes
    - When implementing or modifying the ReferenceIndicatorsPanel component
    - When working with timeframe-labeled conditions (e.g., [H4] EMA > 200)
    - When troubleshooting reference indicator calculation or persistence issues
    - When extending the Logic Panel with multi-timeframe functionality
    - When working with AVAILABLE_TIMEFRAMES or MAX_REFERENCE_TIMEFRAMES constants
    - When implementing background price data fetching for non-chart timeframes

- app_docs/feature-77187659-condition-time-filters.md
  - Conditions:
    - When working with time-based trading filters or session-based restrictions
    - When implementing or modifying the TimeFilterDialog component
    - When working with TimeFilterBadge or TimeFilterTimeline components
    - When working with trading session definitions (Sydney, Tokyo, London, New York)
    - When implementing timezone conversion or time window evaluation
    - When troubleshooting time filter persistence or evaluation issues
    - When extending the Logic Panel with time-based filtering
    - When working with timeFilterUtils.js utility functions
    - When implementing include/exclude mode for trading hours

- app_docs/feature-81932c3d-chart-drawing-tools.md
  - Conditions:
    - When working with chart drawing tools (horizontal lines, trendlines, Fibonacci)
    - When implementing or modifying DrawingToolbar, DrawingPropertiesDialog, or DrawingContextMenu components
    - When working with drawingTypes.js or drawingUtils.js files
    - When adding new drawing types or annotation features to charts
    - When implementing drawing-based trading conditions
    - When troubleshooting drawing rendering, persistence, or interaction issues
    - When extending chart.js with additional shapes or annotations
    - When working with Plotly shapes API for chart overlays

- app_docs/feature-f792fd5a-save-strategy.md
  - Conditions:
    - When working with strategy persistence or save/load functionality
    - When implementing or modifying SaveStrategyDialog component
    - When working with /api/strategies endpoints (save, list, get, delete, check-name)
    - When implementing or modifying Toast notification components
    - When working with auto-save draft or draft recovery functionality
    - When troubleshooting strategy serialization or database persistence issues
    - When extending StrategyConfig data model with new fields
    - When implementing duplicate name detection or overwrite confirmation
    - When working with strategy_service.py Supabase operations

- app_docs/feature-61b69256-strategy-management.md
  - Conditions:
    - When working with strategy load, duplicate, delete, export, or import functionality
    - When implementing or modifying LoadStrategyDialog or ImportStrategyDialog components
    - When working with /api/strategies/extended, /api/strategies/{id}/duplicate, /api/strategies/{id}/export, or /api/strategies/import endpoints
    - When implementing strategy browser or strategy list features
    - When working with strategy export JSON schema or import validation
    - When troubleshooting strategy management operations or undo delete functionality
    - When extending StrategyListItemExtended or StrategyExport data models
    - When implementing conflict resolution for strategy name conflicts

- app_docs/feature-8047b9ec-strategy-import-pattern-display.md
  - Conditions:
    - When troubleshooting strategy import not refreshing UI automatically
    - When working with strategy load error handling or error message improvements
    - When fixing export double-serialization or data corruption issues
    - When troubleshooting patterns not displaying on chart
    - When implementing pattern detection user feedback
    - When working with patternType property propagation or marker colors
    - When debugging chart type restrictions for pattern rendering
    - When enhancing error messages for database connection, missing indicators, or network failures
    - When implementing auto-load functionality after strategy import
    - When working with StrategyConfig.candle_count type validation (int vs str)

- app_docs/feature-81b4393a-strategy-builder-layout.md
  - Conditions:
    - When working with the Strategy Builder three-column layout
    - When implementing or modifying the Page Header Bar or Control Bar on the Strategy page
    - When working with collapsible sidebars (Indicator Library or Logic Panel)
    - When implementing editable strategy name functionality
    - When working with timeframe toggle buttons or active indicator chips
    - When modifying responsive behavior for the Strategy page (mobile/tablet views)
    - When troubleshooting sidebar collapse/expand or layout issues on Strategy page
    - When working with layout toggle buttons or panel visibility state

- app_docs/feature-5c1da8e9-account-page-terminology.md
  - Conditions:
    - When working with Account page terminology or trading terminology consistency
    - When implementing or modifying text on the Account page (Open Trades, Trade History)
    - When troubleshooting "Order History" vs "Trade History" naming issues
    - When verifying trading industry standard terminology usage
    - When creating E2E tests for Account page components
    - When auditing user-facing text for consistency with FXOpen API documentation
    - When working with empty state messages or section headers on the Account page

- app_docs/feature-521004c3-indicators-pattern-loading.md
  - Conditions:
    - When troubleshooting strategies not loading correctly or indicators marked as "unknown"
    - When working with indicator validation or pattern validation logic
    - When implementing or modifying validateIndicators() or validatePatterns() functions
    - When fixing array access patterns for INDICATORS or PATTERNS definitions
    - When working with time filter save/load or data structure conversion
    - When implementing convertTimeFilterToBackend() or convertTimeFilterFromBackend()
    - When troubleshooting time filter settings being lost during save/load cycles
    - When debugging patterns loading without metadata (patternType, candleCount, reliability)
    - When working with URL-based strategy loading vs dialog-based loading inconsistencies
    - When implementing chart refresh on strategy load
    - When improving error messages for missing indicators or patterns
    - When adding pattern detection user feedback (toast notifications)

- app_docs/feature-b503685d-backtest-configuration.md
  - Conditions:
    - When working with backtesting features or backtest configuration
    - When implementing or modifying BacktestLibrary or BacktestConfiguration pages
    - When working with /api/backtests endpoints (save, list, get, delete, duplicate)
    - When implementing position sizing options (fixed lot, fixed dollar, percentage, risk-based)
    - When working with risk management settings (stop loss, take profit, trailing stop, partial closes)
    - When troubleshooting backtest save/load or validation issues
    - When extending BacktestConfig or related Pydantic data models
    - When working with the backtests database table or migrations
    - When implementing backtest execution or results visualization
    - When adding new components to the Backtest Configuration page

- app_docs/feature-2bf4bcfd-backtest-execution-progress-cancel.md
  - Conditions:
    - When working with backtest execution or running backtests
    - When implementing or modifying the BacktestExecutor class
    - When working with /api/backtests/{id}/run, /api/backtests/{id}/progress, or /api/backtests/{id}/cancel endpoints
    - When implementing real-time progress tracking or polling mechanisms
    - When working with BacktestProgressModal component
    - When troubleshooting backtest execution, progress updates, or cancellation issues
    - When implementing background thread execution patterns
    - When working with backtest progress database fields (progress_percentage, candles_processed, trade_count)
    - When extending backtest execution with new metrics or features

- app_docs/feature-62d0b3e2-backtest-progress-visualization.md
  - Conditions:
    - When working with live performance metrics during backtest execution
    - When implementing or modifying the MiniEquityCurve component
    - When working with real-time P/L, win rate, or drawdown calculations
    - When implementing equity curve visualization or SVG charts
    - When working with view mode toggles (compact/detailed) in backtest modal
    - When implementing performance mode or variable polling intervals
    - When troubleshooting backtest progress metrics or visualization issues
    - When extending BacktestProgress model with new metric fields

- app_docs/feature-632a538d-backtest-summary-statistics.md
  - Conditions:
    - When working with backtest results or summary statistics display
    - When implementing or modifying BacktestResultsSummary, MetricCard, or EquityCurveChart components
    - When working with Sharpe Ratio, Sortino Ratio, or risk-adjusted return calculations
    - When implementing maximum drawdown calculations or recovery factor metrics
    - When working with buy-and-hold benchmark comparisons
    - When implementing metric color coding or tooltip explanations
    - When troubleshooting backtest statistics calculations or display issues
    - When extending BacktestResultsSummary data model with new metrics
    - When working with metricDefinitions.js or getMetricTrend functions

- app_docs/feature-69a9dc86-equity-curve-chart.md
  - Conditions:
    - When working with interactive equity curve chart or chart visualization
    - When implementing or modifying EquityCurveChart component with lightweight-charts
    - When working with chart zoom, pan, or interactive controls
    - When implementing drawdown period highlighting or visualization
    - When working with buy-and-hold comparison overlays
    - When implementing rich tooltips showing date, balance, drawdown %, and trade count
    - When adding PNG export functionality to charts
    - When troubleshooting chart performance or rendering issues
    - When extending BacktestResultsSummary with temporal data (equity_curve_dates, trade_counts_per_candle, drawdown_periods)
    - When working with drawdown identification algorithms in backtest_executor.py
    - When implementing crosshair handlers or custom chart tooltips
    - When working with chart responsiveness or resize behavior

- app_docs/feature-50dfaeee-view-trade-list.md
  - Conditions:
    - When working with trade list display or backtest trade analysis
    - When implementing or modifying BacktestTradeList or TradeFilterControls components
    - When working with trade filtering (winners/losers, long/short, date range)
    - When implementing sortable table columns or trade data sorting
    - When working with trade pagination or page size controls
    - When implementing CSV export functionality for trades
    - When working with trade highlighting on equity curve chart
    - When implementing click-to-highlight functionality for trades
    - When troubleshooting trade list display or filtering issues
    - When extending trade data processing utilities (tradeUtils.js)
    - When working with trade formatting functions (formatTradeDuration, formatExitReason)
    - When implementing trade data calculations (P/L percentage)
    - When working with collapsible trade list sections in backtest results

- app_docs/feature-4620e8ed-datetime-timezone-comparison-fix.md
  - Conditions:
    - When troubleshooting datetime timezone comparison errors in backtest execution
    - When working with datetime parsing and timezone handling in backtest_executor.py
    - When fixing "can't compare offset-naive and offset-aware datetimes" errors
    - When implementing timezone normalization for datetime objects
    - When working with date range validation or datetime comparisons in backtests
    - When debugging candle generation loops or trade entry/exit time comparisons
    - When troubleshooting backtest failures during initialization or execution
    - When working with ISO format datetime parsing and timezone conversion
    - When implementing consistent timezone handling across datetime operations
