import { useState, useCallback, useEffect } from 'react';
import TradingChart from './TradingChart';
import useMarketStore from '../../store/useMarketStore';
import { getLastAsianSessionEnd } from '../../utils/timeUtils';

export default function MultiChartLayout() {
  const timeframes = ['1W', '1D', '4H', '1H', '15min', '5min'];
  const [expanded, setExpanded] = useState(null);
  const { biases, zones, structures, mss, stopHunts } = useMarketStore();

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

  const getRoleBadge = (tf) => {
    if (tf === '1W' || tf === '1D') {
      const bias = biases[tf]?.direction || 'NEUTRAL';
      const color = bias === 'BULLISH' ? 'text-bull border-bull/20 bg-bull/10' :
                    bias === 'BEARISH' ? 'text-bear border-bear/20 bg-bear/10' :
                    'text-neutral border-neutral/20 bg-neutral/10';
      return { label: `BIAS: ${bias}`, classes: color };
    }
    
    if (tf === '4H' || tf === '1H') {
      // Look for active zones in this TF
      const activeOBs = (zones?.orderBlocks || []).filter(z => z.timeframe === tf && z.active).length;
      const activeFVGs = (zones?.fvg || []).filter(z => z.timeframe === tf && z.active).length;
      
      if (activeOBs > 0 || activeFVGs > 0) {
        return { label: `POI: ${activeOBs} OB, ${activeFVGs} FVG`, classes: 'text-gold-400 border-gold-400/20 bg-gold-400/10' };
      }
      
      const trend = structures[tf]?.trend || 'NEUTRAL';
      const color = trend === 'BULLISH' ? 'text-bull/80 border-bull/10 bg-bull/5' :
                    trend === 'BEARISH' ? 'text-bear/80 border-bear/10 bg-bear/5' :
                    'text-text-muted border-border bg-bg-tertiary';
      return { label: `STRUCT: ${trend}`, classes: color };
    }
    
    if (tf === '15min' || tf === '5min') {
      const tfMss = mss[tf];
      if (tfMss?.detected) {
        const color = tfMss.direction === 'BULLISH' ? 'text-bull border-bull/20 bg-bull/10' : 'text-bear border-bear/20 bg-bear/10';
        return { label: `EXEC: CHoCH`, classes: color };
      }
      
      const lastAsianEnd = getLastAsianSessionEnd();
      const hasRecentSweep = (stopHunts || []).some(h => 
        h.timeframe === tf && h.time && (new Date(h.time).getTime() / 1000) >= lastAsianEnd
      );
      
      if (hasRecentSweep) {
        return { label: `EXEC: SWEEP`, classes: 'text-neutral border-neutral/20 bg-neutral/10' };
      }
      return { label: `EXEC: WAITING`, classes: 'text-text-muted border-border bg-bg-tertiary' };
    }
    return { label: '', classes: '' };
  };

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
              <div className="chart-overlay-title flex items-center gap-3">
                <span className="chart-overlay-tf">{expanded}</span>
                <span className="chart-overlay-pair">XAUUSD</span>
                {(() => {
                  const badge = getRoleBadge(expanded);
                  if (!badge.label) return null;
                  return (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${badge.classes}`}>
                      {badge.label}
                    </span>
                  );
                })()}
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
        {timeframes.map((tf) => {
          const badge = getRoleBadge(tf);
          return (
            <div
              key={tf}
              className="glass-card p-2 flex flex-col min-h-0 border-border/40 hover:border-gold-400/20 transition-colors cursor-pointer group"
              onClick={() => handleExpand(tf)}
            >
              <div className="flex items-center justify-between mb-1 px-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[10px] font-black text-text-secondary uppercase tracking-widest" style={{ fontFamily: 'var(--font-heading)' }}>
                    {tf} <span className="text-text-muted opacity-30">/ XAUUSD</span>
                  </h2>
                  {badge.label && (
                    <span className={`px-1.5 py-[1px] rounded text-[8px] font-bold tracking-widest border ${badge.classes}`}>
                      {badge.label}
                    </span>
                  )}
                </div>
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
          );
        })}
      </div>
    </>
  );
}
