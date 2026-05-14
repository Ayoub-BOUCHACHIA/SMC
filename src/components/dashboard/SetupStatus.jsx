import useMarketStore from '../../store/useMarketStore';

export default function SetupStatus() {
  const { setupDetected, confluence } = useMarketStore();
  const { score, total } = confluence;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className={`glass-card p-4 animate-fade-in h-full relative overflow-hidden ${setupDetected ? 'border-bull/30' : ''}`}>
      {setupDetected && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(0,200,151,0.08) 0%, transparent 70%)' }} />
      )}
      
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">{setupDetected ? '🎯' : '⏳'}</span>
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
          Setup Status
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Circular progress */}
        <div className="relative flex-shrink-0">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="23" fill="none" stroke="var(--color-border)" strokeWidth="4" />
            <circle
              cx="28" cy="28" r="23" fill="none"
              stroke={setupDetected ? 'var(--color-bull)' : pct >= 40 ? 'var(--color-neutral)' : 'var(--color-text-muted)'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 23}`}
              strokeDashoffset={`${2 * Math.PI * 23 * (1 - pct / 100)}`}
              style={{ 
                transform: 'rotate(-90deg)', 
                transformOrigin: '50% 50%', 
                transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease',
                filter: setupDetected ? 'drop-shadow(0 0 4px var(--color-bull-glow))' : 'none',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)', color: setupDetected ? 'var(--color-bull)' : 'var(--color-text-muted)' }}>
              {score}/{total}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-base font-bold ${setupDetected ? 'text-bull' : 'text-text-muted'}`} style={{ fontFamily: 'var(--font-heading)' }}>
            {setupDetected ? '✅ SETUP READY' : 'SCANNING...'}
          </p>
          <p className="text-[10px] text-text-muted mt-0.5">
            {pct}% conditions — {setupDetected ? 'Entry window open' : 'Waiting for confluence'}
          </p>
          {/* Mini progress bar */}
          <div className="mt-2 h-[3px] bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: setupDetected ? 'var(--color-bull)' : pct >= 40 ? 'var(--color-neutral)' : 'var(--color-text-muted)',
                boxShadow: setupDetected ? '0 0 8px var(--color-bull-glow)' : 'none',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
