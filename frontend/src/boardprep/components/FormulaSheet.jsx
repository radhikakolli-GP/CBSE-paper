import { useState } from "react";
import { FORMULA_SHEETS } from "../formulas.js";

const TABS = [
  { key: "maths", label: "Mathematics" },
  { key: "science", label: "Physics & Chemistry" }
];

export function FormulaSheet() {
  const [tab, setTab] = useState("maths");
  const sheet = FORMULA_SHEETS[tab];

  const handlePrint = () => {
    document.body.classList.add("print-formula-sheet");
    window.print();
    window.setTimeout(() => document.body.classList.remove("print-formula-sheet"), 500);
  };

  return (
    <section id="formulas" aria-labelledby="formulas-head">
      <div className="section-head">
        <h2 id="formulas-head">Formula Sheets</h2>
        <span className="hint">Consolidated, chapter-by-chapter &mdash; for a final glance the night before the paper</span>
      </div>

      <div className="formula-toolbar">
        <div className="filter-tabs">
          {TABS.map((t) => (
            <button key={t.key} aria-pressed={tab === t.key} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <button type="button" className="btn-print" onClick={handlePrint}>Print / Save as PDF</button>
      </div>

      <div className="formula-sheet-print-target">
        <h3 className="formula-print-title">{sheet.label} &mdash; Formula Sheet</h3>
        <div className="formula-grid">
          {sheet.chapters.map((ch) => (
            <div
              className="formula-card"
              key={ch.id}
              style={ch.subject ? { "--c": `var(--${ch.subject})`, "--soft": `var(--${ch.subject}-soft)` } : undefined}
            >
              <h4>{ch.title}</h4>
              <div className="formula-list">
                {ch.items.map((item, i) =>
                  item.type === "table" ? (
                    <div className="formula-table-wrap" key={i}>
                      {item.caption && <div className="formula-table-caption">{item.caption}</div>}
                      <table className="formula-table">
                        <thead>
                          <tr>{item.headers.map((h, hi) => <th key={hi}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {item.rows.map((row, ri) => (
                            <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : item.group ? (
                    <div className="formula-group-label" key={i}>{item.group}</div>
                  ) : (
                    <div className="formula-row" key={i}>
                      <div className="formula-expr">{item.f}</div>
                      {item.d && <div className="formula-desc">{item.d}</div>}
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
