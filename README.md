# CBSE Class 10 - Study & Practice App

A full-stack app for CBSE Class 10 exam preparation, covering four courses you can switch between with a toggle in the top bar:

- **Social Science**: History, Geography, Civics, Economics
- **Science**: Physics, Chemistry, Biology
- **Mathematics**: Quadratic Equations, Arithmetic Progressions, Triangles, Introduction to Trigonometry, Real Numbers, Polynomials, Probability, Pair of Linear Equations in Two Variables, Coordinate Geometry, Circles, Areas Related to Circles, Surface Areas and Volumes, Some Applications of Trigonometry
- **English**: Interact in English - Literature Reader (Communicative course) - Fiction, Poetry, Drama - plus Grammar & Writing Skills

Features, for every course:

1. **Chapter notes** - detailed, board-exam-style notes for any chapter you pick: numbered topic sections with a full explanatory paragraph each (dates/names/cause-and-effect for Social Science, definitions/formulae/processes for Science, story/poem summaries and literary analysis for English) plus a "Board keywords" line, in the same style as an official school notes handout, alongside a glossary, key facts and exam tips.
2. **Practice question papers** - generated on demand for one or more chapters. Social Science/Science papers use a fixed total: **30 marks** (6 MCQ + 3 Assertion-Reason + 3 Case-based(CBQ) + 3x2M + 1x3M) or **80 marks** (16 MCQ + 8 Assertion-Reason + 8 Case-based(CBQ) + 4x2M + 2x3M + 2x5M) - hand-tuned to hit CBSE's official typology mandate exactly: 50% competency-based (Assertion-Reason + case-based), 20% plain MCQ, 30% descriptive. Every generated paper carries a `typology` breakdown (see "Paper generation API" below) showing the actual percentages achieved, since this depends on whether the selected chapter(s) have enough AR/CBQ content in the bank yet - the Light - Reflection and Refraction and Electricity chapters are fully stocked to hit the target on their own as of this build (including multi-step numerical word-problem CBQs); other chapters will show a lower competency % and a partial total unless pooled with Light/Electricity, until their banks are similarly expanded (see "Adding more chapters, questions, or subjects" below). English papers instead follow the real, fixed 80-mark CBSE (Communicative) board pattern - see "English pattern" below.
3. **Multiple practice sets** - generate several distinct versions (Set A, Set B, Set C) of a paper in one go, each drawing different questions from the bank where possible, so a student can re-practice the same chapters without seeing repeats.
4. **Answer upload** - students can type answers, upload a photo/scan **or PDF** of a single handwritten answer (auto-transcribed via OCR; PDF uploads have their first page converted to an image before transcription), or upload their **whole answer sheet at once** (one or more photos, or a multi-page scanned PDF) - write your answers by hand as in a real exam, number each one ("5.", "Q5"), then upload; the app OCRs and splits it by question number and pre-fills the matching answer boxes for you to review and correct before submitting. If an upload can't be read (blurry scan, unsupported file, no OCR engine installed) or a question can't be found on the sheet, the exact reason is shown instead of a generic "no answer" message.
5. **Automated grading + performance analysis** - rule-based scoring with partial credit, per-question feedback, and a dashboard showing strengths, weaknesses and what to revise.
6. **Persistent attempt history** - every generated paper and graded submission is saved server-side. The Performance dashboard's "Attempt history" list is clickable - selecting a past attempt reopens the exact paper, the student's answers, the score, and per-question feedback, so a paper doesn't have to be re-generated or re-solved from memory to review it later.
7. **Board Prep dashboard** - a standalone revision tracker (`frontend/board-prep.html`) reachable via the "Board Prep ↗" link in the top nav bar (opens in a new tab). It's a separate static page, not part of the React app, so it works even with the backend stopped: marks weightage by unit for all four courses, a chapter-by-chapter revision checklist, an auto-generated study schedule that adapts to your exam date and what's still unchecked, a mock test log with score trends, and a reference list of the previous-year papers/question banks in this folder. Your checked chapters, exam date and mock scores are saved in the browser's `localStorage`, so they survive a page reload - but are local to that specific browser/device, and separate from the main app's own server-saved paper/submission history. The chapter list, unit weightages and paper archive counts are hardcoded near the top of its `<script>` block (`SUBJECTS`, `ARCHIVE`, `PAPERS`) if you want to edit them to match your own folder contents.

## Course toggle

The four small pill buttons at the top left ("Social Science" / "Science" / "Mathematics" / "English") switch which subjects show up in the Chapter Notes dropdown and the Question Paper chapter checklist. Switching course resets any paper/notes currently on screen so content from different courses never gets mixed into one paper. Your last-picked course is remembered (via `localStorage`) for next time you open the app.

## English pattern

Unlike Social Science/Science, English papers don't scale to a chosen total - every English paper is a fixed **80 marks across 4 sections**, matching the real CBSE English (Communicative) board exam structure exactly (cross-checked against an actual 2026 board paper, Series MNL2K SET~4):

