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