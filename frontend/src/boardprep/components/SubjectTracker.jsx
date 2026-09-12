import { Fragment } from "react";
import { SUBJECTS } from "../data.js";

export function SubjectTracker({ checked, onToggle }) {
  return (
    <section id="tracker" aria-labelledby="tracker-head">
      <div className="section-head">
        <h2 id="tracker-head">Revision Tracker</h2>
        <span className="hint">Check off chapters as you finish them &mdash; saved automatically in this browser</span>
      </div>
      <div className="subject-grid">
      {SUBJECTS.map((s) => {
        const boxIds = s.chapters.map((c, i) => `${s.key}-${i}`);
        const checkedCount = boxIds.filter((id) => checked[id]).length;
        let lastGroup = null;
        return (
          <div className="subject-card" key={s.key} style={{ "--c": s.color, "--soft": s.soft }}>
            <div className="card-top">
              <div>
                <h3>{s.name}</h3>
                <span className="subject-source">{s.source}</span>
              </div>
              <span className="subject-tag">{s.tag}</span>
            </div>
            <div className="progress-row">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: (checkedCount / s.chapters.length * 100) + "%" }} />
              </div>
              <div className="progress-count">{checkedCount} / {s.chapters.length}</div>
            </div>
            <ul className="chapter-list">
              {s.chapters.map((c, i) => {
                const boxId = `${s.key}-${i}`;
                const showGroup = c.group && c.group !== lastGroup;
                lastGroup = c.group || lastGroup;
                return (
                  <Fragment key={boxId}>
                    {showGroup && <div className="chapter-group-label">{c.group}</div>}
                    <li>
                      <input
                        type="checkbox"
                        id={boxId}
                        data-subj={s.key}
                        checked={!!checked[boxId]}
                        onChange={() => onToggle(boxId, s.key)}
                      />
                      <label htmlFor={boxId}>{c.name}</label>
                    </li>
                  </Fragment>
                );
              })}
            </ul>
          </div>
        );
      })}
      </div>
    </section>
  );
}
