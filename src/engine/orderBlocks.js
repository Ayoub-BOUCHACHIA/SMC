// ═══════════════════════════════════════════
// ICT Engine — Order Block Detection
// ═══════════════════════════════════════════

import { DETECTION } from '../config/constants';
import { isBullish, isBearish, candleMovePct } from '../utils/candleUtils';

/**
 * Detect Order Blocks.
 *
 * Bullish OB = last bearish candle before:
 *   - 3+ consecutive bullish candles, OR
 *   - a single bullish candle with body > 0.5%
 * The OB zone = [candle.low, candle.high]
 *
 * Bearish OB = last bullish candle before:
 *   - 3+ consecutive bearish candles, OR
 *   - a single bearish candle with body > 0.5%
 *
 * @param {Array} candles - OHLCV oldest first
 * @param {string} timeframe - Label for tracking
 * @returns {Array} [{ type: 'bullish'|'bearish', high, low, time, timeframe, mitigated, index }]
 */
export function detectOrderBlocks(
  candles,
  timeframe = '',
  minImpulsePct = DETECTION.OB_MIN_IMPULSE_PCT,
  minConsecutive = DETECTION.OB_MIN_CONSECUTIVE
) {
  const obs = [];
  if (!candles || candles.length < minConsecutive + 1) return obs;

  for (let i = 1; i < candles.length - 1; i++) {
    // ─── Bullish OB ───
    if (isBearish(candles[i])) {
      let impulse = false;

      // Check for single large impulse candle
      if (i + 1 < candles.length && isBullish(candles[i + 1])) {
        if (Math.abs(candleMovePct(candles[i + 1])) >= minImpulsePct) {
          impulse = true;
        }
      }

      // Check for N consecutive bullish candles
      if (!impulse && i + minConsecutive < candles.length) {
        let consecutive = true;
        for (let j = 1; j <= minConsecutive; j++) {
          if (!isBullish(candles[i + j])) {
            consecutive = false;
            break;
          }
        }
        impulse = consecutive;
      }

      if (impulse) {
        obs.push({
          type: 'bullish',
          high: candles[i].high,
          low: candles[i].low,
          open: candles[i].open,
          close: candles[i].close,
          time: candles[i].time,
          timeframe,
          index: i,
          mitigated: false,
        });
      }
    }

    // ─── Bearish OB ───
    if (isBullish(candles[i])) {
      let impulse = false;

      if (i + 1 < candles.length && isBearish(candles[i + 1])) {
        if (Math.abs(candleMovePct(candles[i + 1])) >= minImpulsePct) {
          impulse = true;
        }
      }

      if (!impulse && i + minConsecutive < candles.length) {
        let consecutive = true;
        for (let j = 1; j <= minConsecutive; j++) {
          if (!isBearish(candles[i + j])) {
            consecutive = false;
            break;
          }
        }
        impulse = consecutive;
      }

      if (impulse) {
        obs.push({
          type: 'bearish',
          high: candles[i].high,
          low: candles[i].low,
          open: candles[i].open,
          close: candles[i].close,
          time: candles[i].time,
          timeframe,
          index: i,
          mitigated: false,
        });
      }
    }
  }

  // Mark mitigated OBs (price has returned to the zone)
  if (candles.length > 0) {
    const lastPrice = candles[candles.length - 1].close;
    for (const ob of obs) {
      // Check all candles after the OB
      for (let k = ob.index + 1; k < candles.length; k++) {
        if (ob.type === 'bullish' && candles[k].low <= ob.low) {
          ob.mitigated = true;
          break;
        }
        if (ob.type === 'bearish' && candles[k].high >= ob.high) {
          ob.mitigated = true;
          break;
        }
      }
    }
  }

  // Return only un-mitigated and keep last N
  return obs.filter((ob) => !ob.mitigated).slice(-10);
}
