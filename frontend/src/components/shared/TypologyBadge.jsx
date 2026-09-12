export function TypologyBadge({ typology, compact }) {
  if (!typology) return null;
  const t = typology.target || { competency_pct: 50, mcq_pct: 20, descriptive_pct: 30 };
  const rows = [
    { label: "Competency-based", pct: typology.competency_pct, marks: typology.competency_marks, target: t.competency_pct },
    { label: "MCQ", pct: typology.mcq_pct, marks: typology.mcq_marks, target: t.mcq_pct },
    { label: "Descriptive", pct: typology.descriptive_pct, marks: typology.descriptive_marks, target: t.descriptive_pct },
  ];
  if (compact) {
    return (
      <div className="tag-list" style={{ marginTop: 4 }}>
        {rows.map((r) => (
          <span key={r.label} className="keyword-chip" style={{ background: Math.abs(r.pct - r.target) <= 3 ? "#eaf6ea" : "#fdf1e0", color: Math.abs(r.pct - r.target) <= 3 ? "#2f7a3d" : "#a15b0a" }}>
            {r.label}: {r.pct}%
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="notes-section" style={{ marginBottom: 10 }}>
      <h3 style={{ fontSize: 14 }}>Typology check (CBSE mandate: 50% competency-based / 20% MCQ / 30% descriptive)</h3>
      <div className="tag-list">
        {rows.map((r) => {
          const onTarget = Math.abs(r.pct - r.target) <= 3;
          return (
            <span key={r.label} className="keyword-chip" style={{ fontSize: 12.5, background: onTarget ? "#eaf6ea" : "#fdf1e0", color: onTarget ? "#2f7a3d" : "#a15b0a" }}>
              {r.label}: {r.marks} marks ({r.pct}%, target {r.target}%)
            </span>
          );
        })}
      </div>
    </div>
  );
}
