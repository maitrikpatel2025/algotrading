# Prepare Application for Testing/Review

Ensure the Forex Trading Dashboard application is running and ready for E2E tests or reviews.

## Variables

CLIENT_PORT: 3000
SERVER_PORT: 8000

## Instructions

### 1. Check if Services are Already Running

Check to see if processes are already running on CLIENT_PORT and SERVER_PORT using `lsof -i :PORT` or equivalent.

### 2. If Not Running - Start Services

If services are not running:

```bash
# Start all services (server + client)
nohup sh ./scripts/start.sh > /dev/null 2>&1 &
sleep 10
```

### 3. Verify Services are Ready

1. **Verify Backend API**:
   - Run: `curl -s http://localhost:8000/api/health`
   - Expected: JSON response with `"status": "ok"`

2. **Verify Frontend**:
   - Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
   - Expected: HTTP status code `200`

### 4. Report

- If both services are running and responding: Report "Application ready"
- If services failed to start: Report the error and suggest checking logs
  - Server logs: `app/server/` console output
  - Check ports are not in use by other applications

## Application URLs

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000/api/health