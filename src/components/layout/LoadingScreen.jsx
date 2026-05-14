import React, { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [loadingText, setLoadingText] = useState('INIT');
  
  useEffect(() => {
    const states = [
      'Establishing connection to TwelveData...',
      'Fetching 1W macro structure...',
      'Fetching 1D daily bias...',
      'Analyzing 4H zones...',
      'Mapping 15min / 5min liquidity pools...',
      'Compiling ICT/SMC Confluence metrics...',
      'Finalizing charts...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingText(states[i % states.length]);
      i++;
    }, 1500); // Change text every 1.5 seconds to show activity
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center text-text-primary p-6">
      <div className="glass-card p-10 flex flex-col items-center max-w-lg w-full relative overflow-hidden">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>
        
        {/* Spinner */}
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-t-2 border-gold animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-b-2 border-blue animate-[spin_2s_linear_reverse]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gold tracking-widest">SMC</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-[0.2em] text-white mb-2 uppercase text-center" style={{ fontFamily: 'var(--font-heading)' }}>
          System Initialization
        </h1>
        
        <div className="h-10 flex items-center justify-center w-full mt-4 bg-bg-elevated rounded border border-border">
          <p className="text-sm font-mono text-text-secondary animate-pulse text-center px-4">
            &gt; {loadingText}
          </p>
        </div>

        <div className="w-full mt-6 flex flex-col gap-2">
          <div className="w-full h-1 bg-border rounded overflow-hidden">
            <div className="h-full bg-gold animate-[progress_5s_ease-in-out_infinite] rounded"></div>
          </div>
          <p className="text-[10px] text-text-muted text-center uppercase tracking-widest">
            Connecting to Data Streams
          </p>
        </div>
      </div>
    </div>
  );
}
