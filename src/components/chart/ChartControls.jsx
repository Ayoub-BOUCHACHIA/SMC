import { TF_ORDER } from '../../config/constants';
import useMarketStore from '../../store/useMarketStore';

export default function ChartControls() {
  const { chartTF, setSelectedTF } = useMarketStore();

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {TF_ORDER.map(tf => (
        <button
          key={tf}
          id={`tf-btn-${tf}`}
          onClick={() => setSelectedTF(tf)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer
            ${chartTF === tf
              ? 'bg-gold-400/20 text-gold-400 border border-gold-400/50 shadow-[0_0_12px_rgba(212,168,67,0.15)]'
              : 'bg-bg-tertiary text-text-secondary border border-border hover:bg-bg-hover hover:text-text-primary'
            }`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
