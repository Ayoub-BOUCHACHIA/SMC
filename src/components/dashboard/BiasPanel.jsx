import useMarketStore from '../../store/useMarketStore';

const DIRECTIONS = {
  BULLISH: { label: 'BULL', icon: '▲', color: 'var(--color-bull)', bg: 'var(--color-bull-dim)' },
  BEARISH: { label: 'BEAR', icon: '▼', color: 'var(--color-bear)', bg: 'var(--color-bear-dim)' },
  NEUTRAL: { label: 'WAIT', icon: '◆', color: 'var(--color-neutral)', bg: 'var(--color-neutral-dim)' },
};

export default function BiasPanel() {
  const { biases, alignment } = useMarketStore();
  const tfs = ['1W', '1D', '4H'];

  return (
    <div className="glass-card p-4 animate-fade-in h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">📊</span>
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
            Directional Bias
          </h2>
        </div>
        {alignment.aligned && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-400/15 text-gold-400 border border-gold-400/30 animate-pulse-glow" style={{ '--glow-color': 'var(--color-gold-400)' }}>
            ✦ ALIGNED
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {tfs.map(tf => {
          const bias = biases[tf];
          const dir = DIRECTIONS[bias?.direction] || DIRECTIONS.NEUTRAL;
          return (
            <div
              key={tf}
              id={`bias-${tf}`}
              className="rounded-xl px-3 py-3 text-center transition-all duration-300 relative overflow-hidden"
              style={{ background: dir.bg, border: `1px solid ${dir.color}30` }}
            >
              <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 50% 0%, ${dir.color}, transparent 70%)` }} />
              <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1 relative z-10" style={{ fontFamily: 'var(--font-heading)' }}>{tf}</p>
              <p className="text-xl font-bold relative z-10" style={{ color: dir.color, fontFamily: 'var(--font-heading)', textShadow: `0 0 12px ${dir.color}44` }}>
                {dir.icon}
              </p>
              <p className="text-[11px] font-bold mt-1 relative z-10" style={{ color: dir.color }}>{dir.label}</p>
              {bias?.strength > 0 && (
                <div className="mt-1.5 relative z-10">
                  <div className="h-[3px] bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${bias.strength}%`, background: dir.color }} />
                  </div>
                  <p className="text-[9px] opacity-50 mt-0.5">{bias.strength}%</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
