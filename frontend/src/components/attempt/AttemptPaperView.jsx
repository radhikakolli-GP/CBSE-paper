import { useState, useEffect, Fragment } from "react";
import { apiGet, apiPost } from "../../api/client.js";
import { annotateGrouping, GROUPED_PASSAGE_TYPES } from "../../utils/grouping.js";
import { pillClass, pillLabel, wordLimitHint, isChoiceType } from "../../utils/paperFormat.js";
import { fileToBase64 } from "../../utils/fileToBase64.js";
import { TypologyBadge } from "../shared/TypologyBadge.jsx";
import { GeneralInstructions } from "./GeneralInstructions.jsx";
import { PassageBox } from "./PassageBox.jsx";

export function AttemptPaperView({ paper, onSubmitted, onBack, backLabel, onViewAnswerKey }) {
  const [studentName, setStudentName] = useState(localStorage.getItem("cbse_student_name") || "");
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [sheetFiles, setSheetFiles] = useState([]);
  const [parsingSheet, setParsingSheet] = useState(false);
  const [sheetError, setSheetError] = useState("");
  const [sheetInfo, setSheetInfo] = useState(null);
  const [ocrStatus, setOcrStatus] = useState(null); // null = still checking; {available, reason} once known

  useEffect(() => {
    apiGet("/api/ocr-status")
      .then(setOcrStatus)
      .catch(() => setOcrStatus({ available: true, reason: null })); // fail open: don't block the feature if the status check itself errors
  }, []);

  const grouped = annotateGrouping(paper.questions, !!(paper.sections && paper.sections.length > 0));
  const writtenQuestionCount = paper.questions.filter((q) => !isChoiceType(q.type)).length;

  const setAnswer = (qid, patch) => {
    setAnswers((prev) => ({ ...prev, [qid]: { ...(prev[qid] || {}), ...patch } }));
  };

  const handleImage = async (qid, file) => {
    if (!file) return;
    const dataUrl = await fileToBase64(file);
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    setAnswer(qid, {
      image_base64: dataUrl,
      image_preview: isPdf ? null : dataUrl,
      upload_name: file.name,
      upload_is_pdf: isPdf,
    });
  };

  const parseSheet = async () => {
    if (sheetFiles.length === 0) {
      setSheetError("Choose one or more photos (or a scanned PDF) of your answer sheet first.");
      return;
    }
    setParsingSheet(true);
    setSheetError("");
    setSheetInfo(null);
    try {
      const pages = await Promise.all(
        sheetFiles.map(async (f) => ({ data: await fileToBase64(f), name: f.name }))
      );
      const result = await apiPost(`/api/papers/${paper.id}/parse-sheet`, { pages });
      if (result.fatal_error) {
        setSheetError(result.fatal_error);
        return;
      }
      setAnswers((prev) => {
        const next = { ...prev };
        Object.entries(result.segments).forEach(([qid, text]) => {
          next[qid] = { ...(next[qid] || {}), answer_text: text, from_sheet: true };
        });
        return next;
      });
      setSheetInfo({
        matchedCount: result.matched_ids.length,
        unmatchedIds: result.unmatched_ids,
        unrecognisedMarkers: result.unrecognised_markers,
        pageErrors: result.page_errors,
      });
    } catch (e) {
      setSheetError(e.message);
    } finally {
      setParsingSheet(false);
    }
  };

  const submit = () => {
    if (!studentName.trim()) {
      setError("Please enter your name before submitting.");
      return;
    }
    localStorage.setItem("cbse_student_name", studentName.trim());
    setSubmitting(true);
    setError("");
    const payload = {
      student_name: studentName.trim(),
      answers: paper.questions.map((q) => {
        const a = answers[q.id] || {};
        return {
          question_id: q.id,
          selected_option: a.selected_option ?? null,
          answer_text: a.answer_text || "",
          image_base64: a.image_base64 || null,
        };
      }),
    };
    apiPost(`/api/papers/${paper.id}/submit`, payload)
      .then((result) => onSubmitted({ ...result, sections: paper.sections }))
      .catch((e) => setError(e.message))
      .finally(() => setSubmitting(false));
  };

  return (
    <div>
      <GeneralInstructions pattern={paper.pattern} sections={paper.sections || []} />

      <div className="card">
        <div className="result-row" style={{ marginBottom: 10 }}>
          <h2 style={{ margin: 0 }}>{paper.set_label ? paper.set_label + " - " : ""}{paper.total_marks} marks</h2>
          <div>
            <button className="btn secondary" onClick={onBack}>{backLabel || "Back to sets"}</button>{" "}
            {onViewAnswerKey && <button className="btn secondary" onClick={() => onViewAnswerKey(paper.id)}>Answer key</button>}
          </div>
        </div>
        <TypologyBadge typology={paper.typology} />
        {paper.warnings && paper.warnings.length > 0 && (
          <div className="warn-box">
            {paper.warnings.map((w, i) => <div key={i}>{w}</div>)}
          </div>
        )}
        {error && <div className="error-box">{error}</div>}

        <label className="field-label">Your name</label>
        <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter your name" />

        {writtenQuestionCount > 0 && ocrStatus && !ocrStatus.available && (
          <div className="warn-box" style={{ background: "var(--bg)", marginTop: 14 }}>
            <b>Whole-sheet upload isn't set up on this server yet</b>
            <div className="muted" style={{ marginTop: 4, fontSize: 13 }}>
              Reading a photographed answer sheet needs an OCR engine (Tesseract) installed on
              the computer running this server - it isn't installed here yet
              ({ocrStatus.reason}), so uploads would fail after you've already gone to the
              trouble of taking photos. Ask whoever runs this server to run:
              <code style={{ display: "block", margin: "6px 0", padding: "6px 8px", background: "var(--card)", borderRadius: 4 }}>
                pip install pytesseract pillow{ocrStatus.reason && ocrStatus.reason.includes("Tesseract binary") ? "" : ""}
              </code>
              plus install the Tesseract binary itself (e.g. <code>brew install tesseract</code> on
              a Mac, <code>sudo apt install tesseract-ocr</code> on Linux, or the installer at{" "}
              <a href="https://github.com/UB-Mannheim/tesseract/wiki" target="_blank" rel="noreferrer">github.com/UB-Mannheim/tesseract/wiki</a> on
              Windows), then restart the server. Until then, please type your answers or upload
              one photo per question in the boxes below instead.
            </div>
          </div>
        )}

        {writtenQuestionCount > 0 && ocrStatus && ocrStatus.available && (
          <div className="warn-box" style={{ background: "var(--bg)", marginTop: 14 }}>
            <b>Prefer to write your answers on paper?</b>
            <div className="muted" style={{ marginTop: 4, marginBottom: 8, fontSize: 13 }}>
              Write your answers by hand as you would in the real exam - number each answer
              to match the question numbers below (e.g. "5." or "Q5") - then photograph or
              scan the pages and upload them here. We'll read your handwriting and fill in
              the matching answer boxes below automatically, so you only need to review and
              fix anything it got wrong before submitting. (MCQ / Assertion-Reason questions
              still need to be selected below, since those aren't written out by hand.)
            </div>
            <input
              type="file"
              accept="image/*,application/pdf,.pdf"
              multiple
              onChange={(e) => { setSheetFiles(Array.from(e.target.files || [])); setSheetInfo(null); setSheetError(""); }}
            />
            {sheetFiles.length > 0 && (
              <div className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>
                {sheetFiles.length} file{sheetFiles.length === 1 ? "" : "s"} selected: {sheetFiles.map((f) => f.name).join(", ")}
              </div>
            )}
            <button className="btn secondary" style={{ marginTop: 8 }} disabled={parsingSheet} onClick={parseSheet}>
              {parsingSheet ? "Reading your handwriting..." : "Read my answer sheet"}
            </button>
            {sheetError && <div className="error-box" style={{ marginTop: 8 }}>{sheetError}</div>}
            {sheetInfo && (
              <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>
                Filled in {sheetInfo.matchedCount} of {writtenQuestionCount} answer{writtenQuestionCount === 1 ? "" : "s"} from your sheet - please check them below.
                {sheetInfo.unmatchedIds.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    Couldn't find {sheetInfo.unmatchedIds.length} question{sheetInfo.unmatchedIds.length === 1 ? "" : "s"} on the sheet
                    (check that each answer is numbered clearly) - type or upload those manually below.
                  </div>
                )}
                {sheetInfo.pageErrors.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    Some pages couldn't be read: {sheetInfo.pageErrors.map((e, i) => <span key={i}>{e.source_name}{e.page_number > 1 ? ` (page ${e.page_number})` : ""}: {e.error} </span>)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          {grouped.map((q, idx) => (
            <Fragment key={q.id}>
              {q._startsSection && (
                <div className="section-header">{q._sectionLabel}</div>
              )}
              {(GROUPED_PASSAGE_TYPES.includes(q.group_type || q.type)) && q._startsGroup && <PassageBox text={q.passage} />}
              <div className="question-block" style={{ borderTop: q._startsSection ? "none" : undefined }}>
                <div className="question-head">
                  <span className={pillClass(q.group_type || q.type)}>{pillLabel(q)}</span>
                  <span className="marks">
                    Q{idx + 1}{q.part_label ? " (" + q.part_label + ")" : ""} &middot; {q.chapter_title}
                    {wordLimitHint(q.group_type || q.type) ? " · " + wordLimitHint(q.group_type || q.type) : ""}
                  </span>
                </div>
                <div className="question-text">{q.question}</div>
                {q.cues && q.cues.length > 0 && (
                  <div className="muted" style={{ fontSize: 12.5, marginTop: -4, marginBottom: 8 }}>
                    Use these cues, along with your own ideas: {q.cues.join(" · ")}
                  </div>
                )}

                {isChoiceType(q.type) ? (
                  <div className="options">
                    {q.options.map((opt, oi) => (
                      <label key={oi}>
                        <input
                          type="radio"
                          name={q.id}
                          checked={(answers[q.id] || {}).selected_option === oi}
                          onChange={() => setAnswer(q.id, { selected_option: oi })}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div>
                    {(answers[q.id] || {}).from_sheet && (
                      <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>
                        📄 Auto-filled from your uploaded answer sheet - check it's correct before submitting.
                      </div>
                    )}
                    <textarea
                      placeholder="Type your answer here..."
                      value={(answers[q.id] || {}).answer_text || ""}
                      onChange={(e) => setAnswer(q.id, { answer_text: e.target.value, from_sheet: false })}
                    />
                    <div className="image-upload-row">
                      <label className="muted" style={{ fontSize: 13 }}>
                        Or upload a photo/scan (or PDF) of your handwritten answer:
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf,.pdf"
                        onChange={(e) => handleImage(q.id, e.target.files[0])}
                      />
                      {(answers[q.id] || {}).image_preview && (
                        <img className="image-preview" src={(answers[q.id] || {}).image_preview} />
                      )}
                      {(answers[q.id] || {}).upload_is_pdf && (
                        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                          PDF selected: {(answers[q.id] || {}).upload_name}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Fragment>
          ))}
        </div>

        <button className="btn orange" style={{ marginTop: 16 }} disabled={submitting} onClick={submit}>
          {submitting ? "Grading..." : "Submit Answers for Grading"}
        </button>
      </div>
    </div>
  );
}
