import { useEffect, useRef } from 'react';
import useMarketStore from './store/useMarketStore';
import { requestNotificationPermission } from './services/alertService';
import Header from './components/layout/Header';
import LoadingScreen from './components/layout/LoadingScreen';
import BiasPanel from './components/dashboard/BiasPanel';
import SetupStatus from './components/dashboard/SetupStatus';
import KillzoneTimer from './components/dashboard/KillzoneTimer';
import TradeChecklist from './components/checklist/TradeChecklist';
import MultiChartLayout from './components/chart/MultiChartLayout';
import ZonesTable from './components/zones/ZonesTable';
import ActiveZones from './components/dashboard/ActiveZones';
import AlertFeed from './components/alerts/AlertFeed';
import ApiSetupBanner from './components/dashboard/ApiSetupBanner';

export default function App() {
  const { refreshData, refreshPrice, loading, lastUpdate } = useMarketStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    requestNotificationPermission();
    refreshData();

    const priceIv = setInterval(refreshPrice, 30000);
    const dataIv = setInterval(refreshData, 300000);

    return () => {
      clearInterval(priceIv);
      clearInterval(dataIv);
    };
  }, [refreshData, refreshPrice]);

  if (loading && !lastUpdate) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen flex flex-col bg-bg-deep overflow-hidden">
      <Header />

      <main className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
        {/* API Setup Banner (demo mode) - only show if needed, but keeping it for now */}
        <ApiSetupBanner />

        {/* Top Info Bar: Bias + Setup + Killzone (Unified Header) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 shrink-0" style={{ height: '140px' }}>
          <div className="lg:col-span-4 h-full">
            <BiasPanel />
          </div>
          <div className="lg:col-span-5 h-full">
            <SetupStatus />
          </div>
          <div className="lg:col-span-3 h-full">
            <KillzoneTimer />
          </div>
        </div>

        {/* Middle Section: Charts & Checklist */}
        <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0">
          {/* Main Charts Area */}
          <div className="flex-1 min-w-0">
            <MultiChartLayout />
          </div>

          {/* Right Sidebar: Checklist & Proximity */}
          <div className="w-full lg:w-72 flex flex-col gap-3 shrink-0">
            <div className="flex-1 min-h-0">
              <TradeChecklist />
            </div>
            <div className="h-48">
              <ActiveZones />
            </div>
          </div>
        </div>

        {/* Bottom Section: Logs & Full Zones */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 shrink-0" style={{ height: '160px' }}>
          <div className="lg:col-span-8 h-full">
            <ZonesTable />
          </div>
          <div className="lg:col-span-4 h-full">
            <AlertFeed />
          </div>
        </div>
      </main>

      {/* Ultra-compact Footer */}
      <footer className="px-4 py-1 border-t border-border flex justify-between items-center bg-bg-primary/50 text-[9px] shrink-0">
        <p className="text-text-muted">
           <span className="text-gold-400">●</span> SMC ENGINE STABLE
        </p>
        <p className="text-text-muted font-mono">
          REFRESHED: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : '—'}
          {loading && <span className="ml-2 animate-pulse text-bull">📡 SYNC...</span>}
        </p>
      </footer>
    </div>
  );
}
