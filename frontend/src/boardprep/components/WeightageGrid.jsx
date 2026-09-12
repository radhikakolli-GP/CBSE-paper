import { SUBJECTS } from "../data.js";

export function WeightageGrid() {
  return (
    <section id="weightage" aria-labelledby="weightage-head">
      <div className="section-head">
        <h2 id="weightage-head">Marks Weightage</h2>
        <span className="hint">Indicative CBSE unit-wise split, 80 theory + 20 internal assessment</span>
      </div>
      <div className="weightage-grid">
        {SUBJECTS.map((s) => {
          const total = s.units.reduce((sum, u) => sum + u.marks, 0);
          return (
            <div className="weightage-card" key={s.key} style={{ "--c": s.color, "--soft": s.soft }}>
              <div className="card-top">
                <h3>{s.name}</h3>
                <span className="total">{total} + 20 IA</span>
              </div>
              {s.units.map((u) => (
                <div className="unit-row" key={u.name}>
                  <span className="unit-name">{u.name}</span>
                  <div className="unit-bar-track">
                    <div className="unit-bar-fill" style={{ width: (u.marks / total * 100).toFixed(0) + "%" }} />
                  </div>
                  <span className="unit-marks">{u.marks}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
