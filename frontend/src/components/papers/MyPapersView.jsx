import { useState } from "react";
import { apiGet } from "../../api/client.js";
import { getRecentPapers, removeRecentPaper, clearRecentPapers } from "../../utils/recentPapers.js";
import { PATTERN_LABELS } from "../../utils/paperFormat.js";

// Lists every paper this browser has generated (device-local, via
// localStorage - see getRecentPapers/addRecentPapers), so a paper is
// never truly "lost" just because the student navigated away or clicked
// "Change chapters". Each paper was already saved server-side the moment it
// was generated (see db.save_paper in server.py) - this view just fetches it
// back by id via GET /api/papers/{id} and drops the student straight into
// the attempt screen, same as picking a freshly-generated set.
export function MyPapersView({ onOpen, onViewAnswerKey }) {
  const [papers, setPapers] = useState(() => getRecentPapers());
  const [openingId, setOpeningId] = useState(null);
  const [error, setError] = useState("");

  const open = (id) => {
    setOpeningId(id);
    setError("");
    apiGet("/api/papers/" + id)
      .then((paper) => onOpen(paper))
      .catch((e) => setError("Couldn't reopen this paper (it may have been generated on a different device or server): " + e.message))
      .finally(() => setOpeningId(null));
  };

  const remove = (id) => setPapers(removeRecentPaper(id));

  const clearAll = () => {
    clearRecentPapers();
    setPapers([]);
  };

  return (
    <div className="card">
      <div className="result-row" style={{ marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>My Papers</h2>
        {papers.length > 0 && <button className="btn secondary" onClick={clearAll}>Clear list</button>}
      </div>
      <p className="muted">
        Every paper you've generated on this device, whether or not you've attempted it yet. Papers stay
        available here even after you change chapters or close the app - this list just points back to them.
      </p>
      {error && <div className="error-box">{error}</div>}
      {papers.length === 0 ? (
        <div className="warn-box">
          No papers generated yet on this device. Generate one from the Question Paper tab and it'll show up here.
        </div>
      ) : (
        <div className="set-picker-grid">
          {papers.map((p) => (
            <div className="set-card" key={p.id}>
              <h3>{p.title}</h3>
              <div className="set-meta">
                {p.set_label ? p.set_label + " · " : ""}{p.total_marks} marks &middot; {PATTERN_LABELS[p.pattern] || p.pattern}
              </div>
              <div className="muted" style={{ fontSize: 11.5, marginBottom: 8 }}>
                Generated {new Date(p.generated_at).toLocaleString()}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" disabled={openingId === p.id} onClick={() => open(p.id)}>
                  {openingId === p.id ? "Opening..." : "Open"}
                </button>
                <button className="btn secondary" onClick={() => onViewAnswerKey(p.id)}>Answer key</button>
                <button className="btn secondary" onClick={() => remove(p.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
