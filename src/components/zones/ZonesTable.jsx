import useMarketStore from '../../store/useMarketStore';
import { formatPrice } from '../../utils/formatters';

export default function ZonesTable() {
  const { zones, currentPrice } = useMarketStore();
  const price = currentPrice || 0;

  const rows = [
    ...(zones.orderBlocks || []).map(z => ({
      zoneType: 'OB', direction: z.type, high: z.high, low: z.low, tf: z.timeframe, status: z.mitigated ? 'MITIGATED' : 'ACTIVE',
      distance: Math.abs(price - (z.high + z.low) / 2),
      isMitigated: z.mitigated
    })),
    ...(zones.fvg || []).map(z => ({
      zoneType: 'FVG', direction: z.type, high: z.top, low: z.bottom, tf: z.timeframe, status: z.filled ? 'FILLED' : 'ACTIVE',
      distance: Math.abs(price - (z.top + z.bottom) / 2),
      isMitigated: z.filled
    })),
    ...(zones.liquidity || []).map(z => ({
      zoneType: z.type, direction: z.type === 'BSL' ? 'bearish' : 'bullish', high: z.price, low: z.price, tf: z.timeframe, status: z.swept ? 'SWEPT' : 'ACTIVE',
      distance: Math.abs(price - z.price),
      isMitigated: z.swept
    })),
  ].sort((a, b) => a.distance - b.distance);

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border flex items-center justify-between bg-bg-primary/30">
        <div className="flex items-center gap-2">
          <span className="text-sm">🌐</span>
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
            Institutional Liquidity Engine
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-text-muted px-1.5 py-0.5 rounded border border-border">
            SCANNING...
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px] border-separate border-spacing-0">
          <thead className="sticky top-0 bg-bg-card z-10 shadow-sm">
            <tr>
              <th className="text-left py-3 px-4 text-text-muted font-bold uppercase tracking-widest border-b border-border">TYPE</th>
              <th className="text-left py-3 px-2 text-text-muted font-bold uppercase tracking-widest border-b border-border">TF</th>
              <th className="text-left py-3 px-2 text-text-muted font-bold uppercase tracking-widest border-b border-border">RANGE</th>
              <th className="text-right py-3 px-4 text-text-muted font-bold uppercase tracking-widest border-b border-border">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {rows.slice(0, 15).map((row, i) => (
              <tr key={i} className="hover:bg-bg-hover/40 transition-colors group">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-3 rounded-full ${row.direction === 'bullish' ? 'bg-bull' : 'bg-bear'}`} />
                    <span className="font-bold text-text-primary tracking-tight">{row.zoneType}</span>
                    <span className={`text-[9px] font-bold ${row.direction === 'bullish' ? 'text-bull' : 'text-bear'}`}>
                      {row.direction === 'bullish' ? '↑' : '↓'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className="text-text-muted font-mono">{row.tf}</span>
                </td>
                <td className="py-3 px-2 font-mono text-text-secondary">
                  {row.high === row.low 
                    ? formatPrice(row.high) 
                    : <span className="flex flex-col">
                        <span className="text-[10px]">{formatPrice(row.high)}</span>
                        <span className="text-[10px] opacity-40">{formatPrice(row.low)}</span>
                      </span>
                  }
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    row.isMitigated 
                      ? 'bg-bg-tertiary text-text-muted border-border' 
                      : row.direction === 'bullish' 
                        ? 'bg-bull/10 text-bull border-bull/20' 
                        : 'bg-bear/10 text-bear border-bear/20'
                  }`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} className="py-10 text-center text-text-muted italic">No liquidity zones detected in search window</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-2 bg-bg-deep/50 border-t border-border flex justify-between items-center px-4">
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-bull animate-pulse" />
          <div className="w-1 h-1 rounded-full bg-bull animate-pulse delay-75" />
          <div className="w-1 h-1 rounded-full bg-bull animate-pulse delay-150" />
        </div>
        <span className="text-[9px] font-mono text-text-muted uppercase">SYSTEMS STABLE</span>
      </div>
    </div>
  );
}
