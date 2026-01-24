# Feature: Backtest System Comprehensive Improvements

## Metadata
issue_number: `137`
adw_id: `7d5b1074`
issue_json: `{"number":137,"title":"Feature Backtest improvement","body":"/feature\n\nadw_sdlc_iso\n\n\n- Add tooltips next to all technical fields explaining what each setting means (ATR multiplier, leverage ratios, risk:reward calculations)\n- Create preset templates for common trading strategies (conservative, moderate, aggressive) that users can select with one click\n- Add real-time validation feedback as users type in form fields instead of waiting for save button\n- Display visual indicators to distinguish required fields from optional fields\n- Add validation summary panel showing date range validity, available historical data, and estimated execution time\n- Show risk warnings when high-risk settings are selected (e.g., leverage above 1:50)\n- Validate that either stop loss or take profit is configured, not allowing both to be \"none\"\n- Add date range validation warnings if range is too short (less than 7 days) or too long (more than 10 years)\n- Check if sufficient historical data exists for the selected pair and timeframe before allowing backtest execution\n\n- Create more specific error states beyond just \"failed\" (insufficient data, strategy validation error, timeout, data source error)\n- Display user-friendly error messages instead of technical error codes\n- Add recovery suggestions when backtest fails (e.g., \"Try a shorter date range\" or \"Check strategy has entry conditions\")\n- Show warning when selected date range has missing candle data\n- Add confirmation dialog when user tries to close configuration with unsaved changes\n- Implement retry mechanism for failed backtests with one-click option\n\n\n- Add trade heatmap showing performance by day of week and hour of day\n- Create underwater chart showing drawdown periods visually\n- Add profit/loss distribution histogram to show trade outcome spread\n- Track and display longest consecutive winning and losing streaks\n- Add visual timeline of major drawdown events with annotations\n- Show trade cluster analysis to identify over-trading periods\n- Add benchmark comparison option to compare against simple buy-and-hold strategy\n- Create monthly/quarterly performance breakdown table\n\n\n- Add timeline visualization showing current date being processed within total date range\n- Display running trade count with breakdown of wins vs losses during execution\n- Show current equity balance updating in real-time during backtest\n- Add quick comparison view showing how current run compares to previous backtests of same strategy\n- Implement exponential backoff for progress polling to reduce server load\n- Add estimated time remaining calculation based on current processing speed\n- Show live chart of equity curve building as backtest progresses\n\n\n\n- Show visual bar chart of position size relative to total account balance\n- Display potential loss scenarios for different stop loss distances\n- Add risk/reward ratio visualization with color coding (green for favorable ratios, red for unfavorable)\n- Calculate and display value at risk (VaR) based on configured settings\n- Show maximum possible loss per trade in both percentage and dollar amounts\n- Add visual comparison of different position sizing methods side-by-side\n\n\n\n- Add \"Recently Viewed\" section at top of library showing last 5 accessed backtests\n- Show preview tooltip on hover displaying key metrics without needing to open the backtest\n- Implement bulk selection and operations (delete multiple, compare selected, export batch)\n- Add animated status indicators (running = pulsing blue icon, failed = red warning icon)\n- Create additional filters for date range, strategy type, profitability threshold\n- Add sorting by profitability, number of trades, or win rate\n- Implement card view vs list view toggle option\n- Add quick stats summary bar showing total backtests, average win rate, best performing strategy\n\n\n\n- Add \"Clone & Modify\" button that duplicates backtest and immediately opens configuration dialog\n- Create \"Re-run with same config\" option for quick re-execution\n- Add \"Export to Strategy Template\" to save successful configurations as reusable templates\n- Implement \"Share Configuration\" feature that exports backtest settings as JSON\n- Add \"Schedule Recurring Backtest\" option to automatically re-run on new data\n- Create \"Optimize Parameters\" workflow that tests multiple variations automatically\n\n\n- Design and add illustrations for empty backtest library state\n- Create \"Get Started\" tutorial overlay for first-time users showing key features\n- Add sample backtest templates with pre-configured settings for demonstration\n- Replace loading spinners with skeleton screens showing content structure\n- Implement progressive loading for large trade lists (load first 50 trades, then load rest)\n- Add virtual scrolling for trade lists with more than 100 trades\n- Create onboarding tooltips that highlight key features on first visit\n- Add contextual help button in header that opens feature documentation\n\n\n- Test configuration dialog on tablet and mobile devices\n- Implement stacked layout for form sections on screens smaller than 768px\n- Convert multi-column grids to single column on mobile\n- Make all buttons and interactive elements touch-friendly (minimum 44px touch target)\n- Test date picker usability on mobile devices and replace if needed\n- Ensure charts are readable and interactive on small screens\n- Add swipe gestures for navigating between backtest results sections\n\n\n\n- Add Monte Carlo simulation option to run multiple randomized variations of the same backtest\n- Implement walk-forward optimization to test strategy robustness over time\n- Create parameter sensitivity analysis showing how changes to settings affect results\n- Build strategy ranking dashboard comparing all backtests at a glance\n- Add correlation analysis showing how different strategies perform in various market conditions\n- Implement portfolio-level backtesting for testing multiple strategies together\n- Create optimization mode that automatically finds best parameter combinations\n\n\n- Add comments and annotations on specific trades in trade list\n- Create share functionality to send backtest results to team members\n- Implement version control for backtest configurations with change history\n- Add collaborative notes feature where multiple users can document insights\n- Create backtest comparison sharing with public URL option\n- Add export to presentation format for stakeholder reporting\n\n\n\n- Implement caching for frequently accessed backtest results\n- Add database indexing for faster backtest library queries\n- Optimize equity curve calculation for very long backtests (10+ years)\n- Add compression for storing large trade lists in database\n- Implement partial result streaming for long-running backtests\n- Add health check endpoint for backtest executor service\n- Create automated cleanup job for failed/abandoned backtest executions\n- Add telemetry and performance monitoring for backtest execution times\n\n"}`

## Feature Description

This feature delivers comprehensive improvements to the existing backtest system across configuration UX, error handling, analytics visualization, execution monitoring, and library management. The enhancements focus on making the backtest system more user-friendly, informative, and efficient by adding tooltips and validation, enriching results with advanced analytics, improving progress tracking, and enhancing the backtest library with better organization and quick actions.

Key improvements include:
- **Configuration UX**: Tooltips, preset templates, real-time validation, risk warnings, validation summary panel
- **Error Handling**: Specific error states, user-friendly messages, recovery suggestions, retry mechanism
- **Advanced Analytics**: Trade heatmaps, underwater charts, P/L distribution, streak tracking, benchmark comparison
- **Enhanced Progress**: Timeline visualization, running metrics, equity curve building, estimated time remaining
- **Risk Visualization**: Position size charts, loss scenarios, VaR calculation, risk/reward color coding
- **Library Improvements**: Recently viewed, hover previews, bulk operations, additional filters, card/list view toggle, quick stats
- **Quick Actions**: Clone & modify, re-run, export templates, share configuration
- **UX Polish**: Empty state illustrations, getting started tutorial, skeleton screens, progressive loading, onboarding tooltips
- **Mobile Responsiveness**: Stacked layouts, touch-friendly targets, mobile-optimized charts
- **Advanced Features**: Monte Carlo simulation, walk-forward optimization, parameter sensitivity analysis, portfolio-level backtesting
- **Collaboration**: Trade annotations, sharing, version control, collaborative notes
- **Performance**: Caching, indexing, optimization for long backtests, result streaming, cleanup jobs, telemetry

## User Story

