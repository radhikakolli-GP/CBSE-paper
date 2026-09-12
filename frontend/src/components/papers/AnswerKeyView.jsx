import { useState, useEffect, Fragment } from "react";
import { apiGet } from "../../api/client.js";
import { annotateGrouping, GROUPED_PASSAGE_TYPES } from "../../utils/grouping.js";
import { pillClass, pillLabel, isChoiceType } from "../../utils/paperFormat.js";
import { PassageBox } from "../attempt/PassageBox.jsx";

// Shows the correct answer / model answer / rubric for every question on a
// paper, un-stripped - meant for a parent or teacher marking a physical
// handwritten answer sheet by hand, as an alternative to the OCR auto-fill
// path (which needs Tesseract installed and still struggles with real
// handwriting). Fetches fresh from /api/papers/{id}/answer-key rather than
// reusing whatever `paper` object the caller already has in state, since
// that object is very often the stripped, student-facing version returned by
// /generate or /submit (no answer_index/rubric/model_answer on it at all).
export function AnswerKeyView({ paperId, onBack }) {
  const [paper, setPaper] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPaper(null);
    setError("");
    apiGet(`/api/papers/${paperId}/answer-key`)
      .then(setPaper)
      .catch((e) => setError(e.message));
  }, [paperId]);

  if (error) {
    return (
      <div className="card">
        <div className="error-box">{error}</div>
        <button className="btn secondary" style={{ marginTop: 10 }} onClick={onBack}>Back</button>
      </div>
    );
  }
  if (!paper) {
    return <div className="card">Loading answer key...</div>;
  }

  const grouped = annotateGrouping(paper.questions, !!(paper.sections && paper.sections.length > 0));

  return (
    <div>
      <div className="card no-print">
        <div className="result-row" style={{ marginBottom: 10 }}>
          <h2 style={{ margin: 0 }}>Answer key - {paper.set_label ? paper.set_label + " - " : ""}{paper.total_marks} marks</h2>
          <div>
            <button className="btn secondary" onClick={onBack}>Back</button>{" "}
            <button className="btn" onClick={() => window.print()}>Print</button>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 0 }}>
          Correct options, model answers and mark-scheme points for every question - use this to mark
          a handwritten answer sheet by hand instead of relying on the OCR upload.
        </p>
      </div>

      <div className="card">
        {grouped.map((q, idx) => (
          <Fragment key={q.id}>
            {q._startsSection && <div className="section-header">{q._sectionLabel}</div>}
            {(GROUPED_PASSAGE_TYPES.includes(q.group_type || q.type)) && q._startsGroup && <PassageBox text={q.passage} />}
            <div className="question-block" style={{ borderTop: q._startsSection ? "none" : undefined }}>
              <div className="question-head">
                <span className={pillClass(q.group_type || q.type)}>{pillLabel(q)}</span>
                <span className="marks">
                  Q{idx + 1}{q.part_label ? " (" + q.part_label + ")" : ""} &middot; {q.chapter_title} &middot; {q.marks} mark{q.marks === 1 ? "" : "s"}
                </span>
              </div>
              <div className="question-text">{q.question}</div>

              {isChoiceType(q.type) ? (
                <div className="options">
                  {(q.options || []).map((opt, oi) => (
                    <div key={oi} style={oi === q.answer_index ? { fontWeight: 700, color: "var(--navy)" } : undefined}>
                      {oi === q.answer_index ? "✓ " : "   "} {opt}
                    </div>
                  ))}
                  {q.explanation && (
                    <div className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>{q.explanation}</div>
                  )}
                </div>
              ) : (
                <div>
                  {q.model_answer && (
                    <div style={{ marginTop: 4 }}>
                      <b style={{ fontSize: 12.5 }}>Model answer:</b>
                      <div style={{ marginTop: 2 }}>{q.model_answer}</div>
                    </div>
                  )}
                  {q.rubric && q.rubric.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <b style={{ fontSize: 12.5 }}>Key points expected ({q.marks} mark{q.marks === 1 ? "" : "s"} total):</b>
                      <ul style={{ marginTop: 4, marginBottom: 0 }}>
                        {q.rubric.map((p, pi) => (
                          <li key={pi} style={{ fontSize: 13.5 }}>{p.point}{p.weight ? ` (${p.weight} mark${p.weight === 1 ? "" : "s"})` : ""}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!q.model_answer && (!q.rubric || q.rubric.length === 0) && (
                    <div className="muted" style={{ fontSize: 12.5 }}>No model answer recorded for this question type - use your own judgement.</div>
                  )}
                </div>
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
