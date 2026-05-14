import { analyzeStructure } from './structure';

export function calculateBias(candles) {
  if (!candles || candles.length < 10) {
    return { direction: 'NEUTRAL', strength: 0, details: null };
  }
  const analysis = analyzeStructure(candles);
  const recent = analysis.points.slice(-6);
  let bullPoints = 0, bearPoints = 0;
  for (const p of recent) {
    if (p.label === 'HH' || p.label === 'HL') bullPoints++;
    if (p.label === 'LH' || p.label === 'LL') bearPoints++;
  }
  const total = bullPoints + bearPoints;
  const strength = total > 0 ? Math.round((Math.max(bullPoints, bearPoints) / total) * 100) : 0;
  return { direction: analysis.trend, strength, details: { points: analysis.points, swings: analysis.swings, lastSwing: analysis.lastSwing, bullPoints, bearPoints } };
}

export function calculateAlignment(biases) {
  const directions = Object.values(biases).map(b => b?.direction).filter(Boolean);
  if (directions.length === 0) return { aligned: false, direction: 'NEUTRAL', details: biases };
  const allSame = directions.every(d => d === directions[0]);
  return { aligned: allSame && directions[0] !== 'NEUTRAL', direction: allSame ? directions[0] : 'NEUTRAL', details: biases };
}
