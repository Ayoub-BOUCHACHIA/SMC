// ═══════════════════════════════════════════
// Data Service — TwelveData API + Caching
// ═══════════════════════════════════════════

import { buildTimeSeriesUrl, buildPriceUrl, isApiConfigured } from '../config/api';
import { SYMBOL, TIMEFRAMES, TF_ORDER } from '../config/constants';
import { parseCandles } from '../utils/candleUtils';

// ─── In-memory cache ───
const cache = {};

function getCacheKey(tf) {
  return `${SYMBOL}_${tf}`;
}

function isCacheValid(tf) {
  const key = getCacheKey(tf);
  if (!cache[key]) return false;
  const age = Date.now() - cache[key].timestamp;
  return age < TIMEFRAMES[tf].refreshMs;
}

/**
 * Fetch OHLCV for a single timeframe with caching
 */
export async function fetchOHLCV(tf) {
  if (!isApiConfigured()) {
    return getDemoData(tf);
  }

  if (isCacheValid(tf)) {
    return cache[getCacheKey(tf)].data;
  }

  const config = TIMEFRAMES[tf];
  const url = buildTimeSeriesUrl(SYMBOL, config.interval, config.outputSize);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json.status === 'error') {
      console.error(`TwelveData error for ${tf}:`, json.message);
      throw new Error(json.message);
    }

    const candles = parseCandles(json);
    cache[getCacheKey(tf)] = { data: candles, timestamp: Date.now() };
    return candles;
  } catch (err) {
    console.error(`Failed to fetch ${tf}:`, err);
    // Return cached data if available, even if stale
    if (cache[getCacheKey(tf)]) return cache[getCacheKey(tf)].data;
    return getDemoData(tf);
  }
}

/**
 * Fetch all timeframes with staggered timing to respect rate limits
 */
export async function fetchAllTimeframes() {
  const results = {};
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  for (const tf of TF_ORDER) {
    try {
      results[tf] = await fetchOHLCV(tf);
    } catch (err) {
      results[tf] = getDemoData(tf);
    }
    // 8 req/min limit: space by ~8 seconds
    if (isApiConfigured()) {
      await delay(8000);
    }
  }

  return results;
}

/**
 * Fetch current price
 */
export async function fetchCurrentPrice() {
  if (!isApiConfigured()) {
    // Return a simulated price from demo data
    const demo = getDemoData('5min');
    return demo[demo.length - 1]?.close || 3245.50;
  }

  try {
    const url = buildPriceUrl(SYMBOL);
    const res = await fetch(url);
    const json = await res.json();
    return parseFloat(json.price);
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════
// Demo Data Generator (when no API key)
// ═══════════════════════════════════════════

function getDemoData(tf) {
  const config = TIMEFRAMES[tf];
  const count = config.outputSize;
  const candles = [];
  let basePrice = 3200;
  const now = Date.now();

  // Interval durations in ms
  const intervalMs = {
    '1W': 7 * 24 * 3600000,
    '1D': 24 * 3600000,
    '4H': 4 * 3600000,
    '1H': 3600000,
    '15min': 15 * 60000,
    '5min': 5 * 60000,
  };

  const step = intervalMs[tf] || 3600000;

  // Generate a realistic uptrend with pullbacks
  for (let i = 0; i < count; i++) {
    const time = new Date(now - (count - i) * step);
    const trend = Math.sin(i / (count * 0.15)) * 80;
    const noise = (Math.random() - 0.48) * 25;
    const move = trend / count + noise;

    const open = basePrice;
    const close = open + move;
    const high = Math.max(open, close) + Math.random() * 12;
    const low = Math.min(open, close) - Math.random() * 12;

    candles.push({
      time: time.toISOString().slice(0, 19).replace('T', ' '),
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume: Math.floor(Math.random() * 10000 + 1000),
    });

    basePrice = close;
  }

  return candles;
}
