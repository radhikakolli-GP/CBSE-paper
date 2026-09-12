import { useState } from "react";
import { SUBJECTS, subjectByKey, scoreTier } from "../data.js";
import { Sparkline } from "./Sparkline.jsx";

export function MockTestLog({ mockLog, onAdd, onRemove }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [subj, setSubj] = useState(SUBJECTS[0].key);
  const [paper, setPaper] = useState("");
  const [score, setScore] = useState("");
  const [max, setMax] = useState("80");

  const submit = (ev) => {
    ev.preventDefault();
    const scoreNum = Number(score);
    const maxNum = Number(max);
    if (!date || !paper.trim() || isNaN(scoreNum) || isNaN(maxNum) || maxNum <= 0) return;
    onAdd({ id: Date.now(), date, subj, paper: paper.trim(), score: scoreNum, max: maxNum });
    setPaper("");
    setScore("");
  };

  const rows = mockLog.slice().sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section id="mocklog" aria-labelledby="mocklog-head">
      <div className="section-head">
        <h2 id="mocklog-head">Mock Test Log</h2>
        <span className="hint">Saved automatically in this browser &mdash; jot down your score after every paper</span>
      </div>

      <div className="mocklog-stats">
        {SUBJECTS.map((s) => {
          const entries = mockLog.filter((e) => e.subj === s.key).slice().sort((a, b) => a.date.localeCompare(b.date));
          if (entries.length === 0) {
            return (
              <div className="mock-stat-card" key={s.key} style={{ "--c": s.color, "--soft": s.soft }}>
                <div className="mock-stat-top"><h4>{s.name}</h4></div>
                <div className="mock-stat-sub">No tests logged yet</div>
              </div>
            );
          }
          const pcts = entries.map((e) => Math.round((e.score / e.max) * 100));
          const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
          let trendClass = "flat", trendGlyph = "→";
          if (pcts.length >= 2) {
            const diff = pcts[pcts.length - 1] - pcts[pcts.length - 2];
            if (diff > 0) { trendClass = "up"; trendGlyph = "↑"; }
            else if (diff < 0) { trendClass = "down"; trendGlyph = "↓"; }
          }
          const color = typeof window !== "undefined"
            ? getComputedStyle(document.documentElement).getPropertyValue(`--${s.key}`).trim()
            : "";
          return (
            <div className="mock-stat-card" key={s.key} style={{ "--c": s.color, "--soft": s.soft }}>
              <div className="mock-stat-top">
                <h4>{s.name}</h4>
                <span className="mock-stat-avg">{avg}%</span>
              </div>
              <div className="mock-stat-sub">{entries.length} test{entries.length === 1 ? "" : "s"} logged &middot; <span className={"trend " + trendClass}>{trendGlyph}</span></div>
              <Sparkline scores={pcts} color={color} />
            </div>
          );
        })}
      </div>

      <form className="mocklog-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="mockDate">Date</label>
          <input type="date" id="mockDate" required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="mockSubject">Subject</label>
          <select id="mockSubject" value={subj} onChange={(e) => setSubj(e.target.value)}>
            {SUBJECTS.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
          </select>
        </div>
        <div className="field grow">
          <label htmlFor="mockPaper">Paper</label>
          <input
            type="text" id="mockPaper" placeholder="e.g. 2025 Main, Set 31-1-1" required
            value={paper} onChange={(e) => setPaper(e.target.value)}
          />
        </div>
        <div className="field narrow">
          <label htmlFor="mockScore">Score</label>
          <input type="number" id="mockScore" min="0" max="100" required value={score} onChange={(e) => setScore(e.target.value)} />
        </div>
        <div className="field narrow">
          <label htmlFor="mockMax">Out of</label>
          <input type="number" id="mockMax" min="1" max="100" required value={max} onChange={(e) => setMax(e.target.value)} />
        </div>
        <button type="submit" className="btn-add">Add entry</button>
      </form>

      <div className="mocklog-table-wrap">
        <table className="data">
          <thead><tr><th>Date</th><th>Subject</th><th>Paper</th><th>Score</th><th></th></tr></thead>
          <tbody>
            {rows.map((e) => {
              const s = subjectByKey[e.subj];
              const pct = Math.round((e.score / e.max) * 100);
              return (
                <tr key={e.id}>
                  <td className="file-name">{e.date}</td>
                  <td><span className="subj-chip" style={{ "--c": s.color, "--soft": s.soft }}>{s.name}</span></td>
                  <td>{e.paper}</td>
                  <td><span className={"score-pill " + scoreTier(pct)}>{e.score}/{e.max} &middot; {pct}%</span></td>
                  <td><button className="row-remove" aria-label="Remove entry" onClick={() => onRemove(e.id)}>&times;</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
