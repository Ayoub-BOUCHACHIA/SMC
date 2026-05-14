// ═══════════════════════════════════════════
// ICT Engine — Fair Value Gap (FVG) Detection
// ═══════════════════════════════════════════

import { DETECTION } from '../config/constants';
import { bodySize, averageBody } from '../utils/candleUtils';

/**
 * Detect Fair Value Gaps (Imbalances).
 *
 * FVG Bullish:
 *   candle[i-1].high < candle[i+1].low
 *   AND candle[i] body > 2x average body of last 10
 *   → Zone: [candle[i-1].high, candle[i+1].low]
 *
 * FVG Bearish:
 *   candle[i-1].low > candle[i+1].high
 *   AND candle[i] body > 2x average body of last 10
 *   → Zone: [candle[i+1].high, candle[i-1].low]
 *
 * @param {Array} candles - OHLCV oldest first
 * @param {string} timeframe - Label
 * @returns {Array} [{ type, top, bottom, time, timeframe, filled }]
 */
export function detectFVG(
  candles,
  timeframe = '',
  bodyMultiplier = DETECTION.FVG_BODY_MULTIPLIER,
  avgLookback = DETECTION.FVG_AVG_LOOKBACK
) {
  const fvgs = [];
  if (!candles || candles.length < 3) return fvgs;

  for (let i = 1; i < candles.length - 1; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];
    const next = candles[i + 1];

    // Calculate average body for context
    const sliceStart = Math.max(0, i - avgLookback);
    const avgBody = averageBody(candles.slice(sliceStart, i), avgLookback);

    // Check if middle candle is impulsive
    const currBody = bodySize(curr);
    const isImpulsive = avgBody > 0 && currBody > bodyMultiplier * avgBody;

    if (!isImpulsive) continue;

    // ─── Bullish FVG: gap between prev high and next low ───
    if (next.low > prev.high) {
      fvgs.push({
        type: 'bullish',
        top: next.low,
        bottom: prev.high,
        midTime: curr.time,
        time: curr.time,
        timeframe,
        index: i,
        filled: false,
      });
    }

    // ─── Bearish FVG: gap between prev low and next high ───
    if (next.high < prev.low) {
      fvgs.push({
        type: 'bearish',
        top: prev.low,
        bottom: next.high,
        midTime: curr.time,
        time: curr.time,
        timeframe,
        index: i,
        filled: false,
      });
    }
  }

  // Check which FVGs have been filled by subsequent price action
  for (const fvg of fvgs) {
    for (let k = fvg.index + 2; k < candles.length; k++) {
      if (fvg.type === 'bullish') {
        // Price drops back to fill the gap
        if (candles[k].low <= fvg.bottom) {
          fvg.filled = true;
          break;
        }
      } else {
        // Price rises back to fill the gap
        if (candles[k].high >= fvg.top) {
          fvg.filled = true;
          break;
        }
      }
    }
  }

  // Return only unfilled FVGs, keep last N
  return fvgs.filter((f) => !f.filled).slice(-10);
}