As a forex trader using the backtest system
I want comprehensive improvements to configuration, analytics, monitoring, and management
So that I can more effectively validate strategies, understand their performance characteristics, identify risks, and make data-driven trading decisions with confidence

## Problem Statement

The current backtest system provides basic functionality for running and viewing backtest results, but lacks critical features that professional traders need:

1. **Configuration Complexity**: Users struggle to understand technical fields like ATR multipliers and leverage ratios without explanations, making it difficult to configure backtests correctly
2. **Limited Validation**: Validation only occurs on save, users can't see issues until they attempt to save, and there's no guidance on risk levels or data availability
3. **Generic Error Messages**: Failed backtests only show "failed" status without specific reasons or recovery guidance
4. **Basic Analytics**: Results lack depth - no heatmaps, underwater charts, streak analysis, or benchmark comparisons to fully understand strategy behavior
5. **Poor Progress Feedback**: Users have no visibility into what's happening during execution - no timeline, running metrics, or estimated completion time
6. **Limited Library Organization**: No recently viewed section, no hover previews, no bulk operations, limited filtering and sorting
7. **Inefficient Workflows**: No quick actions for cloning, re-running, or exporting templates - users must repeat configuration steps
8. **Weak Onboarding**: Empty states are bare, no tutorial for first-time users, no contextual help
9. **Desktop-Only**: Poor mobile experience with layouts not optimized for smaller screens
10. **No Advanced Analysis**: Missing Monte Carlo simulation, walk-forward optimization, parameter sensitivity, portfolio-level backtesting
11. **No Collaboration**: Can't annotate trades, share results, track versions, or collaborate with team
12. **Performance Issues**: No caching, slow queries on large result sets, no cleanup of abandoned executions

## Solution Statement

Implement comprehensive improvements across all aspects of the backtest system by:

1. **Enhancing Configuration UX**: Add tooltips to all technical fields, create preset templates (conservative/moderate/aggressive), implement real-time validation with visual feedback, add required/optional field indicators, create validation summary panel showing date range validity and data availability, display risk warnings for high-risk settings, validate SL/TP configuration, add date range warnings, check historical data availability

2. **Improving Error Handling**: Create specific error states (insufficient_data, strategy_validation_error, timeout, data_source_error), display user-friendly messages with technical details hidden, add recovery suggestions based on error type, show warnings for missing candle data, implement unsaved changes confirmation dialog, add one-click retry mechanism

3. **Adding Advanced Analytics**: Build trade heatmap by day/hour, create underwater chart for drawdown visualization, add P/L distribution histogram, track longest winning/losing streaks, add drawdown event timeline with annotations, implement trade cluster analysis for over-trading detection, add benchmark comparison against buy-and-hold, create monthly/quarterly performance breakdown

4. **Enhancing Progress Monitoring**: Add timeline visualization showing current processing position, display running trade count with win/loss breakdown, show real-time equity balance updates, add comparison view with previous runs, implement exponential backoff polling, add ETA calculation, show live equity curve building

5. **Improving Risk Visualization**: Add position size bar chart relative to account balance, display potential loss scenarios for different SL distances, add risk/reward ratio visualization with color coding, calculate and display VaR, show maximum loss per trade in percentage and dollars, add comparison of position sizing methods

6. **Enhancing Library Management**: Add recently viewed section (last 5), implement hover tooltips with key metrics preview, add bulk selection and operations, implement animated status indicators, add filters for date range/strategy type/profitability, add sorting by profitability/trade count/win rate, implement card vs list view toggle, add quick stats summary bar

7. **Adding Quick Actions**: Implement Clone & Modify button, add Re-run with same config option, implement Export to Strategy Template, add Share Configuration feature with JSON export, implement Schedule Recurring Backtest, create Optimize Parameters workflow

8. **Polishing UX**: Design empty state illustrations, create getting started tutorial overlay, add sample backtest templates, replace spinners with skeleton screens, implement progressive loading for trade lists, add virtual scrolling for 100+ trades, create onboarding tooltips, add contextual help button

9. **Optimizing for Mobile**: Test and optimize for tablet/mobile, implement stacked layouts below 768px, convert grids to single column on mobile, ensure 44px touch targets, optimize date picker for mobile, ensure chart readability on small screens, add swipe gestures for navigation

10. **Adding Advanced Features**: Implement Monte Carlo simulation, add walk-forward optimization, create parameter sensitivity analysis, build strategy ranking dashboard, add correlation analysis, implement portfolio-level backtesting, create optimization mode for parameter search

11. **Enabling Collaboration**: Add trade annotation and comments, create sharing functionality, implement version control for configurations, add collaborative notes, enable comparison sharing with public URLs, add export to presentation format

12. **Improving Performance**: Implement result caching, add database indexing, optimize equity curve calculations, add compression for trade lists, implement result streaming, add health check endpoint, create cleanup job for abandoned executions, add telemetry and performance monitoring

## Relevant Files

Use these files to implement the feature:

### Backend Core Files

- `app/server/core/backtest_service.py` - CRUD service for backtests, needs enhancements for templates, sharing, versioning, caching
- `app/server/core/backtest_executor.py` - Backtest execution engine, needs enhanced progress tracking, error categorization, Monte Carlo, optimization
- `app/server/core/data_models.py` - Pydantic models for backtest data, needs new models for templates, analytics, annotations
- `app/server/server.py` - FastAPI endpoints, needs new endpoints for templates, analytics, sharing, optimization, health checks

### Backend Database Files

- `app/server/db/supabase_client.py` - Database client, may need query optimization
- `app/server/db/migrations/` - Database migrations directory, needs new migrations for templates, annotations, analytics cache

### Backend Tests

- `app/server/tests/test_backtest_executor.py` - Tests for backtest execution, needs tests for new analytics and optimization features

### Frontend Core Components

- `app/client/src/pages/BacktestLibrary.jsx` - Library page, needs recently viewed, hover previews, bulk operations, filters, view toggle, quick stats
- `app/client/src/pages/BacktestDashboard.jsx` - Dashboard page, may need updates for new features
- `app/client/src/components/BacktestConfigurationDialog.jsx` - Configuration dialog, needs tooltips, presets, real-time validation, validation summary, risk warnings
- `app/client/src/components/BacktestResultsSummary.jsx` - Results display, needs advanced analytics components integration
- `app/client/src/components/BacktestProgressModal.jsx` - Progress modal, needs timeline, running metrics, ETA, live equity curve
- `app/client/src/components/BacktestTradeList.jsx` - Trade list, needs annotations, progressive loading, virtual scrolling

### Frontend API Client

- `app/client/src/app/api.js` - API client, needs endpoints for templates, analytics, sharing, optimization

### Frontend Navigation

- `app/client/src/components/NavigationBar.jsx` - May need updates if navigation changes

### Configuration Documentation

- `app_docs/feature-b503685d-backtest-configuration.md` - Documentation for backtest configuration, reference for understanding current system
- `app_docs/feature-2bf4bcfd-backtest-execution-progress-cancel.md` - Documentation for execution and progress, reference for progress enhancements
- `app_docs/feature-632a538d-backtest-summary-statistics.md` - Documentation for summary statistics, reference for analytics enhancements
- `app_docs/feature-64cbfa24-risk-analytics.md` - Documentation for risk analytics, reference for risk visualization
- `app_docs/feature-96de4387-compare-backtest-results.md` - Documentation for comparison feature, reference for sharing and collaboration

### E2E Test Reference Files

