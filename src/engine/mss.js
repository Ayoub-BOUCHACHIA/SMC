// ═══════════════════════════════════════════
// ICT Engine — Market Structure Shift (MSS)
// ═══════════════════════════════════════════

import { detectSwingPoints, classifyStructure } from './structure';
import { DETECTION } from '../config/constants';

/**
 * Detect Market Structure Shift (MSS).
 *
 * In bearish trend: price breaks above recent LH → MSS Bullish (potential reversal up)
 * In bullish trend: price breaks below recent HL → MSS Bearish (potential reversal down)
 *
 * @param {Array} candles - OHLCV oldest first
 * @param {string} timeframe
 * @returns {{ detected: boolean, direction: string, breakLevel: number, time: string, details: string }}
 */
export function detectMSS(candles, timeframe = '') {
  if (!candles || candles.length < 20) {
    return { detected: false, direction: null, breakLevel: null, time: null };
  }

  const swings = detectSwingPoints(candles, DETECTION.SWING_LOOKBACK);
  const structure = classifyStructure(swings);

  if (structure.points.length < 3) {
    return { detected: false, direction: null, breakLevel: null, time: null };
  }

  const lastCandle = candles[candles.length - 1];
  const recentPoints = structure.points.slice(-6);

  // ─── Bearish trend → look for bullish MSS ───
  if (structure.trend === 'BEARISH') {
    // Find the most recent LH
    const recentLH = [...recentPoints].reverse().find((p) => p.label === 'LH');
    if (recentLH && lastCandle.close > recentLH.price) {
      return {
        detected: true,
        direction: 'BULLISH',
        breakLevel: recentLH.price,
        time: lastCandle.time,
        timeframe,
        details: `Price broke above LH at ${recentLH.price.toFixed(2)} — structure shift to bullish`,
      };
    }
  }

  // ─── Bullish trend → look for bearish MSS ───
  if (structure.trend === 'BULLISH') {
    const recentHL = [...recentPoints].reverse().find((p) => p.label === 'HL');
    if (recentHL && lastCandle.close < recentHL.price) {
      return {
        detected: true,
        direction: 'BEARISH',
        breakLevel: recentHL.price,
        time: lastCandle.time,
        timeframe,
        details: `Price broke below HL at ${recentHL.price.toFixed(2)} — structure shift to bearish`,
      };
    }
  }

  return { detected: false, direction: null, breakLevel: null, time: null };
}
