import { Routes, Route } from "react-router-dom";
import MainApp from "./MainApp.jsx";
import { BoardPrepPage } from "./boardprep/BoardPrepPage.jsx";
import { MathsConceptsPage } from "./mathsconcepts/MathsConceptsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<MainApp />} />
      <Route path="/board-prep" element={<BoardPrepPage />} />
      <Route path="/maths-concepts" element={<MathsConceptsPage />} />
    </Routes>
  );
}
