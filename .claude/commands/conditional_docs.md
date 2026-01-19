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
