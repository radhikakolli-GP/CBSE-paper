import { SUBJECTS, chapterWeight, archiveTotalFor, formatDate } from "../data.js";

const REVISION_BUFFER = 14;

function uncheckedChapters(key, checked) {
  return SUBJECTS.find((s) => s.key === key).chapters.filter((c, i) => !checked[`${key}-${i}`]);
}

function buildSchedule(examDate, checked) {
  const examDateObj = new Date(examDate + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const daysUntilExam = Math.round((examDateObj - today) / 86400000);

  if (isNaN(daysUntilExam)) {
    return { empty: "Set an exam date above to generate a schedule.", hint: "" };
  }
  if (daysUntilExam <= 0) {
    return { empty: "Exam date has passed — update the date above.", hint: "" };
  }

  const daysForNewContent = daysUntilExam - REVISION_BUFFER;

  // Build a weighted, subject-interleaved queue of unfinished chapters.
  const perSubjectQueues = SUBJECTS.map((s) => {
    return uncheckedChapters(s.key, checked)
      .map((c) => ({ subj: s.key, name: c.name, color: s.color, soft: s.soft, weight: chapterWeight(s, c) }))
      .sort((a, b) => b.weight - a.weight);
  });
  const pool = [];
  let added = true;
  while (added) {
    added = false;
    for (const q of perSubjectQueues) {
      if (q.length) { pool.push(q.shift()); added = true; }
    }
  }

  if (pool.length === 0) {
    return { empty: "Every chapter is checked off — spend remaining time on previous-year papers and quick revision.", hint: "tracker fully complete" };
  }

  if (daysForNewContent < 7) {
    return {
      empty: `Fewer than ${REVISION_BUFFER + 7} days remain — too tight for a fresh pass through ${pool.length} pending chapter${pool.length === 1 ? "" : "s"}. Go straight to previous-year papers and rapid revision.`,
      hint: `${pool.length} chapters still open`,
    };
  }

  const weeksAvailable = Math.max(1, Math.round(daysForNewContent / 7));
  // Spread chapters proportionally across every available week (not just enough
  // weeks to hold them) so the plan runs right up to the revision buffer with no gap.
  const weeks = [];
  for (let w = 0; w < weeksAvailable; w++) {
    const startIdx = Math.round((w * pool.length) / weeksAvailable);
    const endIdx = Math.round(((w + 1) * pool.length) / weeksAvailable);
    const slice = pool.slice(startIdx, endIdx);
    if (slice.length) weeks.push({ weekIndex: w, chapters: slice });
  }

  const weekCards = weeks.map(({ weekIndex, chapters }, i) => {
    const start = new Date(today); start.setDate(start.getDate() + weekIndex * 7);
    const end = new Date(start); end.setDate(end.getDate() + 6);
    return { key: weekIndex, label: `Week ${i + 1}`, range: `${formatDate(start)} – ${formatDate(end)}`, chapters };
  });

  const finalStart = new Date(examDateObj); finalStart.setDate(finalStart.getDate() - REVISION_BUFFER);
  const finalEnd = new Date(examDateObj); finalEnd.setDate(finalEnd.getDate() - 1);
  const archiveNote = SUBJECTS.map((s) => `${archiveTotalFor(s.key)} ${s.name}`).join(", ");

  return {
    weekCards,
    finalRange: `${formatDate(finalStart)} – ${formatDate(finalEnd)}`,
    archiveNote,
    hint: `${pool.length} chapters across ${weeks.length} week${weeks.length === 1 ? "" : "s"}`,
  };
}

export function StudySchedule({ examDate, checked }) {
  const schedule = buildSchedule(examDate, checked);
  return (
    <section id="schedule" aria-labelledby="schedule-head">
      <div className="section-head">
        <h2 id="schedule-head">Study Schedule</h2>
        <span className="hint">{schedule.hint}</span>
      </div>
      <div className="schedule-wrap">
        {schedule.empty ? (
          <div className="schedule-empty">{schedule.empty}</div>
        ) : (
          <>
            {schedule.weekCards.map((w) => (
              <div className="week-card" key={w.key}>
                <div className="week-head">
                  <span className="week-num">{w.label}</span>
                  <span className="week-range">{w.range}</span>
                </div>
                <div className="chip-row">
                  {w.chapters.map((c, i) => (
                    <span className="chapter-chip" key={i} style={{ "--c": c.color, "--soft": c.soft }}>{c.name}</span>
                  ))}
                </div>
              </div>
            ))}
            <div className="schedule-final">
              <span className="week-num" style={{ color: "var(--accent)" }}>Final stretch</span>
              <span className="week-range"> {schedule.finalRange}</span>
              <p>Reserved for full previous-year mock tests and quick revision — the archive below has {schedule.archiveNote} official paper sets to draw from.</p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
