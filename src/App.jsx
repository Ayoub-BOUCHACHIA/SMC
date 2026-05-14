import { useEffect, useRef } from 'react';
import useMarketStore from './store/useMarketStore';
import { requestNotificationPermission } from './services/alertService';
import Header from './components/layout/Header';
import LoadingScreen from './components/layout/LoadingScreen';
import BiasPanel from './components/dashboard/BiasPanel';
import ConfluenceScore from './components/dashboard/ConfluenceScore';
import ActiveZones from './components/dashboard/ActiveZones';
import SetupStatus from './components/dashboard/SetupStatus';
import KillzoneTimer from './components/dashboard/KillzoneTimer';
import TradeChecklist from './components/checklist/TradeChecklist';
import MultiChartLayout from './components/chart/MultiChartLayout';
import ZonesTable from './components/zones/ZonesTable';
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

    // Refresh price every 30s
    const priceIv = setInterval(refreshPrice, 30000);
    // Full refresh every 5 min
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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-4 lg:p-6">
        {/* API Setup Banner (demo mode) */}
        <ApiSetupBanner />

        {/* Top Row: Bias + Setup + Killzone */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          <div className="lg:col-span-5">
            <BiasPanel />
          </div>
          <div className="lg:col-span-4">
            <SetupStatus />
          </div>
          <div className="lg:col-span-3">
            <KillzoneTimer />
          </div>
        </div>

        {/* Main Row: Charts */}
        <div className="mb-4">
          <MultiChartLayout />
        </div>

        {/* Confluence & Checklist Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ConfluenceScore />
          <TradeChecklist />
        </div>

        {/* Bottom Row: Zones + Active + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <ZonesTable />
          </div>
          <div className="lg:col-span-4">
            <ActiveZones />
          </div>
          <div className="lg:col-span-3">
            <AlertFeed />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-border text-center">
        <p className="text-[10px] text-text-muted">
          SMC Gold Analyzer — ICT/Smart Money Concepts • Data refreshed {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : '—'}
          {loading && <span className="ml-2 animate-pulse">⟳ Refreshing...</span>}
        </p>
      </footer>
    </div>
  );
}
