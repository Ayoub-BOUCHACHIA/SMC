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
    <div className={`glass-card p-4 animate-fade-in h-full relative overflow-hidden ${kz.active ? 'border-gold-400/30' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">🕒</span>
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
          Market Sessions
        </h2>
      </div>

      {kz.active ? (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center relative">
            <span className="absolute inset-0 rounded-xl border border-gold-400/20 animate-pulse-glow" style={{ '--glow-color': 'var(--color-gold-400)' }} />
            <span className="text-2xl z-10">{kz.emoji}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gold-400 uppercase tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              {kz.name}
            </p>
            <div className="mt-1.5 space-y-1">
              <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold-400 animate-pulse" 
                  style={{ width: `${Math.max(10, (kz.remainingMinutes / 120) * 100)}%` }} 
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-text-muted font-mono uppercase">
                <span>Active Now</span>
                <span>{kz.remainingMinutes}M Left</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-bg-tertiary flex items-center justify-center">
            <span className="text-2xl opacity-30">⏸</span>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold mb-0.5">Next Opportunity</p>
            <p className="text-sm font-bold text-text-primary uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
              {next.emoji} {next.name}
            </p>
            <p className="text-[10px] text-gold-400/70 font-mono mt-1">
              IN {formatCountdown(next.minutesUntil)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
