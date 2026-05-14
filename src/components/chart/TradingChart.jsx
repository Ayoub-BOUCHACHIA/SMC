import { useEffect, useRef, useCallback } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { COLORS } from '../../config/constants';
import useMarketStore from '../../store/useMarketStore';

export default function TradingChart({ timeframe }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const priceLinesRef = useRef([]);

  const { ohlcv, chartTF, zones, structures } = useMarketStore();
  const tf = timeframe || chartTF;
  const candles = ohlcv[tf] || [];

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
          let t = c.time;
          if (typeof t === 'string') {
            const d = new Date(t.replace(' ', 'T') + (t.includes('Z') ? '' : 'Z'));
            t = Math.floor(d.getTime() / 1000);
          }
          return { time: t, open: c.open, high: c.high, low: c.low, close: c.close };
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

        // ─── Draw Structure Markers ───
        const tfStructure = structures[tf];
        if (tfStructure && tfStructure.points) {
          const markers = [];
          tfStructure.points.forEach(p => {
            let t = p.time;
            if (typeof t === 'string') {
              const d = new Date(t.replace(' ', 'T') + (t.includes('Z') ? '' : 'Z'));
              t = Math.floor(d.getTime() / 1000);
            }
            if (seen.has(t)) {
              markers.push({
                time: t,
                position: p.type === 'high' ? 'aboveBar' : 'belowBar',
                color: p.type === 'high' ? COLORS.bear : COLORS.bull,
                shape: p.type === 'high' ? 'arrowDown' : 'arrowUp',
                text: p.label,
                size: 1,
              });
            }
          });
          markers.sort((a, b) => a.time - b.time);
          seriesRef.current.setMarkers(markers);
        }

        // ─── Draw Zones (OB / FVG) ───
        priceLinesRef.current.forEach(pl => seriesRef.current.removePriceLine(pl));
        priceLinesRef.current = [];

        const linesToDraw = [];
        
        // Active Order Blocks
        const tfOBs = (zones?.orderBlocks || []).filter(z => z.timeframe === tf);
        tfOBs.forEach(ob => {
          linesToDraw.push({
            price: ob.top,
            color: ob.type === 'bullish' ? COLORS.bull : COLORS.bear,
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: true,
            title: `OB`,
          });
          linesToDraw.push({
            price: ob.bottom,
            color: ob.type === 'bullish' ? COLORS.bull : COLORS.bear,
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: false,
          });
        });

        // Active FVGs
        const tfFVGs = (zones?.fvg || []).filter(z => z.timeframe === tf);
        tfFVGs.forEach(f => {
          linesToDraw.push({
            price: f.top,
            color: COLORS.fvg,
            lineWidth: 1,
            lineStyle: 3,
            axisLabelVisible: true,
            title: `FVG`,
          });
          linesToDraw.push({
            price: f.bottom,
            color: COLORS.fvg,
            lineWidth: 1,
            lineStyle: 3,
            axisLabelVisible: false,
          });
        });

        linesToDraw.forEach(opts => {
          const pl = seriesRef.current.createPriceLine(opts);
          priceLinesRef.current.push(pl);
        });

        // Only fit content on initial data load, not on every tick to preserve zoom level
        if (unique.length === candles.length) {
          chartRef.current?.timeScale().fitContent();
        }
      }
    } catch (err) {
      console.warn('Chart data update error:', err);
    }
  }, [candles, tf, zones, structures]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    />
  );
}
