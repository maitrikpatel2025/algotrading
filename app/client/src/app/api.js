import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// Response interceptor for error handling
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log errors for debugging
        const detail = error.response?.data?.detail;
        const statusCode = error.response?.status;

        // Handle validation errors (422) - detail is an array of error objects
        let errorMessage;
        if (Array.isArray(detail)) {
            errorMessage = detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join('; ');
            console.error(`API Validation Errors [${statusCode}]:`, detail);
        } else {
            errorMessage = detail || error.message || 'An unknown error occurred';
        }

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
    put: (url, data) => axios.put(url, data).then(response),
    delete: (url) => axios.delete(url).then(response),
    download: (url) => axios.get(url, { responseType: 'blob' })
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
    botsStatus: () => requests.get("/bots/status"),
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
    }),
    // Backtest endpoints
    saveBacktest: (backtest) => requests.post("/backtests", { backtest }),
    listBacktests: () => requests.get("/backtests"),
    getBacktest: (id) => requests.get(`/backtests/${id}`),
    deleteBacktest: (id) => requests.delete(`/backtests/${id}`),
    duplicateBacktest: (id) => requests.post(`/backtests/${id}/duplicate`),
    // Backtest execution endpoints
    runBacktest: (id, keepPartialOnCancel = false) =>
        requests.post(`/backtests/${id}/run`, { keep_partial_on_cancel: keepPartialOnCancel }),
    getBacktestProgress: (id) => requests.get(`/backtests/${id}/progress`),
    cancelBacktest: (id, keepPartialResults = false) =>
        requests.post(`/backtests/${id}/cancel`, { keep_partial_results: keepPartialResults }),
    // Backtest notes and export endpoints
    updateBacktestNotes: (id, notes) => requests.put(`/backtests/${id}/notes`, { notes }),
    exportBacktestCSV: async (id) => {
        const response = await requests.download(`/backtests/${id}/export/csv`);
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = response.headers['content-disposition']?.match(/filename="(.+)"/)?.[1] || `backtest_${id}.csv`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
    exportBacktestJSON: async (id) => {
        const response = await requests.download(`/backtests/${id}/export/json`);
        const blob = new Blob([response.data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = response.headers['content-disposition']?.match(/filename="(.+)"/)?.[1] || `backtest_${id}.json`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
    exportBacktestPDF: async (id) => {
        const response = await requests.download(`/backtests/${id}/export/pdf`);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = response.headers['content-disposition']?.match(/filename="(.+)"/)?.[1] || `backtest_${id}.pdf`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
    // Backtest comparison endpoints
    compareBacktests: (backtestIds, notes = null) =>
        requests.post("/backtests/compare", { backtest_ids: backtestIds, notes }),
    exportComparisonCSV: async (backtestIds, notes = null, includeNotes = true) => {
        const response = await axios.post(
            `${axios.defaults.baseURL}/backtests/compare/export/csv`,
            { backtest_ids: backtestIds, notes, include_notes: includeNotes },
            { responseType: 'blob' }
        );
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = response.headers['content-disposition']?.match(/filename="(.+)"/)?.[1] || 'backtest_comparison.csv';
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
    exportComparisonJSON: async (backtestIds, notes = null, includeNotes = true) => {
        const response = await axios.post(
            `${axios.defaults.baseURL}/backtests/compare/export/json`,
            { backtest_ids: backtestIds, notes, include_notes: includeNotes },
            { responseType: 'blob' }
        );
        const blob = new Blob([response.data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = response.headers['content-disposition']?.match(/filename="(.+)"/)?.[1] || 'backtest_comparison.json';
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
    exportComparisonPDF: async (backtestIds, notes = null, includeNotes = true) => {
        const response = await axios.post(
            `${axios.defaults.baseURL}/backtests/compare/export/pdf`,
            { backtest_ids: backtestIds, notes, include_notes: includeNotes },
            { responseType: 'blob' }
        );
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = response.headers['content-disposition']?.match(/filename="(.+)"/)?.[1] || 'backtest_comparison.pdf';
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
}

export default endPoints;