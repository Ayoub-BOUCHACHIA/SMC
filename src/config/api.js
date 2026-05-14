// ═══════════════════════════════════════════
// TwelveData API Configuration
// ═══════════════════════════════════════════

const API_KEY = import.meta.env.VITE_TWELVEDATA_API_KEY || '';
const BASE_URL = 'https://api.twelvedata.com';

export function getApiKey() {
  return API_KEY;
}

export function isApiConfigured() {
  return API_KEY && API_KEY !== 'your_api_key_here';
}

/**
 * Build a time_series URL for a given symbol and interval
 */
export function buildTimeSeriesUrl(symbol, interval, outputSize = 100) {
  const params = new URLSearchParams({
    symbol,
    interval,
    outputsize: String(outputSize),
    apikey: API_KEY,
    format: 'JSON',
    timezone: 'UTC',
  });
  return `${BASE_URL}/time_series?${params.toString()}`;
}

/**
 * Build a price endpoint for current quote
 */
export function buildPriceUrl(symbol) {
  const params = new URLSearchParams({
    symbol,
    apikey: API_KEY,
  });
  return `${BASE_URL}/price?${params.toString()}`;
}
