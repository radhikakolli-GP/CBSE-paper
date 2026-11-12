"""
Groq-powered handwriting reader and meaning-based point checker.

1. read_sheet(): photos of a handwritten answer sheet -> {question_id: text}, via a Groq
   vision model. Same output shape as ocr.split_answer_sheet()'s "segments", so the existing
   review step (answers pre-filled into editable boxes) works unchanged. The parent
   reviews/corrects the text BEFORE anything is marked.
2. judge_missed_points(): after keyword grading, asks Groq one narrow yes/no question per
   missed rubric point ("does the answer express this point, in any words?"), mirroring the
   CBSE marking-scheme rule that a correct answer in the student's own words earns the mark.
"""
import base64
import io
import json
import os
import re

import ai_tutor

VISION_MODEL = os.environ.get("GROQ_VISION_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")
JUDGE_MODEL = os.environ.get("GROQ_JUDGE_MODEL", ai_tutor.GROQ_MODEL)
IMAGES_PER_REQUEST = 3
MAX_RAW_BYTES = 3 * 1024 * 1024

try:
    from PIL import Image
    PIL_OK = True
except Exception:  # Pillow is optional
    PIL_OK = False


def available():
    return ai_tutor.ai_status()["available"]


def _prepare_image(data):
    """data: base64 (optionally a data: URL). Returns (data_url, error)."""
    if "," in data and data.strip().startswith("data:"):
        data = data.split(",", 1)[1]
    try:
        raw = base64.b64decode(data)
    except Exception:
        return None, "could not decode image"
    if raw[:4] == b"%PDF":
        return None, "PDF files are not supported by AI reading - please upload photos (JPG/PNG)"
    if PIL_OK:
        try:
            im = Image.open(io.BytesIO(raw)).convert("RGB")
            im.thumbnail((1600, 1600))
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=82)
            raw = buf.getvalue()
        except Exception as e:
            return None, f"could not open image ({e})"
    elif len(raw) > MAX_RAW_BYTES:
        return None, "image too large - please upload a smaller photo (under 3 MB)"
    return "data:image/jpeg;base64," + base64.b64encode(raw).decode(), None


def _parse_json(text):
    text = text.strip()
    text = re.sub(r"^```(?:json)?|```$", "", text, flags=re.M).strip()
    try:
        return json.loads(text)
    except Exception:
        m = re.search(r"\{.*\}", text, re.S)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                return None
    return None


def read_sheet(pages, expected):
    """
    pages: [{"data": base64, "name": str}] (photos only)
    expected: [{"question_id", "number", "question", "marks"}] for written (non-MCQ) questions
    Returns {"segments": {qid: text}, "page_errors": [...], "fatal_error": str|None}
    """
    if not available():
        return {"segments": {}, "page_errors": [], "fatal_error": "GROQ_API_KEY is not set on the server."}
    by_number = {e["number"]: e["question_id"] for e in expected}
    listing = "\n".join(f"Q{e['number']} ({e['marks']} marks): {e['question'][:140]}" for e in expected)

    images, page_errors = [], []
    for i, p in enumerate(pages):
        url, err = _prepare_image(p.get("data", ""))
        if err:
            page_errors.append({"source_name": p.get("name", f"page {i+1}"), "page_number": 1, "error": err})
        else:
            images.append((p.get("name", f"page {i+1}"), url))
    if not images:
        return {"segments": {}, "page_errors": page_errors, "fatal_error": "No readable photos were uploaded."}

    segments = {}
    last_number = None
    for start in range(0, len(images), IMAGES_PER_REQUEST):
        batch = images[start:start + IMAGES_PER_REQUEST]
        prompt = (
            "These are consecutive pages of a student's HANDWRITTEN answer sheet for the questions listed below.\n"
            "Transcribe the handwriting EXACTLY as written - keep spelling and grammar mistakes, do not correct, "
            "improve, complete or summarise anything. Write [unclear] for any word you cannot read.\n"
            "Split the writing by question number using the numbers the student wrote (Q3, 3., (3) etc.). "
            "Ignore answers to multiple-choice questions.\n"
            + (f"If the first page starts in the middle of an answer, it continues question {last_number}.\n" if last_number else "")
            + "Reply with JSON only: {\"answers\": [{\"number\": <int>, \"text\": \"<transcription>\"}]}\n\n"
            "Questions:\n" + listing
        )
        content = [{"type": "text", "text": prompt}] + [{"type": "image_url", "image_url": {"url": u}} for _, u in batch]
        text, err = ai_tutor.groq_chat({
            "model": VISION_MODEL, "temperature": 0, "max_tokens": 3000,
            "messages": [{"role": "user", "content": content}],
        }, timeout=60)
        if err:
            hint = " (check the model name in GROQ_VISION_MODEL against Groq's current vision models)" if "model" in err.lower() else ""
            return {"segments": segments, "page_errors": page_errors, "fatal_error": err + hint}
        data = _parse_json(text)
        if not data or "answers" not in data:
            page_errors.append({"source_name": batch[0][0], "page_number": 1, "error": "the AI reply could not be understood - try again"})
            continue
        for a in data["answers"]:
            try:
                n = int(a.get("number"))
            except Exception:
                continue
            qid = by_number.get(n)
            t = (a.get("text") or "").strip()
            if qid and t:
                segments[qid] = (segments.get(qid, "") + " " + t).strip()
                last_number = n
    return {"segments": segments, "page_errors": page_errors, "fatal_error": None}


