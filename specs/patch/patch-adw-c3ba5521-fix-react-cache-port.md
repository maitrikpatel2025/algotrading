# Patch: Fix React webpack cache and browser cache for port 8000

## Metadata
adw_id: `c3ba5521`
review_change_request: `Issue #1: React frontend bundle.js is making API calls to http://localhost:9104 instead of http://localhost:8000 where the backend server is actually running. The .env file has been corrected to use port 8000, but the React development server's cached bundle still contains the old port 9104. This causes all API calls (loading backtests, loading strategies) to fail with ERR_CONNECTION_REFUSED errors. The issue appears to be browser/webpack caching of the old environment variable value despite restarting the dev server. Resolution: Clear React build cache and browser cache, then restart the development server: 1) Stop frontend (pkill -f npm start), 2) Remove node_modules/.cache if it exists, 3) Clear browser cache or use hard refresh (Ctrl+Shift+R), 4) Restart frontend (npm start). Alternatively, use incognito/private browsing mode to bypass cache. The root cause is that .env changes require clearing webpack-dev-server cache and browser cache to take effect. Severity: blocker`

## Issue Summary
**Original Spec:** None (Cache-related blocker issue)
**Issue:** React frontend is making API calls to the old port 9104 instead of the correct port 8000 due to webpack-dev-server and browser caching of the old REACT_APP_API_URL environment variable value.
**Solution:** Clear webpack build cache, remove browser cache, and restart the development server to force React to rebuild with the updated port 8000 from the .env file.

## Files to Modify
No code changes required - this is a cache-clearing and restart operation.

## Implementation Steps
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Stop frontend development server
- Kill any running npm/React processes: `pkill -f "npm start" || pkill -f "react-scripts"`
- Verify no processes are running on port 3000: `lsof -ti:3000`

### Step 2: Clear webpack cache and browser cache
- Remove webpack-dev-server cache directory: `rm -rf app/client/node_modules/.cache`
- Remove React build directory if it exists: `rm -rf app/client/build`
- Verify .env file has correct port: `cat app/client/.env | grep REACT_APP_API_URL`

### Step 3: Restart frontend development server
- Navigate to client directory: `cd app/client`
- Start React development server: `npm start`
- Wait for server to fully start (typically 30-45 seconds)

### Step 4: Verify port configuration in browser
- Open browser in incognito/private mode (bypasses browser cache)
- Navigate to http://localhost:3000
- Open browser DevTools Network tab
- Verify API calls are being made to http://localhost:8000/api (not 9104)

## Validation
Execute every command to validate the patch is complete with zero regressions.

1. **Verify .env configuration**
   ```bash
   cd app/client && grep "REACT_APP_API_URL=http://localhost:8000" .env
   ```

2. **Verify cache directories are cleared**
   ```bash
   [ ! -d "app/client/node_modules/.cache" ] && echo "Cache cleared successfully" || echo "Cache still exists"
   ```

3. **Verify frontend is running and responding**
   ```bash
   sleep 5 && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302" && echo "Frontend running" || echo "Frontend not responding"
   ```

4. **Run backend tests** (per test.md sequence)
   ```bash
   cd app/server && uv run python -m py_compile server.py core/*.py
   ```

5. **Run frontend build test** (per test.md sequence)
   ```bash
   cd app/client && npm run build
   ```

## Patch Scope
**Lines of code to change:** 0 (cache-clearing operation only)
**Risk level:** low (no code changes, only clearing caches and restarting services)
**Testing required:** Verify API calls in browser DevTools Network tab are hitting localhost:8000, verify backtests and strategies load successfully without ERR_CONNECTION_REFUSED errors