- `.claude/commands/test_e2e.md` - E2E test runner instructions for creating test files
- `.claude/commands/e2e/test_backtest_configuration.md` - Existing E2E test for configuration, reference for test structure
- `.claude/commands/e2e/test_backtest_config_dialog_ux.md` - Existing E2E test for dialog UX, reference for test structure
- `.claude/commands/e2e/test_backtest_execution.md` - Existing E2E test for execution, reference for test structure

### Conditional Documentation Files

Per `.claude/commands/conditional_docs.md`, the following documentation is relevant:
- `app_docs/feature-b503685d-backtest-configuration.md` - Working with backtest configuration
- `app_docs/feature-2bf4bcfd-backtest-execution-progress-cancel.md` - Working with backtest execution and progress
- `app_docs/feature-62d0b3e2-backtest-progress-visualization.md` - Working with progress visualization
- `app_docs/feature-632a538d-backtest-summary-statistics.md` - Working with backtest results and summary statistics
- `app_docs/feature-69a9dc86-equity-curve-chart.md` - Working with equity curve chart
- `app_docs/feature-50dfaeee-view-trade-list.md` - Working with trade list display
- `app_docs/feature-e22956ea-view-trades-on-chart.md` - Working with trade visualization
- `app_docs/feature-ffe0f2e6-save-backtest-results.md` - Working with backtest results export
- `app_docs/feature-6499043a-view-performance-by-time-period.md` - Working with time-based performance analysis
- `app_docs/feature-64cbfa24-risk-analytics.md` - Working with risk analytics
- `app_docs/feature-96de4387-compare-backtest-results.md` - Working with backtest comparison

### New Files

#### Backend New Files

- `app/server/core/backtest_templates.py` - Service for preset templates (conservative, moderate, aggressive)
- `app/server/core/backtest_analytics.py` - Service for advanced analytics (heatmaps, underwater charts, streaks, clusters)
- `app/server/core/backtest_validation.py` - Service for configuration validation, data availability checks, risk warnings
- `app/server/core/backtest_optimizer.py` - Service for Monte Carlo, walk-forward optimization, parameter sensitivity
- `app/server/core/backtest_sharing.py` - Service for configuration sharing, version control, collaborative notes
- `app/server/core/backtest_cache.py` - Service for caching frequently accessed results
- `app/server/utils/performance_monitor.py` - Utility for telemetry and performance monitoring
- `app/server/db/migrations/006_add_backtest_templates_table.sql` - Migration for templates table
- `app/server/db/migrations/007_add_backtest_annotations_table.sql` - Migration for trade annotations
- `app/server/db/migrations/008_add_backtest_versions_table.sql` - Migration for configuration version control
- `app/server/db/migrations/009_add_backtest_analytics_cache_table.sql` - Migration for analytics cache
- `app/server/db/migrations/010_add_backtest_indexes.sql` - Migration for performance indexes

#### Frontend New Components

- `app/client/src/components/BacktestPresetSelector.jsx` - Component for selecting preset templates
- `app/client/src/components/BacktestTooltip.jsx` - Reusable tooltip component for technical fields
- `app/client/src/components/BacktestValidationSummary.jsx` - Component showing validation status, data availability, ETA
- `app/client/src/components/BacktestRiskWarning.jsx` - Component for displaying risk warnings
- `app/client/src/components/TradeHeatmap.jsx` - Component for day/hour performance heatmap
- `app/client/src/components/UnderwaterChart.jsx` - Component for drawdown visualization
- `app/client/src/components/PLDistributionHistogram.jsx` - Component for P/L distribution
- `app/client/src/components/StreakAnalysis.jsx` - Component for winning/losing streak display
- `app/client/src/components/TradeClusterAnalysis.jsx` - Component for over-trading detection
- `app/client/src/components/BenchmarkComparison.jsx` - Component for buy-and-hold comparison
- `app/client/src/components/MonthlyQuarterlyBreakdown.jsx` - Component for time period breakdown
- `app/client/src/components/BacktestTimeline.jsx` - Component for execution timeline visualization
- `app/client/src/components/RunningMetrics.jsx` - Component for real-time execution metrics
- `app/client/src/components/LiveEquityCurve.jsx` - Component for building equity curve during execution
- `app/client/src/components/PositionSizeChart.jsx` - Component for position size visualization
- `app/client/src/components/LossScenarios.jsx` - Component for potential loss scenarios
- `app/client/src/components/VaRDisplay.jsx` - Component for Value at Risk display
- `app/client/src/components/RiskRewardVisualizer.jsx` - Component for risk/reward ratio with color coding
- `app/client/src/components/BacktestRecentlyViewed.jsx` - Component for recently viewed section
- `app/client/src/components/BacktestHoverPreview.jsx` - Component for hover tooltip preview
- `app/client/src/components/BacktestBulkActions.jsx` - Component for bulk selection and operations
- `app/client/src/components/BacktestQuickStats.jsx` - Component for library quick stats summary
- `app/client/src/components/BacktestViewToggle.jsx` - Component for card/list view toggle
- `app/client/src/components/BacktestEmptyState.jsx` - Component for empty library state with illustration
- `app/client/src/components/BacktestGettingStarted.jsx` - Component for getting started tutorial overlay
- `app/client/src/components/BacktestSkeletonLoader.jsx` - Component for skeleton loading states
- `app/client/src/components/BacktestOnboardingTooltip.jsx` - Component for onboarding tooltips
- `app/client/src/components/TradeAnnotations.jsx` - Component for trade annotations and comments
- `app/client/src/components/BacktestShareDialog.jsx` - Component for sharing configuration
- `app/client/src/components/BacktestVersionHistory.jsx` - Component for version control display
- `app/client/src/components/MonteCarloDialog.jsx` - Component for Monte Carlo simulation setup
- `app/client/src/components/WalkForwardDialog.jsx` - Component for walk-forward optimization setup
- `app/client/src/components/ParameterSensitivityChart.jsx` - Component for parameter sensitivity visualization
- `app/client/src/components/StrategyRankingDashboard.jsx` - Component for strategy ranking comparison
- `app/client/src/components/CorrelationMatrix.jsx` - Component for strategy correlation display
- `app/client/src/components/PortfolioBacktestDialog.jsx` - Component for portfolio-level backtest setup

#### Frontend Utility Files

- `app/client/src/utils/backtestValidation.js` - Validation utilities for real-time validation
- `app/client/src/utils/backtestAnalytics.js` - Utilities for analytics calculations
- `app/client/src/utils/backtestFormatting.js` - Utilities for formatting backtest data
- `app/client/src/utils/virtualScrolling.js` - Utilities for virtual scrolling implementation

#### E2E Test File

- `.claude/commands/e2e/test_backtest_improvement_enhancements.md` - E2E test for all new improvements

## Implementation Plan

### Phase 1: Foundation (Configuration UX & Validation)

Establish the foundation by enhancing the configuration dialog with tooltips, preset templates, real-time validation, and validation summary. This phase also includes creating the validation service on the backend to check data availability and provide risk warnings.

**Key Components:**
- Backend validation service with data availability checks
- Preset template system (conservative, moderate, aggressive configurations)
- Real-time validation utilities with field-level feedback
- Tooltip system for technical fields
- Validation summary panel with warnings and recommendations
- Database migrations for templates and enhanced error states

### Phase 2: Core Implementation (Analytics, Progress, Error Handling)

Build the core new features including advanced analytics visualization, enhanced progress monitoring, improved error handling with specific error types, and risk visualization enhancements.

**Key Components:**
- Advanced analytics components (heatmaps, underwater charts, P/L distribution, streaks)
- Enhanced progress monitoring with timeline and running metrics
- Specific error categorization and user-friendly messaging
- Risk visualization improvements (position size charts, VaR, loss scenarios)
- Backend analytics calculation services
- Progress tracking enhancements with ETA calculation