- **Section A - Reading Skills (22 marks)**: two unseen passages (12 marks + 10 marks) drawn from a subject-level `reading_bank`, each with a mix of inference-based MCQ, complete-the-sentence, rectify-the-false-statement and short-answer sub-questions - not simple literal recall.
- **Section B - Writing Skills (22 marks)**: one Application (3 marks, ≤50 words), one Factual Description (4 marks, ≤100 words), one Letter to the Editor (7 marks, ~120 words), and one Article (8 marks, ~150 words, with bullet-point "cues" the student must weave in) - always drawn from the `grammar_writing` chapter.
- **Section C - Grammar (10 marks)**: one Cloze gap-fill paragraph with bracketed MCQ options (3 marks), one word-omission Editing exercise in 4-line table format (4 marks), one Jumbled-words-to-sentence question (1 mark), and one dialogue-to-Reported-Speech paragraph completion (2 marks) - also drawn from `grammar_writing`.
- **Section D - Literature Textbook (26 marks)**: two literature extracts (4 marks each = 8 marks, out of the real paper's "answer any 2 of 3" choice), five 2-mark short answers (10 marks, out of "answer any 5 of 6"), and one cross-text Comparative essay (8 marks, ~150 words, drawn from a subject-level `compare_bank` that pairs two literature chapters around a shared theme) - drawn from whichever Fiction/Poetry/Drama chapters you check in the chapter list (if none are selected, all fourteen are pooled together).

Since the app has no "answer any N of M" optional-question UI, every generated paper always includes exactly the number of extracts/short-answers required after that choice (2 extracts, not 3; 5 short-answers, not 6) rather than showing unused optional questions.

The Question Paper screen reflects this: for English it hides the 30/80-marks choice and shows a fixed "80 marks" summary with the 22/22/10/26 breakdown instead, and the chapter checklist only lists the literature chapters (Reading, Writing and Grammar sections are included automatically in every paper). Cloze/Editing/Reported-speech sub-questions reuse the same shared-passage rendering as Reading/Extract questions; `LETTER`, `ARTICLE`, `APPLICATION`, `DESCRIPTION` and `COMPARE` questions are all graded the same rubric/keyword way as any other descriptive question, checking for correct format elements (address, salutation, heading, cues covered, etc.) as rubric points alongside content.

## Cross-check against a real school paper

This was originally built and checked against an actual BGS National Public School Class X Pre-Midterm Social Science practice paper (30 marks, 4 sections: History 8, Geography 8, Political Science 7, Economics 7), which is why the content bank includes Assertion-Reason and case-based (CBQ) question types alongside MCQ/2M/3M/4M/5M/MAP. It was later cross-checked again against a real 2026 CBSE Class 10 Science board paper (Series MNL2K SET~4), which confirmed CBSE's current typology mandate (unchanged since 2023-24, and confirmed for 2026-27): every board paper splits 50% competency-based (case-based + Assertion-Reason), 20% plain MCQ, 30% descriptive. The "board" pattern exposed in the UI is hand-tuned to hit that split exactly at both 30 and 80 marks (see "Practice question papers" above) - though hitting it in practice for any given chapter depends on that chapter's bank actually having enough AR/CBQ content, which for now is only true of the Light - Reflection and Refraction chapter (a `typology` field on every generated paper reports the real achieved split so this is never just assumed). The richer section-wise "school" pattern (matching the BGS paper's exact structure) remains implemented separately in `content_store.generate_school_pattern` and reachable by calling the API directly with `"pattern": "school"` (see below).

## Architecture

- **Backend**: Python standard library only (`http.server` + `sqlite3`) by default. No `pip install` required to run the core app locally.
- **Frontend**: A single-page React app loaded via CDN (React + Babel Standalone) - no `npm install` or build step. Just open `frontend/index.html` in a browser.
- **OCR** (optional, for photographed handwritten answers): `pytesseract` + `Pillow`, plus the `tesseract-ocr` system binary. If not installed, the app still works - uploads are saved but not auto-transcribed, and students can type instead. PDF uploads additionally need a PDF-to-image step: `pymupdf` (pure pip install, preferred) or the `pdftoppm` command from `poppler-utils` as a fallback. If neither is present, a PDF upload is saved but returns a clear "please upload a photo instead" message rather than a silent failure.
- **Database** (optional swap): `backend/db.py` uses local SQLite by default, but transparently switches to a Postgres database (e.g. Supabase) the moment a `DATABASE_URL` environment variable is set - no other code changes needed. This matters when deploying somewhere with an ephemeral filesystem (like Render's free tier) - see `DEPLOY.md`.

This design was chosen so you can run the whole thing with nothing more than Python 3 and a browser already on your machine.

## Running it

### 1. Start the backend

```bash
cd backend
python3 server.py          # runs on http://localhost:8000 by default
# or: python3 server.py 9000   to use a different port
```

A SQLite database file (`backend/app.db`) is created automatically on first run - this is where question papers, student submissions and grading results are stored. (Deploying to a host with a non-persistent filesystem? Set `DATABASE_URL` to a Postgres connection string instead and this switches automatically - see `DEPLOY.md`.)

### 2. (Optional) Enable OCR for photographed/PDF answers

```bash
pip install pytesseract pillow pymupdf
```

You also need the Tesseract OCR engine installed on your system:
- macOS: `brew install tesseract`
- Ubuntu/Debian: `sudo apt-get install tesseract-ocr`
- Windows: install from https://github.com/UB-Mannheim/tesseract/wiki

`pymupdf` is only needed so a student can upload a PDF instead of a photo (its first page is converted to an image before OCR runs). Without it, PDF uploads are still saved but return a clear message asking for a photo/scan instead.

Check `http://localhost:8000/api/ocr-status` to confirm OCR is active.

### 3. Open the app

Just open `frontend/index.html` directly in your browser (double-click it, or `open frontend/index.html` on macOS). It talks to the backend at `http://localhost:8000` by default.

If you run the backend on a different port, edit the one line near the top of `frontend/index.html`:
```html
<script>window.API_BASE = "http://localhost:8000";</script>
```

### Troubleshooting a blank page

If the page loads blank when double-clicked, it's almost always one of these:

- **No internet on this machine right now.** React/Babel load from a CDN at runtime - if you're offline, the page will be blank. Reconnect and reload.
- **Backend isn't running.** Start it first (`python3 backend/server.py`), then reload the page. Open your browser's dev tools (F12) → Console tab to see the actual error if this doesn't fix it.
- **Stricter browser/corporate settings blocking `file://` pages.** If it's still blank with the backend running and internet on, serve the frontend folder instead of opening the file directly:
  ```bash
  cd frontend
  python3 -m http.server 5500
  ```
  then visit `http://localhost:5500` in your browser.

### "Error 153 / Video player configuration error" on Chapter Notes videos

This happens when `index.html` is opened directly from disk (`file://...`) rather than served over `http://`. YouTube's embedded player rejects the "null" origin that `file://` pages send, so the inline video fails to load. It's not a broken or region-locked video.

The app detects this automatically and swaps the inline player for a plain "Open on YouTube" link instead, which always works. If you'd rather have videos play inline in the notes page, serve the frontend folder as described above (`python3 -m http.server 5500`) instead of double-clicking `index.html`.

## What's included out of the box

The content bank currently covers 8 Social Science chapters (2 per subject, across 4 subjects), 12 Science chapters (4 per subject, across 3 subjects), 4 Mathematics chapters, and a full English (Communicative) course - 14 Literature Reader chapters, a Grammar & Writing Skills chapter, and a reading passage bank - all with full notes and CBSE-style question banks:

**Social Science**
- **History**: The Rise of Nationalism in Europe, Nationalism in India
- **Geography**: Resources and Development, Agriculture
- **Civics**: Power Sharing, Federalism
- **Economics**: Development, Sectors of the Indian Economy

All 8 chapters now carry Assertion-Reason (AR) and Case-Based Questions (CBQ) on top of their baseline banks - Civics already had these; History, Geography and Economics each gained 1 CBQ + 2 AR per chapter. Two of the new CBQs (climate-smart agriculture/millets for Agriculture, and population dynamics/poverty for Development) were adapted directly from real CBSE sample-paper case studies (sourced from the FAO and UNFPA respectively in the original), independently re-verified; the rest (1848 Frankfurt Parliament for Nationalism in Europe, print culture/Bharat Mata for Nationalism in India, land degradation for Resources and Development, disguised unemployment for Sectors of the Indian Economy) are original case studies built on standard NCERT content, since no directly-adaptable real case study was found for those exact topics in the uploaded material. An 80-mark paper pooling all 8 chapters now reaches the mid-to-high 70s out of 80 (up from about 52/80 before this pass), with the small remaining shortfall coming from how the pre-existing Civics CBQs are structured rather than anything added in this pass.

**Science**
- **Physics**: Light - Reflection and Refraction, Electricity, Human Eye and Colourful World, Magnetic Effects of Electric Current, Sources of Energy
- **Chemistry**: Chemical Reactions and Equations, Acids Bases and Salts, Metals and Non-metals, Carbon and its Compounds
- **Biology**: Life Processes, Control and Coordination, How do Organisms Reproduce?, Heredity, Our Environment

Light - Reflection and Refraction and Electricity carry the deepest bank of Assertion-Reason (AR) and Case-Based Questions (CBQ) - including multi-step numerical/word-problem style CBQs (lens combinations, mirror magnification, circuit calculations) matching real board paper Q38-style questions. All other pre-existing Science chapters carry 1 CBQ + 2 AR each on top of their baseline MCQ/2M/3M/5M bank, so an 80-mark paper hits CBSE's exact 50/20/30 competency/MCQ/descriptive typology split with zero warnings, whether built from any single chapter's pool, a mix, or all 14 chapters together.

A full pass through `ScienceX.pdf` (the official CBSE Science case-study Question Bank) turned up two more usable real case studies that hadn't been mined yet: a manganese dioxide + hydrochloric acid redox reaction (added as a second CBQ to Chemical Reactions and Equations) and a Yamuna river detergent-pollution/pH case study (added as a second CBQ to Acids Bases and Salts). The same file also had several case studies (food chains, food webs, biosphere/ecosystem, waste segregation) that didn't map to any existing chapter - these became a brand new **Our Environment** Biology chapter (energy flow, the 10% law, decomposers, biodegradable/non-biodegradable waste), plus a brand new **Sources of Energy** Physics chapter built around the file's biogas case studies (anaerobic digestion, why biogas beats burning dung cakes directly). A couple of food-web sub-questions that depended on reading values off a diagram not present in the extracted text were skipped rather than guessed at. Every fact and figure used from real source material was independently re-verified rather than copied as-is.

**Mathematics**
- Quadratic Equations, Arithmetic Progressions, Triangles, Introduction to Trigonometry, Real Numbers, Polynomials, Probability, Pair of Linear Equations in Two Variables, Coordinate Geometry, Circles, Areas Related to Circles, Surface Areas and Volumes, Some Applications of Trigonometry

The original 4 chapters (Quadratic Equations, Arithmetic Progressions, Triangles, Introduction to Trigonometry) each have full board-style notes plus an 18 MCQ / 7x2M / 7x3M / 3x5M baseline bank, and carry Case-Based (CBQ) and Assertion-Reason (AR) questions adapted from CBSE's own official Class X Mathematics Question Bank (`MathsX.pdf`, uploaded to the reference folder) - car-speed/travel-time and boat upstream/downstream problems for Quadratic Equations; factory production, race-practice and loan-instalment problems for Arithmetic Progressions; a shadow-and-similar-triangles height problem for Triangles. Every number in these adapted case studies was independently re-derived and checked against the source, since a couple of the source's own answer keys contained transcription errors (including two cases where the source's own printed answer options didn't match its stated correct answer at all - a digit-swap in a distance calculation, and a "corresponding angle" label used where "angle of depression" was clearly meant).

A full pass through the rest of `MathsX.pdf` (50 pages, 25 real CBSE case studies in total) found genuine, previously-unused material for 9 more chapters, all of which have now been added: **Real Numbers** (HCF/LCM seminar-room case study), **Polynomials** (parabolic-arch discriminant case study), **Probability** (playing-cards and two-dice board-game case studies), **Pair of Linear Equations in Two Variables** (exam true/false-scoring case study, city auto-fare case study), **Coordinate Geometry** (sports-day flag-positions case study), **Circles** (incircle-of-a-triangle logo-design case study), **Areas Related to Circles** (Pookalam flower-bed case study, brooch-design case study), **Surface Areas and Volumes** (Rubik's-cube-and-ice-cream case study, Great Stupa at Sanchi case study), and **Some Applications of Trigonometry** (India Gate heights-and-distances case study - this is a separate NCERT chapter from Introduction to Trigonometry, covering angle-of-elevation/depression word problems). Each new chapter has full board-style notes plus a baseline MCQ/2M/3M/5M bank, AR questions, and one or more real, independently-verified CBQs. A handful of source case studies were deliberately left out because they depended on a diagram not present in the extracted text (a factor-tree diagram, a Ferris-wheel angle diagram, a garden-plot layout) or turned out to be geometrically inconsistent as stated (a satellite/two-mountains trigonometry problem) - rather than guess at missing figures or force an inconsistent scenario to "work," those were skipped.

All 13 Maths chapters are now live. A 30-mark or 80-mark paper pooling all of them hits CBSE's exact 50/20/30 typology split with zero warnings.

**English (Communicative course - Interact in English: Literature Reader)**
- **Fiction**: Two Gentlemen of Verona, Mrs Packletide's Tiger, The Letter, A Shady Plot, Patol Babu Film Star, Virtually True
- **Poetry**: The Frog and the Nightingale, Not Marble, Nor the Gilded Monuments, Mirror, Ozymandias, The Rime of the Ancient Mariner, Snake
- **Drama**: The Dear Departed, Julius Caesar
- **Grammar & Writing Skills**: Application or Email, Factual Description, Letter to the Editor, Article (with cues), Cloze gap-fill, word-omission Editing, Jumbled sentences, Reported Speech
- **Reading bank**: 6 unseen comprehension passages (subject-level, not tied to a chapter) for Section A - 3 at 12 marks (P1) and 3 at 10 marks (P2)
- **Compare bank**: 6 cross-text comparative essay prompts (subject-level), each pairing two literature chapters around a shared theme, for Section D

This content was checked against three real, verified CBSE Communicative board papers (Series MNL2K SET~4 / 2026, Series CDBA SET-4, Series EFGH/S Set-4) uploaded to the reference folder. Two findings came out of that check: first, the chapter/text coverage lines up closely with what these papers actually examine (The Frog and the Nightingale, The Dear Departed, Patol Babu, The Snake, The Letter, A Shady Plot, Julius Caesar and the Not Marble/Ozymandias comparison all appeared in the real extracts and questions, confirming the existing chapter selection is on target). Second, the Section B Q3 slot (3 marks, 50 words) is set by real papers as either an "application" or an "email" depending on the year/series - two of the three real papers used the email format (From/To/Cc/Date/Subject template) - so the Application pool now includes 2 email-format items alongside the 3 original application-format ones, and either can be drawn when a paper is generated. (One other reference file in the folder, `EnglishX.pdf`, turned out to be a Question Bank for the First Flight/Footprints without Feet textbooks used in CBSE's Language & Literature course, not the Communicative course this app targets - its content wasn't usable here for that reason.)

Note this app targets the CBSE **Communicative** English course (Interact in English - Literature Reader), not the more common Language & Literature course (First Flight / Footprints without Feet) - check which course your school follows before using it for English practice.

Every Mathematics and Science chapter - all 13 Maths chapters and all 14 Science chapters (5 Physics, 4 Chemistry, 5 Biology) - now carries the full baseline bank of 18 MCQ, 7x2M, 7x3M and 3x5M questions, plus AR and one or more CBQs on top. This includes the chapters added later in this project's life (Real Numbers, Polynomials, Probability, Linear Equations in Two Variables, Coordinate Geometry, Circles, Areas Related to Circles, Surface Areas and Volumes, Applications of Trigonometry, Our Environment, Sources of Energy) and two older chapters that had been left short in an earlier pass (How do Organisms Reproduce?, Heredity, Metals and Non-metals, Carbon and its Compounds) - all were brought up to the same depth so that a single chapter, on its own, can satisfy any custom-mode request up to the full 18/7/7/3 baseline (e.g. "5 questions of 3 marks" or "3 questions of 5 marks" from one chapter alone) without a shortfall warning. Every Social Science chapter carries 18 MCQ/7x2M/7x3M/3x5M plus AR/CBQ/MAP too, so this depth is now uniform across the whole content bank. Even so, a single chapter can only ever provide up to 3 distinct 5M questions (matching how real board papers structure long-answer questions per chapter) - requesting more than 3 5M questions from one chapter will still show a shortfall warning; pool 2+ chapters together to go beyond that. Since Science chapters have no map-based questions, an 80-mark paper built only from Science chapters will show a "0 of 1 MAP question available" warning and total 78 marks instead of 80 - this is expected; add Social Science chapters too, or accept the slightly lower total. Note also that a handful of question `id`s were, from an early pass in this project, coincidentally reused across two unrelated subjects (Chemistry's `chemical_reactions_equations`/`acids_bases_salts` chapters vs Civics' `power_sharing`/`federalism` chapters, both originally using a "c1_"/"c2_" prefix scheme) - since papers are never built by mixing Chemistry and Civics content together, this has no practical effect on paper generation or grading, but it's worth knowing about if you ever script something that expects every question `id` in the content bank to be globally unique.

Each of the 14 English literature chapters has 1 EXTRACT (4 sub-questions) + 3x2M + 3x3M + 2x5M (only EXTRACT and 2M are drawn into generated papers, per the real board pattern's Section D - the 3M/5M questions remain in the bank for reference/self-study but aren't used by the generator). With this many chapters pooled into Section D, even a 3-set run picking just 2-3 chapters stays fully fresh; selecting several chapters (or leaving the selection empty, which pools all 14) keeps every set's literature extract and short-answer questions unique for many more than 3 sets.

### v34: mining the "Additional Practice Question" papers and NCERT Exemplar

This pass verified, by phrase-searching the content bank, that the per-subject "Practice Papers"/"Practice questions" folders (the real, full 80-mark CBSE "Additional Practice Questions" papers 1 and 2, each with an official marking scheme, for Science, Maths and Social Science) had never actually been mined into the content bank - only the official Question Bank PDFs (`ScienceX.pdf`, `MathsX.pdf`, `EnglishX.pdf`) had been used previously. Both papers, plus their marking schemes, were extracted and every usable question (one per topic/chapter it genuinely belongs to) was independently re-verified and converted into the app's schema - MCQ/AR for 1-mark items, 2M/3M/5M with a hand-written rubric and model answer for descriptive items, CBQ with nested sub-questions for case studies:

- **Science**: 60 new questions across all 14 chapters, split roughly 4/chapter, from `Science-PQ`/`Science-PQMS` and `Science-PQ2`/`Science-PQMS2`. One genuine error in the official marking scheme was caught and corrected rather than copied: `Science-PQMS.pdf`'s answer for the sickle-cell-anaemia pedigree question (Q38) discussed X-linked colour blindness - content from an unrelated question, evidently pasted in by mistake - so the pedigree analysis for that CBQ (`b4_pq_cbq1`, Heredity) was independently reworked from the actual autosomal-recessive genetics of the question as printed.
- **Maths**: 51 new questions across all 13 chapters, from `Mathematics-PQ`/`Mathematics-PQMS` and (after discovering CBSE's own files were unusually named, with `Mathematics-PQ2.pdf` actually containing the marking scheme and `Mathematics-PQMS2.pdf` the real question paper) the second paper too. Many source questions depended on a printed diagram not present in the extracted text (unlabelled circles, coordinate-plane graphs, a weight-frequency table image) - those were left out rather than guessed at; only questions answerable purely from the printed text, or from a standard, unambiguous configuration named in the question itself, were kept.
- **Social Science**: 54 new questions across all 8 chapters, from `SS-PQ`/`SS-PQMS` and `SS-PQ2`/`SS-PQMS2`. This app's Social Science bank only covers 8 of the full ~19-chapter syllabus (2 per subject), so many source questions belonging to chapters outside that set (Political Parties, Money and Credit, Print Culture, Globalisation, Consumer Rights, Forest and Wildlife) were skipped rather than force-fit into an unrelated chapter. A second error was caught: `SS-PQMS2.pdf`'s answer key for its map-based question (Q37) answered a completely different map question (Amritsar/Madras) - actually the answer key for the *other* paper's Q37, mistakenly reused - so Paper 2's actual Q37 (Bardoli Satyagraha / the December 1920 Nagpur INC session) was answered independently instead.
- **NCERT Exemplar (Science)**: 36 new questions, from the `Science/Exempler` folder's chapter-wise Exemplar Problem booklets. Of the 18 files supplied, 14 map directly to this app's existing Science chapters (confirmed by content, not just filename); `jeep105` (Periodic Classification of Elements) and `jeep116` (Management of Natural Resources) are off the current rationalised CBSE syllabus with no corresponding chapter here, and `jeep117`/`jeep118` are full sample papers rather than per-chapter content - none of these four were used. The Exemplar itself doesn't use the Assertion-Reason format or nested case-study passages (that's a later CBSE board-exam typology), so each new item is composed from a genuine Exemplar-tested concept, independently phrased and verified, rather than copied verbatim - targeted specifically at the 12 chapters previously thinnest on AR/CBQ (everything except Light - Reflection and Refraction and Electricity, which already had the deepest banks), 3 new items per chapter (2 AR + 1 CBQ/descriptive).

All four merges were validated for JSON well-formedness and id uniqueness, and re-tested end to end through `content_store.generate_board_pattern()` and `grading.py` afterward - board-pattern papers still generate at the correct mark totals for every subject and pull in the new content, and both MCQ/AR and rubric-based descriptive grading work correctly on the newly added items. The content bank now totals **1,744 questions** across all 9 subjects (up from roughly 1,343 before this pass).

### v35: English grammar curriculum fix + mining the official SS board-exam papers

Two more content-quality fixes, both directly requested after review:

- **English grammar coverage**: the `grammar_writing` chapter's notes previously covered only 6 topics (Tenses, Modals, Determiners, Subject-Verb Agreement, Reported Speech, Editing), against the real CBSE Class 10 English Workbook's 14-unit grammar syllabus (see `learncbse.in`'s English Workbook Class 10 Solutions index: Determiners, Tenses, Subject-Verb Agreement, Non-Finites, Relatives, Connectors, Conditionals, Comparison, Avoiding Repetition, Nominalisation, Modals: Expressing Attitudes, Active and Passive, Reported Speech, Prepositions). The notes were rewritten to cover all 14 units (plus the 3 exam-technique sections - Editing, Letter format, Article/Speech/Story format - kept separately since they aren't Workbook grammar units), and 8 new CLOZE/EDITING/JUMBLED/REPORTED practice questions were added that specifically test the 9 previously-uncovered points (non-finites, relative clauses, connectors, conditionals, comparison, avoiding repetition, active-passive, prepositions - nominalisation is taught with worked examples in the notes but isn't well-suited to the app's function-word-omission EDITING format, so it wasn't forced into a scored question). All new items were independently verified against standard English grammar rules and re-tested through `_expand_item()`/`grading.py`.
- **Social Science board-exam papers (2023-2026)**: the SS folder also contains 7 zip archives of full official CBSE board papers (Q.P. Code 32/x/x, English-medium, spanning 2023-2026) - a larger and more authoritative source than the earlier Additional Practice Question papers. Of the 7, 5 were text-extractable with `pdftotext` (2023 main set, 2023 compartment set, 2025, 2025 sample, 2026); 2 (2024, and a second 2026 set) were scanned/image-based PDFs with no embedded text layer and were skipped rather than OCR'd. These official papers do **not** ship with marking schemes, so unlike the earlier PQ merge, every answer and model answer below was independently composed and verified against standard NCERT Class 10 Social Science content, not copied from any key. Any question that was diagram/map-dependent, had incomplete/garbled source text, or belonged to one of the ~11 NCERT chapters this app doesn't cover (Political Parties, Money and Credit, Print Culture, Globalisation, Minerals and Energy Resources, Water Resources, Manufacturing Industries, Forest and Wildlife, Democracy and Diversity, Gender/Religion/Caste, Outcomes of Democracy) was skipped rather than force-fit. 32 new questions were added across all 8 chapters (7 to Rise of Nationalism in Europe, 3 CBQs to Nationalism in India, 4 to Agriculture, 5 to Power Sharing, 2 CBQs to Federalism, 6 to Development, 5 to Sectors of the Indian Economy). One answer required correcting my own first instinct rather than the source: "which region became part of unified Italy in 1866" is Venetia (ceded after the Austro-Prussian War), not Sardinia-Piedmont, which was already the founding core state from 1861 - caught by checking the actual unification timeline before writing in the answer.

Both fixes were validated for JSON well-formedness and id uniqueness, and re-tested through `content_store.generate_english_pattern()` / `generate_board_pattern()` and `grading.py` - the new items are reachable by paper generation and grade correctly for both objective (MCQ) and rubric-based descriptive/CBQ types. The content bank now totals **1,784 questions** across all 9 subjects.

### v36: made "Grammar is always included" visible in the paper-generator UI

A user reported not being able to find "Grammar" to select when generating an English practice paper. This wasn't a missing feature - `generate_english_pattern()` in `content_store.py` always pulls Section B (Writing) and Section C (Grammar) from the `grammar_writing` chapter regardless of which chapters are selected, so the frontend's chapter checklist (`frontend/index.html`) deliberately filters `grammar_writing` out of the selectable list, since ticking it wouldn't do anything - Section D (Literature) is the only part that's actually chapter-selectable. That intent was previously only explained in a small muted paragraph above the checklist, easy to miss. Added a visible, checked-and-disabled "Grammar & Writing Skills (always included)" row directly inside the English checklist itself, so it's obvious at the point of confusion rather than relying on someone reading the helper text first. Verified by starting the backend and frontend locally and confirming via `curl` that the served HTML contains the new row and that `/api/subjects` still returns `grammar_writing` as the first English chapter (used for notes/study elsewhere, just not paper-generation chapter selection).

### v37: fixed the stale English chapter list on the Board Prep page

Follow-up to v36: the user pointed out that `frontend/board-prep.html` (the separate revision-tracker/study-dashboard page linked into the app's nav) also showed the wrong English chapters. This turned out to be a different, more basic bug than the v36 one - `board-prep.html` doesn't call the app's API at all; its `SUBJECTS` array (used for the revision checklist, marks-weightage chart and mock-test log) hardcodes chapter names directly in the page, and its English entry had 20 chapters lifted from "First Flight"/"Footprints without Feet" (the NCERT Language & Literature course) - none of which exist in this app's actual content bank. The app's real English chapters (`backend/content/english.json`) are the CBSE Communicative course's "Interact in English" reader plus a Grammar & Writing Skills chapter - a completely different 15-chapter set. Replaced the hardcoded list with the correct 15 chapters (Grammar & Writing Skills under the existing "Writing & Grammar" unit, plus 6 Fiction/6 Poetry/2 Drama chapters grouped to match), keeping the same `unit`/`group` structure the revision-tracker code already expects so the marks-weightage chart, progress checklist and mock-log dropdown all continue to work unchanged. Verified with `node --check` on the extracted script (syntax) and by serving the page locally and confirming the correct chapter titles appear and "First Flight" no longer does.

### v38: upload a whole handwritten answer sheet instead of typing every answer

The user asked for real exam-style writing practice: write answers out by hand on paper, then upload a photo/scan instead of typing into every box. Per-question photo upload already existed (`backend/ocr.py`'s `save_and_extract_text()`, wired into `POST /api/papers/{id}/submit` via an `image_base64` field per answer) but required one photo per question - not "upload my whole answer sheet at once."

Added a whole-sheet flow, built to keep a human review step before grading since handwriting OCR is never fully reliable:

- **`backend/ocr.py`**: added `extract_sheet_pages()` (accepts one or more photos and/or multi-page scanned PDFs - up to 15 pages - OCRs every page in upload order and returns a combined transcript) and `split_answer_sheet()`, which splits that transcript at question-number markers ("5.", "Q5", "Question 5:") the student is expected to write before each answer, same as in a real answer booklet. Only markers whose number matches an actual question on that paper are treated as split points, so a stray number inside the answer text itself (a date, a distance, "in 1857...") can't be mistaken for a new question boundary. Refactored the existing single-image OCR path (`_ocr_image_bytes`) and single-page PDF rasterisation into shared helpers reused by both the old per-question flow and the new whole-sheet flow, and added multi-page PDF rasterisation (`_pdf_all_pages_to_png_bytes`) alongside the existing single-page version.
- **`backend/server.py`**: new `POST /api/papers/{id}/parse-sheet` endpoint - takes `{"pages": [{"data": base64, "name": ...}]}`, OCRs and splits them against that paper's actual (non-MCQ/AR) questions in display order, and returns the per-question draft text plus which questions matched, which didn't, and any unrecognised marker numbers, without touching the database or scoring anything yet.
- **`frontend/index.html`**: `AttemptPaperView` gained an upload box ("Prefer to write your answers on paper?") above the question list, with a multi-file picker and a "Read my answer sheet" button. On success it auto-fills the matching answer boxes below (tagged with a small "📄 Auto-filled from your uploaded answer sheet - check it's correct" note) and reports how many of the paper's written questions were found versus not found. The student still reviews and can edit every auto-filled box, and still clicks the same "Submit Answers for Grading" button as before - grading itself (`/api/papers/{id}/submit`) is completely unchanged. MCQ/Assertion-Reason questions are still answered via the existing radio buttons, since those are quick to select and don't benefit from handwriting OCR.

Verified end to end against the live server (not just unit-level): rendered synthetic "handwritten" answer images with PIL, uploaded them through the real `/parse-sheet` endpoint, confirmed the transcript was split into the correct per-question segments (including correctly ignoring stray numbers embedded inside the answer text, and correctly keeping multi-line/multi-paragraph answers intact), then fed those segments through the real `/submit` endpoint and confirmed grading scores an OCR'd model answer identically (2/2) to typing the same text directly - proving the new upload path and the existing typed path are graded exactly the same way.

### v39: fixed the Science concept videos - most were pitched above Class 10

A user reported that the per-chapter concept videos in Physics/Chemistry/Biology "are not for Class 10 - more detailed, like Class 11 or 12." This was checked directly rather than assumed: several of the video titles written into the content bank in an earlier pass (`video_id`/`video_title` fields on `notes.sections` entries, surfaced by `content_store.search_topics()` for the "Ask a Topic" feature) turned out, on actually opening the real videos in a browser, to be sourced from Khan Academy's general/global library rather than Khan Academy India's grade-tagged content - e.g. the Chemical Reactions video for "Oxidation and Reduction" was an AP-Chemistry-level treatment of the conventional definition, well past what CBSE Class 10 needs. This was a gap in how those videos were originally sourced (titles were written without ever opening the actual video to confirm level/content), not a prompting problem on the user's side.

Rather than fix videos one at a time, all 110 videos across the 14 Science chapters were re-sourced from a single, explicitly Class-10-CBSE-tagged playlist per subject, all from the same channel (Magnet Brains, whose "Class 10 <Subject> | Complete CBSE Course" playlists are explicitly targeted at the CBSE Class 10 syllabus chapter-by-chapter):

- **Physics** (44 videos, 5 chapters): "Class 10 Physics (New Session 2023-24) | Complete CBSE Course" (169 videos, playlist `PLVLoWQFkZbhXAipqg8dmzLQOED1uxgUTx`), covering Light - Reflection and Refraction, Electricity, Human Eye and the Colourful World, Magnetic Effects of Electric Current and Sources of Energy in that order.
- **Chemistry** (29 videos, 4 chapters): "Class 10 Chemistry (New Session 2023-24) | Complete CBSE Course" (149 videos, playlist `PLVLoWQFkZbhVbIi9ux7sKREnFo3jrrKzQ`), covering Chemical Reactions and Equations, Acids Bases and Salts, Metals and Non-Metals, Carbon and its Compounds.
- **Biology** (37 videos, 5 chapters): "Class 10 Biology (Shipra Mam) | Complete CBSE Course" (137 videos, playlist `PLVLoWQFkZbhUmaeiHa7xKTQ3ByL6XujcQ`), covering Life Processes, Control and Coordination, How Do Organisms Reproduce, Heredity, Our Environment.

Each chapter's topic sections were individually matched to the closest-matching video in that chapter's playlist segment (verified by reading the actual ordered playlist - id and title pulled directly from the live YouTube page, not guessed), rather than swapped in bulk; where the playlist didn't split a topic as finely as this app's notes do (e.g. "why biogas is a good fuel" and "conditions needed for biogas formation" are one combined video, not two), the same video is deliberately reused across those sections rather than force-matched to something less relevant. `sources_of_energy` and `our_environment` were already sourced from Magnet Brains in the earlier pass and were checked against these same playlists rather than assumed correct - `our_environment`'s 6 of 7 videos already matched exactly (confirming they were fine); `sources_of_energy` needed 2 of 11 videos swapped for channel-consistency (both had been pointing to a different channel, Avanti Gurukul).

Validated all three content JSON files for well-formedness and confirmed every section has both `video_id` and `video_title` populated, then re-tested through `content_store.search_topics()` and a live `curl` round trip against `/api/topic-search` and `/api/notes` to confirm the new video data actually reaches the API responses correctly.

### v40: an "Answer key" view, plus a proactive warning when whole-sheet OCR isn't set up

Two related fixes after a user tried the v38 whole-answer-sheet upload and got an "OCR isn't available on this server" error:

- **The upload box is now honest about whether it'll work.** Previously the "Prefer to write your answers on paper?" upload box always showed, so a student/parent could go photograph a whole answer sheet, upload it, and only then discover OCR wasn't installed. `AttemptPaperView` now calls the existing `GET /api/ocr-status` endpoint on load and shows one of two boxes instead of guessing: if OCR is available, the upload box as before; if not, a clear explanation of what's missing and the exact install command, with typing/per-question upload offered as the fallback that works either way. (If the status check itself fails for any reason, the feature fails open rather than silently hiding the upload box.)
- **A new "Answer key" view**, for a parent or teacher who'd rather mark a handwritten sheet by hand than trust OCR at all. Prompted directly by feedback that Tesseract (the OCR engine this app can use) is genuinely weak at real handwriting, and that what was actually wanted was simpler: see the correct answers for a generated paper, on demand, and mark the physical sheet manually - no OCR, no auto-grading involved. Added `GET /api/papers/{id}/answer-key`, which returns a paper's questions un-stripped (correct MCQ/AR option, rubric points with mark weights, model answer, explanation - the same fields `/submit` already used internally for grading, just available up front), and a new `AnswerKeyView` component reachable via an "Answer key" / "View answer key" button from My Papers, the set picker, and the attempt screen itself, with a Print button (`window.print()`, with a `@media print` rule added to `styles.css` to hide the top nav and page chrome so only the questions print).

Verified with a live server round trip: generated a paper via `/api/papers/generate`, confirmed the normal `/api/papers/{id}` response still has answer keys stripped (unchanged, for the student-facing attempt view), then confirmed `/api/papers/{id}/answer-key` returns the same paper with `answer_index`/`explanation` present on MCQ/AR questions and `rubric`/`model_answer` present on descriptive ones. The frontend script block was checked structurally (balanced braces/parens/brackets across the whole file, and exactly one definition of each new/modified component) since it's JSX transformed by Babel in-browser rather than plain JS `node --check` can validate directly.

## Paper generation API

`POST /api/papers/generate` accepts:
- `chapters`: list of chapter ids (required for Social Science/Science; optional for English - selects which literature chapters feed Section D, and falls back to pooling all of them if omitted/empty)
- `pattern`: `"board"` (default - mixed MCQ/AR/CBQ/2M/3M/5M paper hand-tuned to CBSE's 50/20/30 typology split, scaled to `total_marks`), `"school"` (section-wise, matches the real BGS paper exactly - see above), or `"english"` (fixed 4-section, 80-mark CBSE (Communicative) board pattern - see "English pattern" above)
- `total_marks`: for `"board"`, use `30` or `80` to get the exact hand-tuned combinations described above (any other number falls back to a proportional approximation); ignored for `"school"` and `"english"` (English is always exactly 80 marks)
- `num_sets`: how many distinct sets to generate at once (1-10; the UI caps the input at 3 since that's what the current content depth comfortably supports)

It returns `{"papers": [...]}`, one entry per generated set, each already saved server-side so it can be fetched again later via `GET /api/papers/<id>`. Every paper (for every pattern) also carries a `typology` object - `{competency_marks, competency_pct, mcq_marks, mcq_pct, descriptive_marks, descriptive_pct, target}` - computed by `content_store.typology_breakdown()`, so the actual CBSE typology split of any generated paper can always be checked rather than assumed. The frontend renders this as a small badge on the set-picker cards and a fuller breakdown at the top of the attempt-paper screen.

## Adding more chapters, questions, or subjects

No code changes needed. Open the relevant file in `backend/content/` (`history.json`, `geography.json`, `civics.json`, `economics.json`, `physics.json`, `chemistry.json`, `biology.json`, `english.json`) and append a new chapter object to the `"chapters"` array, or add more questions to an existing chapter's `"questions"` array (more questions per type = more unique practice sets before repeats kick in).

To add a brand-new subject (or even a fourth course beyond Social Science/Science/English), create a new `backend/content/<subject>.json` file with the same top-level shape as the existing files:

```json
{
  "subject": "unique_subject_key",
  "subject_label": "Subject Display Name",
  "subject_group": "science",
  "subject_group_label": "Science",
  "chapters": [ ... ]
}
```

`subject_group` controls which course toggle ("Social Science" / "Science" / "English") the subject appears under in the UI. Using a new `subject_group` value automatically makes it available to filter by - the course toggle buttons are currently hardcoded in `frontend/index.html` (`const COURSES = [...]`), so add a pill there if you introduce a new group. (English's own generator (`generate_english_pattern`) is also hardcoded to look for a subject with key `"english"` specifically - a brand-new course with its own fixed exam structure, rather than the flexible board/school patterns, would need a similar dedicated generator function.)

```json
{
  "id": "unique_chapter_id",
  "title": "Chapter Title",
  "notes": {
    "overview": "...",
    "sections": [
      {"title": "1. Topic name", "content": "A full explanatory paragraph with dates, names and cause-and-effect detail...",
       "keywords": ["board keyword one", "board keyword two"]}
    ],
    "key_points": ["...", "..."],
    "key_terms": {"Term": "Definition"},
    "important_facts": ["..."],
    "exam_tips": ["..."]
  },
  "questions": [
    {"id": "unique_q_id", "type": "MCQ", "marks": 1, "topic": "...", "question": "...",
     "options": ["A", "B", "C", "D"], "answer_index": 0, "explanation": "..."},

    {"id": "unique_q_id2", "type": "AR", "marks": 1, "topic": "...",
     "question": "Assertion (A): ...\nReason (R): ...",
     "options": [
        "Both A and R are true and R is the correct explanation of A.",
        "Both A and R are true but R is not the correct explanation of A.",
        "A is true but R is false.",
        "A is false but R is true."
     ], "answer_index": 0, "explanation": "..."},

    {"id": "unique_q_id3", "type": "2M", "marks": 2, "topic": "...", "question": "...",
     "rubric": [{"point": "...", "keywords": ["...", "..."], "weight": 1}],
     "model_answer": "..."},

    {"id": "unique_q_id4", "type": "CBQ", "marks": 2, "topic": "...",
     "passage": "A short case-study passage...",
     "subquestions": [
        {"id": "unique_q_id4_a", "question": "...", "marks": 1,
         "rubric": [{"point": "...", "keywords": ["..."], "weight": 1}], "model_answer": "..."},
        {"id": "unique_q_id4_b", "question": "...", "marks": 1,
         "rubric": [{"point": "...", "keywords": ["..."], "weight": 1}], "model_answer": "..."}
     ]}
  ]
}
```

`type` can be `MCQ`, `AR` (Assertion-Reason - structured just like MCQ with 4 fixed options), `2M`/`3M`/`4M`/`5M` (descriptive, by marks), `CBQ` (case-based passage with sub-questions) or `MAP` (same shape as CBQ, used for location-identification questions). For descriptive questions and CBQ/MAP sub-questions, the `rubric` list defines what the grading engine checks for - each point has a weight (marks) and a list of keywords/synonyms that count as covering that point.

The `notes.sections` list is what the Chapter Notes page renders (falls back to the shorter `key_points` bullets if a chapter has no `sections`). Each section should read like a mini board-answer: a full paragraph with specific dates, names and cause-and-effect reasoning, not just a one-line bullet - see any of the 8 existing chapters for the target depth and tone.

The **school pattern** generator (`content_store.SCHOOL_TEMPLATE`) pulls a fixed count of each type per subject (e.g. history always pulls 2 MCQ + 1 2M + 1 4M). If you add a 5th chapter to a subject, it automatically gets pooled in as more source variety for those slots - no template changes needed.

## How grading works

- **MCQ / Assertion-Reason**: exact match against the answer key.
- **Descriptive answers (2M/3M/4M/5M), case-based/map-based sub-questions, and English's READING/EXTRACT/LETTER/ARTICLE questions**: the submitted text (typed, or OCR-extracted from an uploaded image) is checked against each rubric point's keywords, with light fuzzy matching to tolerate small misspellings. Partial credit is awarded proportionally, capped at the question's full marks, and rounded to the nearest 0.5. This is fully deterministic and offline (no external AI calls), and every score comes with an explanation of which points were covered and which were missed, plus the model answer. For LETTER/ARTICLE, rubric points include format elements (e.g. correct salutation, heading, closing) alongside content, so following the expected format is itself worth marks.
- **Question-wise breakdown shows the student's own answer.** Every graded result includes the exact text the student typed (or the OCR-extracted text from an uploaded photo/PDF), or the option they selected for MCQ/AR - shown in a "Your answer" box above the feedback, so a teacher/parent can see what was actually written next to the marking and correct any grading mistakes. Unanswered questions are labelled "Not answered". This works both right after submitting and later, from Performance analysis -> a past submission, since the answer is stored as part of the graded result. Note: submissions made before this feature was added won't have it (grading wasn't storing the raw answer text yet) - only new submissions from v32 onward will show it.

## Performance analysis

`GET /api/performance?student=<name>` aggregates every submission a student has made and reports:
- Overall percentage and marks scored
- Breakdown by question type (MCQ / AR / 2M / 3M / 4M / 5M / CBQ / MAP)
- Breakdown by chapter and by topic
- Strengths (topics >= 75%), areas needing practice (50-75%), and weaknesses (< 50%)
- Actionable recommendations (e.g. "revise these topics", "your long-answer structure needs work")
- Full attempt history

## Ask a Topic

A student who just wants to understand one specific topic doesn't have to browse chapter-by-chapter to find it. The **"Ask a Topic"** tab is a free-text prompt box - type a topic name or a whole question ("reflection of light", "why does a convex mirror always give a smaller image?") and it returns the matching Chapter Notes section (content + board keywords) plus that topic's curated concept video, with a one-click link back into the full chapter.

`GET /api/topic-search?q=<query>` (backed by `content_store.search_topics`) does the matching: a deterministic keyword/fuzzy search across every chapter section's title, board keywords and content - no external AI calls and no live YouTube lookups, so every video returned is one already verified when the content library was built (see the videos work above). Matching uses IDF-style weighting so a rare, distinctive word (e.g. "refraction") counts for more than a generic word that happens to appear in many section titles (e.g. "system"), plus light fuzzy matching so small typos or word-form differences ("reflecting" vs "reflection") still match. Up to 5 ranked results are returned, each tagged Strong/Possible/Weak match so the student can judge confidence rather than blindly trusting the top hit; if nothing scores above 0 it returns an empty list rather than a bad guess.

This is intentionally the simplest of the options discussed (no AI, ships with existing content) - it won't understand heavily paraphrased or conversational questions as well as an LLM would, and it's naturally limited to topics the content bank already covers. Both are reasonable next steps if needed later, once an AI API key is set up.

## Notes on scope

This ships with a solid, extensible foundation and 20 real, carefully-written Social Science/Science chapters (plus the full English course) rather than a shallow pass at the full syllabus. Extending coverage is just a matter of adding more chapter JSON objects in the format described above - no code changes required.
