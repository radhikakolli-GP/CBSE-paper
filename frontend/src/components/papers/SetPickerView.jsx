import { TypologyBadge } from "../shared/TypologyBadge.jsx";

export function SetPickerView({ sets, onAttempt, onBack, onViewAnswerKey }) {
  return (
    <div className="card">
      <div className="result-row" style={{ marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>{sets.length > 1 ? "Choose a set to attempt" : "Your practice paper"}</h2>
        <button className="btn secondary" onClick={onBack}>Change chapters</button>
      </div>
      <p className="muted">
        {sets.length > 1
          ? `${sets.length} distinct practice sets were generated. Attempt one now - the others stay available if you want more practice later.`
          : "Your practice paper is ready - it stays here if you need to step away and come back to it."}
      </p>
      <div className="set-picker-grid">
        {sets.map((p) => (
          <div className="set-card" key={p.id}>
            <h3>{p.set_label}</h3>
            <div className="set-meta">{p.total_marks} marks &middot; {p.questions.length} questions</div>
            <TypologyBadge typology={p.typology} compact />
            {p.sections && p.sections.length > 0 && (
              <div className="set-sections">
                {p.sections.map((s) => <span key={s}>{s}</span>)}
              </div>
            )}
            {p.warnings && p.warnings.length > 0 && (
              <div className="warn-box" style={{ fontSize: 11.5, padding: "6px 8px" }}>
                {p.warnings.length} note{p.warnings.length > 1 ? "s" : ""} - question bank had limited variety for this set.
              </div>
            )}
            <button className="btn" onClick={() => onAttempt(p)}>Attempt this set</button>{" "}
            <button className="btn secondary" onClick={() => onViewAnswerKey(p)}>View answer key</button>
          </div>
        ))}
      </div>
    </div>
  );
}
