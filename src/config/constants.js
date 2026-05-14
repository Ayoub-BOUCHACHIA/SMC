// ═══════════════════════════════════════════
// SMC Gold Analyzer — Constants
// ═══════════════════════════════════════════

export const SYMBOL = 'XAU/USD';

// ─── Timeframe Config ───
export const TIMEFRAMES = {
  '1W':    { interval: '1week', label: '1W',    outputSize: 100,  refreshMs: 3600000,  group: 'bias' },
  '1D':    { interval: '1day',  label: '1D',    outputSize: 200,  refreshMs: 3600000,  group: 'bias' },
  '4H':    { interval: '4h',    label: '4H',    outputSize: 500,  refreshMs: 900000,   group: 'zones' },
  '1H':    { interval: '1h',    label: '1H',    outputSize: 500,  refreshMs: 900000,   group: 'zones' },
  '15min': { interval: '15min', label: '15min', outputSize: 1000, refreshMs: 120000,   group: 'entry' },
  '5min':  { interval: '5min',  label: '5min',  outputSize: 1000, refreshMs: 120000,   group: 'entry' },
};

export const TF_ORDER = ['1W', '1D', '4H', '1H', '15min', '5min'];

// ─── Killzones (CET/Paris Time) ───
export const KILLZONES = [
  {
    name: 'London',
    emoji: '🇬🇧',
    startHour: 8,
    startMinute: 0,
    endHour: 11,
    endMinute: 0,
    timezone: 'Europe/Paris',
  },
  {
    name: 'New York AM',
    emoji: '🇺🇸',
    startHour: 14,
    startMinute: 30,
    endHour: 17,
    endMinute: 0,
    timezone: 'Europe/Paris',
  },
  {
    name: 'New York PM',
    emoji: '🗽',
    startHour: 19,
    startMinute: 30,
    endHour: 22,
    endMinute: 0,
    timezone: 'Europe/Paris',
  },
];

// ─── Detection Thresholds ───
export const DETECTION = {
  SWING_LOOKBACK: 3,
  OB_MIN_IMPULSE_PCT: 0.5,
  OB_MIN_CONSECUTIVE: 3,
  FVG_BODY_MULTIPLIER: 2,
  FVG_AVG_LOOKBACK: 10,
  LIQUIDITY_LOOKBACK: 10,
  STRUCTURE_MIN_SWINGS: 4,
};

// ─── Colors (mirrored from CSS for JS usage) ───
export const COLORS = {
  bull: '#00C897',
  bullDim: 'rgba(0, 200, 151, 0.2)',
  bear: '#FF4757',
  bearDim: 'rgba(255, 71, 87, 0.2)',
  neutral: '#FFA502',
  neutralDim: 'rgba(255, 165, 2, 0.2)',
  gold: '#D4A843',
  fvg: '#3498DB',
  fvgDim: 'rgba(52, 152, 219, 0.15)',
  liquidity: '#F1C40F',
  liquidityDim: 'rgba(241, 196, 15, 0.2)',
  bgPrimary: '#0A0E17',
  bgSecondary: '#111827',
  bgCard: '#151C2E',
  textPrimary: '#E8ECF4',
  textSecondary: '#8896B3',
  textMuted: '#4A5878',
  border: '#1E2A42',
};

// ─── Checklist Labels ───
export const CHECKLIST_ITEMS = [
  { id: 'bias_1w',     label: 'Biais 1W confirmé',              icon: '📊' },
  { id: 'bias_1d',     label: 'Biais 1D aligné avec 1W',        icon: '📈' },
  { id: 'zone_4h',     label: 'Zone 4H identifiée (OB ou FVG)', icon: '🎯' },
  { id: 'killzone',    label: 'Dans une Killzone',               icon: '⏰' },
  { id: 'liquidity',   label: 'Liquidité (SSL/BSL) chassée',     icon: '💧' },
  { id: 'mss_15m',     label: 'MSS confirmé en 15min',           icon: '🔄' },
  { id: 'ob_fvg_5m',   label: 'OB ou FVG 5min identifié',        icon: '🔍' },
  { id: 'rr',          label: 'RR potentiel ≥ 1:2',              icon: '⚖️' },
];
