import useMarketStore from '../../store/useMarketStore';

export default function ConfluenceScore() {
  const { confluence } = useMarketStore();
  const { score, total, percentage } = confluence;

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 75) return 'var(--color-bull)';
    if (percentage >= 50) return 'var(--color-neutral)';
    return 'var(--color-bear)';
  };

  return (
    <div className="glass-card p-4 flex flex-col items-center animate-fade-in">
      <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 self-start" style={{ fontFamily: 'var(--font-heading)' }}>
        Confluence
      </h2>

      <div className="confluence-ring">
        <svg width="120" height="120">
          {/* Background circle */}
          <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="6" />
          {/* Progress arc */}
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={getColor()}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${getColor()})` }}
          />
        </svg>
        <div className="score-text">
          <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: getColor() }}>{percentage}</span>
          <span className="text-[10px] text-text-muted">%</span>
          <span className="text-[10px] text-text-secondary mt-0.5">{score}/{total}</span>
        </div>
      </div>
    </div>
  );
}
