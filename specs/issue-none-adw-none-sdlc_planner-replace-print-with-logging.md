# Chore: Replace Server Print Statements with Proper Python Logging

## Metadata
issue_number: `none`
adw_id: `none`
issue_json: `none`

## Chore Description
Replace all `print()` statements in the server codebase with proper Python logging. Each print statement must be converted to use the appropriate log level (DEBUG, INFO, WARNING, ERROR) based on the context and purpose of the message. The exact same output text must be preserved to maintain consistent log messages. All logging output must be written to stdout (standard output) to ensure compatibility with container environments and log aggregators.

## Relevant Files
Use these files to resolve the chore:

- **`app/server/utils/logger.py`** - Existing logging utility with `LogWrapper` class. Currently only writes to files. Needs to be enhanced to add a console/stdout handler so all logs are written to standard output.

- **`app/server/server.py`** - Main FastAPI application entry point. Contains 1 print statement at line 279 (startup banner). Already has proper logging configured with stdout handler - this is the pattern to follow.

- **`app/server/app.py`** - Alternative FastAPI entry point. Contains 1 print statement at line 166 (startup banner). Needs logging import and configuration.

- **`app/server/core/openfx_api.py`** - OpenFX API client. Contains 6 print statements:
  - Line 118: ERROR - `get_account_summary()` failure
  - Line 134: ERROR - `get_account_instruments()` failure
  - Line 328: ERROR - Instrument not found
  - Line 344: INFO - Place trade action
  - Line 404: INFO - Trade closed successfully
  - Line 406: ERROR - Failed to close trade

- **`app/server/db/database.py`** - Supabase database wrapper. Contains 7 print statements:
  - Line 30: DEBUG - Test connection (list collections)
  - Line 43: ERROR - delete_many error
  - Line 56: ERROR - add_one error
  - Line 69: ERROR - add_many error
  - Line 85: ERROR - query_distinct error
  - Line 102: ERROR - query_single error
  - Line 123: ERROR - query_all error

- **`app/server/infrastructure/instrument_collection.py`** - Instrument collection manager. Contains 4 print statements:
  - Line 59: WARNING - Instrument file creation failed
  - Line 79: WARNING - Instrument DB creation failed
  - Line 94-95: DEBUG - Print instruments (diagnostic output)

- **`app/server/scraping/investing.py`** - Investing.com scraper. Contains 2 print statements:
  - Line 101: ERROR - Error fetching technicals
  - Line 141: INFO - Fetching pair_id/timeframe (progress indicator)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Enhance the LogWrapper utility to support stdout
Modify `app/server/utils/logger.py` to:
- Add a `StreamHandler` that writes to `sys.stdout` in addition to the file handler
- Ensure the same log format is applied to both handlers
- This allows the existing `LogWrapper` class to output to both file and stdout

### Step 2: Create a shared logging configuration module
Create a simple function or use the existing logging configuration pattern from `server.py` to ensure consistent logging setup across all modules. Since `server.py` already has a good pattern, we'll replicate it in other entry points and import logging in modules that need it.

### Step 3: Update app/server/app.py
- Add logging imports at the top (`import logging`, `import sys`)
- Configure logging to stdout with the same format as `server.py`:
  ```python
  logging.basicConfig(
      level=logging.INFO,
      format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
      handlers=[logging.StreamHandler(sys.stdout)]
  )
  logger = logging.getLogger(__name__)
  ```
- Replace print statement at line 166 with `logger.info()`:
  - Original: `print(""" ... startup banner ... """)`
  - New: `logger.info(""" ... startup banner ... """)`

### Step 4: Update app/server/server.py
- Replace print statement at line 279 with `logger.info()`:
  - Original: `print(f""" ... startup banner ... """)`
  - New: `logger.info(f""" ... startup banner ... """)`
- The logging is already configured in this file, just need to use logger instead of print

### Step 5: Update app/server/core/openfx_api.py
- Add logging import at the top: `import logging`
- Create module-level logger: `logger = logging.getLogger(__name__)`
- Replace print statements:
  - Line 118: `print(f"ERROR get_account_summary(): {data}")` -> `logger.error(f"get_account_summary(): {data}")`
  - Line 134: `print(f"ERROR get_account_instruments(): {symbol_data}")` -> `logger.error(f"get_account_instruments(): {symbol_data}")`
  - Line 328: `print(f"Instrument not found: {pair_name}")` -> `logger.error(f"Instrument not found: {pair_name}")`
  - Line 344: `print(f"Place Trade: {data}")` -> `logger.info(f"Place Trade: {data}")`
  - Line 404: `print(f"Closed {trade_id} successfully")` -> `logger.info(f"Closed {trade_id} successfully")`
  - Line 406: `print(f"Failed to close {trade_id}")` -> `logger.error(f"Failed to close {trade_id}")`

