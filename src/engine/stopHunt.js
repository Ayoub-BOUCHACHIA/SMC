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

  // For each level, find the FIRST candle *after* the level's formation index that sweeps it.
  for (const level of liquidityLevels) {
    const startIdx = level.index + 1;
    if (startIdx >= candles.length) continue;

    for (let i = startIdx; i < candles.length; i++) {
      const candle = candles[i];
      const bodyHigh = Math.max(candle.open, candle.close);
      const bodyLow = Math.min(candle.open, candle.close);

      let isSwept = false;
      let isStopHunt = false;

      if (level.type === 'SSL') {
        if (candle.low < level.price) {
          isSwept = true;
          if (bodyLow > level.price) {
            isStopHunt = true;
          }
        }
      } else if (level.type === 'BSL') {
        if (candle.high > level.price) {
          isSwept = true;
          if (bodyHigh < level.price) {
            isStopHunt = true;
          }
        }
      }

      if (isSwept) {
        level.swept = true;
        level.sweptAtCandleIndex = i;

        if (isStopHunt) {
          hunts.push({
            detected: true,
            direction: level.type === 'SSL' ? 'BULLISH' : 'BEARISH',
            level: level.price,
            levelType: level.type,
            wickDepth: level.type === 'SSL' ? level.price - candle.low : candle.high - level.price,
            time: candle.datetime || candle.time,
            index: i,
          });
        }
        break;
      }
    }
  }

  // Sort hunts by index ascending
  hunts.sort((a, b) => a.index - b.index);

  // If lookbackCandles is specified, filter for hunts occurring in the last N candles
  if (lookbackCandles) {
    const minIndex = candles.length - lookbackCandles;
    return hunts.filter(h => h.index >= minIndex);
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
