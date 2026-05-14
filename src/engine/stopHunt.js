// ═══════════════════════════════════════════
// ICT Engine — Stop Hunt Detection
// ═══════════════════════════════════════════

/**
 * Detect Stop Hunts.
 *
 * A stop hunt occurs when price spikes beyond a liquidity level
 * (wick pierces it) but the candle body closes back inside.
 *
 * Bullish Stop Hunt: wick goes below SSL, body closes above it
 *   → Smart money grabbed sell stops, likely reversal up
 *
 * Bearish Stop Hunt: wick goes above BSL, body closes below it
 *   → Smart money grabbed buy stops, likely reversal down
 *
 * @param {Array} candles - OHLCV oldest first
 * @param {Array} liquidityLevels - from detectLiquidity
 * @param {number} lookbackCandles - how many recent candles to check (default: all)
 * @returns {Array} [{ detected, direction, level, candle, time }]
 */
export function detectStopHunts(candles, liquidityLevels, lookbackCandles = null) {
  const hunts = [];
  if (!candles || !liquidityLevels || candles.length < 2) return hunts;

  // Check recent candles or all candles
  const limit = lookbackCandles || candles.length;
  const startIdx = Math.max(0, candles.length - limit);

  for (let i = startIdx; i < candles.length; i++) {
    const candle = candles[i];
    const bodyHigh = Math.max(candle.open, candle.close);
    const bodyLow = Math.min(candle.open, candle.close);

    for (const level of liquidityLevels) {
      // ─── Bullish Stop Hunt (sweep SSL) ───
      if (level.type === 'SSL') {
        // Wick went below the level but body closed above
        if (candle.low < level.price && bodyLow > level.price) {
          hunts.push({
            detected: true,
            direction: 'BULLISH',
            level: level.price,
            levelType: 'SSL',
            wickDepth: level.price - candle.low,
            time: candle.datetime || candle.time,
            index: i,
          });
        }
      }

      // ─── Bearish Stop Hunt (sweep BSL) ───
      if (level.type === 'BSL') {
        // Wick went above the level but body closed below
        if (candle.high > level.price && bodyHigh < level.price) {
          hunts.push({
            detected: true,
            direction: 'BEARISH',
            level: level.price,
            levelType: 'BSL',
            wickDepth: candle.high - level.price,
            time: candle.datetime || candle.time,
            index: i,
          });
        }
      }
    }
  }

  return hunts;
}

/**
 * Check if most recent candle is a stop hunt
 */
export function isRecentStopHunt(candles, liquidityLevels) {
  const hunts = detectStopHunts(candles, liquidityLevels, 2);
  return hunts.length > 0 ? hunts[hunts.length - 1] : null;
}
