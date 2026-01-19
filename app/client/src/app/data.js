export const PAIRS = [
    { key: "EUR_USD", text: "EUR_USD", value:  "EUR_USD" },
    { key: "GBP_JPY", text: "GBP_JPY", value:  "GBP_JPY" },
];

export const GRANULARITIES = [
    { key: "H1", text: "H1", value:  "H1" },
    { key: "D", text: "D", value:  "D" }
];

export const COUNTS = [
    { key: "50", text: "50", value:  "50" },
    { key: "100", text: "100", value:  "100" },
    { key: "200", text: "200", value:  "200" },
    { key: "500", text: "500", value:  "500" },
    { key: "1000", text: "1000", value:  "1000" },
    { key: "2000", text: "2000", value:  "2000" }
];

// Chart type options for the chart type selector
export const CHART_TYPES = [
    { key: "candlestick", text: "Candlestick", value: "candlestick" },
    { key: "ohlc", text: "OHLC", value: "ohlc" },
    { key: "line", text: "Line", value: "line" },
    { key: "area", text: "Area", value: "area" }
];

// Date range presets for quick time navigation
export const DATE_RANGES = [
    { key: "1D", text: "1D", value: "1D" },
    { key: "5D", text: "5D", value: "5D" },
    { key: "1M", text: "1M", value: "1M" },
    { key: "3M", text: "3M", value: "3M" },
    { key: "6M", text: "6M", value: "6M" },
    { key: "YTD", text: "YTD", value: "YTD" },
    { key: "1Y", text: "1Y", value: "1Y" },
    { key: "All", text: "All", value: "All" }
];

// Timeframe to seconds mapping (matches server TFS)
export const GRANULARITY_SECONDS = {
    "M1": 60,
    "M5": 300,
    "M15": 900,
    "M30": 1800,
    "H1": 3600,
    "H4": 14400,
    "D": 86400,
    "W1": 604800
};

/**
 * Calculate the number of candles needed for a given date range and granularity.
 * @param {string} dateRange - Date range preset (1D, 5D, 1M, 3M, 6M, YTD, 1Y, All)
 * @param {string} granularity - Timeframe (M5, M15, H1, H4, D)
 * @returns {number} Number of candles to fetch
 */
export function calculateCandleCount(dateRange, granularity) {
    const secondsPerGranularity = GRANULARITY_SECONDS[granularity] || 3600;
    const now = new Date();
    let startDate;

    switch (dateRange) {
        case "1D":
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case "5D":
            startDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
            break;
        case "1M":
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case "3M":
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 3);
            break;
        case "6M":
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 6);
            break;
        case "YTD":
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        case "1Y":
            startDate = new Date(now);
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        case "All":
            // Return a large number for "All" to get maximum available data
            return 2000;
        default:
            return 100;
    }

    // Calculate the number of seconds between start and now
    const durationSeconds = (now.getTime() - startDate.getTime()) / 1000;

    // Calculate candle count and ensure minimum of 10 and maximum of 2000
    const candleCount = Math.floor(durationSeconds / secondsPerGranularity);
    return Math.max(10, Math.min(2000, candleCount));
}
