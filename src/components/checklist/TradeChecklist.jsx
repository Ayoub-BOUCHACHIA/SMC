import useMarketStore from '../../store/useMarketStore';

export default function TradeChecklist() {
  const { confluence } = useMarketStore();
  const { items, score, total } = confluence;

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border flex items-center justify-between bg-bg-primary/30">
        <div className="flex items-center gap-2">
          <span className="text-sm">📝</span>
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
            Execution Checklist
          </h2>
        </div>
        <div className="flex flex-col items-end">
           <span className={`text-xs font-black font-mono ${score >= 5 ? 'text-bull' : score >= 3 ? 'text-neutral' : 'text-text-muted'}`}>
            {score}/{total}
          </span>
          <span className="text-[8px] text-text-muted uppercase tracking-tighter">CONFIRMATIONS</span>
        </div>
      </div>

      <div className="p-3 flex-1 overflow-auto space-y-1 bg-bg-deep/10">
        {items.map(item => (
          <div 
            key={item.id} 
            className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 border ${
              item.met 
                ? 'bg-bull/10 border-bull/20' 
                : 'bg-bg-primary/40 border-transparent grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:border-border/40'
            }`}
          >
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
              item.met ? 'bg-bull text-bg-deep shadow-[0_0_10px_var(--color-bull-glow)]' : 'bg-bg-tertiary text-text-muted'
            }`}>
              {item.met ? <span className="text-xs">✓</span> : <span className="text-xs">{item.icon}</span>}
            </div>
            
            <div className="flex-1 min-w-0">
               <p className={`text-[11px] font-bold tracking-tight transition-colors ${item.met ? 'text-text-bright' : 'text-text-muted'}`}>
                {item.label}
              </p>
            </div>

            {item.met && (
              <span className="text-[8px] font-mono text-bull/60 uppercase animate-fade-in">Verified</span>
            )}
          </div>
        ))}
      </div>

      {/* Dynamic Strength Bar */}
      <div className="p-4 bg-bg-primary/40 border-t border-border">
        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-text-muted mb-2">
          <span>Reliability Index</span>
          <span style={{ color: score >= 5 ? 'var(--color-bull)' : 'var(--color-neutral)' }}>
            {score >= 5 ? 'STABLE' : 'UNSTABLE'}
          </span>
        </div>
        <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden p-[2px] border border-border">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out relative"
            style={{
              width: `${(score / total) * 100}%`,
              background: score >= 5 ? 'linear-gradient(90deg, #00C897, #00FFC2)' : 'linear-gradient(90deg, #FFA502, #FFD32D)',
              boxShadow: `0 0 10px ${score >= 5 ? 'var(--color-bull-glow)' : 'var(--color-neutral-dim)'}`,
            }}
          >
             <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] animate-[progress_2s_linear_infinite]" style={{ width: '40px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
