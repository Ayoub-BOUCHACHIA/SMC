import useMarketStore from '../../store/useMarketStore';
import { formatPrice, formatPips } from '../../utils/formatters';

export default function ActiveZones() {
  const { zones, currentPrice } = useMarketStore();
  const price = currentPrice || 0;

  const allZones = [
    ...(zones.orderBlocks || []).map(z => ({
      ...z, zoneType: 'OB', midPrice: (z.high + z.low) / 2,
    })),
    ...(zones.fvg || []).map(z => ({
      ...z, zoneType: 'FVG', midPrice: (z.top + z.bottom) / 2,
    })),
  ];

  const withDistance = allZones.map(z => ({
    ...z, distance: Math.abs(price - z.midPrice),
  })).sort((a, b) => a.distance - b.distance).slice(0, 4);

  return (
    <div className="glass-card p-4 animate-fade-in h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">👁️</span>
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
          High Prob. Zones
        </h2>
      </div>

      <div className="space-y-3 flex-1 overflow-auto">
        {withDistance.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center mb-2">
              <span className="text-xs opacity-30">🔍</span>
            </div>
            <p className="text-[10px] text-text-muted italic">Scanning for nearest zones...</p>
          </div>
        )}
        
        {withDistance.map((z, i) => (
          <div key={i} className="group relative overflow-hidden rounded-xl border border-border/40 hover:border-gold-400/30 transition-all duration-300 bg-bg-primary/40 p-3">
            {/* Background progress bar for proximity (normalized) */}
            <div 
              className="absolute left-0 bottom-0 h-[2px] bg-gold-400/40 transition-all duration-1000"
              style={{ width: `${Math.max(5, 100 - (z.distance / 10) * 100)}%` }}
            />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    z.zoneType === 'OB' 
                      ? (z.type === 'bullish' ? 'bg-bull/10 text-bull' : 'bg-bear/10 text-bear')
                      : 'bg-fvg-solid/10 text-fvg-solid'
                  }`}>
                    {z.zoneType}
                  </span>
                  <span className="text-[10px] text-text-muted font-mono tracking-tighter">{z.timeframe}</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-sm font-bold text-text-primary tabular-nums" style={{ fontFamily: 'var(--font-heading)' }}>
                    {z.zoneType === 'OB' ? formatPrice(z.midPrice) : formatPrice(z.midPrice)}
                   </span>
                   <span className={`text-[9px] font-bold uppercase tracking-widest ${z.type === 'bullish' ? 'text-bull' : 'text-bear'}`}>
                     {z.type} SETUP
                   </span>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className={`text-[10px] font-mono font-bold ${z.distance < 1 ? 'text-gold-400 animate-pulse' : 'text-text-muted'}`}>
                  {formatPips(z.distance)} PIPS
                </div>
                <button className="mt-2 text-[9px] text-text-muted hover:text-gold-400 transition-colors uppercase font-bold tracking-widest">
                  ALARM 🔔
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
