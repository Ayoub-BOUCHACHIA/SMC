import useMarketStore from '../../store/useMarketStore';

export default function TradeChecklist() {
  const { confluence } = useMarketStore();
  const { items, score, total } = confluence;

  return (
    <div className="glass-card p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
          Trade Checklist
        </h2>
        <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)', color: score >= 5 ? 'var(--color-bull)' : score >= 3 ? 'var(--color-neutral)' : 'var(--color-text-muted)' }}>
          {score}/{total}
        </span>
      </div>

      <div className="space-y-0.5">
        {items.map(item => (
          <div key={item.id} className={`check-item ${item.met ? 'active' : ''}`}>
            <div className={`check-dot ${item.met ? 'on' : 'off'}`} />
            <span className="text-xs">{item.icon}</span>
            <span className={`text-xs ${item.met ? 'text-text-primary' : 'text-text-muted'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Score bar */}
      <div className="mt-3 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${(score / total) * 100}%`,
            background: score >= 5 ? 'var(--color-bull)' : score >= 3 ? 'var(--color-neutral)' : 'var(--color-bear)',
            boxShadow: `0 0 8px ${score >= 5 ? 'var(--color-bull-glow)' : score >= 3 ? 'var(--color-neutral-dim)' : 'var(--color-bear-glow)'}`,
          }}
        />
      </div>
    </div>
  );
}
