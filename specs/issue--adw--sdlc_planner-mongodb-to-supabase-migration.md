# Chore: MongoDB to Supabase Migration

## Metadata
issue_number: ``
adw_id: ``
issue_json: ``

## Chore Description
Replace the current MongoDB-based architecture with Supabase (Postgres) as the primary database and auth layer. This migration involves:

1. **Remove MongoDB Usage**: Remove MongoDB drivers, models/schemas, connection logic, environment variables, and any Mongo-specific queries from the codebase.

2. **Implement Supabase**: Re-implement all persistence operations using Supabase (SQL tables + Supabase client), including existing collections, indexes, and relationships as appropriate Postgres schema.

3. **Update Configuration**: Update migrations/seed scripts, config files (.env.example, docs) to reflect Supabase URL + anon/service keys.

4. **Preserve Behavior**: Preserve existing API behavior, request/response shapes, and business logic exactly. Keep output written to standard output where applicable (no breaking changes to runtime output).

5. **Add Safeguards**: Add minimal safeguards including connection validation on startup and clear errors if misconfigured.

### Current MongoDB Architecture Analysis

The MongoDB implementation is currently used for:

**Collections Identified:**
- `forex_sample` - Sample forex data storage
- `forex_calendar` - Forex calendar events
- `forex_instruments` - Trading instrument definitions (Symbol, Precision, TradeAmountStep)

**Database Operations in `DataDB` class (`db/database.py`):**
- `delete_many()` - Delete multiple documents by query
- `add_one()` - Insert single document
- `add_many()` - Insert multiple documents
- `query_distinct()` - Get distinct values for a field
- `query_single()` - Query single document (with _id projection)
- `query_all()` - Query all matching documents (with _id projection)
- `test_connection()` - List collection names

**Usage Points:**
- `infrastructure/instrument_collection.py` - Uses `DataDB` to load/store instrument data via `load_from_db()` and `create_in_db()` methods

## Relevant Files
Use these files to resolve the chore:

### Files to Modify

- **`app/server/db/database.py`** - Core database module that implements MongoDB `DataDB` class with all CRUD operations. Will be completely rewritten to use Supabase client.

- **`app/server/db/__init__.py`** - Module exports `DataDB` class. Will be updated to export the new Supabase-based class.

- **`app/server/config/settings.py`** - Contains `MONGO_CONN_STR` environment variable. Will be updated to use Supabase URL and keys.

- **`app/server/infrastructure/instrument_collection.py`** - Uses `DataDB` for `load_from_db()` and `create_in_db()` methods. Will need updates to work with new Supabase data layer.

- **`app/server/env.example`** - Contains MongoDB configuration section. Will be updated with Supabase configuration.

- **`app/server/pyproject.toml`** - Contains `pymongo` and `dnspython` dependencies. Will be updated to use `supabase` Python client.

- **`app/server/requirements.txt`** - Contains `pymongo` and `dnspython` dependencies. Will be updated with Supabase dependencies.

- **`README.md`** - Main project README references MongoDB in prerequisites, environment setup, technology stack, and troubleshooting. Will be updated to reference Supabase.

- **`app/server/README.md`** - Server README references MongoDB in directory structure, prerequisites, configuration, dependencies, and troubleshooting. Will be updated to reference Supabase.

### New Files

- **`app/server/db/supabase_client.py`** - New file for Supabase client initialization and connection validation.

- **`app/server/db/migrations/001_initial_schema.sql`** - SQL migration file defining Postgres tables for forex_instruments, forex_sample, forex_calendar.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Update Dependencies

- Remove `pymongo>=4.5.0` from `app/server/pyproject.toml` dependencies list
- Remove `dnspython>=2.4.0` from `app/server/pyproject.toml` dependencies list
- Add `supabase>=2.0.0` to `app/server/pyproject.toml` dependencies list
- Remove `pymongo>=4.5.0` from `app/server/requirements.txt`
- Remove `dnspython>=2.4.0` from `app/server/requirements.txt`
- Add `supabase>=2.0.0` to `app/server/requirements.txt`
- Run `cd app/server && uv sync` to update lock file and install new dependencies

### Step 2: Update Environment Configuration

