import { useState } from "react";
import { API_BASE } from "./api/client.js";
import { addRecentPapers } from "./utils/recentPapers.js";
import { TopNav } from "./components/layout/TopNav.jsx";
import { NotesView } from "./components/notes/NotesView.jsx";
import { AskTopicView } from "./components/ask/AskTopicView.jsx";
import { GeneratePaperView } from "./components/generate/GeneratePaperView.jsx";
import { SetPickerView } from "./components/papers/SetPickerView.jsx";
import { AnswerKeyView } from "./components/papers/AnswerKeyView.jsx";
import { MyPapersView } from "./components/papers/MyPapersView.jsx";
import { TransposePracticeView } from "./components/transpose/TransposePracticeView.jsx";
import { AttemptPaperView } from "./components/attempt/AttemptPaperView.jsx";
import { ResultsView } from "./components/results/ResultsView.jsx";
import { PerformanceView } from "./components/performance/PerformanceView.jsx";

export default function MainApp() {
  const [view, setView] = useState("notes");
  const [sets, setSets] = useState(null);
  const [paper, setPaper] = useState(null);
  const [result, setResult] = useState(null);
  const [course, setCourse] = useState(localStorage.getItem("cbse_course") || "social_science");
  const [jumpToChapter, setJumpToChapter] = useState("");
  const [answerKeyPaperId, setAnswerKeyPaperId] = useState(null);
  const [answerKeyReturnView, setAnswerKeyReturnView] = useState("papers");

  const viewAnswerKey = (paperId) => {
    setAnswerKeyReturnView(view);
    setAnswerKeyPaperId(paperId);
    setView("answerkey");
  };

  // Top-nav clicks must reset any in-progress paper/set state - otherwise
  // e.g. clicking "Question Paper" again after already generating one leaves
  // `sets` non-null while view resets to "generate", and the generator view
  // guard (which only renders when `!sets`) then renders nothing at all.
  const onNavigate = (key) => {
    if (key === "generate") {
      setSets(null);
      setPaper(null);
    }
    setView(key);
  };

  // Switching course mid-flow (e.g. while a paper/result from the other
  // course is on screen) resets in-progress state and returns to Notes, so
  // Science and Social Science content never mix in one paper/attempt.
  const onCourseChange = (key) => {
    if (key === course) return;
    localStorage.setItem("cbse_course", key);
    setCourse(key);
    setSets(null);
    setPaper(null);
    setResult(null);
    setView("notes");
  };

  return (
    <div className="app-shell">
      <TopNav view={view} onNavigate={onNavigate} course={course} onCourseChange={onCourseChange} />
      <div className="container">
        {view === "notes" && (
          <NotesView
            course={course}
            initialChapterId={jumpToChapter}
            onInitialChapterConsumed={() => setJumpToChapter("")}
          />
        )}

        {view === "ask" && (
          <AskTopicView
            onOpenChapter={(chapterId, group) => {
              if (group && group !== course) {
                localStorage.setItem("cbse_course", group);
                setCourse(group);
              }
              setJumpToChapter(chapterId);
              setView("notes");
            }}
          />
        )}

        {view === "generate" && !sets && (
          <GeneratePaperView
            course={course}
            onSetsReady={(newSets) => {
              addRecentPapers(newSets, course);
              setSets(newSets);
              if (newSets.length === 1) {
                setPaper(newSets[0]);
                setView("attempt");
              } else {
                setView("pickset");
              }
            }}
          />
        )}

        {view === "papers" && (
          <MyPapersView
            onOpen={(reopenedPaper) => {
              setSets(null);
              setPaper(reopenedPaper);
              setView("attempt");
            }}
            onViewAnswerKey={viewAnswerKey}
          />
        )}

        {view === "transpose" && course === "mathematics" && <TransposePracticeView />}

        {view === "pickset" && sets && (
          <SetPickerView
            sets={sets}
            onBack={() => {
              setSets(null);
              setView("generate");
            }}
            onAttempt={(p) => {
              setPaper(p);
              setView("attempt");
            }}
            onViewAnswerKey={viewAnswerKey}
          />
        )}

        {view === "answerkey" && answerKeyPaperId && (
          <AnswerKeyView
            paperId={answerKeyPaperId}
            onBack={() => {
              setAnswerKeyPaperId(null);
              setView(answerKeyReturnView);
            }}
          />
        )}

        {view === "attempt" && paper && (
          <AttemptPaperView
            paper={paper}
            backLabel={sets ? "Back to sets" : "Back to My Papers"}
            onViewAnswerKey={viewAnswerKey}
            onBack={() => {
              // Don't discard `sets`/`paper` here - the generated paper(s)
              // must stay reachable so "Back to sets" never loses the paper
              // the student was just looking at. Only the "Change chapters"
              // action inside SetPickerView actually clears state and returns
              // to the blank generator form.
              //
              // If this paper was instead reopened from "My Papers" (`sets`
              // is null - it wasn't part of a freshly-generated batch), there
              // is no set list to go back to, so return to "My Papers"
              // instead - going to "pickset" with sets=null would render a
              // blank page.
              setPaper(null);
              setView(sets ? "pickset" : "papers");
            }}
            onSubmitted={(r) => {
              setResult(r);
              setView("results");
            }}
          />
        )}

        {view === "results" && result && (
          <ResultsView
            result={result}
            onDone={() => {
              setPaper(null);
              setSets(null);
              setResult(null);
              setView("generate");
            }}
            onViewPerformance={() => setView("performance")}
          />
        )}

        {view === "performance" && (
          <PerformanceView
            defaultStudent={result ? result.student_name : null}
            onViewSubmission={(r) => {
              setResult(r);
              setView("results");
            }}
          />
        )}
      </div>
      <div className="footer-note">
        CBSE Class 10 Study &amp; Practice App &middot; Backend: {API_BASE}
      </div>
    </div>
  );
}
