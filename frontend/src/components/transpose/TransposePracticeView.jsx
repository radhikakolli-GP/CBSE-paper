import { useState, useEffect } from "react";
import { apiGet } from "../../api/client.js";
import { TRANSPOSE_SCORES_KEY, getTransposeScores, pickRandomProblem } from "../../utils/transposeScores.js";

export function TransposePracticeView() {
  const [skill, setSkill] = useState(null);
  const [error, setError] = useState("");
  const [level, setLevel] = useState(1);
  const [problem, setProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // null | "correct" | "incorrect"
  const [showSolution, setShowSolution] = useState(false);
  const [scores, setScores] = useState(() => getTransposeScores());

  useEffect(() => {
    apiGet("/api/skills/transposition").then(setSkill).catch((e) => setError(e.message));
  }, []);

  const currentLevelData = skill ? skill.levels.find((l) => l.level === level) : null;

  useEffect(() => {
    if (currentLevelData) {
      setProblem(pickRandomProblem(currentLevelData.problems));
      setUserAnswer("");
      setFeedback(null);
      setShowSolution(false);
    }
  }, [skill, level]);

  const recordResult = (isCorrect) => {
    setScores((prev) => {
      const cur = prev[level] || { correct: 0, attempted: 0 };
      const next = {
        ...prev,
        [level]: { correct: cur.correct + (isCorrect ? 1 : 0), attempted: cur.attempted + 1 },
      };
      localStorage.setItem(TRANSPOSE_SCORES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const check = () => {
    if (userAnswer.trim() === "" || !problem) return;
    const given = parseFloat(userAnswer.trim());
    const expected = parseFloat(problem.answer);
    const isCorrect = !isNaN(given) && Math.abs(given - expected) < 1e-6;
    setFeedback(isCorrect ? "correct" : "incorrect");
    recordResult(isCorrect);
  };

  const next = () => {
    if (!currentLevelData) return;
    setProblem(pickRandomProblem(currentLevelData.problems, problem ? problem.id : null));
    setUserAnswer("");
    setFeedback(null);
    setShowSolution(false);
  };

  const resetScores = () => {
    localStorage.removeItem(TRANSPOSE_SCORES_KEY);
    setScores({});
  };

  if (error) return <div className="card"><div className="error-box">{error}</div></div>;
  if (!skill || !problem) return <div className="card">Loading practice problems...</div>;

  const levelScore = scores[level] || { correct: 0, attempted: 0 };

  return (
    <div className="card">
      <div className="result-row" style={{ marginBottom: 6 }}>
        <h2 style={{ margin: 0 }}>{skill.title}</h2>
        <button className="btn secondary" onClick={resetScores}>Reset scores</button>
      </div>
      <p className="muted">{skill.intro}</p>

      <div className="warn-box" style={{ background: "var(--bg)", marginBottom: 14 }}>
        <b>The transposition rule</b>
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          {skill.rule_box.map((r, i) => <li key={i} style={{ marginBottom: 2 }}>{r}</li>)}
        </ul>
      </div>

      <label className="field-label">Level</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {skill.levels.map((l) => (
          <button
            key={l.level}
            className={"btn" + (level === l.level ? "" : " secondary")}
            style={{ fontSize: 13 }}
            onClick={() => setLevel(l.level)}
          >
            {l.label}
            {scores[l.level] ? ` (${scores[l.level].correct}/${scores[l.level].attempted})` : ""}
          </button>
        ))}
      </div>
      <p className="muted" style={{ marginTop: -8, marginBottom: 14 }}>{currentLevelData.description}</p>

      <div style={{ textAlign: "center", padding: "20px 10px", background: "var(--bg)", borderRadius: 8, marginBottom: 14 }}>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: 0.5 }}>{problem.equation}</div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <span>x =</span>
        <input
          type="text" inputMode="decimal" style={{ width: 100 }}
          value={userAnswer}
          onChange={(e) => { setUserAnswer(e.target.value); setFeedback(null); }}
          onKeyDown={(e) => { if (e.key === "Enter") check(); }}
          placeholder="answer"
        />
        <button className="btn orange" onClick={check}>Check</button>
        <button className="btn secondary" onClick={next}>Next problem</button>
      </div>

      {feedback === "correct" && <div className="warn-box" style={{ background: "#eaf6ea", color: "#2f7a3d" }}>Correct! x = {problem.answer}.</div>}
      {feedback === "incorrect" && <div className="warn-box" style={{ background: "#fdf1e0", color: "#a15b0a" }}>Not quite - try again, or show the solution below.</div>}

      <button className="btn secondary" style={{ marginTop: 10 }} onClick={() => setShowSolution((s) => !s)}>
        {showSolution ? "Hide solution" : "Show solution"}
      </button>
      {showSolution && (
        <div className="notes-section" style={{ marginTop: 10 }}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {problem.steps.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
          </ol>
        </div>
      )}

      <p className="muted" style={{ marginTop: 16 }}>
        This level: {levelScore.correct} correct out of {levelScore.attempted} attempted.
      </p>
    </div>
  );
}