- In `app/server/config/settings.py`:
  - Remove `MONGO_CONN_STR` variable definition
  - Add `SUPABASE_URL = os.getenv("SUPABASE_URL", "")` for Supabase project URL
  - Add `SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")` for anonymous/public key
  - Add `SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")` for service role key (optional, for admin operations)

- In `app/server/env.example`:
  - Remove the MongoDB Database Configuration section (lines 17-23)
  - Add new Supabase Database Configuration section with:
    ```
    # -----------------------------------------------------------------------------
    # Supabase Database Configuration
    # -----------------------------------------------------------------------------
    # Get your Supabase credentials from: https://supabase.com/dashboard/project/_/settings/api
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_ANON_KEY=your_anon_key_here
    SUPABASE_SERVICE_KEY=your_service_key_here
    ```

### Step 3: Create Supabase Client Module

- Create new file `app/server/db/supabase_client.py` with:
  - Import supabase client library
  - Import settings for Supabase URL and keys
  - Create `get_supabase_client()` function that returns initialized Supabase client
  - Add `validate_connection()` function that tests connection on startup
  - Add clear error messages if SUPABASE_URL or SUPABASE_ANON_KEY are not configured
  - Log successful connection to stdout

### Step 4: Create SQL Migration for Postgres Schema

- Create directory `app/server/db/migrations/` if it doesn't exist
- Create file `app/server/db/migrations/001_initial_schema.sql` with:
  - `forex_instruments` table:
    ```sql
    CREATE TABLE IF NOT EXISTS forex_instruments (
      id SERIAL PRIMARY KEY,
      symbol VARCHAR(20) UNIQUE NOT NULL,
      precision INTEGER NOT NULL,
      trade_amount_step INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX idx_forex_instruments_symbol ON forex_instruments(symbol);
    ```
  - `forex_sample` table (for sample data storage):
    ```sql
    CREATE TABLE IF NOT EXISTS forex_sample (
      id SERIAL PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    ```
  - `forex_calendar` table (for calendar events):
    ```sql
    CREATE TABLE IF NOT EXISTS forex_calendar (
      id SERIAL PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    ```

### Step 5: Rewrite Database Module for Supabase

- Rewrite `app/server/db/database.py` to:
  - Remove all pymongo imports (`from pymongo import MongoClient, errors`)
  - Remove `from config.settings import MONGO_CONN_STR`
  - Import `from db.supabase_client import get_supabase_client`
  - Import `from config.settings import SUPABASE_URL, SUPABASE_ANON_KEY`
  - Rewrite `DataDB` class to use Supabase client instead of MongoDB:
    - Keep the same class name `DataDB` for backwards compatibility
    - Keep the same collection name constants: `SAMPLE_COLL`, `CALENDAR_COLL`, `INSTRUMENTS_COLL`
    - Map collection names to Supabase table names (same names, just used as table references)
    - Rewrite `__init__` to initialize Supabase client instead of MongoClient
    - Rewrite `test_connection()` to verify Supabase connection
    - Rewrite `delete_many()` to use Supabase `.delete().match(kwargs).execute()`
    - Rewrite `add_one()` to use Supabase `.insert(document).execute()`
    - Rewrite `add_many()` to use Supabase `.insert(documents).execute()`
    - Rewrite `query_distinct()` to use Supabase `.select(key).execute()` with Python set for distinct
    - Rewrite `query_single()` to use Supabase `.select("*").match(kwargs).limit(1).execute()` and return first result without internal id
    - Rewrite `query_all()` to use Supabase `.select("*").match(kwargs).execute()` and return list without internal ids
  - Preserve existing method signatures exactly
  - Preserve existing error handling patterns with logging
  - Add connection validation that runs on class instantiation

### Step 6: Update Database Module Exports

- In `app/server/db/__init__.py`:
  - Keep export: `from .database import DataDB`
  - Add export: `from .supabase_client import get_supabase_client, validate_connection`

### Step 7: Update Instrument Collection for Supabase