def judge_missed_points(items):
    """
    items: [{"qid", "question", "answer", "points": [str, ...]}] - only questions where the keyword
    check missed some points. Returns {qid: [bool per point]}; empty dict if Groq unavailable/fails.
    """
    if not items or not available():
        return {}
    out = {}
    for start in range(0, len(items), 6):
        chunk = items[start:start + 6]
        payload_items = [{"id": it["qid"], "question": it["question"][:300], "student_answer": it["answer"][:1500],
                          "points": it["points"]} for it in chunk]
        prompt = (
            "You are a strict but fair CBSE Class 10 examiner using the marking scheme's rule: a point earns its "
            "mark if the student's answer clearly expresses that idea, even in different words. Do not give credit "
            "for vague, unrelated or merely repeated-question text, and do not use outside knowledge to fill gaps.\n"
            "For each item, decide for every listed point whether the student_answer expresses it (true/false).\n"
            "Reply with JSON only: {\"results\": {\"<id>\": [true, false, ...]}} - one boolean per point, in order.\n\n"
            + json.dumps(payload_items)
        )
        text, err = ai_tutor.groq_chat({
            "model": JUDGE_MODEL, "temperature": 0, "max_tokens": 1500,
            "response_format": {"type": "json_object"},
            "messages": [{"role": "user", "content": prompt}],
        }, timeout=40)
        if err:
            continue
        data = _parse_json(text) or {}
        for qid, flags in (data.get("results") or {}).items():
            if isinstance(flags, list):
                out[qid] = [f is True for f in flags]
    return out


def apply_semantic_check(results, questions, answers_by_qid):
    """
    Second-pass marking. For each written answer where the keyword check missed some rubric points,
    ask Groq whether those points are nonetheless expressed in other words, then re-score using the
    same formula (grading.grade_descriptive). Points credited this way are labelled
    '(judged by AI)'. Returns True if the AI pass ran.
    """
    import grading
    qmap = {q["id"]: q for q in questions}
    items = []
    for r in results:
        q = qmap.get(r["question_id"])
        if not q or q["type"] in ("MCQ", "AR") or not r.get("missed_points"):
            continue
        ans = (answers_by_qid.get(r["question_id"], {}) or {}).get("answer_text", "") or ""
        if len(ans.strip()) < 8:
            continue
        items.append({"qid": r["question_id"], "question": q["question"], "answer": ans, "points": list(r["missed_points"])})
    if not items:
        return False
    verdicts = judge_missed_points(items)
    if not verdicts:
        return False
    by_item = {it["qid"]: it for it in items}
    for i, r in enumerate(results):
        flags = verdicts.get(r["question_id"])
        it = by_item.get(r["question_id"])
        if not flags or not it or len(flags) != len(it["points"]):
            continue
        credited = {p for p, f in zip(it["points"], flags) if f}
        if not credited:
            continue
        q = qmap[r["question_id"]]
        new = grading.grade_descriptive(q, it["answer"], extra_matched=credited)
        for k in ("question", "topic", "chapter_id", "chapter_title", "subject", "section",
                  "group_id", "passage", "part_label", "group_type"):
            if k in r:
                new[k] = r[k]
        results[i] = new
    return True
