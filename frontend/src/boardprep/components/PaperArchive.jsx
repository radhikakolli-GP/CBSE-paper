import { useState } from "react";
import { SUBJECTS, ARCHIVE, PAPERS, subjectByKey } from "../data.js";

export function PaperArchive() {
  const [filter, setFilter] = useState("all");

  const archRows = (filter === "all" ? ARCHIVE : ARCHIVE.filter((a) => a.subj === filter))
    .slice()
    .sort((a, b) => a.subj.localeCompare(b.subj) || b.year - a.year || a.session.localeCompare(b.session));
  const paperRows = filter === "all" ? PAPERS : PAPERS.filter((p) => p.subj === filter);
  const totalPapers = archRows.reduce((sum, a) => sum + a.count, 0);

  const options = [{ key: "all", name: "All" }, ...SUBJECTS.map((s) => ({ key: s.key, name: s.name }))];

  return (
    <section id="archive" aria-labelledby="archive-head">
      <div className="section-head">
        <h2 id="archive-head">Previous Year Paper Archive</h2>
        <span className="hint">{totalPapers} official paper sets &middot; {paperRows.length} reference document{paperRows.length === 1 ? "" : "s"}</span>
      </div>
      <div className="filter-tabs">
        {options.map((o) => (
          <button
            key={o.key}
            aria-pressed={filter === o.key}
            onClick={() => setFilter(o.key)}
          >
            {o.name}
          </button>
        ))}
      </div>

      <h3 className="subhead">Official board papers by year</h3>
      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>Subject</th><th>Year</th><th>Session</th><th>Paper sets</th></tr></thead>
          <tbody>
            {archRows.map((a, i) => {
              const s = subjectByKey[a.subj];
              return (
                <tr key={i}>
                  <td><span className="subj-chip" style={{ "--c": s.color, "--soft": s.soft }}>{s.name}</span></td>
                  <td className="file-name">{a.year}</td>
                  <td><span className="session-chip">{a.session}</span></td>
                  <td className="num">{a.count}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3 className="subhead">Practice sets &amp; question banks</h3>
      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>Subject</th><th>File</th><th>Type</th></tr></thead>
          <tbody>
            {paperRows.map((p, i) => {
              const s = subjectByKey[p.subj];
              return (
                <tr key={i}>
                  <td><span className="subj-chip" style={{ "--c": s.color, "--soft": s.soft }}>{s.name}</span></td>
                  <td className="file-name">{p.file}</td>
                  <td className="type-chip">{p.type}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