- In `app/server/infrastructure/instrument_collection.py`:
  - The `DataDB` import should continue to work since we're keeping the same class interface
  - Update `load_from_db()` method if needed to handle Supabase response format:
    - Supabase returns list of rows, each row is a dict with column values
    - The current implementation expects a single document with symbol keys
    - Convert from Supabase row format to expected dict format: `{symbol: {Symbol, Precision, TradeAmountStep}}`
  - Update `create_in_db()` method if needed:
    - Current implementation stores all instruments as a single document
    - For Supabase, store each instrument as a separate row
    - Delete existing instruments first (already done), then insert each instrument as a row
  - Ensure the same public interface and behavior is maintained

### Step 8: Add Startup Connection Validation

- In `app/server/server.py`:
  - Add import: `from db import validate_connection`
  - Add startup event handler that calls `validate_connection()`
  - Log success message if connection is valid
  - Log clear error message and exit gracefully if connection fails or misconfigured

- In `app/server/app.py` (alternative entry point):
  - Add same startup connection validation as server.py

### Step 9: Update Health Check Endpoint

- In `app/server/server.py` health endpoint:
  - Update the `database_connected` field to actually check Supabase connection
  - Use the `validate_connection()` function to test connectivity
  - Return appropriate boolean value based on actual connection status

### Step 10: Update Documentation

- In `README.md`:
  - Update Prerequisites section: Change "MongoDB (optional, for data persistence)" to "Supabase account (optional, for data persistence)"
  - Update Server Environment Variables section: Replace MongoDB config with Supabase config
  - Update Technology Stack Backend table: Replace "PyMongo | MongoDB driver" with "Supabase | PostgreSQL database client"
  - Update Troubleshooting section: Replace "MongoDB connection failed" with "Supabase connection failed" and update troubleshooting steps

- In `app/server/README.md`:
  - Update directory structure: Change `database.py # MongoDB connection` to `database.py # Supabase connection`
  - Update Prerequisites: Change "MongoDB (optional, for data persistence)" to "Supabase account (optional, for data persistence)"
  - Update Environment Variables section: Replace MongoDB config with Supabase config
  - Update Database Dependencies table: Replace pymongo/dnspython with supabase
  - Update Troubleshooting section: Replace MongoDB troubleshooting with Supabase troubleshooting

### Step 11: Run Validation Commands

- Run all validation commands listed below to ensure zero regressions

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `cd app/server && uv sync` - Sync dependencies to ensure supabase package is installed and pymongo is removed
- `cd app/server && uv run pytest` - Run server tests to validate the chore is complete with zero regressions
- `cd app/client && npm run build` - Run frontend build to validate the chore is complete with zero regressions

## Notes

### Important Implementation Considerations

1. **Supabase Client Initialization**: The Supabase Python client is initialized with URL and key. Use the anon key for most operations. The service key should only be used for admin operations that bypass Row Level Security (RLS).

2. **Data Format Conversion**: MongoDB stores documents as nested dicts with flexible schema. Supabase/Postgres uses relational tables. The `forex_instruments` storage will need conversion:
   - MongoDB: Single document like `{EURUSD: {Symbol: "EURUSD", ...}, GBPUSD: {...}}`
   - Supabase: Multiple rows, one per instrument with columns for each field

3. **Error Handling**: The current MongoDB implementation catches `pymongo.errors.InvalidOperation`. Supabase will raise different exceptions. Update error handling to catch Supabase-specific exceptions while maintaining the same logging patterns.

4. **Connection Validation**: Add meaningful error messages when Supabase is misconfigured. Example: "SUPABASE_URL environment variable is not set. Please configure your Supabase credentials in .env file."

5. **Backwards Compatibility**: The `DataDB` class interface must remain identical so that `InstrumentCollection` and any other code using it continues to work without changes to their public APIs.

6. **Schema Management**: The SQL migration file is provided for reference. In a production Supabase setup, tables would be created through the Supabase Dashboard or using Supabase CLI migrations. Document this in the setup instructions.

7. **Testing Considerations**: Existing tests mock the `DataDB` class methods. Since we're preserving the interface, tests should continue to pass. However, if there are any integration tests that actually connect to MongoDB, those will need to be updated for Supabase.

8. **Optional Database**: The README indicates MongoDB is optional. Supabase should also be optional. If Supabase is not configured, the application should still run but database-dependent features should gracefully degrade or show appropriate messages.
