import useMarketStore from '../../store/useMarketStore';
import { formatPrice, formatPips } from '../../utils/formatters';

export default function ActiveZones() {
  const { zones, currentPrice } = useMarketStore();
  const price = currentPrice || 0;

  // Combine all zones and sort by distance to current price
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
  })).sort((a, b) => a.distance - b.distance).slice(0, 5);

  const getZoneClass = (z) => {
    if (z.zoneType === 'OB') return z.type === 'bullish' ? 'zone-ob-bull' : 'zone-ob-bear';
    return 'zone-fvg';
  };

  return (
    <div className="glass-card p-4 animate-fade-in">
      <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
        Nearest Zones
      </h2>

      <div className="space-y-1.5">
        {withDistance.length === 0 && (
          <p className="text-xs text-text-muted py-2">No active zones detected</p>
        )}
        {withDistance.map((z, i) => (
          <div key={i} className={`${getZoneClass(z)} rounded-lg px-3 py-2 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase">{z.zoneType}</span>
              <span className="text-[10px] opacity-70 capitalize">{z.type}</span>
              <span className="text-[9px] text-text-muted">{z.timeframe}</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono font-medium">
                {z.zoneType === 'OB' ? `${formatPrice(z.low)}–${formatPrice(z.high)}` : `${formatPrice(z.bottom)}–${formatPrice(z.top)}`}
              </p>
              <p className="text-[9px] text-text-muted">{formatPips(z.distance)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
