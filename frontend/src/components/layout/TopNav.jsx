import { Link } from "react-router-dom";
import { COURSES } from "../../utils/paperFormat.js";

export function TopNav({ view, onNavigate, course, onCourseChange }) {
  const tabs = [
    ["notes", "Chapter Notes"],
    ["ask", "Ask a Topic"],
    ["generate", "Question Paper"],
    ["papers", "My Papers"],
    ...(course === "mathematics" ? [["transpose", "Transpose Practice"]] : []),
    ["performance", "My Performance"],
  ];
  return (
    <div className="topbar">
      <div>
        <h1>CBSE Class 10 - Study &amp; Practice</h1>
        <div className="sub">Notes &middot; Board-pattern papers &middot; Answer upload &middot; Performance analysis</div>
        <div className="course-switch">
          {COURSES.map((c) => (
            <button
              key={c.key}
              className={"course-btn" + (course === c.key ? " active" : "")}
              onClick={() => onCourseChange(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="nav">
        {tabs.map(([key, label]) => (
          <button key={key} className={view === key ? "active" : ""} onClick={() => onNavigate(key)}>
            {label}
          </button>
        ))}
        <Link to="/board-prep" target="_blank" rel="noopener noreferrer" className="nav-link">
          Board Prep &#8599;
        </Link>
      </div>
    </div>
  );
}
