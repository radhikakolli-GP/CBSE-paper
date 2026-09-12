"""
Rule-based grading engine.

MCQs are graded by exact match against the answer key.
Descriptive answers (2/3/5 marks) are graded against a rubric: each question
defines a list of key points, each with a set of keyword/synonym phrases and
a mark weight. The student's answer text (typed, or OCR-extracted from an
uploaded photo) is scanned for those keyword phrases (with light fuzzy
matching to tolerate small misspellings) and awarded partial credit for each
matched point, up to the question's full marks.

This is intentionally transparent and deterministic (no external AI calls),
so it works fully offline and its scoring can always be explained to the
student via the feedback it returns.
"""
import re
import difflib


def _normalize(text):
    text = (text or "").lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _phrase_present(phrase, norm_text, norm_words):
    """Check if a keyword phrase is present in the text, exactly or fuzzily."""
    phrase = _normalize(phrase)
    if not phrase:
        return False
    if phrase in norm_text:
        return True
    # fuzzy: for multi-word phrases, require most words to fuzzy-match
    phrase_words = phrase.split()
    hits = 0
    for pw in phrase_words:
        if len(pw) < 4:
            if pw in norm_words:
                hits += 1
            continue
        close = difflib.get_close_matches(pw, norm_words, n=1, cutoff=0.82)
        if close:
            hits += 1
    return hits >= max(1, int(round(len(phrase_words) * 0.7)))


def grade_mcq(question, submitted_index):
    correct = question["answer_index"]
    options = question["options"]
    has_answer = submitted_index is not None and 0 <= int(submitted_index) < len(options)
    is_correct = has_answer and int(submitted_index) == int(correct)
    marks_awarded = question["marks"] if is_correct else 0
    feedback = (
        "Correct." if is_correct else
        f"Incorrect. The correct option was: \"{question['options'][correct]}\". {question.get('explanation', '')}".strip()
    )
    return {
        "question_id": question["id"],
        "type": question.get("type", "MCQ"),
        "marks_available": question["marks"],
        "marks_awarded": marks_awarded,
        "is_correct": is_correct,
        "feedback": feedback,
        "matched_points": [],
        "missed_points": [] if is_correct else [question["options"][correct]],
        "student_answer_index": int(submitted_index) if has_answer else None,
        "student_answer": options[int(submitted_index)] if has_answer else None,
    }


def grade_descriptive(question, answer_text):
    norm_text = _normalize(answer_text)
    norm_words = set(norm_text.split())
    rubric = question.get("rubric", [])
    total_weight = sum(p["weight"] for p in rubric) or question["marks"]

    matched_points = []
    missed_points = []
    raw_score = 0.0

    if not norm_text or len(norm_text) < 3:
        for p in rubric:
            missed_points.append(p["point"])
        marks_awarded = 0.0
        feedback = "No answer detected (or answer too short to evaluate). Review the model answer for this question."
    else:
        for p in rubric:
            found = any(_phrase_present(kw, norm_text, norm_words) for kw in p["keywords"])
            if found:
                matched_points.append(p["point"])
                raw_score += p["weight"]
            else:
                missed_points.append(p["point"])

        marks_awarded = (raw_score / total_weight) * question["marks"] if total_weight else 0.0
        # length sanity check: extremely short answers relative to marks get capped
        # (marks 3/4/7/8 correspond to English's Application/Description/Letter/
        # Article/Compare-essay question types, which run much longer than a
        # typical Social Science 3M/5M answer).
        expected_min_words = {1: 0, 2: 15, 3: 20, 4: 30, 5: 45, 7: 70, 8: 80}.get(question["marks"], 15)
        word_count = len(norm_text.split())
        if word_count < expected_min_words * 0.4 and marks_awarded > question["marks"] * 0.5:
            marks_awarded = min(marks_awarded, question["marks"] * 0.5)

        marks_awarded = round(marks_awarded * 2) / 2  # round to nearest 0.5
        marks_awarded = max(0.0, min(question["marks"], marks_awarded))

        if marks_awarded >= question["marks"] * 0.85:
            feedback = "Well covered - your answer includes most of the key points expected."
        elif marks_awarded >= question["marks"] * 0.5:
            feedback = "Partially correct. You covered some key points but missed others (see below)."
        else:
            feedback = "Your answer is missing most of the key points expected for full marks."

    return {
        "question_id": question["id"],
        "type": question["type"],
        "marks_available": question["marks"],
        "marks_awarded": marks_awarded,
        "is_correct": marks_awarded >= question["marks"] * 0.85,
        "feedback": feedback,
        "matched_points": matched_points,
        "missed_points": missed_points,
        "model_answer": question.get("model_answer", ""),
        "student_answer": (answer_text or "").strip() or None,
    }


def grade_answer(question, submitted):
    """
    submitted: dict with either 'selected_option' (int, for MCQ/AR) or
    'answer_text' (str, typed or OCR-derived, for descriptive questions,
    including CBQ/MAP sub-questions which are graded the same way as any
    other short-answer question once flattened by content_store).
    """
    if question["type"] in ("MCQ", "AR"):
        return grade_mcq(question, submitted.get("selected_option"))
    return grade_descriptive(question, submitted.get("answer_text", ""))


