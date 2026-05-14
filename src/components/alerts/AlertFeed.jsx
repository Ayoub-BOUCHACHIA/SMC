import useMarketStore from '../../store/useMarketStore';
import { ALERT_TYPES } from '../../services/alertService';
import { timeAgo } from '../../utils/formatters';

export default function AlertFeed() {
  const { alerts, clearAlerts } = useMarketStore();

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border flex items-center justify-between bg-bg-primary/30">
        <div className="flex items-center gap-2">
          <span className="text-sm">🔔</span>
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
            System Events
          </h2>
        </div>
        {alerts.length > 0 && (
          <button 
            onClick={clearAlerts} 
            className="text-[9px] font-bold text-text-muted hover:text-bear transition-all px-2 py-0.5 rounded border border-border hover:border-bear/30 uppercase tracking-tighter"
          >
            Flush
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-0.5 p-2 bg-bg-deep/20">
        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 opacity-30">
            <span className="text-2xl mb-2">📡</span>
            <p className="text-[10px] uppercase tracking-widest font-bold">Awaiting Market Signals</p>
          </div>
        )}
        {alerts.slice(0, 20).map(alert => {
          const config = ALERT_TYPES[alert.type] || ALERT_TYPES.info;
          return (
            <div 
              key={alert.id} 
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-bg-hover/30 transition-all group border border-transparent hover:border-border/40 animate-slide-in"
            >
              <div className="flex flex-col items-center gap-1 mt-1">
                 <span className="text-base group-hover:scale-110 transition-transform">{config.icon}</span>
                 <div className="w-[1px] h-full bg-border group-last:hidden" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-text-primary tracking-tight">{alert.title}</p>
                  <span className="text-[9px] font-mono text-text-muted whitespace-nowrap">{timeAgo(alert.timestamp)}</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5 line-clamp-2">{alert.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2 border-t border-border text-[9px] text-text-muted flex justify-center items-center gap-2 bg-bg-primary/40 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-bull/50 animate-pulse" />
        REAL-TIME FEED ACTIVE
      </div>
    </div>
  );
}
