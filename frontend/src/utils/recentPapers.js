// Recent-papers tracking (device-local, via localStorage). Every paper the
// backend generates is already persisted server-side (see db.py) and
// reachable via GET /api/papers/{id} - but there was previously no way to
// find that id again after leaving the page (e.g. clicking "Change
// chapters"), so generated papers effectively felt "lost" even though they
// still existed. This keeps a lightweight pointer list (id/title/marks/etc,
// not the full paper) so "My Papers" can list and reopen them later.
const RECENT_PAPERS_KEY = "cbse_recent_papers";
const RECENT_PAPERS_LIMIT = 40;

export function getRecentPapers() {
  try {
    const raw = localStorage.getItem(RECENT_PAPERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

export function addRecentPapers(papers, course) {
  const existing = getRecentPapers();
  const existingIds = new Set(existing.map((p) => p.id));
  const additions = papers
    .filter((p) => !existingIds.has(p.id))
    .map((p) => ({
      id: p.id,
      title: p.title,
      set_label: p.set_label,
      pattern: p.pattern,
      total_marks: p.total_marks,
      course: course,
      generated_at: new Date().toISOString(),
    }));
  const merged = [...additions, ...existing].slice(0, RECENT_PAPERS_LIMIT);
  localStorage.setItem(RECENT_PAPERS_KEY, JSON.stringify(merged));
}

export function removeRecentPaper(id) {
  const remaining = getRecentPapers().filter((p) => p.id !== id);
  localStorage.setItem(RECENT_PAPERS_KEY, JSON.stringify(remaining));
  return remaining;
}

export function clearRecentPapers() {
  localStorage.removeItem(RECENT_PAPERS_KEY);
}
