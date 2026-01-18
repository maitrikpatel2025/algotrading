# Chart API 503 Error Fix - Retry Logic Implementation

**ADW ID:** fbcb8acc
**Date:** 2026-01-18
**Specification:** specs/issue-32-adw-fbcb8acc-sdlc_planner-fix-chart-api-503-error.md

## Overview

This fix addresses 503 Service Unavailable errors when loading chart data on the Strategy page. The solution implements retry logic with exponential backoff in the OpenFX API client, allowing the application to automatically retry failed requests for transient errors before reporting failure to the user.

## What Was Built

- Retry logic with exponential backoff for transient API errors (5xx status codes)
- Automatic retry for connection errors, timeouts, and request exceptions
- Configurable retry parameters (max_retries, backoff_base)
- Warning-level logging for retry attempts
- Error-level logging when all retries are exhausted
- E2E test for validating Strategy page chart loading

## Technical Implementation

### Files Modified

- `app/server/core/openfx_api.py`: Added retry logic to `_make_request()` method with exponential backoff
- `.claude/commands/e2e/test_strategy_chart_load.md`: New E2E test file for chart loading validation

### Key Changes

- **New `_is_transient_error()` method**: Checks if HTTP status code is in 5xx range (transient/retryable)
- **Enhanced `_make_request()` method**: Added `max_retries` (default: 3) and `backoff_base` (default: 1.0s) parameters
- **Retry loop implementation**: Retries up to 3 times with exponential backoff (1s, 2s, 4s delays)
- **Connection error handling**: Catches `ConnectionError`, `Timeout`, and `RequestException` for retry
- **Logging integration**: Warning logs for retry attempts, error logs when all retries exhausted

### Retry Behavior

```
Attempt 1: Request fails with 503 → Wait 1.0s → Retry
Attempt 2: Request fails with 503 → Wait 2.0s → Retry
Attempt 3: Request fails with 503 → Return error (all retries exhausted)
```

## How to Use

1. The retry logic is automatic and requires no user intervention
2. Navigate to the Strategy page at http://localhost:3000/strategy
3. Select a currency pair and timeframe
4. Click "Load Data" - the system will automatically retry on transient failures
5. If all retries fail, an error message will be displayed

## Configuration

The retry behavior is configured via method parameters:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `max_retries` | 3 | Maximum number of retry attempts |
| `backoff_base` | 1.0 | Base time in seconds for exponential backoff |

Backoff formula: `wait_time = backoff_base * (2 ^ attempt)`

## Testing

### Unit Tests
```bash
cd app/server && uv run pytest
```

### E2E Test
Run the Strategy chart load E2E test:
```bash
# Read and execute the E2E test
# See .claude/commands/e2e/test_strategy_chart_load.md
```

The E2E test validates:
- Navigation to Strategy page
- Currency pair and timeframe selection
- Successful chart data loading
- No error messages displayed

## Notes

- Only 5xx errors and connection-related exceptions trigger retries
- 4xx client errors are not retried as they indicate permanent failures
- The throttle logic (`_throttle()`) is applied before each request attempt
- Return signature of `_make_request()` remains unchanged for backward compatibility
- Log messages include the URL, attempt number, and wait time for debugging
