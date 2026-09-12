const STORAGE_KEY = "boardPrep2027State";

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { examDate: null, checked: {}, mockLog: [] };
    const parsed = JSON.parse(raw);
    const mockLog = Array.isArray(parsed.mockLog)
      ? parsed.mockLog
          .map((e) => ({
            id: e.id != null ? e.id : Date.now() + Math.random(),
            date: e.date, subj: e.subj, paper: e.paper,
            score: Number(e.score), max: Number(e.max)
          }))
          .filter((e) => e.date && e.subj && e.paper && !isNaN(e.score) && !isNaN(e.max))
      : [];
    return {
      examDate: typeof parsed.examDate === "string" ? parsed.examDate : null,
      checked: (parsed.checked && typeof parsed.checked === "object") ? parsed.checked : {},
      mockLog,
    };
  } catch (e) {
    return { examDate: null, checked: {}, mockLog: [] };
  }
}

export function saveState({ examDate, checked, mockLog }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ examDate, checked, mockLog }));
  } catch (e) {
    // localStorage unavailable or full — data just won't persist this time.
  }
}
