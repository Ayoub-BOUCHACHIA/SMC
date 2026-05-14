// ═══════════════════════════════════════════
// Utility — Candle Helpers
// ═══════════════════════════════════════════

/**
 * Is the candle bullish?
 */
export function isBullish(candle) {
  return candle.close > candle.open;
}

/**
 * Is the candle bearish?
 */
export function isBearish(candle) {
  return candle.close < candle.open;
}

/**
 * Body size of a candle (absolute)
 */
export function bodySize(candle) {
  return Math.abs(candle.close - candle.open);
}

/**
 * Full range of a candle (high - low)
 */
export function range(candle) {
  return candle.high - candle.low;
}

/**
 * Upper wick size
 */
export function upperWick(candle) {
  return candle.high - Math.max(candle.open, candle.close);
}

/**
 * Lower wick size
 */
export function lowerWick(candle) {
  return Math.min(candle.open, candle.close) - candle.low;
}

/**
 * Average body size over N candles
 */
export function averageBody(candles, n = 10) {
  const slice = candles.slice(-n);
  if (slice.length === 0) return 0;
  return slice.reduce((sum, c) => sum + bodySize(c), 0) / slice.length;
}

/**
 * Percentage move of a candle
 */
export function candleMovePct(candle) {
  if (!candle.open) return 0;
  return ((candle.close - candle.open) / candle.open) * 100;
}

/**
 * Parse TwelveData OHLCV response into standardized candle array
 * Returns sorted oldest-first
 */
export function parseCandles(apiResponse) {
  if (!apiResponse?.values || !Array.isArray(apiResponse.values)) {
    return [];
  }

  return apiResponse.values
    .map((v) => ({
      time: v.datetime,
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
      volume: parseFloat(v.volume || 0),
    }))
    .reverse(); // API returns newest-first, we want oldest-first
}