### Phase 3: Integration (Library, Actions, Polish, Advanced Features)

Integrate enhancements into the library management, add quick actions, polish UX with empty states and onboarding, optimize for mobile, and add advanced features like Monte Carlo and optimization.

**Key Components:**
- Library improvements (recently viewed, hover previews, bulk operations, filters)
- Quick action implementations (clone & modify, re-run, templates, sharing)
- UX polish (empty states, tutorials, skeleton screens, progressive loading)
- Mobile optimization with responsive layouts and touch targets
- Advanced features (Monte Carlo, walk-forward, parameter sensitivity, portfolio backtesting)
- Collaboration features (annotations, sharing, version control)
- Performance optimizations (caching, indexing, streaming, cleanup jobs)

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Backend Foundation - Validation Service

- Create `app/server/core/backtest_validation.py` with validation utilities
- Implement `validate_configuration()` function for comprehensive config validation
- Implement `check_data_availability()` function to verify historical data exists for pair/timeframe/date range
- Implement `calculate_estimated_duration()` function to estimate backtest execution time
- Implement `get_risk_warnings()` function to identify high-risk settings (leverage > 1:50, no SL/TP, etc.)
- Implement `validate_date_range()` function to check for warnings (too short < 7 days, too long > 10 years)
- Implement `validate_sl_tp_configuration()` function to ensure at least one is configured
- Add unit tests for all validation functions

### 2. Backend Foundation - Template System

- Create database migration `006_add_backtest_templates_table.sql` for templates table (id, name, type, description, config_json, is_default, created_at)
- Create `app/server/core/backtest_templates.py` service
- Implement `create_template()`, `get_templates()`, `get_template_by_id()`, `delete_template()` functions
- Create preset templates data: conservative (low leverage 1:10, tight SL, small position size), moderate (leverage 1:30, standard SL/TP), aggressive (high leverage 1:100, wide stops, large position size)
- Implement `seed_default_templates()` function to populate database with presets on first run
- Add API endpoints in `server.py`: `POST /api/backtests/templates`, `GET /api/backtests/templates`, `GET /api/backtests/templates/{id}`, `DELETE /api/backtests/templates/{id}`
- Add unit tests for template service

### 3. Backend Foundation - Enhanced Error States

- Update `app/server/core/data_models.py` to add new error state types: `insufficient_data`, `strategy_validation_error`, `timeout`, `data_source_error`
- Enhance `BacktestConfig` model to include `error_type: Optional[str]`, `error_message: Optional[str]`, `error_details: Optional[dict]`, `recovery_suggestions: Optional[List[str]]`
- Update `app/server/core/backtest_executor.py` to categorize errors and set specific error types
- Implement `_categorize_error()` helper function to analyze exceptions and assign error types
- Implement `_generate_recovery_suggestions()` function based on error type
- Update database migration for error fields in backtests table
- Add tests for error categorization

### 4. Frontend Foundation - Tooltip System

- Create `app/client/src/components/BacktestTooltip.jsx` reusable tooltip component
- Implement tooltip with HelpCircle icon, hover trigger, popover positioning
- Create tooltip content definitions in `app/client/src/utils/tooltipContent.js` for all technical fields:
  - ATR multiplier: "Average True Range multiplier determines stop loss/take profit distance based on market volatility. Higher values = wider stops."
  - Leverage ratios: "Leverage allows you to control larger positions. 1:50 means $1 controls $50. Higher leverage = higher risk."
  - Risk/Reward: "Ratio of potential profit to potential loss. 2:1 means you target $2 profit for every $1 risked."
  - Position sizing methods: Explain each method (fixed lot, fixed dollar, percentage, risk-based)
  - Stop loss types: Explain each type (fixed pips, ATR-based, percentage, etc.)
  - Take profit types: Explain each type
  - And tooltips for all other technical fields
- Add tooltip to relevant fields in `BacktestConfigurationDialog.jsx`

### 5. Frontend Foundation - Preset Template Selector

- Create `app/client/src/components/BacktestPresetSelector.jsx` component
- Implement preset selection dropdown with conservative/moderate/aggressive options
- Add visual indicators for each preset (icons, color coding)
- Add descriptions explaining what each preset configures
- Implement "Apply Preset" action that populates form with preset values
- Add confirmation dialog if form has unsaved changes before applying preset
- Add "Load Custom Template" option to load user-saved templates
- Integrate preset selector into `BacktestConfigurationDialog.jsx` at top of form

### 6. Frontend Foundation - Real-Time Validation

- Create `app/client/src/utils/backtestValidation.js` with client-side validation utilities
- Implement validation functions for each form section (date range, balance, position sizing, risk management)
- Update `BacktestConfigurationDialog.jsx` to add real-time validation on field change
- Implement debounced validation (300ms delay) to avoid excessive re-validation
- Add visual validation indicators: green checkmark for valid, red X for invalid, yellow warning for warnings
- Display inline error messages below invalid fields
- Add visual distinction between required fields (red asterisk) and optional fields
- Implement field-level validation state tracking
- Add tests for validation utilities

### 7. Frontend Foundation - Validation Summary Panel

- Create `app/client/src/components/BacktestValidationSummary.jsx` component
- Design panel with sections: Date Range Status, Data Availability, Configuration Issues, Risk Warnings, Estimated Duration
- Add API call to backend validation endpoint to check data availability
- Display date range validation (valid range, too short warning, too long warning, future date error)
- Display data availability status (checking, available, missing data warning with gap details)
- Display configuration issues list (SL/TP both none, invalid leverage, etc.)
- Display risk warnings list (high leverage warning, no stop loss warning, large position size warning)
- Display estimated execution time based on date range and pair
- Add color coding: green for all clear, yellow for warnings, red for errors
- Integrate validation summary into `BacktestConfigurationDialog.jsx`
- Add backend endpoint `POST /api/backtests/validate` that returns validation result

### 8. Backend Analytics - Advanced Calculations

- Create `app/server/core/backtest_analytics.py` service for advanced analytics
- Implement `calculate_trade_heatmap()` function returning trade P/L aggregated by day of week and hour
- Implement `calculate_underwater_chart()` function returning drawdown data points for visualization
- Implement `calculate_pl_distribution()` function returning histogram bins for trade outcomes
- Implement `calculate_longest_streaks()` function returning longest winning and losing streaks
- Implement `identify_drawdown_events()` function returning major drawdown periods with annotations
- Implement `analyze_trade_clusters()` function detecting over-trading periods (multiple trades in short time)
- Implement `calculate_benchmark_comparison()` function comparing strategy to buy-and-hold
- Implement `calculate_monthly_quarterly_breakdown()` function aggregating performance by time period
- Add these analytics to `backtest_executor.py` results calculation
- Update `BacktestConfig.results` model to include all new analytics fields
- Add unit tests for analytics calculations

### 9. Frontend Analytics - Visualization Components

- Create `app/client/src/components/TradeHeatmap.jsx` for day/hour heatmap using Plotly
- Create `app/client/src/components/UnderwaterChart.jsx` for drawdown visualization using Plotly area chart
- Create `app/client/src/components/PLDistributionHistogram.jsx` for P/L distribution using Plotly histogram
- Create `app/client/src/components/StreakAnalysis.jsx` for displaying longest winning/losing streaks
- Create `app/client/src/components/TradeClusterAnalysis.jsx` for over-trading detection visualization
- Create `app/client/src/components/BenchmarkComparison.jsx` for strategy vs buy-and-hold comparison
- Create `app/client/src/components/MonthlyQuarterlyBreakdown.jsx` for time period performance table
- Integrate all analytics components into `BacktestResultsSummary.jsx` in new "Advanced Analytics" section
- Add tests for analytics components

