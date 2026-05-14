// ═══════════════════════════════════════════
// Utility — Formatters
// ═══════════════════════════════════════════

/**
 * Format price to 2 decimal places with comma separator
 */
export function formatPrice(price) {
  if (price == null || isNaN(price)) return '—';
  return Number(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format a price range (e.g. for zones)
 */
export function formatRange(high, low) {
  return `${formatPrice(low)} — ${formatPrice(high)}`;
}

/**
 * Format percentage
 */
export function formatPercent(value) {
  if (value == null) return '—';
  return `${Math.round(value)}%`;
}

/**
 * Format distance in pips (Gold: 1 pip = $0.10)
 */
export function formatPips(distance) {
  if (distance == null) return '—';
  const pips = Math.abs(distance) / 0.10;
  return `${pips.toFixed(0)} pips`;
}

/**
 * Format timestamp for display
 */
export function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Time ago label
 */
export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
