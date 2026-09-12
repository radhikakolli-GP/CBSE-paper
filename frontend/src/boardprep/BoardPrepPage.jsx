import { useState, useEffect } from "react";
import { loadState, saveState } from "./storage.js";
import { Countdown } from "./components/Countdown.jsx";
import { WeightageGrid } from "./components/WeightageGrid.jsx";
import { SubjectTracker } from "./components/SubjectTracker.jsx";
import { StudySchedule } from "./components/StudySchedule.jsx";
import { MockTestLog } from "./components/MockTestLog.jsx";
import { PaperArchive } from "./components/PaperArchive.jsx";
import "./boardprep.css";

export function BoardPrepPage() {
  const [loaded] = useState(() => loadState());
  const [examDate, setExamDate] = useState(loaded.examDate || "2027-02-15");
  const [checked, setChecked] = useState(loaded.checked);
  const [mockLog, setMockLog] = useState(loaded.mockLog);

  useEffect(() => {
    saveState({ examDate, checked, mockLog });
  }, [examDate, checked, mockLog]);

  const toggleChapter = (boxId) => {
    setChecked((prev) => ({ ...prev, [boxId]: !prev[boxId] }));
  };

  const addMockEntry = (entry) => {
    setMockLog((prev) => [...prev, entry]);
  };

  const removeMockEntry = (id) => {
    setMockLog((prev) => prev.filter((e) => String(e.id) !== String(id)));
  };

  return (
    <div className="bp-page">
      <div className="page">
        <header className="masthead">
          <div className="masthead-title">
            <div className="eyebrow">CBSE &middot; Class X &middot; Board Examinations</div>
            <h1>Board Prep 2027</h1>
            <p>Revision tracker, weightage, study schedule, mock test log and previous-year paper archive across Maths, Science, Social Science and English.</p>
            <nav className="jump" aria-label="Section navigation">
              <a href="#weightage-head">Weightage</a>
              <a href="#tracker-head">Tracker</a>
              <a href="#schedule-head">Schedule</a>
              <a href="#mocklog-head">Mock Tests</a>
              <a href="#archive-head">Papers</a>
            </nav>
          </div>
          <Countdown examDate={examDate} onExamDateChange={setExamDate} />
        </header>

        <WeightageGrid />
        <SubjectTracker checked={checked} onToggle={toggleChapter} />
        <StudySchedule examDate={examDate} checked={checked} />
        <MockTestLog mockLog={mockLog} onAdd={addMockEntry} onRemove={removeMockEntry} />
        <PaperArchive />

        <footer>Personal study dashboard &middot; not affiliated with CBSE &middot; syllabus drawn from the NCERT Class X textbook (2026&ndash;27 reprint) and official CBSE question banks where available &middot; your progress, exam date and mock scores are saved automatically in this browser (localStorage) &mdash; they'll persist across reloads on this device/browser, but won't follow you to a different device or browser</footer>
      </div>
    </div>
  );
}