### Step 6: Update app/server/db/database.py
- Add logging import at the top: `import logging`
- Create module-level logger: `logger = logging.getLogger(__name__)`
- Replace print statements:
  - Line 30: `print(self.db.list_collection_names())` -> `logger.debug(self.db.list_collection_names())`
  - Line 43: `print(f"delete_many error: {error}")` -> `logger.error(f"delete_many error: {error}")`
  - Line 56: `print(f"add_one error: {error}")` -> `logger.error(f"add_one error: {error}")`
  - Line 69: `print(f"add_many error: {error}")` -> `logger.error(f"add_many error: {error}")`
  - Line 85: `print(f"query_distinct error: {error}")` -> `logger.error(f"query_distinct error: {error}")`
  - Line 102: `print(f"query_single error: {error}")` -> `logger.error(f"query_single error: {error}")`
  - Line 123: `print(f"query_all error: {error}")` -> `logger.error(f"query_all error: {error}")`

### Step 7: Update app/server/infrastructure/instrument_collection.py
- Add logging import at the top: `import logging`
- Create module-level logger: `logger = logging.getLogger(__name__)`
- Replace print statements:
  - Line 59: `print("Instrument file creation failed")` -> `logger.warning("Instrument file creation failed")`
  - Line 79: `print("Instrument DB creation failed")` -> `logger.warning("Instrument DB creation failed")`
  - Line 94: `print(key, value)` -> `logger.debug(f"{key} {value}")`
  - Line 95: `print(f"{len(self.instruments_dict)} instruments")` -> `logger.debug(f"{len(self.instruments_dict)} instruments")`

### Step 8: Update app/server/scraping/investing.py
- Add logging import at the top: `import logging`
- Create module-level logger: `logger = logging.getLogger(__name__)`
- Replace print statements:
  - Line 101: `print(f"Error fetching technicals: {e}")` -> `logger.error(f"Error fetching technicals: {e}")`
  - Line 141: `print(f"Fetching pair_id: {pair_id}, timeframe: {time_frame}")` -> `logger.info(f"Fetching pair_id: {pair_id}, timeframe: {time_frame}")`

### Step 9: Update app/server/utils/logger.py to include stdout handler
Modify the `LogWrapper` class to also output to stdout:
- Import `sys` module
- In the `__init__` method, add a `StreamHandler(sys.stdout)` in addition to the `FileHandler`
- Apply the same formatter to both handlers
- This ensures any code using `LogWrapper` will output to both file and stdout

### Step 10: Run Validation Commands
Execute all validation commands to confirm zero regressions.

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `cd app/server && uv run pytest` - Run server tests to validate the chore is complete with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the chore is complete with zero regressions
- `cd app/server && uv run python -c "import server; import app; import core.openfx_api; import db.database; import infrastructure.instrument_collection; import scraping.investing; print('All imports successful')"` - Verify all modified modules import without errors
- `grep -r "print(" app/server --include="*.py" | grep -v "__pycache__" | grep -v "test_" | grep -v ".pyc"` - Verify no print statements remain in server code (excluding tests)

## Notes
- The startup banners in `server.py` and `app.py` use multi-line strings with ASCII art. When converting to logging, the formatting will be preserved exactly.
- Log levels chosen based on context:
  - **DEBUG**: Diagnostic information (test_connection output, instrument listing)
  - **INFO**: Normal operational messages (trade placement, successful operations, progress)
  - **WARNING**: Unexpected but recoverable situations (file/DB creation failures that have fallbacks)
  - **ERROR**: Operation failures that may affect functionality
- The logging configuration in `server.py` already writes to stdout via `StreamHandler(sys.stdout)` - this pattern is followed in all other files.
- Python's logging module is already available in the standard library, no additional dependencies needed.
- All loggers use `__name__` to create a logger hierarchy (e.g., `core.openfx_api`, `db.database`) which allows for fine-grained log level control if needed later.
