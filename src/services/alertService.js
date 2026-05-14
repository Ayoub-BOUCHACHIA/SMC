// ═══════════════════════════════════════════
// Alert Service — Browser Notifications
// ═══════════════════════════════════════════

let notificationPermission = 'default';

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') {
    notificationPermission = 'granted';
    return true;
  }
  const result = await Notification.requestPermission();
  notificationPermission = result;
  return result === 'granted';
}

/**
 * Send a browser notification
 */
export function sendNotification(title, body, icon = '⚡') {
  if (notificationPermission !== 'granted') return;

  try {
    new Notification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: `smc-${Date.now()}`,
      silent: false,
    });
  } catch (e) {
    console.warn('Notification failed:', e);
  }
}

/**
 * Create a standardized alert object
 */
export function createAlert(type, title, message, data = {}) {
  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,       // 'zone_entry' | 'stop_hunt' | 'mss' | 'setup' | 'killzone'
    title,
    message,
    data,
    timestamp: new Date().toISOString(),
    read: false,
  };
}

/**
 * Alert type config for display
 */
export const ALERT_TYPES = {
  zone_entry: { icon: '🎯', color: '#3498DB', label: 'Zone Entry' },
  stop_hunt:  { icon: '🔫', color: '#FF4757', label: 'Stop Hunt' },
  mss:        { icon: '🔄', color: '#FFA502', label: 'MSS' },
  setup:      { icon: '✅', color: '#00C897', label: 'Setup Detected' },
  killzone:   { icon: '⏰', color: '#D4A843', label: 'Killzone' },
  info:       { icon: 'ℹ️', color: '#8896B3', label: 'Info' },
};
