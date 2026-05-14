import useMarketStore from '../../store/useMarketStore';
import { formatPrice } from '../../utils/formatters';

export default function ZonesTable() {
  const { zones, currentPrice } = useMarketStore();
  const price = currentPrice || 0;

  const rows = [
    ...(zones.orderBlocks || []).map(z => ({
      zoneType: 'OB', direction: z.type, high: z.high, low: z.low, tf: z.timeframe, status: z.mitigated ? 'Mitigated' : 'Active',
      distance: Math.abs(price - (z.high + z.low) / 2),
    })),
    ...(zones.fvg || []).map(z => ({
      zoneType: 'FVG', direction: z.type, high: z.top, low: z.bottom, tf: z.timeframe, status: z.filled ? 'Filled' : 'Active',
      distance: Math.abs(price - (z.top + z.bottom) / 2),
    })),
    ...(zones.liquidity || []).map(z => ({
      zoneType: z.type, direction: z.type === 'BSL' ? 'bearish' : 'bullish', high: z.price, low: z.price, tf: z.timeframe, status: z.swept ? 'Swept' : 'Active',
      distance: Math.abs(price - z.price),
    })),
  ].sort((a, b) => a.distance - b.distance);

  const typeColors = {
    'OB': { bull: 'text-bull', bear: 'text-bear' },
    'FVG': { bull: 'text-fvg-solid', bear: 'text-fvg-solid' },
    'BSL': { bull: 'text-liquidity', bear: 'text-liquidity' },
    'SSL': { bull: 'text-liquidity', bear: 'text-liquidity' },
  };

  return (
    <div className="glass-card p-4 animate-fade-in">
      <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
        All Zones
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 text-text-muted font-medium">Type</th>
              <th className="text-left py-2 px-2 text-text-muted font-medium">Dir</th>
              <th className="text-right py-2 px-2 text-text-muted font-medium">Range</th>
              <th className="text-center py-2 px-2 text-text-muted font-medium">TF</th>
              <th className="text-center py-2 px-2 text-text-muted font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 20).map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-bg-hover transition-colors">
                <td className="py-2 px-2 font-semibold">{row.zoneType}</td>
                <td className={`py-2 px-2 capitalize ${row.direction === 'bullish' ? 'text-bull' : 'text-bear'}`}>
                  {row.direction === 'bullish' ? '▲' : '▼'} {row.direction}
                </td>
                <td className="py-2 px-2 text-right font-mono">
                  {row.high === row.low ? formatPrice(row.high) : `${formatPrice(row.low)} – ${formatPrice(row.high)}`}
                </td>
                <td className="py-2 px-2 text-center text-text-muted">{row.tf}</td>
                <td className="py-2 px-2 text-center">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${row.status === 'Active' ? 'bg-bull/10 text-bull' : 'bg-bg-tertiary text-text-muted'}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="py-4 text-center text-text-muted">No zones detected yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