### 10. Backend Progress - Enhanced Tracking

- Update `app/server/core/backtest_executor.py` progress tracking
- Add `current_date` field to progress updates showing which date is being processed
- Add `trade_breakdown` field with `{ wins: int, losses: int }` for running win/loss count
- Add `current_equity` field showing live equity balance
- Implement `calculate_eta()` function based on current processing speed
- Implement exponential backoff polling logic with increasing intervals (1s, 2s, 4s, max 10s)
- Add `equity_curve_points` array to progress for live equity curve building (timestamp, balance pairs)
- Update progress database fields to support new data
- Add tests for enhanced progress tracking

### 11. Frontend Progress - Enhanced Visualization

- Create `app/client/src/components/BacktestTimeline.jsx` showing timeline bar with current position
- Create `app/client/src/components/RunningMetrics.jsx` displaying wins, losses, win rate, current equity
- Create `app/client/src/components/LiveEquityCurve.jsx` rendering equity curve that builds during execution using lightweight-charts
- Update `BacktestProgressModal.jsx` to integrate timeline, running metrics, and live equity curve
- Implement exponential backoff polling in progress modal (use increasing intervals)
- Add estimated time remaining display with countdown
- Add comparison view showing "vs Previous Run" metrics if available
- Add tests for progress components

### 12. Frontend Error Handling - User-Friendly Messages

- Create `app/client/src/utils/errorMessages.js` mapping error types to user-friendly messages
- Implement `getErrorMessage()` function that returns friendly message based on error type
- Implement `getRecoverySuggestions()` function that returns recovery suggestions based on error type
- Update `BacktestLibrary.jsx` to display error type badge and friendly message on failed backtests
- Add "View Error Details" button that shows technical error in expandable section
- Display recovery suggestions as bulleted list with actionable items
- Implement retry mechanism: add "Retry Backtest" button on failed backtest cards
- Add confirmation dialog when user tries to close configuration with unsaved changes
- Add warning banner if selected date range has missing candle data (requires data availability check)
- Add tests for error utilities

### 13. Frontend Risk Visualization - Enhanced Charts

- Create `app/client/src/components/PositionSizeChart.jsx` showing horizontal bar chart of position size relative to account balance
- Create `app/client/src/components/LossScenarios.jsx` displaying table of potential losses at different SL distances
- Create `app/client/src/components/VaRDisplay.jsx` showing Value at Risk calculation and explanation
- Create `app/client/src/components/RiskRewardVisualizer.jsx` showing risk/reward ratio with color coding (green >= 2:1, yellow 1:1-2:1, red < 1:1)
- Update `RiskPreviewChart.jsx` to include these enhanced visualizations
- Add comparison view showing different position sizing methods side-by-side
- Integrate risk visualizations into configuration dialog
- Add tests for risk visualization components

### 14. Frontend Library - Recently Viewed & Hover Previews

- Create `app/client/src/components/BacktestRecentlyViewed.jsx` component
- Implement localStorage tracking of recently viewed backtests (store last 5 IDs with timestamps)
- Add recently viewed section at top of `BacktestLibrary.jsx` before main grid
- Create `app/client/src/components/BacktestHoverPreview.jsx` tooltip component
- Implement hover preview showing key metrics: win rate, profit/loss, total trades, Sharpe ratio, max drawdown
- Add hover trigger on backtest cards with 300ms delay
- Position tooltip adjacent to card with arrow pointer
- Add tests for recently viewed and hover preview

### 15. Frontend Library - Bulk Operations

- Create `app/client/src/components/BacktestBulkActions.jsx` component
- Add bulk selection mode toggle button to library header
- Implement checkbox on each backtest card for selection
- Add "Select All" / "Deselect All" buttons
- Implement bulk actions toolbar showing: Delete Selected, Compare Selected, Export Selected
- Add confirmation dialog for bulk delete with count of selected items
- Implement bulk export that downloads multiple backtests as JSON or CSV
- Update `BacktestLibrary.jsx` to manage bulk selection state
- Integrate with existing comparison feature for "Compare Selected" action
- Add tests for bulk operations

### 16. Frontend Library - Enhanced Filters & Sorting

- Update `BacktestLibrary.jsx` to add date range filter (last week, last month, last 3 months, last year, custom range)
- Add strategy type filter (by pair or by strategy name)
- Add profitability filter (profitable, unprofitable, all)
- Add sorting options: profitability (profit amount), number of trades, win rate
- Implement filter/sort state management with localStorage persistence
- Add filter/sort controls to library header
- Implement animated status indicators on backtest cards (running = pulsing blue, failed = red with warning icon)
- Add quick clear filters button
- Add tests for filter and sort logic

### 17. Frontend Library - View Toggle & Quick Stats

- Create `app/client/src/components/BacktestViewToggle.jsx` component with card/list view toggle
- Implement list view layout showing backtests in table format with columns: Name, Strategy, Date Range, Status, Profit/Loss, Win Rate, Actions
- Implement card view (current grid layout)
- Add view preference persistence to localStorage
- Create `app/client/src/components/BacktestQuickStats.jsx` component
- Calculate and display quick stats: Total Backtests, Average Win Rate, Best Performing Strategy (by profit), Total Profit/Loss
- Add quick stats bar below search/filter controls in library
- Add tests for view toggle and quick stats

### 18. Frontend Library - Quick Actions Menu

- Update backtest card context menu (MoreVertical button) to add new quick actions
- Add "Clone & Modify" action that duplicates backtest and immediately opens configuration dialog
- Add "Re-run with Same Config" action that starts execution without opening dialog
- Add "Export to Template" action that saves configuration as reusable template
- Add "Share Configuration" action that opens share dialog
- Create `app/client/src/components/BacktestShareDialog.jsx` for sharing
- Implement configuration export as JSON with copy to clipboard and download options
- Add confirmation toast after quick actions
- Add tests for quick actions

### 19. Frontend UX Polish - Empty States & Onboarding

- Create `app/client/src/components/BacktestEmptyState.jsx` with illustration and getting started message
- Design or find SVG illustration for empty backtest library (e.g., empty chart or test tubes)
- Add "Create Your First Backtest" button and "Learn About Backtesting" link
- Create `app/client/src/components/BacktestGettingStarted.jsx` tutorial overlay component
- Implement multi-step tutorial highlighting key features (configuration, execution, results, library)
- Add localStorage flag to show tutorial only on first visit
- Add "Show Tutorial" button in library header for returning users
- Create `app/client/src/components/BacktestSkeletonLoader.jsx` for loading states
- Replace loading spinners with skeleton screens showing card structure
- Add tests for empty state and tutorial

### 20. Frontend UX Polish - Progressive Loading & Virtual Scrolling

- Create `app/client/src/utils/virtualScrolling.js` utility for virtual scrolling
- Update `BacktestTradeList.jsx` to implement progressive loading (load first 50 trades, then load rest on scroll)
- Implement virtual scrolling for trade lists with 100+ trades using react-window or similar
- Add loading indicator at bottom of list when loading more trades
- Add "Load More" button as fallback for progressive loading
- Create `app/client/src/components/BacktestOnboardingTooltip.jsx` for contextual tooltips
- Implement onboarding tooltips that appear on first visit highlighting key features
- Add localStorage tracking of dismissed tooltips
- Add "Skip Tour" option to dismiss all tooltips
- Add tests for progressive loading and virtual scrolling

