import useMarketStore from '../../store/useMarketStore';
import { ALERT_TYPES } from '../../services/alertService';
import { timeAgo } from '../../utils/formatters';

export default function AlertFeed() {
  const { alerts, clearAlerts } = useMarketStore();

  return (
    <div className="glass-card p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
          Alerts
        </h2>
        {alerts.length > 0 && (
          <button onClick={clearAlerts} className="text-[10px] text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
            Clear
          </button>
        )}
      </div>

      <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
        {alerts.length === 0 && (
          <p className="text-xs text-text-muted py-3 text-center">No alerts yet</p>
        )}
        {alerts.slice(0, 15).map(alert => {
          const config = ALERT_TYPES[alert.type] || ALERT_TYPES.info;
          return (
            <div key={alert.id} className="flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-bg-hover transition-colors animate-slide-in">
              <span className="text-sm flex-shrink-0">{config.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{alert.title}</p>
                <p className="text-[10px] text-text-muted truncate">{alert.message}</p>
              </div>
              <span className="text-[9px] text-text-muted flex-shrink-0">{timeAgo(alert.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
