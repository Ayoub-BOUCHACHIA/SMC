// ═══════════════════════════════════════════
// ICT Engine — Market Structure Detection
// Swing High/Low + HH/HL/LH/LL classification
// ═══════════════════════════════════════════

import { DETECTION } from '../config/constants';

/**
 * Detect swing highs and lows using a lookback window.
 * A swing high has N lower highs on each side.
 * A swing low has N higher lows on each side.
 *
 * @param {Array} candles - OHLCV array (oldest first)
 * @param {number} lookback - Number of candles to check on each side
 * @returns {Array} [{ type: 'high'|'low', price, index, time }]
 */
export function detectSwingPoints(candles, lookback = DETECTION.SWING_LOOKBACK) {
  const swings = [];
  if (!candles || candles.length < lookback * 2 + 1) return swings;

  for (let i = lookback; i < candles.length - lookback; i++) {
    let isSwingHigh = true;
    let isSwingLow = true;

    for (let j = 1; j <= lookback; j++) {
      // Check swing high
      if (candles[i].high <= candles[i - j].high || candles[i].high <= candles[i + j].high) {
        isSwingHigh = false;
      }
      // Check swing low
      if (candles[i].low >= candles[i - j].low || candles[i].low >= candles[i + j].low) {
        isSwingLow = false;
      }
    }

    if (isSwingHigh) {
      swings.push({
        type: 'high',
        price: candles[i].high,
        index: i,
        time: candles[i].datetime || candles[i].time,
      });
    }
    if (isSwingLow) {
      swings.push({
        type: 'low',
        price: candles[i].low,
        index: i,
        time: candles[i].datetime || candles[i].time,
      });
    }
  }

  // Sort by index
  swings.sort((a, b) => a.index - b.index);
  return swings;
}

/**
 * Classify structure based on swing points sequence.
 * Compares consecutive highs and lows:
 *   HH + HL = BULLISH
 *   LH + LL = BEARISH
 *   Mixed   = NEUTRAL
 *
 * @param {Array} swings - From detectSwingPoints
 * @returns {Object} { points: Array, trend: string, lastSwing: Object }
 */
export function classifyStructure(swings) {
  if (!swings || swings.length < DETECTION.STRUCTURE_MIN_SWINGS) {
    return { points: [], trend: 'NEUTRAL', lastSwing: null };
  }

  const highs = swings.filter((s) => s.type === 'high');
  const lows = swings.filter((s) => s.type === 'low');

  const points = [];

  // Label highs as HH or LH
  for (let i = 1; i < highs.length; i++) {
    points.push({
      ...highs[i],
      label: highs[i].price > highs[i - 1].price ? 'HH' : 'LH',
    });
  }

  // Label lows as HL or LL
  for (let i = 1; i < lows.length; i++) {
    points.push({
      ...lows[i],
      label: lows[i].price > lows[i - 1].price ? 'HL' : 'LL',
    });
  }

  points.sort((a, b) => a.index - b.index);

  // Determine trend from last 4 structure points
  const recent = points.slice(-4);
  let bullishCount = 0;
  let bearishCount = 0;

  for (const p of recent) {
    if (p.label === 'HH' || p.label === 'HL') bullishCount++;
    if (p.label === 'LH' || p.label === 'LL') bearishCount++;
  }

  let trend = 'NEUTRAL';
  if (bullishCount >= 3) trend = 'BULLISH';
  else if (bearishCount >= 3) trend = 'BEARISH';
  else if (bullishCount > bearishCount) trend = 'BULLISH';
  else if (bearishCount > bullishCount) trend = 'BEARISH';

  // Second pass: Assign CHoCH and BOS markers for the UI
  let currentTrend = 'NEUTRAL';
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.label === 'HH') {
      if (currentTrend !== 'BULLISH') {
        p.marker = 'CHoCH';
        currentTrend = 'BULLISH';
      } else {
        p.marker = 'BOS';
      }
    } else if (p.label === 'LL') {
      if (currentTrend !== 'BEARISH') {
        p.marker = 'CHoCH';
        currentTrend = 'BEARISH';
      } else {
        p.marker = 'BOS';
      }
    } else {
      p.marker = null; // Hide HL and LH in the new clean UI
    }
  }

  return {
    points,
    trend,
    lastSwing: swings[swings.length - 1],
  };
}

/**
 * Convenience: detect and classify in one call
 */
export function analyzeStructure(candles, lookback = DETECTION.SWING_LOOKBACK) {
  const swings = detectSwingPoints(candles, lookback);
  const structure = classifyStructure(swings);
  return { swings, ...structure };
}
