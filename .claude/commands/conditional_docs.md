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
