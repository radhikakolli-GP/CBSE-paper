import { Link } from "react-router-dom";
import { MATHS_CONCEPTS } from "./concepts.js";
import "./mathsconcepts.css";

export function MathsConceptsPage() {
  return (
    <div className="mc-page">
      <header className="mc-header no-print">
        <div>
          <div className="mc-eyebrow">CBSE &middot; Class X &middot; Mathematics</div>
          <h1>Main Concepts and Results</h1>
          <p>Every chapter's concept summary, reproduced from the NCERT Exemplar Problems book &mdash; for a printout to keep beside you while revising.</p>
        </div>
        <div className="mc-actions">
          <Link to="/board-prep" className="mc-link">Board Prep</Link>
          <button type="button" className="mc-print-btn" onClick={() => window.print()}>Print / Save as PDF</button>
        </div>
      </header>

      <div className="mc-print-title">Class X Mathematics &mdash; Main Concepts and Results</div>

      <main className="mc-chapters">
        {MATHS_CONCEPTS.map((ch) => (
          <section className="mc-chapter" key={ch.id}>
            <h2>{ch.title}</h2>
            {ch.groups.map((group, gi) => (
              <div className="mc-group" key={gi}>
                {group.heading && <h3>{group.heading}</h3>}
                <ul className="mc-points">
                  {group.points.map((point, pi) =>
                    point.type === "table" ? (
                      <li className="mc-table-item" key={pi}>
                        {point.caption && <div className="mc-table-caption">{point.caption}</div>}
                        <table className="mc-table">
                          <thead>
                            <tr>{point.headers.map((h, hi) => <th key={hi}>{h}</th>)}</tr>
                          </thead>
                          <tbody>
                            {point.rows.map((row, ri) => (
                              <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                            ))}
                          </tbody>
                        </table>
                      </li>
                    ) : typeof point === "string" ? (
                      <li key={pi}>{point}</li>
                    ) : (
                      <li key={pi}>
                        {point.text}
                        <ul className="mc-subpoints">
                          {point.sub.map((s, si) => <li key={si}>{s}</li>)}
                        </ul>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </main>

      <footer className="mc-footer no-print">Personal study reference &middot; not affiliated with CBSE or NCERT &middot; text reproduced from the NCERT Class X Mathematics Exemplar Problems book (ncert.nic.in).</footer>
    </div>
  );
}
