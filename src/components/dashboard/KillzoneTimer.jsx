import { useEffect, useState } from 'react';
import { getActiveKillzone, getNextKillzone, formatCountdown } from '../../utils/timeUtils';

export default function KillzoneTimer() {
  const [kz, setKz] = useState({ active: false });
  const [next, setNext] = useState({ name: '', minutesUntil: 0 });

  useEffect(() => {
    const update = () => {
      setKz(getActiveKillzone());
      setNext(getNextKillzone());
    };
    update();
    const iv = setInterval(update, 10000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className={`glass-card p-4 animate-fade-in ${kz.active ? 'border-gold-400/30' : ''}`}>
      <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
        Killzones
      </h2>

      {kz.active ? (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold-400/15 flex items-center justify-center animate-pulse-glow" style={{ '--glow-color': 'var(--color-gold-400)' }}>
            <span className="text-lg">{kz.emoji}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gold-400" style={{ fontFamily: 'var(--font-heading)' }}>
              {kz.name} Active
            </p>
            <p className="text-[10px] text-text-muted">
              {kz.remainingMinutes}min remaining
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center">
            <span className="text-lg opacity-40">⏰</span>
          </div>
          <div>
            <p className="text-xs text-text-muted">Next session</p>
            <p className="text-sm font-semibold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
              {next.emoji} {next.name} in {formatCountdown(next.minutesUntil)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
