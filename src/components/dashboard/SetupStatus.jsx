import useMarketStore from '../../store/useMarketStore';

export default function SetupStatus() {
  const { setupDetected, confluence } = useMarketStore();

  return (
    <div className={`glass-card p-4 animate-fade-in relative overflow-hidden ${setupDetected ? 'border-bull/30' : ''}`}>
      {setupDetected && (
        <div className="absolute inset-0 bg-gradient-to-r from-bull/5 to-transparent pointer-events-none" />
      )}
      <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
        Setup Status
      </h2>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg relative ${setupDetected ? 'bg-bull/20' : 'bg-bg-tertiary'}`}>
          {setupDetected && (
            <span className="absolute inset-0 rounded-xl bg-bull/20" style={{ animation: 'beacon 2s ease-out infinite' }} />
          )}
          <span>{setupDetected ? '✅' : '⏳'}</span>
        </div>
        <div>
          <p className={`text-lg font-bold ${setupDetected ? 'text-bull' : 'text-text-muted'}`} style={{ fontFamily: 'var(--font-heading)' }}>
            {setupDetected ? 'SETUP DETECTED' : 'WAITING'}
          </p>
          <p className="text-[10px] text-text-muted">
            {confluence.score}/{confluence.total} conditions met
          </p>
        </div>
      </div>
    </div>
  );
}
