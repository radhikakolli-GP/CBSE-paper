function computeCountdown(examDateStr) {
  const target = new Date(examDateStr + "T00:00:00");
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((target - startOfToday) / 86400000);
  if (isNaN(diffDays)) return { days: "—", label: "set a date" };
  if (diffDays > 0) return { days: diffDays, label: "days to go" };
  if (diffDays === 0) return { days: "Today", label: "exams begin" };
  return { days: Math.abs(diffDays), label: "days since exams began" };
}

export function Countdown({ examDate, onExamDateChange }) {
  const { days, label } = computeCountdown(examDate);
  return (
    <div className="countdown">
      <div className="days">{days}</div>
      <div className="days-label">{label}</div>
      <div className="date-row">
        <label htmlFor="examDate">Exam starts</label>
        <input
          type="date"
          id="examDate"
          value={examDate}
          onChange={(e) => onExamDateChange(e.target.value)}
        />
      </div>
    </div>
  );
}
