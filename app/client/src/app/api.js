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
    get: (url) => axios.get(url).then(response)
}

const endPoints = {
    account: () => requests.get("/account"),
    headlines: () => requests.get("/headlines"),
    options: () => requests.get("/options"),
    technicals: (p, g) => requests.get(`/technicals/${p}/${g}`),
    prices: (p, g, c) => requests.get(`/prices/${p}/${g}/${c}`),
    openTrades: () => requests.get("/trades/open"),
    tradeHistory: () => requests.get("/trades/history"),
    botStatus: () => requests.get("/bot/status")
}

export default endPoints;