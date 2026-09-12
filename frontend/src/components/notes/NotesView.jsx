import { useState, useEffect } from "react";
import { apiGet } from "../../api/client.js";
import { TopicVideo } from "./TopicVideo.jsx";

export function NotesView({ course, initialChapterId, onInitialChapterConsumed }) {
  const [subjects, setSubjects] = useState([]);
  const [chapterId, setChapterId] = useState("");
  const [notes, setNotes] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet("/api/subjects").then((d) => setSubjects(d.subjects)).catch((e) => setError(e.message));
  }, []);

  const visibleSubjects = subjects.filter((s) => s.group === course);

  useEffect(() => {
    // Reset the selected chapter/notes when the course changes, so notes
    // from the previously selected course don't linger on screen - unless
    // this course switch was triggered by "Open full chapter" from Ask a
    // Topic, in which case initialChapterId (below) will load the right
    // chapter for the new course right after.
    if (!initialChapterId) {
      setChapterId("");
      setNotes(null);
    }
  }, [course]);

  const loadNotes = (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    apiGet("/api/notes?chapter=" + encodeURIComponent(id))
      .then((d) => setNotes(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  // Jumped here from "Ask a Topic" -> Open full chapter: load that specific
  // chapter once, then tell the parent to clear the request so navigating
  // away and back to Notes normally doesn't keep re-loading it.
  useEffect(() => {
    if (initialChapterId) {
      setChapterId(initialChapterId);
      loadNotes(initialChapterId);
      if (onInitialChapterConsumed) onInitialChapterConsumed();
    }
  }, [initialChapterId]);

  return (
    <div>
      <div className="card">
        <h2>Pick a chapter</h2>
        {error && <div className="error-box">{error}</div>}
        <label className="field-label">Chapter</label>
        <select
          value={chapterId}
          onChange={(e) => {
            setChapterId(e.target.value);
            loadNotes(e.target.value);
          }}
        >
          <option value="">-- Select a chapter --</option>
          {visibleSubjects.map((s) => (
            <optgroup key={s.subject} label={s.label}>
              {s.chapters.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {loading && <div className="muted">Loading notes...</div>}

      {notes && (
        <div className="card">
          <h2>{notes.title}</h2>
          <div className="notes-section">
            <h3>Overview</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6 }}>{notes.notes.overview}</p>
          </div>

          {notes.notes.sections && notes.notes.sections.length > 0 ? (
            <div className="notes-section">
              {notes.notes.sections.map((sec, i) => (
                <div className="board-note-block" key={i}>
                  <h3>{sec.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.65 }}>{sec.content}</p>
                  {sec.keywords && sec.keywords.length > 0 && (
                    <div className="tag-list" style={{ marginTop: 4, marginBottom: 4 }}>
                      <span className="muted" style={{ fontSize: 11.5, marginRight: 4 }}>Board keywords:</span>
                      {sec.keywords.map((k, ki) => <span key={ki} className="keyword-chip">{k}</span>)}
                    </div>
                  )}
                  {sec.video_id && <TopicVideo videoId={sec.video_id} title={sec.video_title} />}
                </div>
              ))}
            </div>
          ) : (
            <div className="notes-section">
              <h3>Key Points</h3>
              <ul>{notes.notes.key_points.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </div>
          )}

          <div className="notes-section">
            <h3>Key Terms</h3>
            {Object.entries(notes.notes.key_terms).map(([term, def]) => (
              <div className="term-item" key={term}><b>{term}:</b> {def}</div>
            ))}
          </div>
          <div className="notes-section">
            <h3>Important Facts</h3>
            <ul>{notes.notes.important_facts.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>
          <div className="notes-section">
            <h3>Exam Tips</h3>
            <ul>{notes.notes.exam_tips.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>
          {notes.notes.case_study_video && (
            <div className="notes-section">
              <h3>Solving Case-Based / Scenario Questions</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.6 }} className="muted">{notes.notes.case_study_video.description}</p>
              <TopicVideo videoId={notes.notes.case_study_video.video_id} title={notes.notes.case_study_video.video_title} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
