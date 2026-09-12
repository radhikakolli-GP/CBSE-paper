import { useState, useEffect } from "react";
import { apiGet, apiPost } from "../../api/client.js";

const CUSTOM_TYPE_INFO = [
  { key: "MCQ", label: "MCQ", marksEach: 1 },
  { key: "AR", label: "Assertion-Reason", marksEach: 1 },
  { key: "2M", label: "2-mark", marksEach: 2 },
  { key: "3M", label: "3-mark", marksEach: 3 },
  { key: "5M", label: "5-mark", marksEach: 5 },
];
const EMPTY_CUSTOM_COUNTS = { MCQ: 0, AR: 0, "2M": 0, "3M": 0, "5M": 0 };

export function GeneratePaperView({ onSetsReady, course }) {
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState([]);
  const [totalMarks, setTotalMarks] = useState(30);
  const [paperMode, setPaperMode] = useState("fixed"); // "fixed" | "custom" (english always uses its own fixed pattern)
  const [customCounts, setCustomCounts] = useState(EMPTY_CUSTOM_COUNTS);
  const [numSets, setNumSets] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet("/api/subjects").then((d) => setSubjects(d.subjects)).catch((e) => setError(e.message));
  }, []);

  const visibleSubjects = subjects.filter((s) => s.group === course);

  useEffect(() => {
    // Switching course invalidates any chapters selected from the other
    // course, so clear the selection to avoid mixing Science and Social
    // Science chapters into one paper.
    setSelected([]);
  }, [course]);

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const setCustomCount = (typeKey, value) => {
    const n = Math.max(0, Math.min(50, Number(value) || 0));
    setCustomCounts((prev) => ({ ...prev, [typeKey]: n }));
  };

  const customTotalMarks = CUSTOM_TYPE_INFO.reduce(
    (sum, t) => sum + (Number(customCounts[t.key]) || 0) * t.marksEach, 0
  );
  const customTotalQuestions = CUSTOM_TYPE_INFO.reduce((sum, t) => sum + (Number(customCounts[t.key]) || 0), 0);

  const isCustom = course !== "english" && paperMode === "custom";

  const generate = () => {
    if (selected.length === 0 && course !== "english") {
      setError("Select at least one chapter.");
      return;
    }
    if (isCustom && customTotalQuestions === 0) {
      setError("Enter a count greater than 0 for at least one question type.");
      return;
    }
    setLoading(true);
    setError("");
    const payload =
      course === "english"
        ? { chapters: selected, pattern: "english", num_sets: Number(numSets) || 1 }
        : isCustom
        ? { chapters: selected, pattern: "custom", custom_counts: customCounts, num_sets: Number(numSets) || 1 }
        : { chapters: selected, pattern: "board", total_marks: totalMarks, num_sets: Number(numSets) || 1 };
    apiPost("/api/papers/generate", payload)
      .then((d) => onSetsReady(d.papers))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="card">
      <h2>Generate a practice question paper</h2>
      <p className="muted">
        {course === "english"
          ? "English papers always follow the real CBSE (Communicative) board pattern: Reading Skills (22), Writing Skills (22), Grammar (10), Literature (26) - 80 marks total, 3-hour paper."
          : "Papers are made up of MCQs (1 mark each), Assertion-Reason (1 mark each), 2-mark, 3-mark and 5-mark questions."}
        {course === "social_science" && !isCustom
          ? " The 80-mark paper also includes one map-based question, since several chapters involve map work."
          : ""}
      </p>
      {visibleSubjects.length === 0 && (
        <div className="warn-box">No chapters are available yet for this course.</div>
      )}
      {error && <div className="error-box">{error}</div>}

      <div className="grid-2">
        <div>
          <label className="field-label">{course === "english" ? "Literature chapters" : "Chapters"}</label>
          {course === "english" && (
            <p className="muted" style={{ marginTop: -4, marginBottom: 8, fontSize: 12.5 }}>
              Pick which Fiction/Poetry/Drama chapters Section D draws from. Reading, Writing and
              Grammar sections are included automatically in every English paper.
            </p>
          )}
          <div className="chapter-checklist">
            {visibleSubjects.map((s) => (
              <div className="subject-group" key={s.subject}>
                <div className="subject-title">{s.label}</div>
                {course === "english" && s.chapters.some((c) => c.id === "grammar_writing") && (
                  <label style={{ opacity: 0.7, cursor: "default" }} title="Reading, Writing and Grammar sections are always included in every English paper - no selection needed.">
                    <input type="checkbox" checked disabled />
                    Grammar &amp; Writing Skills <span className="muted">(always included)</span>
                  </label>
                )}
                {s.chapters.filter((c) => c.id !== "grammar_writing").map((c) => (
                  <label key={c.id}>
                    <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} />
                    {c.title}
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div>
          {course === "english" ? (
            <div className="warn-box" style={{ background: "var(--bg)", marginBottom: 12 }}>
              <b>80 marks - real CBSE (Communicative) board pattern</b>
              <div className="muted" style={{ marginTop: 4 }}>
                Reading Skills (22) + Writing Skills (22) + Grammar (10) + Literature Textbook (26).
              </div>
            </div>
          ) : (
            <>
              <label className="field-label">Paper style</label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, cursor: "pointer" }}>
                <input type="radio" name="paperMode" checked={paperMode === "fixed"} onChange={() => setPaperMode("fixed")} />
                <span><b>Fixed board pattern</b> <span className="muted">(30 or 80 marks, CBSE typology mix)</span></span>
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, cursor: "pointer" }}>
                <input type="radio" name="paperMode" checked={paperMode === "custom"} onChange={() => setPaperMode("custom")} />
                <span><b>Custom</b> <span className="muted">(pick how many of each question type)</span></span>
              </label>

              {paperMode === "fixed" ? (
                <>
                  <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, cursor: "pointer" }}>
                    <input type="radio" name="totalMarks" checked={totalMarks === 30} onChange={() => setTotalMarks(30)} />
                    <span><b>30 marks</b> <span className="muted">(6 MCQ + 3 Assertion-Reason + 3 Case-based + 3&times;2M + 1&times;3M)</span></span>
                  </label>
                  <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, cursor: "pointer" }}>
                    <input type="radio" name="totalMarks" checked={totalMarks === 80} onChange={() => setTotalMarks(80)} />
                    <span><b>80 marks</b> <span className="muted">(16 MCQ + 8 Assertion-Reason + 8 Case-based + 4&times;2M + 2&times;3M + 2&times;5M)</span></span>
                  </label>
                </>
              ) : (
                <div style={{ marginBottom: 12 }}>
                  <p className="muted" style={{ marginTop: -4, marginBottom: 8, fontSize: 12.5 }}>
                    e.g. set "2-mark" to 10 to generate a paper of just 10 two-mark questions.
                  </p>
                  {CUSTOM_TYPE_INFO.map((t) => (
                    <label key={t.key} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <span style={{ width: 140 }}>{t.label} <span className="muted">({t.marksEach}m each)</span></span>
                      <input
                        type="number" min="0" max="50" style={{ width: 70 }}
                        value={customCounts[t.key]}
                        onChange={(e) => setCustomCount(t.key, e.target.value)}
                      />
                    </label>
                  ))}
                  <p className="muted" style={{ marginTop: 8 }}>
                    {customTotalQuestions} question{customTotalQuestions === 1 ? "" : "s"}, {customTotalMarks} marks total.
                  </p>
                </div>
              )}
            </>
          )}

          <label className="field-label">Number of practice sets</label>
          <input type="number" min="1" max="3" value={numSets} onChange={(e) => setNumSets(e.target.value)} />
          <p className="muted" style={{ marginTop: 6 }}>
            Generates that many distinct versions (Set A, Set B, ...) with different questions where the
            question bank allows, so you can re-practice the same chapters without repeats. A larger paper
            draws on a lot of questions, so select several chapters to avoid running short.
          </p>

          <button className="btn orange" style={{ marginTop: 10 }} disabled={loading} onClick={generate}>
            {loading ? "Generating..." : "Generate Question Paper(s)"}
          </button>
        </div>
      </div>
    </div>
  );
}
