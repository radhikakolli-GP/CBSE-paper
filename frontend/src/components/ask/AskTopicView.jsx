import { useState } from "react";
import { apiGet } from "../../api/client.js";
import { TopicVideo } from "../notes/TopicVideo.jsx";

// "Ask a Topic" - a free-text prompt box for a student who just wants to
// understand one specific topic, without knowing (or caring) which chapter
// it's filed under. Backed by content_store.search_topics: a deterministic
// keyword/fuzzy search over every chapter section already in the app (no
// external AI calls), so the video shown is always one already verified
// when the content library was built - never a live/unverified lookup.
const TOPIC_EXAMPLES = [
  "reflection of light",
  "photosynthesis",
  "ohm's law",
  "causes of the first world war",
  "types of soil in India",
];

function relevanceLabel(score) {
  if (score >= 80) return { text: "Strong match", cls: "good" };
  if (score >= 30) return { text: "Possible match", cls: "mid" };
  return { text: "Weak match", cls: "bad" };
}

export function AskTopicView({ onOpenChapter }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openIdx, setOpenIdx] = useState(0);

  const runSearch = (q) => {
    const trimmed = (q !== undefined ? q : query).trim();
    if (!trimmed) {
      setError("Type a topic or question first.");
      return;
    }
    setQuery(trimmed);
    setLoading(true);
    setError("");
    setSearched(true);
    apiGet("/api/topic-search?q=" + encodeURIComponent(trimmed))
      .then((d) => {
        setResults(d.results);
        setOpenIdx(0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <div className="card">
        <h2>Ask about one topic</h2>
        <p className="muted">
          Type a topic name or a whole question - e.g. "reflection of light" or "why does a convex
          mirror always give a smaller image?" - and get the relevant Chapter Notes section plus its
          concept video, without hunting through chapters.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Type a topic or question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
            style={{ flex: "1 1 320px" }}
          />
          <button className="btn orange" disabled={loading} onClick={() => runSearch()}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
        <div className="tag-list" style={{ marginTop: 10 }}>
          <span className="muted" style={{ fontSize: 12, marginRight: 4 }}>Try:</span>
          {TOPIC_EXAMPLES.map((ex) => (
            <span
              key={ex}
              className="keyword-chip"
              style={{ cursor: "pointer" }}
              onClick={() => { setQuery(ex); runSearch(ex); }}
            >
              {ex}
            </span>
          ))}
        </div>
        {error && <div className="error-box" style={{ marginTop: 10 }}>{error}</div>}
      </div>

      {searched && !loading && results && results.length === 0 && (
        <div className="card">
          <div className="warn-box">
            No close match found in the notes yet. Try simpler or different keywords, or browse the
            chapter directly from Chapter Notes.
          </div>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="card">
          <h2>{results.length === 1 ? "Here's what I found" : `${results.length} possible matches`}</h2>
          {results.length > 1 && (
            <p className="muted" style={{ marginTop: -4 }}>
              Not the one you meant? Pick a different match below.
            </p>
          )}
          <div className="tag-list" style={{ marginBottom: 14 }}>
            {results.map((r, i) => {
              const rel = relevanceLabel(r.relevance);
              return (
                <span
                  key={i}
                  className={"tag " + (i === openIdx ? "good" : "mid")}
                  style={{ cursor: "pointer" }}
                  onClick={() => setOpenIdx(i)}
                >
                  {r.section_title}
                </span>
              );
            })}
          </div>

          {results[openIdx] && (() => {
            const r = results[openIdx];
            const rel = relevanceLabel(r.relevance);
            return (
              <div className="board-note-block">
                <div className="tag-list" style={{ marginBottom: 6 }}>
                  <span className="keyword-chip">{r.subject_label}</span>
                  <span className="keyword-chip">{r.chapter_title}</span>
                  <span className={"tag " + rel.cls} style={{ fontSize: 11 }}>{rel.text}</span>
                </div>
                <h3>{r.section_title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.65 }}>{r.content}</p>
                {r.keywords && r.keywords.length > 0 && (
                  <div className="tag-list" style={{ marginTop: 4, marginBottom: 4 }}>
                    <span className="muted" style={{ fontSize: 11.5, marginRight: 4 }}>Board keywords:</span>
                    {r.keywords.map((k, ki) => <span key={ki} className="keyword-chip">{k}</span>)}
                  </div>
                )}
                {r.video_id ? (
                  <TopicVideo videoId={r.video_id} title={r.video_title} />
                ) : (
                  <p className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>No concept video linked for this topic yet.</p>
                )}
                {rel.cls === "bad" && (
                  <div className="warn-box" style={{ marginTop: 10 }}>
                    This looks like a weak match - the notes may not cover this exact topic. Try rephrasing,
                    or open the full chapter from Chapter Notes to browse.
                  </div>
                )}
                {onOpenChapter && (
                  <button className="btn secondary" style={{ marginTop: 10 }} onClick={() => onOpenChapter(r.chapter_id, r.subject_group)}>
                    Open full chapter in Chapter Notes
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