### 21. Frontend Mobile Optimization

- Update `BacktestConfigurationDialog.jsx` to implement stacked layout for form sections below 768px
- Convert multi-column grids to single column on mobile using Tailwind responsive classes
- Ensure all buttons and interactive elements are at least 44px tall for touch targets
- Test date picker on mobile and implement mobile-friendly date picker if needed (native HTML5 date input)
- Update all chart components to be responsive with proper sizing on small screens
- Add swipe gesture support for navigating between result tabs using react-swipeable or similar
- Test library grid on mobile and adjust card sizes for readability
- Add responsive navigation for library filters (collapsible filter panel on mobile)
- Test entire backtest workflow on mobile devices (emulator or real device)
- Document mobile UX enhancements

### 22. Backend Advanced Features - Monte Carlo & Optimization

- Create `app/server/core/backtest_optimizer.py` service for advanced features
- Implement `run_monte_carlo_simulation()` function that runs N iterations with randomized entry timing
- Implement `run_walk_forward_optimization()` function that tests strategy over rolling time windows
- Implement `calculate_parameter_sensitivity()` function that varies parameters and measures impact on results
- Implement `optimize_parameters()` function that searches for best parameter combinations using grid search or genetic algorithm
- Implement `calculate_strategy_correlation()` function analyzing correlation between multiple strategies
- Implement `run_portfolio_backtest()` function that backtests multiple strategies together with shared capital
- Add API endpoints in `server.py` for Monte Carlo, walk-forward, parameter sensitivity, optimization, correlation, portfolio backtesting
- Update data models for optimization results
- Add unit tests for optimizer service

### 23. Frontend Advanced Features - Monte Carlo & Optimization UI

- Create `app/client/src/components/MonteCarloDialog.jsx` for Monte Carlo simulation setup
- Implement form for number of iterations, randomization settings (entry timing, initial balance variation)
- Create visualization for Monte Carlo results (distribution of outcomes, confidence intervals)
- Create `app/client/src/components/WalkForwardDialog.jsx` for walk-forward optimization setup
- Implement form for in-sample period, out-of-sample period, step size
- Create visualization for walk-forward results (performance across windows)
- Create `app/client/src/components/ParameterSensitivityChart.jsx` for sensitivity analysis
- Implement parameter selection and range definition
- Create heatmap or line chart showing parameter impact on metrics
- Create `app/client/src/components/StrategyRankingDashboard.jsx` for strategy comparison
- Implement table showing all backtests ranked by selected metric
- Create `app/client/src/components/CorrelationMatrix.jsx` for strategy correlation
- Create `app/client/src/components/PortfolioBacktestDialog.jsx` for portfolio-level backtesting
- Implement strategy selection and capital allocation settings
- Add "Advanced Analysis" menu to library header with access to all advanced features
- Add tests for advanced feature components

### 24. Backend Collaboration - Annotations & Sharing

- Create database migration `007_add_backtest_annotations_table.sql` (id, backtest_id, trade_index, user_id, comment, created_at)
- Create database migration `008_add_backtest_versions_table.sql` (id, backtest_id, version_number, config_snapshot, changed_by, change_description, created_at)
- Create `app/server/core/backtest_sharing.py` service
- Implement `add_annotation()`, `get_annotations()`, `update_annotation()`, `delete_annotation()` functions
- Implement `save_version()`, `get_version_history()`, `restore_version()` functions for version control
- Implement `share_backtest()` function that generates shareable public URL with token
- Implement `get_shared_backtest()` function for retrieving backtest via share token
- Add collaborative notes field to backtests table
- Add API endpoints for annotations, version control, sharing
- Add unit tests for sharing service

### 25. Frontend Collaboration - Annotations & Sharing UI

- Create `app/client/src/components/TradeAnnotations.jsx` for trade annotations
- Implement annotation display on trade list items (comment icon with count)
- Implement add/edit/delete annotation dialog
- Create `app/client/src/components/BacktestVersionHistory.jsx` for version control
- Implement version history list with timestamps, change descriptions, and restore buttons
- Implement version comparison view showing diff between versions
- Update `BacktestShareDialog.jsx` to add public sharing option
- Implement share token generation and URL display with copy button
- Add access control options (view only, allow clone)
- Add collaborative notes editor to backtest results page
- Implement real-time collaborative editing with auto-save (debounced)
- Add export to presentation format (PowerPoint or PDF) with key slides: summary, charts, trade list
- Add tests for collaboration components

### 26. Backend Performance - Caching & Optimization

- Create database migration `009_add_backtest_analytics_cache_table.sql` (backtest_id, analytics_type, cached_data, created_at, expires_at)
- Create database migration `010_add_backtest_indexes.sql` adding indexes on strategy_id, status, updated_at, created_at
- Create `app/server/core/backtest_cache.py` service
- Implement `cache_analytics()`, `get_cached_analytics()`, `invalidate_cache()` functions
- Implement TTL-based cache expiration (analytics cached for 1 hour)
- Optimize `backtest_executor.py` equity curve calculation for very long backtests (10+ years) using downsampling
- Implement compression for trade lists in database (gzip compression for large lists)
- Implement partial result streaming for long-running backtests (send results in chunks)
- Add health check endpoint `GET /api/backtests/health` returning executor status, queue length, active executions
- Create cleanup job script `app/server/scripts/cleanup_abandoned_backtests.py` that marks stale "running" backtests as failed
- Create `app/server/utils/performance_monitor.py` for telemetry and performance monitoring
- Implement execution time tracking and logging
- Add unit tests for caching and cleanup

### 27. Backend Performance - Cleanup Job Scheduling

- Add cron job or scheduled task configuration for cleanup job
- Implement cleanup logic: find backtests with status "running" and updated_at > 1 hour ago
- Mark abandoned backtests as "failed" with error message "Execution abandoned or interrupted"
- Add logging for cleanup operations
- Add configuration for cleanup interval (default: every 15 minutes)
- Test cleanup job in development environment

### 28. Create E2E Test File

- Create `.claude/commands/e2e/test_backtest_improvement_enhancements.md` E2E test file
- Follow the structure from `.claude/commands/test_e2e.md` and existing E2E tests
- Include test sections for:
  - Configuration UX: tooltips, presets, real-time validation, validation summary, risk warnings
  - Error handling: specific error states, user-friendly messages, recovery suggestions, retry mechanism
  - Advanced analytics: heatmap, underwater chart, P/L distribution, streak analysis, benchmark comparison
  - Enhanced progress: timeline, running metrics, live equity curve, ETA
  - Risk visualization: position size chart, loss scenarios, VaR, risk/reward color coding
  - Library improvements: recently viewed, hover preview, bulk operations, filters, view toggle, quick stats
  - Quick actions: clone & modify, re-run, export template, share configuration
  - UX polish: empty state, getting started tutorial, skeleton screens, progressive loading
  - Mobile responsiveness: verify layouts on mobile viewport
  - Advanced features: Monte Carlo setup, walk-forward, parameter sensitivity, portfolio backtesting
  - Collaboration: annotations, version history, sharing
- Define user story, success criteria, and test steps for each section
- Include screenshot capture points for documentation
- Specify expected outcomes and verification steps

### 29. Documentation

