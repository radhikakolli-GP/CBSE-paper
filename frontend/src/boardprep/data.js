export const SUBJECTS = [
  {
    key: "maths", name: "Mathematics", tag: "041 Standard", color: "var(--maths)", soft: "var(--maths-soft)",
    source: "NCERT textbook, 2026–27 reprint",
    units: [
      { name: "Algebra", marks: 20 },
      { name: "Geometry", marks: 15 },
      { name: "Trigonometry", marks: 12 },
      { name: "Statistics & Probability", marks: 11 },
      { name: "Mensuration", marks: 10 },
      { name: "Coordinate Geometry", marks: 6 },
      { name: "Number Systems", marks: 6 }
    ],
    chapters: [
      { name: "Real Numbers", unit: "Number Systems" },
      { name: "Polynomials", unit: "Algebra" },
      { name: "Pair of Linear Equations in Two Variables", unit: "Algebra" },
      { name: "Quadratic Equations", unit: "Algebra" },
      { name: "Arithmetic Progressions", unit: "Algebra" },
      { name: "Triangles", unit: "Geometry" },
      { name: "Coordinate Geometry", unit: "Coordinate Geometry" },
      { name: "Introduction to Trigonometry", unit: "Trigonometry" },
      { name: "Some Applications of Trigonometry", unit: "Trigonometry" },
      { name: "Circles", unit: "Geometry" },
      { name: "Areas Related to Circles", unit: "Geometry" },
      { name: "Surface Areas and Volumes", unit: "Mensuration" },
      { name: "Statistics", unit: "Statistics & Probability" },
      { name: "Probability", unit: "Statistics & Probability" }
    ]
  },
  {
    key: "science", name: "Science", tag: "086", color: "var(--science)", soft: "var(--science-soft)",
    source: "NCERT textbook, 2026–27 reprint",
    units: [
      { name: "Chemical Substances", marks: 25 },
      { name: "World of Living", marks: 25 },
      { name: "Effects of Current", marks: 13 },
      { name: "Natural Phenomena", marks: 12 },
      { name: "Natural Resources", marks: 5 }
    ],
    chapters: [
      { name: "Chemical Reactions and Equations", unit: "Chemical Substances" },
      { name: "Acids, Bases and Salts", unit: "Chemical Substances" },
      { name: "Metals and Non-metals", unit: "Chemical Substances" },
      { name: "Carbon and its Compounds", unit: "Chemical Substances" },
      { name: "Life Processes", unit: "World of Living" },
      { name: "Control and Coordination", unit: "World of Living" },
      { name: "How do Organisms Reproduce?", unit: "World of Living" },
      { name: "Heredity and Evolution", unit: "World of Living" },
      { name: "Light — Reflection and Refraction", unit: "Natural Phenomena" },
      { name: "The Human Eye and the Colourful World", unit: "Natural Phenomena" },
      { name: "Electricity", unit: "Effects of Current" },
      { name: "Magnetic Effects of Electric Current", unit: "Effects of Current" },
      { name: "Our Environment", unit: "Natural Resources" }
    ]
  },
  {
    key: "sst", name: "Social Science", tag: "087", color: "var(--sst)", soft: "var(--sst-soft)",
    source: "Indicative — add your SST NCERT PDFs for an exact match",
    units: [
      { name: "History", marks: 20 },
      { name: "Geography", marks: 20 },
      { name: "Political Science", marks: 20 },
      { name: "Economics", marks: 20 }
    ],
    chapters: [
      { name: "Nationalism in India", unit: "History" },
      { name: "The Making of a Global World", unit: "History" },
      { name: "Resources and Development", unit: "Geography" },
      { name: "Water Resources", unit: "Geography" },
      { name: "Power Sharing", unit: "Political Science" },
      { name: "Federalism", unit: "Political Science" },
      { name: "Development", unit: "Economics" },
      { name: "Sectors of the Indian Economy", unit: "Economics" }
    ]
  },
  {
    key: "english", name: "English", tag: "Communicative", color: "var(--english)", soft: "var(--english-soft)",
    source: "CBSE Class X English question bank (rationalised syllabus)",
    units: [
      { name: "Reading", marks: 20 },
      { name: "Writing & Grammar", marks: 20 },
      { name: "Literature", marks: 40 }
    ],
    chapters: [
      { name: "Grammar & Writing Skills", unit: "Writing & Grammar" },
      { name: "Two Gentlemen of Verona", unit: "Literature", group: "Fiction" },
      { name: "Mrs Packletide's Tiger", unit: "Literature", group: "Fiction" },
      { name: "The Letter", unit: "Literature", group: "Fiction" },
      { name: "A Shady Plot", unit: "Literature", group: "Fiction" },
      { name: "Patol Babu, Film Star", unit: "Literature", group: "Fiction" },
      { name: "Virtually True", unit: "Literature", group: "Fiction" },
      { name: "The Frog and the Nightingale", unit: "Literature", group: "Poetry" },
      { name: "Not Marble, Nor the Gilded Monuments", unit: "Literature", group: "Poetry" },
      { name: "Mirror", unit: "Literature", group: "Poetry" },
      { name: "Ozymandias", unit: "Literature", group: "Poetry" },
      { name: "The Rime of the Ancient Mariner", unit: "Literature", group: "Poetry" },
      { name: "Snake", unit: "Literature", group: "Poetry" },
      { name: "The Dear Departed", unit: "Literature", group: "Drama" },
      { name: "Julius Caesar", unit: "Literature", group: "Drama" }
    ]
  }
];

