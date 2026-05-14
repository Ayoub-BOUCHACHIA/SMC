// ═══════════════════════════════════════════
// Utility — Killzone & Time calculations
// ═══════════════════════════════════════════

import { KILLZONES } from '../config/constants';

/**
 * Get the current time in the target timezone (CET/Paris)
 * Returns { hours, minutes, seconds, totalMinutes }
 */
export function getParisTime() {
  const now = new Date();
  const parisStr = now.toLocaleString('en-US', { timeZone: 'Europe/Paris' });
  const paris = new Date(parisStr);
  return {
    hours: paris.getHours(),
    minutes: paris.getMinutes(),
    seconds: paris.getSeconds(),
    totalMinutes: paris.getHours() * 60 + paris.getMinutes(),
    dayOfWeek: paris.getDay(), // 0=Sun, 6=Sat
  };
}

/**
 * Check if we are currently in any killzone
 * Returns { active, name, emoji } or { active: false }
 */
export function getActiveKillzone() {
  const { totalMinutes, dayOfWeek } = getParisTime();

  // Markets closed on weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { active: false, name: null, emoji: null };
  }

  for (const kz of KILLZONES) {
    const startMins = kz.startHour * 60 + kz.startMinute;
    const endMins = kz.endHour * 60 + kz.endMinute;

    if (totalMinutes >= startMins && totalMinutes < endMins) {
      return {
        active: true,
        name: kz.name,
        emoji: kz.emoji,
        remainingMinutes: endMins - totalMinutes,
      };
    }
  }

  return { active: false, name: null, emoji: null };
}

/**
 * Get countdown info to next killzone
 * Returns { name, emoji, minutesUntil }
 */
export function getNextKillzone() {
  const { totalMinutes, dayOfWeek } = getParisTime();

  // Weekend: calculate until Monday London open
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    const daysUntilMonday = dayOfWeek === 6 ? 2 : 1;
    const londonStart = KILLZONES[0];
    const minutesUntil = daysUntilMonday * 24 * 60 +
      (londonStart.startHour * 60 + londonStart.startMinute) - totalMinutes;
    return {
      name: londonStart.name,
      emoji: londonStart.emoji,
      minutesUntil: Math.max(0, minutesUntil),
    };
  }

  // Find next killzone today
  for (const kz of KILLZONES) {
    const startMins = kz.startHour * 60 + kz.startMinute;
    if (totalMinutes < startMins) {
      return {
        name: kz.name,
        emoji: kz.emoji,
        minutesUntil: startMins - totalMinutes,
      };
    }
  }

  // All killzones passed today — next is tomorrow London
  const londonStart = KILLZONES[0];
  const nextDayOffset = dayOfWeek === 5 ? 3 : 1; // Friday → Monday
  const minutesUntil = nextDayOffset * 24 * 60 +
    (londonStart.startHour * 60 + londonStart.startMinute) - totalMinutes;

  return {
    name: londonStart.name,
    emoji: londonStart.emoji,
    minutesUntil: Math.max(0, minutesUntil),
  };
}

/**
 * Get the Unix timestamp (seconds) of the end of the last Asian session
 */
export function getLastAsianSessionEnd() {
  const now = new Date();
  const parisStr = now.toLocaleString('en-US', { timeZone: 'Europe/Paris' });
  const paris = new Date(parisStr);
  
  // Asiatic session ends at 07:00 CET/Paris
  const asianEndHour = 7;
  
  let lastEnd = new Date(paris);
  lastEnd.setHours(asianEndHour, 0, 0, 0);
  
  // If current time is before 07:00, the last session ended yesterday
  if (paris.getHours() < asianEndHour) {
    lastEnd.setDate(lastEnd.getDate() - 1);
  }
  
  return Math.floor(lastEnd.getTime() / 1000);
}

/**
 * Format minutes into hours and minutes string
 */
export function formatCountdown(totalMinutes) {
  if (totalMinutes <= 0) return 'NOW';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
