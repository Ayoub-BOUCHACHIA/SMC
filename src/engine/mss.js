import { detectSwingPoints, classifyStructure } from './structure';
import { DETECTION } from '../config/constants';
import { bodySize, averageBody } from '../utils/candleUtils';
import { detectFVG } from './fvg';

/**
 * Detect Market Structure Shift (MSS) trend-independently with displacement and invalidation verification.
 *
 * Bullish MSS: price closes above recent Swing High, confirmed by displacement (large body or FVG) and not invalidated.
 * Bearish MSS: price closes below recent Swing Low, confirmed by displacement (large body or FVG) and not invalidated.
 *
 * @param {Array} candles - OHLCV oldest first
 * @param {string} timeframe
 * @returns {Object} { detected: boolean, direction: string, breakLevel: number, time: string, timeframe: string, details: string }
 */
export function detectMSS(candles, timeframe = '') {
  if (!candles || candles.length < 20) {
    return { detected: false, direction: null, breakLevel: null, time: null };
  }

  const swings = detectSwingPoints(candles, DETECTION.SWING_LOOKBACK);

  const highs = swings.filter((s) => s.type === 'high');
  const lows = swings.filter((s) => s.type === 'low');

  let bullishMSS = null;
  let bearishMSS = null;

  // ─── Bullish MSS ───
  // Look back at the last 3 swing highs to see if any have been broken
  const recentHighs = highs.slice(-3);
  for (let hIdx = recentHighs.length - 1; hIdx >= 0; hIdx--) {
    const recentHigh = recentHighs[hIdx];

    // Find the first candle that closes above this swing high
    let breakIdx = -1;
    for (let i = recentHigh.index + 1; i < candles.length; i++) {
      if (candles[i].close > recentHigh.price) {
        breakIdx = i;
        break;
      }
    }

    if (breakIdx !== -1) {
      // Find the lowest low between the swing high and the break
      let slPrice = Infinity;
      for (let i = recentHigh.index; i <= breakIdx; i++) {
        if (candles[i].low < slPrice) {
          slPrice = candles[i].low;
        }
      }

      // Check for invalidation: close below slPrice after breakIdx
      let invalidated = false;
      for (let i = breakIdx + 1; i < candles.length; i++) {
        if (candles[i].close < slPrice) {
          invalidated = true;
          break;
        }
      }

      // Check displacement: break candle body > 1.5x average body of preceding 10 candles, OR FVG formed
      const avg = averageBody(candles.slice(Math.max(0, breakIdx - 10), breakIdx), 10);
      const isLargeBody = bodySize(candles[breakIdx]) > 1.5 * avg;

      const fvgs = detectFVG(candles, timeframe);
      const hasBullishFVG = fvgs.some((f) => f.type === 'bullish' && f.index >= breakIdx - 2);
      const hasDisplacement = isLargeBody || hasBullishFVG;

      // Recency: break happened within the last 12 candles
      const isRecent = (candles.length - 1 - breakIdx) < 12;

      if (!invalidated && hasDisplacement && isRecent) {
        bullishMSS = {
          detected: true,
          direction: 'BULLISH',
          breakLevel: recentHigh.price,
          time: candles[breakIdx].time,
          timeframe,
          details: `Bullish MSS confirmed: Price broke above swing high at ${recentHigh.price.toFixed(2)} with displacement.`,
          breakIdx,
        };
        // Found a valid one, stop checking older swing highs
        break;
      }
    }
  }

  // ─── Bearish MSS ───
  // Look back at the last 3 swing lows to see if any have been broken
  const recentLows = lows.slice(-3);
  for (let lIdx = recentLows.length - 1; lIdx >= 0; lIdx--) {
    const recentLow = recentLows[lIdx];

    // Find the first candle that closes below this swing low
    let breakIdx = -1;
    for (let i = recentLow.index + 1; i < candles.length; i++) {
      if (candles[i].close < recentLow.price) {
        breakIdx = i;
        break;
      }
    }

    if (breakIdx !== -1) {
      // Find the highest high between the swing low and the break
      let shPrice = -Infinity;
      for (let i = recentLow.index; i <= breakIdx; i++) {
        if (candles[i].high > shPrice) {
          shPrice = candles[i].high;
        }
      }

      // Check for invalidation: close above shPrice after breakIdx
      let invalidated = false;
      for (let i = breakIdx + 1; i < candles.length; i++) {
        if (candles[i].close > shPrice) {
          invalidated = true;
          break;
        }
      }

      // Check displacement: break candle body > 1.5x average body of preceding 10 candles, OR FVG formed
      const avg = averageBody(candles.slice(Math.max(0, breakIdx - 10), breakIdx), 10);
      const isLargeBody = bodySize(candles[breakIdx]) > 1.5 * avg;

      const fvgs = detectFVG(candles, timeframe);
      const hasBearishFVG = fvgs.some((f) => f.type === 'bearish' && f.index >= breakIdx - 2);
      const hasDisplacement = isLargeBody || hasBearishFVG;

      // Recency: break happened within the last 12 candles
      const isRecent = (candles.length - 1 - breakIdx) < 12;

      if (!invalidated && hasDisplacement && isRecent) {
        bearishMSS = {
          detected: true,
          direction: 'BEARISH',
          breakLevel: recentLow.price,
          time: candles[breakIdx].time,
          timeframe,
          details: `Bearish MSS confirmed: Price broke below swing low at ${recentLow.price.toFixed(2)} with displacement.`,
          breakIdx,
        };
        // Found a valid one, stop checking older swing lows
        break;
      }
    }
  }

  // If both are detected, return the most recent one (larger breakIdx)
  if (bullishMSS && bearishMSS) {
    return bullishMSS.breakIdx > bearishMSS.breakIdx ? bullishMSS : bearishMSS;
  }

  return bullishMSS || bearishMSS || { detected: false, direction: null, breakLevel: null, time: null };
}
