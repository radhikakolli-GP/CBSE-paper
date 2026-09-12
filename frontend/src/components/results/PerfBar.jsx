export function PerfBar({ label, pct }) {
  const color = pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--orange)" : "var(--red)";
  return (
    <div className="stat-row">
      <div className="label">{label}</div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: pct + "%", background: color }} />
      </div>
      <div className="pct">{pct}%</div>
    </div>
  );
}
