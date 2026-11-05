#!/usr/bin/env python3
"""
CBSE Class 10 Social Science Practice App - backend server.

Pure Python standard library (http.server + sqlite3) - no pip install
required to run the core app. OCR (photo answer transcription) uses
pytesseract + Pillow if installed; otherwise that one feature degrades
gracefully (image is stored, but not auto-transcribed - student can still
type the answer instead).

Run:
    python3 server.py [port]

Then open frontend/index.html in a browser (it talks to this server on
http://localhost:8000 by default).

Port resolution order: an explicit CLI argument (python3 server.py 8080)
wins if given; otherwise the PORT environment variable is used if set
(this is how hosts like Render/Railway tell an app which port to bind to);
otherwise it defaults to 8000. This means the exact same command,
`python3 server.py`, works unmodified both locally and on those hosts.
"""
import json
import mimetypes
import os
import re
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

import db
import content_store
import grading
import ocr
import ai_tutor
import skills_store

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT", 8000))


def strip_answer_key(question):
    """Remove answer/rubric fields before sending a paper to the student."""
    clean = {k: v for k, v in question.items() if k not in (
        "answer_index", "rubric", "model_answer", "explanation"
    )}
    return clean


class Handler(BaseHTTPRequestHandler):
    server_version = "CBSESSTApp/1.0"

    def log_message(self, fmt, *args):
        pass  # keep console quiet; comment out to debug

    # ---- helpers -----------------------------------------------------
    def _send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except Exception:
            return {}

    def _serve_frontend(self, path):
        """
        Serve the static frontend (../frontend) so that opening the
        backend's own URL (e.g. the Render URL) loads the app itself,
        instead of {"error": "not found"}. Returns True if a file was sent.
        Only files inside the frontend folder are ever served.
        """
        root = os.path.realpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend"))
        rel = path.lstrip("/") or "index.html"
        full = os.path.realpath(os.path.join(root, rel))
        if not (full == root or full.startswith(root + os.sep)) or not os.path.isfile(full):
            return False
        ctype = mimetypes.guess_type(full)[0] or "application/octet-stream"
        if ctype.startswith("text/") or ctype in ("application/javascript", "application/json"):
            ctype += "; charset=utf-8"
        with open(full, "rb") as fh:
            body = fh.read()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
        return True

    def do_OPTIONS(self):
        self._send_json(200, {"ok": True})

    # ---- routing -------------------------------------------------------
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)

        try:
            if path == "/api/subjects":
                return self._send_json(200, {"subjects": content_store.list_subjects()})

            if path == "/api/skills":
                return self._send_json(200, {"skills": skills_store.list_skills()})

            m = re.match(r"^/api/skills/([a-zA-Z0-9_-]+)$", path)
            if m:
                skill = skills_store.get_skill(m.group(1))
                if not skill:
                    return self._send_json(404, {"error": f"skill '{m.group(1)}' not found"})
                return self._send_json(200, skill)

            if path == "/api/notes":
                chapter_id = qs.get("chapter", [None])[0]
                if not chapter_id:
                    return self._send_json(400, {"error": "chapter query param required"})
                notes = content_store.get_notes(chapter_id)
                if not notes:
                    return self._send_json(404, {"error": f"chapter '{chapter_id}' not found"})
                return self._send_json(200, notes)

            if path == "/api/search":
                q = qs.get("q", [""])[0]
                return self._send_json(200, {"results": content_store.search_chapters(q)})

            if path == "/api/topic-search":
                q = qs.get("q", [""])[0]
                if not q.strip():
                    return self._send_json(400, {"error": "q query param required"})
                return self._send_json(200, {"query": q, "results": content_store.search_topics(q)})

            m = re.match(r"^/api/papers/(\d+)/answer-key$", path)
            if m:
                # Full, un-stripped question set (correct options, rubrics,
                # model answers, explanations) for a paper - meant for a
                # parent/teacher who wants to mark a handwritten answer sheet
                # by hand rather than relying on OCR + auto-grading. There's
                # no student-facing auth in this app to bypass here - this is
                # the same data /submit already returns per-question inside
                # its grading feedback, just available up front instead of
                # only after grading.
                paper = db.get_paper(int(m.group(1)))
                if not paper:
                    return self._send_json(404, {"error": "paper not found"})
                return self._send_json(200, {
                    "id": paper["id"], "title": paper["title"], "chapters": paper["chapters"],
                    "total_marks": paper["total_marks"], "questions": paper["questions"],
                    "pattern": paper["pattern"], "sections": paper["sections"],
                    "created_at": paper["created_at"],
                })

            m = re.match(r"^/api/papers/(\d+)$", path)
            if m:
                paper = db.get_paper(int(m.group(1)))
                if not paper:
                    return self._send_json(404, {"error": "paper not found"})
                clean_questions = [strip_answer_key(q) for q in paper["questions"]]
                return self._send_json(200, {
                    "id": paper["id"], "title": paper["title"], "chapters": paper["chapters"],
                    "total_marks": paper["total_marks"], "questions": clean_questions,
                    "pattern": paper["pattern"], "sections": paper["sections"],
                    "created_at": paper["created_at"],
                })

            m = re.match(r"^/api/submissions/(\d+)$", path)
            if m:
                sub = db.get_submission(int(m.group(1)))
                if not sub:
                    return self._send_json(404, {"error": "submission not found"})
                return self._send_json(200, sub)

            if path == "/api/performance":
                student = qs.get("student", [None])[0]
                if not student:
                    return self._send_json(400, {"error": "student query param required"})
                subs = db.get_submissions_for_student(student)
                report = grading.analyze_performance(subs)
                if report is None:
                    return self._send_json(200, {"attempts": 0, "message": "No submissions yet for this student."})
                return self._send_json(200, report)

            if path == "/api/students":
                return self._send_json(200, {"students": db.get_all_students()})

            if path == "/api/ocr-status":
                return self._send_json(200, ocr.ocr_status())

            if path == "/api/english-sets":
                import english_sets
                return self._send_json(200, {"sets": [{"id": x["id"], "title": x["title"], "note": x["note"]} for x in english_sets.SETS]})

            if path == "/api/ai-status":
                return self._send_json(200, ai_tutor.ai_status())

            if not path.startswith("/api/") and self._serve_frontend(path):
                return

            return self._send_json(404, {"error": "not found"})
        except Exception as e:
            return self._send_json(500, {"error": str(e)})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self._read_json_body()

        try:
            if path == "/api/papers/generate":
                chapters = body.get("chapters", [])
                total_marks = body.get("total_marks")
                pattern = body.get("pattern", "board")  # "board" (MCQ+2/3/5 marks, default), "school", "custom", or "english"
                custom_counts = body.get("custom_counts")  # e.g. {"2M": 10} for pattern="custom"
                num_sets = body.get("num_sets", 1)
                # English's chapter selection only picks which literature chapters
                # feed Section C - generate_english_pattern pools all of them when
                # none are given - so an empty list is valid for that pattern only.
                if not chapters and pattern != "english":
                    return self._send_json(400, {"error": "chapters (list of chapter ids) required"})
                if pattern == "custom" and not any(int(v or 0) > 0 for v in (custom_counts or {}).values()):
                    return self._send_json(400, {"error": "custom_counts must specify at least one question type with a count > 0"})

                sets = content_store.generate_paper(
                    chapters, pattern=pattern, total_marks=total_marks, num_sets=num_sets,
                    custom_counts=custom_counts, english_set=body.get("english_set"),
                )
                sets = [s for s in sets if s["questions"]]
                if not sets:
                    return self._send_json(404, {"error": "No questions found for the given chapter(s)."})

                papers_out = []
                for s in sets:
                    paper_id = db.save_paper(
                        s["title"], chapters, s["total_marks"], s["questions"],
                        pattern=s["pattern"], sections=s["sections"],
                    )
                    clean_questions = [strip_answer_key(q) for q in s["questions"]]
                    papers_out.append({
                        "id": paper_id, "title": s["title"], "chapters": chapters,
                        "total_marks": s["total_marks"], "questions": clean_questions,
                        "warnings": s["warnings"], "set_label": s["set_label"],
                        "pattern": s["pattern"], "sections": s["sections"],
                        "typology": s["typology"],
                    })
                return self._send_json(200, {"papers": papers_out})

            if path == "/api/ask-ai":
                question = (body.get("question") or "").strip()
                result = ai_tutor.ask_tutor(question)
                return self._send_json(200, result)

            m = re.match(r"^/api/papers/(\d+)/parse-sheet$", path)
            if m:
                paper_id = int(m.group(1))
                paper = db.get_paper(paper_id)
                if not paper:
                    return self._send_json(404, {"error": "paper not found"})

                pages = body.get("pages", [])  # list of {data, name} - whole answer-sheet photos/PDFs
                if not pages:
                    return self._send_json(400, {"error": "pages (list of {data, name}) required"})
                if len(pages) > 15:
                    return self._send_json(400, {"error": "Too many files - please upload at most 15 pages at once."})

                ocr_result = ocr.extract_sheet_pages(pages, filename_hint=f"{paper_id}_sheet")
                if ocr_result.get("fatal_error"):
                    return self._send_json(200, {
                        "full_text": "", "segments": {}, "matched_ids": [], "unmatched_ids": [],
                        "unrecognised_markers": [], "page_errors": [], "fatal_error": ocr_result["fatal_error"],
                    })

                # Only non-choice (non-MCQ/AR) questions need a written answer -
                # MCQ/AR are still selected via radio buttons in the UI.
                expected = [
                    {"question_id": q["id"], "number": idx + 1}
                    for idx, q in enumerate(paper["questions"])
                    if q["type"] not in ("MCQ", "AR")
                ]
                split_result = ocr.split_answer_sheet(ocr_result["combined_text"], expected)

                page_errors = [
                    {"source_name": p["source_name"], "page_number": p["page_number"], "error": p["error"]}
                    for p in ocr_result["pages"] if p.get("error")
                ]

                return self._send_json(200, {
                    "full_text": ocr_result["combined_text"],
                    "segments": split_result["segments"],
                    "matched_ids": split_result["matched_ids"],
                    "unmatched_ids": split_result["unmatched_ids"],
                    "unrecognised_markers": split_result["unrecognised_markers"],
                    "page_errors": page_errors,
                    "fatal_error": None,
                })

            m = re.match(r"^/api/papers/(\d+)/submit$", path)
            if m:
                paper_id = int(m.group(1))
                paper = db.get_paper(paper_id)
                if not paper:
                    return self._send_json(404, {"error": "paper not found"})

                student_name = (body.get("student_name") or "Anonymous").strip() or "Anonymous"
                answers = body.get("answers", [])  # list of {question_id, selected_option?, answer_text?, image_base64?}

                answers_by_qid = {}
                ocr_notes = {}
                for a in answers:
                    qid = a.get("question_id")
                    entry = {"selected_option": a.get("selected_option")}
                    text = a.get("answer_text", "") or ""
                    if a.get("image_base64"):
                        ocr_result = ocr.save_and_extract_text(a["image_base64"], filename_hint=f"{paper_id}_{qid}")
                        if ocr_result["extracted_text"]:
                            text = (text + " " + ocr_result["extracted_text"]).strip()
                        if ocr_result["error"]:
                            ocr_notes[qid] = ocr_result["error"]
                    entry["answer_text"] = text
                    answers_by_qid[qid] = entry

                results = grading.grade_paper(paper["questions"], answers_by_qid)
                for r in results:
                    if r["question_id"] in ocr_notes:
                        r["ocr_note"] = ocr_notes[r["question_id"]]

                total_score = round(sum(r["marks_awarded"] for r in results), 1)
                sub_id = db.save_submission(
                    paper_id, student_name, answers, results, total_score, paper["total_marks"]
                )
                return self._send_json(200, {
                    "submission_id": sub_id,
                    "student_name": student_name,
                    "total_score": total_score,
                    "total_marks": paper["total_marks"],
                    "percentage": round((total_score / paper["total_marks"]) * 100, 1) if paper["total_marks"] else 0,
                    "results": results,
                })

            return self._send_json(404, {"error": "not found"})
        except Exception as e:
            return self._send_json(500, {"error": str(e)})


def main():
    db.init_db()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"CBSE SST Practice App backend running on http://localhost:{PORT}")
    print(f"OCR status: {ocr.ocr_status()}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.shutdown()


if __name__ == "__main__":
    main()
