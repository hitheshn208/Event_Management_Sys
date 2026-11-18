export default function ProgressBar({ percent, label }) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  const tone = value >= 100 ? "full" : value >= 75 ? "high" : "normal";
  return (
    <div className={`progress progress-${tone}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="progress-fill" style={{ width: `${value}%` }} />
    </div>
  );
}