// Official CBSE board question papers found in the local archive, grouped by
// subject / year / session, with real per-zip paper-set counts.
export const ARCHIVE = [
  { subj: "maths", year: 2023, session: "Main Exam", count: 24 },
  { subj: "maths", year: 2023, session: "Compartment", count: 4 },
  { subj: "maths", year: 2024, session: "Main Exam", count: 16 },
  { subj: "maths", year: 2025, session: "Main Exam", count: 19 },
  { subj: "maths", year: 2025, session: "Compartment", count: 4 },
  { subj: "maths", year: 2026, session: "Main Exam", count: 32 },
  { subj: "maths", year: 2026, session: "Compartment", count: 7 },

  { subj: "science", year: 2023, session: "Main Exam", count: 24 },
  { subj: "science", year: 2023, session: "Compartment", count: 10 },
  { subj: "science", year: 2024, session: "Main Exam", count: 16 },
  { subj: "science", year: 2025, session: "Main Exam", count: 19 },
  { subj: "science", year: 2025, session: "Compartment", count: 4 },
  { subj: "science", year: 2026, session: "Main Exam", count: 16 },
  { subj: "science", year: 2026, session: "Compartment", count: 7 },

  { subj: "sst", year: 2023, session: "Main Exam", count: 21 },
  { subj: "sst", year: 2023, session: "Compartment", count: 6 },
  { subj: "sst", year: 2024, session: "Main Exam", count: 15 },
  { subj: "sst", year: 2025, session: "Main Exam", count: 18 },
  { subj: "sst", year: 2025, session: "Compartment", count: 3 },
  { subj: "sst", year: 2026, session: "Main Exam", count: 15 },
  { subj: "sst", year: 2026, session: "Compartment", count: 6 },

  { subj: "english", year: 2024, session: "Main Exam", count: 1 },
  { subj: "english", year: 2025, session: "Compartment", count: 1 },
  { subj: "english", year: 2026, session: "Main Exam", count: 1 },
  { subj: "english", year: 2026, session: "Compartment", count: 1 }
];

// Standalone practice-question / marking-scheme / question-bank documents.
export const PAPERS = [
  { subj: "maths", file: "MathsX.pdf", type: "Case Studies" },
  { subj: "maths", file: "Mathematics-PQ.pdf", type: "Practice Questions 2023–24" },
  { subj: "maths", file: "Mathematics-PQ (1).pdf", type: "Practice Questions 2023–24" },
  { subj: "maths", file: "Mathematics-PQ2.pdf", type: "Practice Questions 2023–24" },
  { subj: "maths", file: "Mathematics-PQMS.pdf", type: "Practice Q + Marking Scheme" },
  { subj: "maths", file: "Mathematics-PQMS (1).pdf", type: "Practice Q + Marking Scheme" },
  { subj: "maths", file: "Mathematics-PQMS2.pdf", type: "Practice Q + Marking Scheme" },

  { subj: "science", file: "ScienceX.pdf", type: "Case Studies" },
  { subj: "science", file: "Science-PQ.pdf", type: "Practice Questions 2023–24" },
  { subj: "science", file: "Science-PQ (1).pdf", type: "Practice Questions 2023–24" },
  { subj: "science", file: "Science-PQ2.pdf", type: "Practice Questions 2023–24" },
  { subj: "science", file: "Science-PQMS.pdf", type: "Practice Q + Marking Scheme" },
  { subj: "science", file: "Science-PQMS (1).pdf", type: "Practice Q + Marking Scheme" },
  { subj: "science", file: "Science-PQMS2.pdf", type: "Practice Q + Marking Scheme" },

  { subj: "sst", file: "SS-PQ.pdf", type: "Practice Questions 2023–24" },
  { subj: "sst", file: "SS-PQ (1).pdf", type: "Practice Questions 2023–24" },
  { subj: "sst", file: "SS-PQ2.pdf", type: "Practice Questions 2023–24" },
  { subj: "sst", file: "SS-PQMS.pdf", type: "Practice Q + Marking Scheme" },
  { subj: "sst", file: "SS-PQMS (1).pdf", type: "Practice Q + Marking Scheme" },
  { subj: "sst", file: "SS-PQMS2.pdf", type: "Practice Q + Marking Scheme" },

  { subj: "english", file: "EnglishX.pdf", type: "Question Bank" },
  { subj: "english", file: "1_eng_communicative_2025.pdf", type: "Practice Questions" }
];

export const subjectByKey = Object.fromEntries(SUBJECTS.map(s => [s.key, s]));

export function unitMarksLookup(subject) {
  return Object.fromEntries(subject.units.map(u => [u.name, u.marks]));
}

export function chapterWeight(subject, chapter) {
  const unitMarks = unitMarksLookup(subject)[chapter.unit] || 1;
  const chaptersInUnit = subject.chapters.filter(c => c.unit === chapter.unit).length || 1;
  return unitMarks / chaptersInUnit;
}

export function archiveTotalFor(key) {
  return ARCHIVE.filter(a => a.subj === key).reduce((sum, a) => sum + a.count, 0);
}

export function formatDate(d) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function scoreTier(pct) {
  if (pct >= 80) return "good";
  if (pct >= 60) return "warn";
  return "bad";
}
