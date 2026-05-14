import { useState } from 'react';
import { isApiConfigured } from '../../config/api';

export default function ApiSetupBanner({ onDismiss }) {
  const [dismissed, setDismissed] = useState(false);

  if (isApiConfigured() || dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-neutral/30 bg-gradient-to-r from-neutral/10 via-neutral/5 to-transparent p-5 mb-4 animate-fade-in">
      {/* Glow accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-neutral rounded-l-xl" />

      <div className="flex items-start gap-4 pl-3">
        <div className="w-10 h-10 rounded-lg bg-neutral/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xl">🔑</span>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-bold text-neutral mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            Mode Démo — Données simulées
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed mb-3">
            Les prix affichés sont <strong className="text-neutral">fictifs</strong>. Pour obtenir les vraies données XAU/USD en temps réel,
            configurez votre clé API TwelveData :
          </p>

          <div className="bg-bg-deep/80 rounded-lg p-3 border border-border mb-3">
            <p className="text-[11px] text-text-muted mb-2">1. Créer un compte gratuit sur <a href="https://twelvedata.com" target="_blank" rel="noreferrer" className="text-gold-400 underline hover:text-gold-300">twelvedata.com</a></p>
            <p className="text-[11px] text-text-muted mb-2">2. Copier votre API Key depuis le dashboard</p>
            <p className="text-[11px] text-text-muted mb-1">3. Créer le fichier <code className="text-gold-400 bg-gold-400/10 px-1 rounded">.env</code> à la racine du projet :</p>
            <pre className="text-[11px] font-mono text-bull bg-bull/5 rounded px-2 py-1.5 mt-1 border border-bull/10">
              VITE_TWELVEDATA_API_KEY=votre_clé_ici
            </pre>
            <p className="text-[10px] text-text-muted mt-2">4. Redémarrer le serveur de développement</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://twelvedata.com/pricing"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] px-3 py-1.5 rounded-lg bg-gold-400/15 text-gold-400 border border-gold-400/30 hover:bg-gold-400/25 transition-colors"
            >
              Obtenir une clé gratuite →
            </a>
            <button
              onClick={() => { setDismissed(true); onDismiss?.(); }}
              className="text-[11px] text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            >
              Continuer en mode démo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
