import { useEffect, useRef, useCallback } from 'react';
import { createChart, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts';
import { COLORS } from '../../config/constants';
import useMarketStore from '../../store/useMarketStore';
import { getLastAsianSessionEnd } from '../../utils/timeUtils';

export default function TradingChart({ timeframe }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const priceLinesRef = useRef([]);
  const markersRef = useRef(null);

  const { ohlcv, chartTF, zones, structures, stopHunts } = useMarketStore();
  const tf = timeframe || chartTF;
  const candles = ohlcv[tf] || [];

  // Helper: convert any time value to unix seconds
  const toUnix = (t) => {
    if (typeof t === 'number') return t;
    if (typeof t === 'string') {
      const d = new Date(t.replace(' ', 'T') + (t.includes('Z') ? '' : 'Z'));
      return Math.floor(d.getTime() / 1000);
    }
    return NaN;
  };

  const initChart = useCallback(() => {
    if (!containerRef.current) return;
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth || 800,
      height: containerRef.current.clientHeight || 500,
      autoSize: true,
      layout: {
        background: { color: 'transparent' },
        textColor: COLORS.textSecondary,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(30, 42, 66, 0.5)' },
        horzLines: { color: 'rgba(30, 42, 66, 0.5)' },
      },
      crosshair: {
        vertLine: { color: COLORS.gold, width: 1, style: 2, labelBackgroundColor: COLORS.gold },
        horzLine: { color: COLORS.gold, width: 1, style: 2, labelBackgroundColor: COLORS.gold },
      },
      rightPriceScale: {
        borderColor: COLORS.border,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: COLORS.border,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: COLORS.bull,
      downColor: COLORS.bear,
      borderUpColor: COLORS.bull,
      borderDownColor: COLORS.bear,
      wickUpColor: COLORS.bull,
      wickDownColor: COLORS.bear,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || entries[0].target !== containerRef.current) return;
      const newRect = entries[0].contentRect;
      if (chartRef.current && newRect.width > 0 && newRect.height > 0) {
        chartRef.current.applyOptions({
          width: newRect.width,
          height: newRect.height,
        });
      }
    });
    
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const cleanup = initChart();
    return () => {
      cleanup?.();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [initChart]);

  // Update data and draw SMC visuals
  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;

    try {
      const chartData = candles
        .map((c) => {
          const t = toUnix(c.datetime || c.time);
          return { time: t, open: +c.open, high: +c.high, low: +c.low, close: +c.close };
        })
        .filter((d) => !isNaN(d.time))
        .sort((a, b) => a.time - b.time);

      const seen = new Set();
      const unique = chartData.filter((d) => {
        if (seen.has(d.time)) return false;
        seen.add(d.time);
        return true;
      });

      if (unique.length > 0) {
        seriesRef.current.setData(unique);

        // ─── Build Markers Array ───
        // SMC Top-Down: H4/H1 = POI zones & structure, 15min/5min = execution (Sweep/CHoCH), BOS = all intraday
        const markers = [];
        const lastAsianEnd = getLastAsianSessionEnd();

        // Execution TFs: Sweep & CHoCH only here (post-Asian session)
        const executionTFs = ['15min', '5min'];
        // POI TFs: OB/FVG zones & HH/HL/LH/LL structure labels
        const poiTFs = ['4H', '1H'];
        // Overview TFs: clean charts, no markers
        const overviewTFs = ['1W', '1D'];

        // 1. Sweep Markers — only on execution TFs, post-Asian session
        if (executionTFs.includes(tf)) {
          const tfSweeps = (stopHunts || []).filter(h => h.timeframe === tf && h.levelType && h.time);
          tfSweeps.forEach(sweep => {
            const t = toUnix(sweep.time);
            if (t < lastAsianEnd) return; // Only post-Asian session
            if (seen.has(t)) {
              markers.push({
                time: t,
                position: sweep.direction === 'BULLISH' ? 'belowBar' : 'aboveBar',
                color: COLORS.gold,
                shape: sweep.direction === 'BULLISH' ? 'arrowUp' : 'arrowDown',
                text: '💧 Sweep',
                size: 1,
              });
            }
          });
        }

        // 2. Structure Markers (HH/LL, CHoCH, BOS)
        const tfStructure = structures[tf];
        if (tfStructure && tfStructure.points && !overviewTFs.includes(tf)) {
          tfStructure.points.forEach(p => {
            if (!p.label && !p.marker) return;
            
            const markerText = p.marker ? p.marker : p.label;
            const t = toUnix(p.time);
            
            // HH/HL/LH/LL — only on POI TFs (H4, H1) for structure identification
            if (['HH', 'HL', 'LH', 'LL'].includes(markerText) && !poiTFs.includes(tf)) {
              return;
            }

            // CHoCH — only on execution TFs (15min, 5min) for entry confirmation
            if (markerText === 'CHoCH' && !executionTFs.includes(tf)) {
              return;
            }

            // CHoCH — only post-Asian session
            if (markerText === 'CHoCH' && t < lastAsianEnd) {
              return;
            }

            // BOS — shown on all intraday TFs (H4, H1, 15min, 5min)
            // No additional filter needed for BOS

            if (seen.has(t)) {
              let color = p.type === 'high' ? COLORS.bear : COLORS.bull;
              if (p.marker === 'CHoCH') color = COLORS.gold;
              if (p.marker === 'BOS') color = '#9B59B6';

              markers.push({
                time: t,
                position: p.type === 'high' ? 'aboveBar' : 'belowBar',
                color,
                shape: p.type === 'high' ? 'arrowDown' : 'arrowUp',
                text: markerText,
                size: 1,
              });
            }
          });
        }
        
        markers.sort((a, b) => a.time - b.time);
        
        // Deduplicate markers by time (lightweight-charts crashes on duplicates)
        const uniqueMarkers = [];
        const markerTimes = new Set();
        markers.forEach(m => {
          if (!markerTimes.has(m.time)) {
            markerTimes.add(m.time);
            uniqueMarkers.push(m);
          } else {
            const existing = uniqueMarkers.find(um => um.time === m.time);
            if (existing && existing.text !== m.text) {
               existing.text += ' / ' + m.text;
            }
          }
        });

        // ─── Use v5 API: createSeriesMarkers ───
        // Remove old markers primitive if it exists
        if (markersRef.current) {
          try { markersRef.current.detach(); } catch (_) { /* ignore */ }
          markersRef.current = null;
        }

        if (uniqueMarkers.length > 0) {
          markersRef.current = createSeriesMarkers(seriesRef.current, uniqueMarkers);
        }

        // ─── Draw Zones (OB / FVG) as price lines ───
        priceLinesRef.current.forEach(pl => {
          try { seriesRef.current.removePriceLine(pl); } catch (_) { /* ignore */ }
        });
        priceLinesRef.current = [];

        // OB/FVG zones — only on POI TFs (H4, H1) for institutional zone identification
        const shouldShowZones = poiTFs.includes(tf);

        const linesToDraw = [];
        
        if (shouldShowZones) {
          // Active Order Blocks (use .high / .low from engine)
          const tfOBs = (zones?.orderBlocks || []).filter(z => z.timeframe === tf);
          tfOBs.forEach(ob => {
            linesToDraw.push({
              price: ob.high,
              color: ob.type === 'bullish' ? COLORS.bull : COLORS.bear,
              lineWidth: 1,
              lineStyle: 2,
              axisLabelVisible: true,
              title: `OB ${ob.type === 'bullish' ? '▲' : '▼'}`,
            });
            linesToDraw.push({
              price: ob.low,
              color: ob.type === 'bullish' ? COLORS.bull : COLORS.bear,
              lineWidth: 1,
              lineStyle: 2,
              axisLabelVisible: false,
            });
          });

          // Active FVGs (use .top / .bottom from engine)
          const tfFVGs = (zones?.fvg || []).filter(z => z.timeframe === tf);
          tfFVGs.forEach(f => {
            linesToDraw.push({
              price: f.top,
              color: COLORS.fvg,
              lineWidth: 1,
              lineStyle: 3,
              axisLabelVisible: true,
              title: `FVG ${f.type === 'bullish' ? '▲' : '▼'}`,
            });
            linesToDraw.push({
              price: f.bottom,
              color: COLORS.fvg,
              lineWidth: 1,
              lineStyle: 3,
              axisLabelVisible: false,
            });
          });
        }

        linesToDraw.forEach(opts => {
          try {
            const pl = seriesRef.current.createPriceLine(opts);
            priceLinesRef.current.push(pl);
          } catch (_) { /* ignore invalid prices */ }
        });

        // Fit content on initial load
        if (unique.length === candles.length) {
          chartRef.current?.timeScale().fitContent();
        }
      }
    } catch (err) {
      console.warn('Chart data update error:', err);
    }
  }, [candles, tf, zones, structures, stopHunts]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    />
  );
}
