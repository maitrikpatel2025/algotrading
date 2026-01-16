# E2E Test: API Health Check

Test the backend API health and connectivity for the Forex Trading Dashboard.

## User Story

As a developer  
I want to verify the API is running and responding correctly  
So that I can ensure the backend services are operational

## Test Steps

1. **Verify** API Health Endpoint:
   - Make a GET request to `http://localhost:8000/api/health`
   - **Verify** response status is 200
   - **Verify** response contains `"status": "ok"`
   - **Verify** response contains `"service": "forex-trading-api"`

2. **Verify** API Test Endpoint:
   - Make a GET request to `http://localhost:8000/api/test`
   - **Verify** response status is 200

3. **Verify** Options Endpoint:
   - Make a GET request to `http://localhost:8000/api/options`
   - **Verify** response contains available trading pairs
   - **Verify** response contains available timeframes

4. **Verify** API Documentation:
   - Navigate to `http://localhost:8000/docs`
   - Take a screenshot of the Swagger UI
   - **Verify** the documentation page loads
   - **Verify** endpoints are listed

## Success Criteria
- Health endpoint returns "ok" status
- Test endpoint is accessible
- Options endpoint returns trading configuration
- API documentation (Swagger UI) is accessible
- 1 screenshot of API docs is taken
