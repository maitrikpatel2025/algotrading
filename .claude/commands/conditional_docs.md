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