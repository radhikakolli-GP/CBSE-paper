export function GeneralInstructions({ pattern, sections }) {
  if (pattern === "english") {
    return (
      <div className="card">
        <h3 style={{ marginTop: 0 }}>General Instructions</h3>
        <ul className="instructions-list">
          <li>This paper has four fixed sections: {sections.join(", ")}. All questions are compulsory - answer them in the order given.</li>
          <li><b>Section A - Reading Skills (22 marks):</b> two unseen passages (12 + 10 marks) with a mix of MCQs, complete-the-sentence, rectify-the-statement and short-answer questions. Read each passage carefully - some questions ask you to infer or synthesise rather than just locate a fact.</li>
          <li><b>Section B - Writing Skills (22 marks):</b> an application or email (&le;50 words, 3 marks - recent papers use either format for this question, so both appear here), a factual description (&le;100 words, 4 marks), a letter to the editor (~120 words, 7 marks) and an article/speech/story (~150 words, 8 marks). Stick to the word limit and use the correct format - format carries dedicated marks.</li>
          <li><b>Section C - Grammar (10 marks):</b> a gap-fill passage with bracketed options (3 marks), an editing/word-omission exercise (4 marks), a jumbled-sentence question (1 mark) and a reported-speech completion (2 marks).</li>
          <li><b>Section D - Literature Textbook (26 marks):</b> two extract-based passages (4 marks each, 4 sub-questions), five 2-mark short-answer questions in 30-40 words each, and one 8-mark comparative essay (~150 words) analysing two texts together.</li>
        </ul>
      </div>
    );
  }
  if (pattern !== "school") return null;
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>General Instructions</h3>
      <ul className="instructions-list">
        <li>This paper has sections for each subject you selected: {sections.join(", ")}.</li>
        <li>MCQ and Assertion-Reason (AR) questions carry 1 mark each.</li>
        <li>Very Short Answer (2M) questions carry 2 marks each - keep answers to about 40 words.</li>
        <li>Short Answer (3M) questions carry 3 marks each - keep answers to about 60 words.</li>
        <li>Long Answer (4M) questions carry 4 marks each - keep answers to about 120 words.</li>
        <li>Case-based (CBQ) questions have a short passage followed by sub-questions worth 1 mark each.</li>
        <li>Map-based (MAP) questions ask you to name a region/state (a text-based stand-in for labelling an actual map, which this app doesn't render).</li>
      </ul>
    </div>
  );
}
