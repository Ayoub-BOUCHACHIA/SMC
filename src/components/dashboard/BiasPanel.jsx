import useMarketStore from '../../store/useMarketStore';

const DIRECTIONS = {
  BULLISH: { label: 'BULLISH', icon: '▲', className: 'bias-bullish' },
  BEARISH: { label: 'BEARISH', icon: '▼', className: 'bias-bearish' },
  NEUTRAL: { label: 'NEUTRAL', icon: '◆', className: 'bias-neutral' },
};

export default function BiasPanel() {
  const { biases, alignment } = useMarketStore();
  const tfs = ['1W', '1D', '4H'];

  return (
    <div className="glass-card p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
          Directional Bias
        </h2>
        {alignment.aligned && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-400/15 text-gold-400 border border-gold-400/30 animate-pulse-glow" style={{ '--glow-color': 'var(--color-gold-400)' }}>
            ALIGNED ✦
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
              className={`${dir.className} rounded-lg px-3 py-3 text-center transition-all duration-300`}
            >
              <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">{tf}</p>
              <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                {dir.icon}
              </p>
              <p className="text-[11px] font-semibold mt-1">{dir.label}</p>
              {bias?.strength > 0 && (
                <p className="text-[9px] opacity-60 mt-0.5">{bias.strength}%</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
