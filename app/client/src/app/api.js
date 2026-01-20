import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// Response interceptor for error handling
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log errors for debugging
        const errorMessage = error.response?.data?.detail || error.message || 'An unknown error occurred';
        const statusCode = error.response?.status;

        console.error(`API Error [${statusCode || 'Network'}]: ${errorMessage}`);

        // Transform error for consistent handling
        if (error.response) {
            // Server responded with an error status
            const status = error.response.status;

            if (status === 503) {
                console.warn('External service temporarily unavailable');
            } else if (status === 404) {
                console.warn('Requested resource not found');
            } else if (status === 400) {
                console.warn('Invalid request parameters');
            } else if (status >= 500) {
                console.error('Server error occurred');
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response received from server - possible network issue');
        }

        return Promise.reject(error);
    }
);

const response = (resp) => resp.data;

const requests = {
    get: (url) => axios.get(url).then(response),
    post: (url, data) => axios.post(url, data).then(response),
    delete: (url) => axios.delete(url).then(response)
}

const endPoints = {
    account: () => requests.get("/account"),
    headlines: () => requests.get("/headlines"),
    options: () => requests.get("/options"),
    technicals: (p, g) => requests.get(`/technicals/${p}/${g}`),
    prices: (p, g, c) => requests.get(`/prices/${p}/${g}/${c}`),
    spread: (pair) => requests.get(`/spread/${pair}`),
    openTrades: () => requests.get("/trades/open"),
    tradeHistory: () => requests.get("/trades/history"),
    botStatus: () => requests.get("/bot/status"),
    botStart: (config = {}) => requests.post("/bot/start", config),
    botStop: () => requests.post("/bot/stop"),
    botRestart: (config = {}) => requests.post("/bot/restart", config),
    // Strategy endpoints
    saveStrategy: (strategy) => requests.post("/strategies", { strategy }),
    listStrategies: () => requests.get("/strategies"),
    listStrategiesExtended: () => requests.get("/strategies/extended"),
    getStrategy: (id) => requests.get(`/strategies/${id}`),
    deleteStrategy: (id) => requests.delete(`/strategies/${id}`),
    checkStrategyName: (name) => requests.get(`/strategies/check-name/${encodeURIComponent(name)}`),
    // Strategy management endpoints
    duplicateStrategy: (id) => requests.post(`/strategies/${id}/duplicate`),
    exportStrategy: (id) => requests.get(`/strategies/${id}/export`),
    validateImport: (data) => requests.post('/strategies/import/validate', { strategy_data: data }),
    saveImport: (data, options = {}) => requests.post('/strategies/import/save', {
        strategy_data: data,
        name_override: options.name_override,
        conflict_resolution: options.conflict_resolution
    })
}

export default endPoints;