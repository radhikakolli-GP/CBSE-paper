export function PassageBox({ text }) {
  if (!text) return null;
  return (
    <div className="passage-box">
      <span className="passage-label">Read the passage and answer:</span>
      {text}
    </div>
  );
}
