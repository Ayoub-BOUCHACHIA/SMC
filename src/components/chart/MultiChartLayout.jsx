import TradingChart from './TradingChart';

export default function MultiChartLayout() {
  const timeframes = ['1W', '1D', '4H', '1H', '15min', '5min'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {timeframes.map((tf) => (
        <div key={tf} className="glass-card p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
              XAU/USD — {tf}
            </h2>
            <div className="flex gap-2">
              <span className="text-[10px] px-1.5 py-0.5 bg-bg-secondary rounded border border-border text-text-muted">
                {tf === '1W' || tf === '1D' ? 'Bias & Trend' : tf === '4H' || tf === '1H' ? 'Key Zones' : 'Entry & MSS'}
              </span>
            </div>
          </div>
          <div className="w-full flex-1" style={{ minHeight: '32vh' }}>
            <TradingChart timeframe={tf} />
          </div>
        </div>
      ))}
    </div>
  );
}
