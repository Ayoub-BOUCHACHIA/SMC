import { useEffect, useState } from 'react';
import useMarketStore from '../../store/useMarketStore';
import { formatPrice } from '../../utils/formatters';
import { getActiveKillzone } from '../../utils/timeUtils';
import { isApiConfigured } from '../../config/api';

export default function Header() {
  const { currentPrice, previousPrice, lastUpdate, loading } = useMarketStore();
  const [kz, setKz] = useState({ active: false });
  const [flash, setFlash] = useState('');

  useEffect(() => {
    const iv = setInterval(() => setKz(getActiveKillzone()), 10000);
    setKz(getActiveKillzone());
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (previousPrice && currentPrice) {
      setFlash(currentPrice > previousPrice ? 'up' : currentPrice < previousPrice ? 'down' : '');
      const t = setTimeout(() => setFlash(''), 800);
      return () => clearTimeout(t);
    }
  }, [currentPrice, previousPrice]);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-bg-primary/80 backdrop-blur-md">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-bg-deep font-bold text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
          SM
        </div>
        <div>
          <h1 className="text-base font-bold tracking-wide" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold-400)' }}>
            SMC GOLD ANALYZER
          </h1>
          <p className="text-[10px] text-text-muted tracking-widest uppercase">ICT / Smart Money Concepts</p>
        </div>
      </div>

      {/* Live Price */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">XAU / USD</p>
          <p
            className={`text-2xl font-bold tabular-nums tracking-tight ${flash === 'up' ? 'text-bull' : flash === 'down' ? 'text-bear' : 'text-text-bright'}`}
            style={{
              fontFamily: 'var(--font-mono)',
              animation: flash ? `price-flash-${flash} 0.8s ease-out` : 'none',
              textShadow: flash === 'up' ? '0 0 20px var(--color-bull-glow)' : flash === 'down' ? '0 0 20px var(--color-bear-glow)' : 'none',
            }}
          >
            {currentPrice ? formatPrice(currentPrice) : '—'}
          </p>
        </div>

        {/* Session Badge */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${kz.active ? 'border-gold-400/50 bg-gold-400/10' : 'border-border bg-bg-tertiary'}`}>
          <span className={`w-2 h-2 rounded-full ${kz.active ? 'bg-bull animate-pulse' : 'bg-text-muted'}`} />
          <span className="text-text-secondary">
            {kz.active ? `${kz.emoji} ${kz.name}` : '⏸ Off Session'}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-[10px] text-text-muted">
          {loading && <span className="animate-pulse">◉ Loading...</span>}
          {!isApiConfigured() && (
            <span className="text-neutral px-2.5 py-1 rounded-lg bg-neutral/15 border border-neutral/30 font-semibold animate-pulse tracking-wide">
              ⚠ DEMO — Données fictives
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
