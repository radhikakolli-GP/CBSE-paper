import { useState } from "react";

export function TopicVideo({ videoId, title }) {
  const [loaded, setLoaded] = useState(false);
  if (!videoId) return null;
  const watchUrl = "https://www.youtube.com/watch?v=" + videoId;
  const isFileProtocol = typeof window !== "undefined" && window.location && window.location.protocol === "file:";
  return (
    <div className="topic-video" style={{ marginTop: 8, marginBottom: 4 }}>
      {loaded ? (
        <div>
          {isFileProtocol ? (
            // The YouTube player can't initialise on a page opened directly from disk
            // (file://) - it rejects the "null" origin and shows "Error 153". Rather
            // than show a broken embed, skip straight to a normal link that opens the
            // video in the browser, which always works regardless of how the app is served.
            <a className="btn-video-load" href={watchUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, textDecoration: "none" }}>
              &#9654; Open on YouTube: {title || "Concept video"}
            </a>
          ) : (
            <>
              <div className="video-embed-wrap" style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 8, maxWidth: 480 }}>
                <iframe
                  src={"https://www.youtube.com/embed/" + videoId}
                  title={title || "Concept video"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                />
              </div>
              <div style={{ marginTop: 4 }}>
                <a href={watchUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5 }}>
                  Video not playing? Open it directly on YouTube &#8599;
                </a>
              </div>
            </>
          )}
        </div>
      ) : (
        <button className="btn-video-load" onClick={() => setLoaded(true)} style={{ fontSize: 13 }}>
          &#9654; Watch: {title || "Concept video"}
        </button>
      )}
    </div>
  );
}
