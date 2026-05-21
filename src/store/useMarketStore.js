import { create } from 'zustand';
import { fetchAllTimeframes, fetchCurrentPrice } from '../services/dataService';
import { calculateBias, calculateAlignment } from '../engine/bias';
import { detectOrderBlocks } from '../engine/orderBlocks';
import { detectFVG } from '../engine/fvg';
import { detectLiquidity } from '../engine/liquidity';
import { detectMSS } from '../engine/mss';
import { analyzeStructure } from '../engine/structure';
import { detectStopHunts } from '../engine/stopHunt';
import { calculateConfluence } from '../engine/confluence';
import { getActiveKillzone } from '../utils/timeUtils';
import { createAlert, sendNotification } from '../services/alertService';

const useMarketStore = create((set, get) => ({
  // ─── Data ───
  ohlcv: {},
  currentPrice: null,
  previousPrice: null,
  loading: true,
  error: null,
  lastUpdate: null,

  // ─── Analysis ───
  biases: {},
  alignment: { aligned: false, direction: 'NEUTRAL' },
  zones: { orderBlocks: [], fvg: [], liquidity: [] },
  structures: {},
  mss: {},
  stopHunts: [],
  confluence: { items: [], score: 0, total: 8, percentage: 0 },
  killzone: { active: false },

  // ─── Alerts ───
  alerts: [],
  setupDetected: false,

  // ─── UI ───
  selectedTF: '4H',
  chartTF: '4H',

  // ─── Actions ───
  setSelectedTF: (tf) => set({ selectedTF: tf, chartTF: tf }),

  refreshData: async () => {
    set({ loading: true, error: null });
    try {
      const ohlcv = await fetchAllTimeframes();
      const price = await fetchCurrentPrice();
      const prev = get().currentPrice;
      set({ ohlcv, currentPrice: price, previousPrice: prev, lastUpdate: new Date().toISOString(), loading: false });
      get().runAnalysis();
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  refreshPrice: async () => {
    const price = await fetchCurrentPrice();
    if (price) {
      const prev = get().currentPrice;
      set({ currentPrice: price, previousPrice: prev });
    }
  },

  runAnalysis: () => {
    const { ohlcv, currentPrice } = get();
    if (!ohlcv || Object.keys(ohlcv).length === 0) return;

    // 1. Biases
    const biases = {};
    for (const tf of ['1W', '1D', '4H']) {
      if (ohlcv[tf]) biases[tf] = calculateBias(ohlcv[tf]);
    }
    const alignment = calculateAlignment(biases);

    // 2. Zones
    const orderBlocks = [];
    const fvg = [];
    const liquidity = [];
    const allTimeframes = ['1W', '1D', '4H', '1H', '15min', '5min'];
    for (const tf of allTimeframes) {
      if (ohlcv[tf]) {
        orderBlocks.push(...detectOrderBlocks(ohlcv[tf], tf));
        fvg.push(...detectFVG(ohlcv[tf], tf));
        liquidity.push(...detectLiquidity(ohlcv[tf], tf));
      }
    }

    // 3. Structure & MSS
    const mss = {};
    const structures = {};
    for (const tf of allTimeframes) {
      if (ohlcv[tf]) {
        structures[tf] = analyzeStructure(ohlcv[tf]);
        if (['15min', '5min'].includes(tf)) {
          mss[tf] = detectMSS(ohlcv[tf], tf);
        }
      }
    }

    // 4. Stop Hunts (Sweeps)
    let stopHunts = [];
    for (const tf of allTimeframes) {
      if (ohlcv[tf]) {
        const tfLiq = liquidity.filter(l => l.timeframe === tf);
        // Pass null to detect all historical sweeps instead of last 5
        const hunts = detectStopHunts(ohlcv[tf], tfLiq, null);
        stopHunts.push(...hunts.map(h => ({ ...h, timeframe: tf })));
      }
    }

    // 5. Killzone
    const killzone = getActiveKillzone();

    // 6. Confluence
    const zones = { orderBlocks, fvg, liquidity };
    const confluence = calculateConfluence({ biases, zones, mss, killzone, currentPrice, stopHunts, ohlcv });

    // 7. Setup detection
    const setupDetected = confluence.score >= 5;

    // 8. Generate alerts for notable events
    const prevAlerts = get().alerts;
    const newAlerts = [...prevAlerts];

    if (setupDetected && !get().setupDetected) {
      const a = createAlert('setup', 'Setup ICT Détecté!', `Score: ${confluence.score}/8 — ${alignment.direction}`, { score: confluence.score });
      newAlerts.unshift(a);
      sendNotification(a.title, a.message);
    }

    for (const m of Object.values(mss)) {
      if (m.detected) {
        const exists = prevAlerts.find(a => a.type === 'mss' && a.data?.breakLevel === m.breakLevel);
        if (!exists) {
          const a = createAlert('mss', `MSS ${m.direction}`, m.details, { breakLevel: m.breakLevel });
          newAlerts.unshift(a);
          sendNotification(a.title, a.message);
        }
      }
    }

    set({
      biases, alignment, zones, structures, mss, stopHunts, killzone, confluence, setupDetected,
      alerts: newAlerts.slice(0, 50),
    });
  },

  addAlert: (alert) => set(s => ({ alerts: [alert, ...s.alerts].slice(0, 50) })),
  clearAlerts: () => set({ alerts: [] }),
}));

export default useMarketStore;
