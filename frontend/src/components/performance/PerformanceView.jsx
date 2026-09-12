import { useState, useEffect, Fragment } from "react";
import { apiGet } from "../../api/client.js";
import { PerfBar } from "../results/PerfBar.jsx";

export function PerformanceView({ defaultStudent, onViewSubmission }) {
  const [studentName, setStudentName] = useState(defaultStudent || localStorage.getItem("cbse_student_name") || "");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openingId, setOpeningId] = useState(null);

  const openSubmission = (subId, paperId) => {
    setOpeningId(subId);
    Promise.all([
      apiGet("/api/submissions/" + subId),
      apiGet("/api/papers/" + paperId).catch(() => null), // best-effort, only used for section headers
    ])
      .then(([sub, paper]) => {
        onViewSubmission({
          submission_id: sub.id,
          student_name: sub.student_name,
          total_score: sub.total_score,
          total_marks: sub.total_marks,
          percentage: sub.total_marks ? Math.round((sub.total_score / sub.total_marks) * 1000) / 10 : 0,
          results: sub.results,
          sections: paper ? paper.sections : [],
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setOpeningId(null));
  };

  const load = () => {
    if (!studentName.trim()) {
      setError("Enter a student name to view performance.");
      return;
    }
    setLoading(true);
    setError("");
    apiGet("/api/performance?student=" + encodeURIComponent(studentName.trim()))
      .then((d) => setReport(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (defaultStudent) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultStudent]);

  return (
    <div>
      <div className="card">
        <h2>Performance Analysis</h2>
        <div className="grid-2">
          <div>
            <label className="field-label">Student name</label>
            <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter your name" />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="btn" onClick={load} disabled={loading}>
              {loading ? "Loading..." : "View my performance"}
            </button>
          </div>
        </div>
        {error && <div className="error-box" style={{ marginTop: 12 }}>{error}</div>}
      </div>

      {report && report.attempts === 0 && (
        <div className="card"><p className="muted">{report.message}</p></div>
      )}

      {report && report.attempts > 0 && (
        <Fragment>
          <div className="card">
            <h2>Overall</h2>
            <div style={{ fontSize: 26, fontWeight: 700, color: "var(--navy)" }}>{report.overall_percentage}%</div>
            <p className="muted">
              Based on {report.attempts} attempt{report.attempts > 1 ? "s" : ""} &middot;{" "}
              {report.total_awarded} / {report.total_available} marks scored across all papers.
            </p>

            <h3 style={{ marginTop: 16 }}>By question type</h3>
            {Object.entries(report.question_type_performance).map(([type, pct]) => (
              <PerfBar key={type} label={type} pct={pct} />
            ))}
          </div>

          <div className="card">
            <h3>By chapter</h3>
            {Object.entries(report.chapter_performance).map(([ch, pct]) => (
              <PerfBar key={ch} label={ch} pct={pct} />
            ))}
          </div>

          <div className="card">
            <h3>By topic</h3>
            {Object.entries(report.topic_performance).map(([topic, pct]) => (
              <PerfBar key={topic} label={topic} pct={pct} />
            ))}
          </div>

          <div className="card">
            <h3>Strengths &amp; areas to improve</h3>
            <div className="tag-list">
              {report.strengths.map((s) => <span key={s} className="tag good">{s}</span>)}
              {report.needs_practice.map((s) => <span key={s} className="tag mid">{s}</span>)}
              {report.weaknesses.map((s) => <span key={s} className="tag bad">{s}</span>)}
            </div>
            <h3 style={{ marginTop: 16 }}>Recommendations</h3>
            <ul>
              {report.recommendations.map((r, i) => <li key={i} style={{ marginBottom: 6, fontSize: 14 }}>{r}</li>)}
            </ul>
          </div>

          <div className="card">
            <h3>Attempt history</h3>
            <p className="muted" style={{ marginTop: -6, marginBottom: 10 }}>Click any past attempt to re-open its full question paper, your answers, and the per-question feedback.</p>
            {report.history.map((h) => (
              <div
                key={h.submission_id}
                className="stat-row"
                style={{ cursor: "pointer", opacity: openingId === h.submission_id ? 0.6 : 1 }}
                onClick={() => openSubmission(h.submission_id, h.paper_id)}
                title="View this paper again"
              >
                <div className="label">{new Date(h.submitted_at + "Z").toLocaleString()}</div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: h.percentage + "%", background: "var(--blue)" }} />
                </div>
                <div className="pct">{h.score}/{h.total}</div>
              </div>
            ))}
          </div>
        </Fragment>
      )}
    </div>
  );
}
