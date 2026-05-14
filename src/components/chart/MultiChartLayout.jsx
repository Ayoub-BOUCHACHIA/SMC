import TradingChart from './TradingChart';

export default function MultiChartLayout() {
  const timeframes = ['1W', '1D', '4H', '1H', '15min', '5min'];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 h-full">
      {timeframes.map((tf) => (
        <div key={tf} className="glass-card p-2 flex flex-col min-h-0 border-border/40 hover:border-gold-400/20 transition-colors">
          <div className="flex items-center justify-between mb-1 px-1">
            <h2 className="text-[10px] font-black text-text-secondary uppercase tracking-widest" style={{ fontFamily: 'var(--font-heading)' }}>
              {tf} <span className="text-text-muted opacity-30">/ XAUUSD</span>
            </h2>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-bull/40" />
              <div className="w-1 h-1 rounded-full bg-bull/40 animate-pulse" />
            </div>
          </div>
          <div className="flex-1 w-full relative min-h-0">
            <TradingChart timeframe={tf} />
          </div>
        </div>
      ))}
    </div>
  );
}
