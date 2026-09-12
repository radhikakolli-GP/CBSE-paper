import { Fragment } from "react";
import { annotateGrouping, GROUPED_PASSAGE_TYPES } from "../../utils/grouping.js";
import { pillClass } from "../../utils/paperFormat.js";
import { PassageBox } from "../attempt/PassageBox.jsx";

function scoreBadgeClass(awarded, available) {
  if (available === 0) return "zero";
  const ratio = awarded / available;
  if (ratio >= 0.85) return "full";
  if (ratio > 0) return "partial";
  return "zero";
}

export function ResultsView({ result, onDone, onViewPerformance }) {
  const grouped = annotateGrouping(result.results, !!(result.sections && result.sections.length > 0));
  return (
    <div>
      <div className="card">
        <h2>Result for {result.student_name}</h2>
        <div className="result-row">
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>
            {result.total_score} / {result.total_marks}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--orange)" }}>{result.percentage}%</div>
        </div>
        <div style={{ marginTop: 10 }}>
          <button className="btn secondary" onClick={onDone}>Attempt another paper</button>{" "}
          <button className="btn" onClick={onViewPerformance}>View performance analysis</button>
        </div>
      </div>

      <div className="card">
        <h2>Question-wise breakdown</h2>
        {grouped.map((r, idx) => (
          <Fragment key={r.question_id}>
            {r._startsSection && <div className="section-header">{r._sectionLabel}</div>}
            {(GROUPED_PASSAGE_TYPES.includes(r.group_type || r.type)) && r._startsGroup && <PassageBox text={r.passage} />}
            <div className="question-block">
              <div className="question-head">
                <span className={pillClass(r.group_type || r.type)}>{r.group_type || r.type}</span>
                <span className="marks">
                  Q{idx + 1}{r.part_label ? " (" + r.part_label + ")" : ""} &middot; {r.topic}
                </span>
              </div>
              <div className="question-text">{r.question}</div>
              <div className="result-row" style={{ marginTop: 6 }}>
                <span className={"score-badge " + scoreBadgeClass(r.marks_awarded, r.marks_available)}>
                  {r.marks_awarded} / {r.marks_available} marks
                </span>
              </div>
              <div className={"student-answer-box" + (!r.student_answer ? " empty" : "")}>
                <b>Your answer:</b>{" "}
                {r.student_answer ? r.student_answer : <em>Not answered</em>}
              </div>
              <div className="feedback-box">{r.feedback}</div>
              {r.matched_points && r.matched_points.length > 0 && (
                <div className="feedback-box">
                  <b>What you covered well:</b>
                  <ul>{r.matched_points.map((p, i) => <li key={i}>{p}</li>)}</ul>
                </div>
              )}
              {r.missed_points && r.missed_points.length > 0 && (
                <div className="feedback-box missed">
                  <b>What to add / review:</b>
                  <ul>{r.missed_points.map((p, i) => <li key={i}>{p}</li>)}</ul>
                </div>
              )}
              {r.model_answer && (
                <div className="feedback-box">
                  <b>Model answer:</b> {r.model_answer}
                </div>
              )}
              {r.ocr_note && (
                <div className="warn-box" style={{ marginTop: 8 }}>
                  <b>Upload not read:</b> {r.ocr_note}
                </div>
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
