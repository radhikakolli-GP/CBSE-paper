export function Sparkline({ scores, color }) {
  if (scores.length < 2) return null;
  const w = 140, h = 32, pad = 3;
  const max = 100, min = 0;
  const stepX = (w - pad * 2) / (scores.length - 1);
  const pts = scores.map((s, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((s - min) / (max - min)) * (h - pad * 2);
    return [x, y];
  });
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = `${pad},${h - pad} ` + line + ` ${w - pad},${h - pad}`;
  const last = pts[pts.length - 1];
  return (
    <svg className="sparkline" width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Score trend">
      <polyline points={area} fill={color} opacity="0.12" stroke="none" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="2.6" fill={color} />
    </svg>
  );
}
