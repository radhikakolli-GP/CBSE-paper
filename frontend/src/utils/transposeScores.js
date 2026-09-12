// Skill practice: transposition method drill. Score per level (persisted in
// localStorage) so a student can see themselves improving over multiple
// visits, matching the pattern used for recent-papers tracking above.
export const TRANSPOSE_SCORES_KEY = "cbse_transpose_scores";

export function getTransposeScores() {
  try {
    const raw = localStorage.getItem(TRANSPOSE_SCORES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function pickRandomProblem(problems, excludeId) {
  const pool = problems.length > 1 ? problems.filter((p) => p.id !== excludeId) : problems;
  return pool[Math.floor(Math.random() * pool.length)];
}
