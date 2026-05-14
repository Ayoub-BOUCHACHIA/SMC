import { useState, useCallback, useEffect } from 'react';
import TradingChart from './TradingChart';

export default function MultiChartLayout() {
  const timeframes = ['1W', '1D', '4H', '1H', '15min', '5min'];
  const [expanded, setExpanded] = useState(null);

  // Close on Escape key
  useEffect(() => {
    if (!expanded) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setExpanded(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [expanded]);

  const handleExpand = useCallback((tf) => {
    setExpanded(tf);
  }, []);

  const handleClose = useCallback(() => {
    setExpanded(null);
  }, []);

  return (
    <>
      {/* ── Expanded Chart Overlay ── */}
      {expanded && (
        <div
          className="chart-overlay"
          onClick={handleClose}
        >
          <div
            className="chart-overlay-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="chart-overlay-header">
              <div className="chart-overlay-title">
                <span className="chart-overlay-tf">{expanded}</span>
                <span className="chart-overlay-pair">XAUUSD</span>
              </div>
              <button
                className="chart-overlay-close"
                onClick={handleClose}
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Chart */}
            <div className="chart-overlay-body">
              <TradingChart timeframe={expanded} key={`expanded-${expanded}`} />
            </div>
          </div>
        </div>
      )}

      {/* ── Normal 3x2 Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 h-full">
        {timeframes.map((tf) => (
          <div
            key={tf}
            className="glass-card p-2 flex flex-col min-h-0 border-border/40 hover:border-gold-400/20 transition-colors cursor-pointer group"
            onClick={() => handleExpand(tf)}
          >
            <div className="flex items-center justify-between mb-1 px-1">
              <h2 className="text-[10px] font-black text-text-secondary uppercase tracking-widest" style={{ fontFamily: 'var(--font-heading)' }}>
                {tf} <span className="text-text-muted opacity-30">/ XAUUSD</span>
              </h2>
              <div className="flex gap-1 items-center">
                {/* Expand icon — visible on hover */}
                <svg
                  className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-60 transition-opacity"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
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
    </>
  );
}
