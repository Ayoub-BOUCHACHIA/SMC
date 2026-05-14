// ═══════════════════════════════════════════
// ICT Engine — Liquidity Detection (BSL/SSL)
// ═══════════════════════════════════════════

import { DETECTION } from '../config/constants';

/**
 * Detect Buy Side Liquidity (BSL) and Sell Side Liquidity (SSL).
 *
 * BSL = swing high that is the highest point in a lookback window.
 *       Represents resting buy stops / sell limit orders above.
 *
 * SSL = swing low that is the lowest point in a lookback window.
 *       Represents resting sell stops / buy limit orders below.
 *
 * @param {Array} candles - OHLCV oldest first
 * @param {string} timeframe - Label
 * @param {number} lookback - Window size
 * @returns {Array} [{ type: 'BSL'|'SSL', price, time, index, swept }]
 */
export function detectLiquidity(
  candles,
  timeframe = '',
  lookback = DETECTION.LIQUIDITY_LOOKBACK
) {
  const levels = [];
  if (!candles || candles.length < lookback) return levels;

  const processed = new Set();

  for (let i = lookback; i < candles.length; i++) {
    const window = candles.slice(i - lookback, i);

    // Find max high in window
    let maxHigh = -Infinity;
    let maxHighIdx = -1;
    let minLow = Infinity;
    let minLowIdx = -1;

    for (let j = 0; j < window.length; j++) {
      if (window[j].high > maxHigh) {
        maxHigh = window[j].high;
        maxHighIdx = i - lookback + j;
      }
      if (window[j].low < minLow) {
        minLow = window[j].low;
        minLowIdx = i - lookback + j;
      }
    }

    // BSL — significant high
    const bslKey = `BSL-${maxHigh.toFixed(2)}`;
    if (!processed.has(bslKey)) {
      processed.add(bslKey);
      levels.push({
        type: 'BSL',
        price: maxHigh,
        time: candles[maxHighIdx].time,
        timeframe,
        index: maxHighIdx,
        swept: false,
      });
    }

    // SSL — significant low
    const sslKey = `SSL-${minLow.toFixed(2)}`;
    if (!processed.has(sslKey)) {
      processed.add(sslKey);
      levels.push({
        type: 'SSL',
        price: minLow,
        time: candles[minLowIdx].time,
        timeframe,
        index: minLowIdx,
        swept: false,
      });
    }
  }

  // Check if levels have been swept (price went beyond)
  for (const lvl of levels) {
    for (let k = lvl.index + 1; k < candles.length; k++) {
      if (lvl.type === 'BSL' && candles[k].high > lvl.price) {
        lvl.swept = true;
        break;
      }
      if (lvl.type === 'SSL' && candles[k].low < lvl.price) {
        lvl.swept = true;
        break;
      }
    }
  }

  // Deduplicate by proximity (within $2)
  const unique = [];
  const sorted = levels.sort((a, b) => a.price - b.price);
  for (const lvl of sorted) {
    const exists = unique.find(
      (u) => u.type === lvl.type && Math.abs(u.price - lvl.price) < 2
    );
    if (!exists) unique.push(lvl);
  }

  // Return un-swept levels, recent ones
  return unique.filter((l) => !l.swept).slice(-15);
}