def grade_paper(questions, answers_by_qid):
    """
    questions: list of full question dicts (with answer keys/rubrics).
    answers_by_qid: dict question_id -> submitted answer dict.
    Returns list of per-question result dicts (order preserved).
    """
    results = []
    for q in questions:
        submitted = answers_by_qid.get(q["id"], {})
        result = grade_answer(q, submitted)
        result["question"] = q["question"]
        result["topic"] = q.get("topic", "")
        result["chapter_id"] = q.get("chapter_id", "")
        result["chapter_title"] = q.get("chapter_title", "")
        result["subject"] = q.get("subject", "")
        # explicit section label (used by English papers, which have fixed
        # Reading / Writing & Grammar / Literature sections that don't map
        # cleanly onto a single "subject" the way Social Science/Science do).
        if q.get("section"):
            result["section"] = q["section"]
        # passage-group metadata for case-based (CBQ) / map-based (MAP) /
        # reading comprehension (READING) / literary extract (EXTRACT)
        # questions, so the UI can render the shared passage once per group.
        if q.get("group_id"):
            result["group_id"] = q["group_id"]
            result["passage"] = q.get("passage", "")
            result["part_label"] = q.get("part_label", "")
            result["group_type"] = q.get("group_type", "")
        results.append(result)
    return results


# ---------------------------------------------------------------------------
# Performance analysis across one or more graded submissions
# ---------------------------------------------------------------------------

def analyze_performance(submissions):
    """
    submissions: list of stored submission dicts (each has 'results', a list
    of per-question grading result dicts as produced by grade_paper, plus
    total_score/total_marks).
    Returns an aggregated performance report: overall %, per-chapter and
    per-topic accuracy, strengths, weaknesses, and actionable feedback.
    """
    if not submissions:
        return None

    topic_stats = {}   # topic -> {"awarded": x, "available": y}
    chapter_stats = {}  # chapter_title -> {"awarded": x, "available": y}
    type_stats = {}     # question type -> {"awarded": x, "available": y}
    total_awarded = 0.0
    total_available = 0.0
    history = []

    for sub in submissions:
        history.append({
            "submission_id": sub["id"],
            "paper_id": sub["paper_id"],
            "submitted_at": sub["submitted_at"],
            "score": sub["total_score"],
            "total": sub["total_marks"],
            "percentage": round((sub["total_score"] / sub["total_marks"]) * 100, 1) if sub["total_marks"] else 0,
        })
        for r in sub["results"]:
            total_awarded += r["marks_awarded"]
            total_available += r["marks_available"]

            topic = r.get("topic") or "General"
            t = topic_stats.setdefault(topic, {"awarded": 0.0, "available": 0.0})
            t["awarded"] += r["marks_awarded"]
            t["available"] += r["marks_available"]

            chap = r.get("chapter_title") or "Unknown chapter"
            c = chapter_stats.setdefault(chap, {"awarded": 0.0, "available": 0.0})
            c["awarded"] += r["marks_awarded"]
            c["available"] += r["marks_available"]

            qtype = r.get("type")
            ty = type_stats.setdefault(qtype, {"awarded": 0.0, "available": 0.0})
            ty["awarded"] += r["marks_awarded"]
            ty["available"] += r["marks_available"]

    def pct(d):
        return round((d["awarded"] / d["available"]) * 100, 1) if d["available"] else 0.0

    topic_pct = {k: pct(v) for k, v in topic_stats.items()}
    chapter_pct = {k: pct(v) for k, v in chapter_stats.items()}
    type_pct = {k: pct(v) for k, v in type_stats.items()}

    strengths = sorted([t for t, p in topic_pct.items() if p >= 75], key=lambda t: -topic_pct[t])
    weaknesses = sorted([t for t, p in topic_pct.items() if p < 50], key=lambda t: topic_pct[t])
    needs_practice = sorted([t for t, p in topic_pct.items() if 50 <= p < 75], key=lambda t: topic_pct[t])

    overall_pct = round((total_awarded / total_available) * 100, 1) if total_available else 0.0

    recommendations = []
    if weaknesses:
        recommendations.append(
            "Priority revision needed on: " + ", ".join(weaknesses[:5]) +
            ". Re-read the summary notes for these topics and attempt a fresh paper focused on them."
        )
    if needs_practice:
        recommendations.append(
            "Strengthen with more practice on: " + ", ".join(needs_practice[:5]) + "."
        )
    if type_pct.get("5M", 100) < 60:
        recommendations.append(
            "Long-answer (5-mark) questions are scoring low - practice writing structured answers "
            "that explicitly cover every key point, not just the general idea. Use point-wise or "
            "paragraph structure covering causes/features/examples as relevant."
        )
    if type_pct.get("MCQ", 100) < 60:
        recommendations.append(
            "MCQ accuracy is low - revise key facts, dates and definitions from the chapter notes, "
            "as these questions test precise recall."
        )
    if not recommendations:
        recommendations.append("Strong performance overall - keep revising periodically to retain recall for the board exam.")

    return {
        "attempts": len(submissions),
        "overall_percentage": overall_pct,
        "total_awarded": round(total_awarded, 1),
        "total_available": round(total_available, 1),
        "topic_performance": topic_pct,
        "chapter_performance": chapter_pct,
        "question_type_performance": type_pct,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "needs_practice": needs_practice,
        "recommendations": recommendations,
        "history": history,
    }