- Update `app_docs/feature-b503685d-backtest-configuration.md` to document all configuration enhancements
- Create `app_docs/feature-7d5b1074-backtest-improvement-enhancements.md` comprehensive documentation covering:
  - Feature overview and motivation
  - Configuration UX improvements with screenshots and examples
  - Advanced analytics explanation with formulas and interpretation guides
  - Enhanced progress monitoring details
  - Error handling and recovery guide
  - Risk visualization guide
  - Library management improvements
  - Quick actions documentation
  - UX polish features
  - Mobile usage guide
  - Advanced features user guide (Monte Carlo, optimization, etc.)
  - Collaboration features guide
  - Performance improvements and caching behavior
  - API endpoint documentation
  - Database schema changes
  - Configuration examples for each preset template
  - Troubleshooting guide

### 30. Run Validation Commands

- Execute all validation commands listed in "Validation Commands" section below to ensure zero regressions
- Fix any errors or failures before marking task complete
- Verify E2E test passes with all steps successful
- Verify all unit tests pass
- Verify frontend build succeeds with no errors
- Document any known issues or limitations

## Testing Strategy

### Unit Tests

- **Backend Validation Service**: Test all validation functions with valid/invalid inputs, edge cases (min/max date ranges, all SL/TP combinations, leverage boundaries)
- **Backend Template Service**: Test template CRUD operations, preset seeding, template application
- **Backend Analytics Service**: Test all analytics calculations with sample trade data, verify correctness of heatmap aggregation, underwater chart data, P/L distribution bins, streak calculations, benchmark comparison
- **Backend Progress Enhancement**: Test ETA calculation accuracy, exponential backoff polling logic, equity curve point generation
- **Backend Error Categorization**: Test error classification for different exception types, verify recovery suggestions are appropriate
- **Backend Optimizer Service**: Test Monte Carlo iterations, walk-forward windows, parameter sensitivity ranges, portfolio backtesting with multiple strategies
- **Backend Sharing Service**: Test annotation CRUD, version control save/restore, share token generation and retrieval
- **Backend Cache Service**: Test cache storage/retrieval, TTL expiration, cache invalidation
- **Backend Cleanup Job**: Test abandoned backtest detection, status updates, logging
- **Frontend Validation Utilities**: Test client-side validation rules, real-time feedback logic, debouncing
- **Frontend Analytics Components**: Test chart rendering with various data sizes, empty states, error states
- **Frontend Progress Components**: Test timeline updates, running metrics calculations, live equity curve rendering
- **Frontend Library Features**: Test recently viewed tracking, hover preview display, bulk selection logic, filter/sort operations
- **Frontend Quick Actions**: Test clone & modify, re-run, template export, share dialog functionality
- **Frontend UX Components**: Test empty state display, tutorial steps, skeleton loading, progressive loading, virtual scrolling
- **Frontend Mobile Optimization**: Test responsive layouts at various breakpoints, touch target sizes
- **Frontend Advanced Features**: Test Monte Carlo dialog, walk-forward setup, parameter sensitivity input, portfolio configuration
- **Frontend Collaboration**: Test annotation creation/editing, version comparison, share token copy, collaborative notes auto-save

### Edge Cases

- **Validation Edge Cases**:
  - Date range exactly 7 days (minimum warning threshold)
  - Date range exactly 10 years (maximum warning threshold)
  - End date in the future (should error)
  - Both stop loss and take profit set to "none" (should error)
  - Leverage exactly 1:50 (risk warning threshold)
  - Very small initial balance ($100)
  - Very large initial balance ($10,000,000)

- **Analytics Edge Cases**:
  - Backtest with zero trades (should handle gracefully)
  - Backtest with only winning trades (streak calculation)
  - Backtest with only losing trades (streak calculation)
  - Very long backtest (10+ years) with thousands of trades
  - Backtest with trades only on one day of week or hour (sparse heatmap)

- **Progress Edge Cases**:
  - Very fast backtest completing in < 1 second
  - Very slow backtest taking > 1 hour
  - Backtest with no trades during execution
  - Backtest interrupted/cancelled mid-execution

- **Library Edge Cases**:
  - Empty library (show empty state)
  - Library with 1000+ backtests (pagination/performance)
  - Recently viewed when no backtests have been viewed yet
  - Bulk select all when 100+ backtests present
  - Filter combinations returning zero results

- **Mobile Edge Cases**:
  - Very small screen (320px width)
  - Tablet in portrait and landscape
  - Touch interactions on all interactive elements
  - Long form fields with soft keyboard open

- **Optimization Edge Cases**:
  - Monte Carlo with 1000+ iterations (performance)
  - Walk-forward with very short windows
  - Parameter sensitivity with many parameters (20+)
  - Portfolio backtest with 10+ strategies

- **Collaboration Edge Cases**:
  - Annotation on trade that was deleted
  - Version restore when strategy no longer exists
  - Share token expired or invalid
  - Concurrent edits to collaborative notes

## Acceptance Criteria

1. **Configuration UX**:
   - All technical fields have tooltips explaining their meaning
   - Preset templates (conservative, moderate, aggressive) are available and correctly populate form
   - Real-time validation provides immediate feedback on all form fields
   - Required fields are visually distinct from optional fields
   - Validation summary panel shows date range validity, data availability, and estimated execution time
   - Risk warnings appear for leverage > 1:50 and other high-risk settings
   - Both stop loss and take profit cannot be set to "none" simultaneously
   - Date range warnings appear for ranges < 7 days or > 10 years
   - Data availability check confirms historical data exists before allowing execution

2. **Error Handling**:
   - Failed backtests show specific error types (insufficient_data, strategy_validation_error, timeout, data_source_error)
   - User-friendly error messages are displayed with technical details hidden
   - Recovery suggestions are provided based on error type
   - Warning appears when selected date range has missing candle data
   - Confirmation dialog prevents closing configuration with unsaved changes
   - Retry button successfully re-runs failed backtests

3. **Advanced Analytics**:
   - Trade heatmap displays performance aggregated by day of week and hour of day
   - Underwater chart visualizes drawdown periods
   - P/L distribution histogram shows spread of trade outcomes
   - Longest consecutive winning and losing streaks are tracked and displayed
   - Visual timeline shows major drawdown events with annotations
   - Trade cluster analysis identifies over-trading periods
   - Benchmark comparison shows strategy performance vs buy-and-hold
   - Monthly/quarterly performance breakdown table is accurate

4. **Enhanced Progress**:
   - Timeline visualization shows current date being processed within total range
   - Running trade count displays wins vs losses breakdown during execution
   - Current equity balance updates in real-time during backtest
   - Comparison view shows how current run compares to previous backtests
   - Exponential backoff polling reduces server load
   - Estimated time remaining is calculated and displayed
   - Live equity curve builds as backtest progresses

5. **Risk Visualization**:
   - Position size bar chart shows size relative to account balance
   - Potential loss scenarios are displayed for different stop loss distances
   - Risk/reward ratio visualization uses color coding (green/yellow/red)
   - Value at Risk (VaR) is calculated and displayed
   - Maximum possible loss per trade is shown in percentage and dollars
   - Visual comparison of different position sizing methods is available

6. **Library Management**:
   - Recently viewed section shows last 5 accessed backtests
   - Hover preview tooltips display key metrics without opening backtest
   - Bulk selection allows deleting, comparing, or exporting multiple backtests
   - Animated status indicators show running (pulsing blue) and failed (red) states
   - Filters for date range, strategy type, and profitability work correctly
   - Sorting by profitability, number of trades, and win rate functions properly
   - Card view and list view toggle switches layout
   - Quick stats summary bar shows accurate totals and averages

7. **Quick Actions**:
   - Clone & Modify duplicates backtest and opens configuration dialog
   - Re-run with Same Config executes without opening dialog
   - Export to Template saves configuration as reusable template
   - Share Configuration exports settings as JSON with copy/download options

