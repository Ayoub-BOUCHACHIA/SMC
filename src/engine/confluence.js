import { getActiveKillzone } from '../utils/timeUtils';
import { CHECKLIST_ITEMS } from '../config/constants';

export function calculateConfluence({ biases, zones, mss, killzone, currentPrice, stopHunts, ohlcv }) {
  const items = CHECKLIST_ITEMS.map(item => {
    let met = false;
    switch (item.id) {
      case 'bias_1w': met = biases?.['1W']?.direction === 'BULLISH' || biases?.['1W']?.direction === 'BEARISH'; break;
      case 'bias_1d': met = biases?.['1W']?.direction && biases?.['1D']?.direction === biases?.['1W']?.direction; break;
      case 'zone_4h': {
        const obs4h = (zones?.orderBlocks || []).filter(z => z.timeframe === '4H');
        const fvg4h = (zones?.fvg || []).filter(z => z.timeframe === '4H');
        met = obs4h.length > 0 || fvg4h.length > 0;
        break;
      }
      case 'killzone': { const kz = killzone || getActiveKillzone(); met = kz.active; break; }
      case 'liquidity': {
        if (stopHunts && ohlcv) {
          const executionHunts = stopHunts.filter(h => ['15min', '5min'].includes(h.timeframe));
          met = executionHunts.some(h => {
            const tfCandles = ohlcv[h.timeframe];
            if (!tfCandles) return false;
            return (tfCandles.length - 1 - h.index) < 15;
          });
        } else {
          met = (zones?.liquidity || []).some(l => l.swept);
        }
        break;
      }
      case 'mss_15m': met = mss?.['15min']?.detected === true; break;
      case 'ob_fvg_5m': {
        const obs5 = (zones?.orderBlocks || []).filter(z => z.timeframe === '5min');
        const fvg5 = (zones?.fvg || []).filter(z => z.timeframe === '5min');
        met = obs5.length > 0 || fvg5.length > 0;
        break;
      }
      case 'rr': met = false; break; // Requires manual entry or SL/TP analysis
    }
    return { ...item, met };
  });
  const score = items.filter(i => i.met).length;
  return { items, score, total: items.length, percentage: Math.round((score / items.length) * 100) };
}