8. **UX Polish**:
   - Empty state illustration and message appear when library is empty
   - Getting started tutorial overlay guides first-time users
   - Sample backtest templates are available for demonstration
   - Skeleton screens replace loading spinners
   - Progressive loading handles large trade lists (first 50, then rest)
   - Virtual scrolling works for trade lists with 100+ trades
   - Onboarding tooltips highlight key features on first visit
   - Contextual help button opens feature documentation

9. **Mobile Responsiveness**:
   - Configuration dialog uses stacked layout on screens < 768px
   - Multi-column grids convert to single column on mobile
   - All buttons and interactive elements are at least 44px tall
   - Date picker is usable on mobile devices
   - Charts are readable and interactive on small screens
   - Swipe gestures navigate between result sections

10. **Advanced Features**:
    - Monte Carlo simulation runs multiple iterations with randomization
    - Walk-forward optimization tests strategy over rolling windows
    - Parameter sensitivity analysis shows impact of parameter changes
    - Strategy ranking dashboard compares all backtests
    - Correlation analysis shows how strategies perform across conditions
    - Portfolio-level backtesting tests multiple strategies together
    - Optimization mode finds best parameter combinations

11. **Collaboration**:
    - Comments and annotations can be added to specific trades
    - Share functionality allows sending results to team members
    - Version control tracks configuration changes with history
    - Collaborative notes support multiple users documenting insights
    - Backtest comparison can be shared with public URL
    - Export to presentation format generates slides with key results

12. **Performance**:
    - Caching improves load times for frequently accessed results
    - Database indexes speed up library queries
    - Equity curve calculation is optimized for 10+ year backtests
    - Trade lists are compressed in database
    - Partial result streaming works for long-running backtests
    - Health check endpoint reports executor status
    - Cleanup job marks abandoned executions as failed
    - Telemetry tracks execution times and performance metrics

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- Read `.claude/commands/test_e2e.md` for E2E test runner instructions
- Execute `.claude/commands/e2e/test_backtest_improvement_enhancements.md` E2E test to validate all new functionality works end-to-end
- Execute existing backtest E2E tests to ensure no regressions:
  - `.claude/commands/e2e/test_backtest_configuration.md`
  - `.claude/commands/e2e/test_backtest_config_dialog_ux.md`
  - `.claude/commands/e2e/test_backtest_execution.md`
  - `.claude/commands/e2e/test_backtest_progress_visualization.md`
  - `.claude/commands/e2e/test_backtest_summary_statistics.md`
  - `.claude/commands/e2e/test_equity_curve_chart.md`
  - `.claude/commands/e2e/test_view_trade_list.md`
  - `.claude/commands/e2e/test_view_trades_on_chart.md`
  - `.claude/commands/e2e/test_save_backtest_results.md`
  - `.claude/commands/e2e/test_view_performance_by_time_period.md`
  - `.claude/commands/e2e/test_risk_analytics.md`
  - `.claude/commands/e2e/test_compare_backtest_results.md`
- `cd app/server && uv run pytest` - Run all server tests to validate backend changes work with zero regressions
- `cd app/server && uv run pytest tests/test_backtest_executor.py -v` - Run backtest executor tests specifically
- `cd app/server && uv run pytest tests/ -k validation -v` - Run validation tests specifically
- `cd app/server && uv run pytest tests/ -k analytics -v` - Run analytics tests specifically
- `cd app/server && uv run pytest tests/ -k optimizer -v` - Run optimizer tests specifically
- `cd app/client && npm run build` - Run frontend build to validate all components compile with zero errors
- `cd app/client && npm test` - Run frontend tests if available
- Manually test configuration dialog tooltips on all fields
- Manually test preset template selection (conservative, moderate, aggressive)
- Manually test real-time validation on form fields
- Manually test validation summary panel with various configurations
- Manually test risk warnings display for high leverage
- Manually test error states and recovery suggestions
- Manually test advanced analytics charts (heatmap, underwater, P/L distribution, streaks, clusters, benchmark)
- Manually test enhanced progress monitoring during backtest execution
- Manually test risk visualization charts
- Manually test recently viewed section
- Manually test hover preview on backtest cards
- Manually test bulk operations (select, delete, compare, export)
- Manually test library filters and sorting
- Manually test card/list view toggle
- Manually test quick stats summary bar
- Manually test Clone & Modify, Re-run, Export Template, Share Configuration quick actions
- Manually test empty state illustration and getting started tutorial
- Manually test skeleton screens and progressive loading
- Manually test mobile responsiveness on 768px, 480px, and 320px viewports
- Manually test Monte Carlo simulation setup and execution
- Manually test walk-forward optimization
- Manually test parameter sensitivity analysis
- Manually test portfolio-level backtesting
- Manually test trade annotations
- Manually test version history and restore
- Manually test share configuration and public URL access
- Manually verify caching improves performance on repeated loads
- Manually verify cleanup job marks abandoned backtests as failed

## Notes

### Implementation Considerations

- **Phased Rollout**: This is a large feature with many components. Consider implementing in phases with Phase 1 (Configuration UX & Validation) first, then Phase 2 (Analytics, Progress, Error Handling), then Phase 3 (Library, Actions, Polish, Advanced Features)
- **Feature Flags**: Consider using feature flags to enable/disable advanced features (Monte Carlo, walk-forward, portfolio backtesting) for gradual rollout
- **Performance Impact**: Advanced analytics and optimization features may impact performance. Ensure caching and optimization are in place before releasing to production
- **Mobile Testing**: Thoroughly test mobile experience on actual devices, not just emulators, to ensure touch interactions and gestures work properly
- **Accessibility**: Ensure all new components are accessible with keyboard navigation and screen readers
- **Backwards Compatibility**: Ensure existing backtests without new fields (analytics, annotations, versions) continue to work correctly

### Dependencies

- No new npm packages should be needed for frontend (existing Plotly.js, lightweight-charts, Tailwind CSS cover visualization needs)
- Consider adding `react-window` or `react-virtualized` for virtual scrolling if not already present
- Consider adding `react-swipeable` for swipe gesture support on mobile
- Backend may need `scipy` or `numpy` for advanced statistical calculations (Monte Carlo, parameter optimization)
- Backend may need `reportlab` or `python-pptx` for presentation format export

### Future Enhancements

After this feature is complete, consider these follow-up enhancements:
- **AI-Powered Optimization**: Use machine learning to suggest optimal parameter combinations
- **Multi-Strategy Portfolios**: Automatically generate diversified portfolio recommendations
- **Real-Time Backtesting**: Run backtests on live data as new candles arrive
- **Community Sharing**: Public marketplace for sharing successful strategies and configurations
- **Backtesting API**: External API for programmatic backtest creation and management
- **Advanced Risk Models**: VaR improvements with GARCH models, Expected Shortfall (CVaR)
- **Seasonality Analysis**: Detect and visualize seasonal patterns in strategy performance
- **Regime Detection**: Automatically identify different market regimes and strategy performance in each

### Known Limitations

- **Historical Data Dependency**: Data availability checks rely on historical data API which must be reliable and comprehensive
- **Execution Time**: Very long backtests (10+ years, high-frequency timeframes) may still take significant time despite optimizations
- **Mobile Chart Interaction**: Some complex chart interactions may be challenging on very small screens despite optimizations
- **Collaboration Real-Time**: Collaborative notes use debounced auto-save, not true real-time synchronization (consider WebSocket for future enhancement)
- **Monte Carlo Iterations**: Very high iteration counts (1000+) may require significant processing time and memory
- **Portfolio Backtesting**: Portfolio-level backtesting with many strategies may have performance implications
