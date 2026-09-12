"""
Loads CBSE Class 10 Social Science content (notes + question banks) from the
JSON files in content/. Adding a new chapter is as simple as appending a new
chapter object to the relevant subject file - no code changes required.

Two paper styles are supported:

- "school": mirrors a typical CBSE school periodic/mid-term practice paper -
  fixed sections (History / Geography / Political Science / Economics), each
  with its own mark weightage and mix of MCQ, Assertion-Reason, VSA (2M),
  SA (3M), LA (4M), case-based (CBQ) and map-based (MAP) questions. Marks per
  section (8/8/7/7 = 30) mirror a real sample paper.
- "board": a flexible, mixed-question paper (MCQ + 2/3/5 mark questions)
  scaled to a total marks target, useful for single/multi-chapter drills that
  don't need to mimic the exact school section structure.

Both support generating multiple distinct "sets" (Set A, Set B, ...) in one
call, each drawing a different combination of questions from the bank so a
student can re-practice without seeing the same paper twice.
"""
import difflib
import json
import math
import os
import random
import re

CONTENT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "content")

_cache = None


def _load():
    global _cache
    if _cache is not None:
        return _cache
    subjects = {}
    for fname in os.listdir(CONTENT_DIR):
        if not fname.endswith(".json"):
            continue
        with open(os.path.join(CONTENT_DIR, fname), encoding="utf-8") as f:
            data = json.load(f)
        subjects[data["subject"]] = data
    _cache = subjects
    return _cache


def list_subjects():
    subjects = _load()
    return [
        {"subject": s["subject"], "label": s["subject_label"],
         "group": s.get("subject_group", "other"),
         "group_label": s.get("subject_group_label", "Other"),
         "chapters": [{"id": c["id"], "title": c["title"]} for c in s["chapters"]]}
        for s in subjects.values()
    ]


def find_chapter(chapter_id):
    subjects = _load()
    for subj in subjects.values():
        for ch in subj["chapters"]:
            if ch["id"] == chapter_id:
                return subj["subject"], ch
    return None, None


def get_notes(chapter_id):
    subject, ch = find_chapter(chapter_id)
    if not ch:
        return None
    return {
        "chapter_id": ch["id"],
        "title": ch["title"],
        "subject": subject,
        "notes": ch["notes"],
    }


def search_chapters(query):
    """Case-insensitive partial match on chapter title or id."""
    query = query.strip().lower()
    subjects = _load()
    results = []
    for subj in subjects.values():
        for ch in subj["chapters"]:
            if query in ch["title"].lower() or query in ch["id"].lower():
                results.append({"id": ch["id"], "title": ch["title"], "subject": subj["subject"]})
    return results


# ---------------------------------------------------------------------------
# Topic search ("Ask a Topic") - free-text search across every chapter
# section (title, board keywords, content), so a student can type a topic or
# a whole question ("why does a convex mirror always give a smaller image?")
# and get back the matching Chapter Notes section plus its curated concept
# video, without needing to know which chapter it lives in. Pure keyword /
# fuzzy matching against the existing content - no external AI or network
# calls, so every video returned is one already verified when the content
# library was built.
# ---------------------------------------------------------------------------

_STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "what", "why", "how",
    "when", "where", "which", "who", "explain", "describe", "define",
    "define.", "does", "do", "did", "of", "in", "on", "for", "to", "and",
    "or", "with", "about", "please", "give", "tell", "me", "you", "can",
    "class", "10", "cbse", "chapter", "topic", "concept",
}


def _norm(text):
    text = (text or "").lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _query_words(query_norm):
    return {w for w in query_norm.split() if w not in _STOPWORDS and len(w) > 1}


_topic_index_cache = None


def _topic_index():
    """
    Builds (and caches) a flat list of every chapter section plus, crucially,
    an IDF (inverse document frequency) weight per word seen in section
    titles/keywords. Without this, generic words that happen to appear in
    many different section titles across the whole library (e.g. "system" -
    Endocrine System, Male/Female Reproductive System, Nervous System...)
    would out-score the one section that's actually about the query just by
    matching a common word, while a distinctive but rarer word gets no
    special credit. Weighting by how *rare* a matched word is across all
    section titles/keywords fixes that.
    """
    global _topic_index_cache
    if _topic_index_cache is not None:
        return _topic_index_cache

    subjects = _load()
    docs = []
    for subj in subjects.values():
        for ch in subj["chapters"]:
            for sec in ch.get("notes", {}).get("sections", []) or []:
                title_norm = _norm(sec.get("title", ""))
                keywords = sec.get("keywords", []) or []
                keywords_norm = _norm(" ".join(keywords))
                content_norm = _norm(sec.get("content", ""))
                docs.append({
                    "subj": subj, "ch": ch, "sec": sec,
                    "title_norm": title_norm, "title_words": set(title_norm.split()),
                    "keywords": keywords, "keywords_norm": keywords_norm,
                    "keyword_words": set(keywords_norm.split()),
                    "content_norm": content_norm, "content_words": set(content_norm.split()),
                })

    n_docs = max(1, len(docs))
    df = {}
    for d in docs:
        for w in d["title_words"] | d["keyword_words"]:
            df[w] = df.get(w, 0) + 1

    def idf(word):
        # smoothed idf, floor of ~1 so no word ever goes to zero weight
        return math.log((n_docs + 1) / (1 + df.get(word, 0))) + 1

    _topic_index_cache = {"docs": docs, "idf": idf}
    return _topic_index_cache


def _weighted_overlap(q_words, text_words, base_weight, idf_fn, fuzzy=True):
    if not q_words or not text_words:
        return 0.0
    exact = q_words & text_words
    score = sum(base_weight * idf_fn(w) for w in exact)
    if fuzzy:
        for w in (q_words - exact):
            if len(w) < 4:
                continue
            close = difflib.get_close_matches(w, text_words, n=1, cutoff=0.72)
            if close:
                score += base_weight * idf_fn(close[0]) * 0.5
    return score


def _score_doc(query_norm, q_words, doc, idf_fn):
    score = 0.0
    if query_norm and query_norm in doc["title_norm"]:
        score += 60
    if query_norm and any(query_norm in _norm(k) or _norm(k) in query_norm for k in doc["keywords"]):
        score += 45
    # a query phrase appearing verbatim in the section's prose is a strong,
    # low-noise signal even when the section's *title* uses different words
    # for the same thing (e.g. a section titled "The Neuron and Nerve
    # Impulse" whose content explains "...unit of the nervous system" - a
    # student searching "nervous system" should still land here, not on an
    # unrelated section that merely shares the generic word "system").
    if query_norm and len(query_norm) >= 6 and query_norm in doc["content_norm"]:
        score += 40
    score += _weighted_overlap(q_words, doc["title_words"], 10, idf_fn)
    score += _weighted_overlap(q_words, doc["keyword_words"], 7, idf_fn)
    # content words are weighted flat (not by idf) - content is free-form
    # prose, not a curated label, so word rarity there is a much noisier
    # signal; it's kept as a light tie-breaker only.
    score += _weighted_overlap(q_words, doc["content_words"], 1, idf_fn=lambda w: 1, fuzzy=False)
    return score


def search_topics(query, limit=5):
    """
    Free-text topic search across every chapter's notes.sections.
    Returns up to `limit` ranked matches, each with enough context to answer
    "what is this about" plus its curated video (if the section has one).
    """
    query_norm = _norm(query)
    q_words = _query_words(query_norm)
    if not query_norm or not q_words:
        return []

    index = _topic_index()
    scored = []
    for doc in index["docs"]:
        score = _score_doc(query_norm, q_words, doc, index["idf"])
        if score > 0:
            scored.append((score, doc["subj"], doc["ch"], doc["sec"]))

    scored.sort(key=lambda x: -x[0])
    # collapse to (at most) the top-scoring section per chapter so a single
    # broad chapter doesn't crowd out other relevant chapters in the results
    seen_chapters = set()
    results = []
    for score, subj, ch, sec in scored:
        dedupe_key = (ch["id"], sec["title"])
        if dedupe_key in seen_chapters:
            continue
        seen_chapters.add(dedupe_key)
        content = sec.get("content", "")
        results.append({
            "chapter_id": ch["id"],
            "chapter_title": ch["title"],
            "subject": subj["subject"],
            "subject_label": subj["subject_label"],
            "subject_group": subj.get("subject_group", "other"),
            "section_title": sec.get("title", ""),
            "content": content,
            "excerpt": content if len(content) <= 320 else content[:320].rsplit(" ", 1)[0] + "...",
            "keywords": sec.get("keywords", []) or [],
            "video_id": sec.get("video_id"),
            "video_title": sec.get("video_title"),
            "relevance": round(score, 1),
        })
        if len(results) >= limit:
            break
    return results


# ---------------------------------------------------------------------------
# Question paper generation
# ---------------------------------------------------------------------------

SUBJECT_LABELS = {
    "history": "History",
    "geography": "Geography",
    "civics": "Political Science",
    "economics": "Economics",
}

# Mirrors the section structure/weightage of a real CBSE school practice
# paper (BGS National Public School, Pre-Midterm Practice Paper): four
# sections totalling 30 marks (History 8, Geography 8, Political Science 7,
# Economics 7), each built from a specific mix of question types.
SCHOOL_TEMPLATE = {
    "history":   [("MCQ", 2), ("2M", 1), ("4M", 1)],               # 1+1+2+4 = 8
    "geography": [("MCQ", 2), ("4M", 1), ("MAP", 1)],              # 1+1+4+2 = 8
    "civics":    [("MCQ", 1), ("AR", 1), ("3M", 1), ("CBQ", 1)],   # 1+1+3+2 = 7
    "economics": [("MCQ", 2), ("2M", 1), ("3M", 1)],               # 1+1+2+3 = 7
}
SECTION_ORDER = ["history", "geography", "civics", "economics"]

# Flexible "board style" pattern (mixed MCQ/AR/CBQ + 2/3/5 mark), scaled to
# a requested total_marks - not organised into fixed sections. Kept only as
# a last-resort fallback; see _board_pattern_for_marks, which now defaults
# to the 30-mark competency-balanced pattern instead of this list directly.
DEFAULT_BOARD_PATTERN = [
    ("MCQ", 6),
    ("AR", 3),
    ("CBQ", 3),
    ("2M", 3),
    ("3M", 1),
]  # totals: 6 + 3 + 12 + 6 + 3 = 30 marks


def _build_pool(chapter_ids):
    """subject -> type -> list of raw bank items (with chapter metadata attached)."""
    pool = {}
    chapter_titles_by_subject = {}
    for cid in chapter_ids:
        subject, ch = find_chapter(cid)
        if not ch:
            continue
        chapter_titles_by_subject.setdefault(subject, []).append(ch["title"])
        subj_pool = pool.setdefault(subject, {})
        for q in ch["questions"]:
            q_copy = dict(q)
            q_copy["chapter_id"] = cid
            q_copy["chapter_title"] = ch["title"]
            q_copy["subject"] = subject
            subj_pool.setdefault(q["type"], []).append(q_copy)
    return pool, chapter_titles_by_subject


PASSAGE_GROUP_TYPES = ("CBQ", "MAP", "READING", "EXTRACT", "CLOZE", "EDITING", "REPORTED")


def _expand_item(item):
    """Turn one bank item into a list of flat, gradable question entries.
    Atomic types (MCQ/AR/2M/3M/4M/5M/LETTER/ARTICLE/APPLICATION/DESCRIPTION/
    JUMBLED/COMPARE) expand to a single entry. CBQ/MAP/READING/EXTRACT/CLOZE/
    EDITING/REPORTED parents (a shared passage + N sub-questions) expand to N
    entries, each worth the sub-question's own marks, tagged with a shared
    group_id so the frontend can render the passage once per group.

    Each sub-question is either "objective" (has its own options +
    answer_index, e.g. a cloze blank or a genuine MCQ embedded in a reading
    passage) or "descriptive" (graded against a rubric, like a short-answer
    sub-question). Objective sub-questions get their flattened entry's type
    forced to "MCQ" regardless of the parent's type, so they're graded by
    exact match and rendered as radio-button options by the frontend, exactly
    like any other MCQ - the parent type is only used for descriptive
    sub-questions and for picking the right passage-box/label styling.
    """
    if item["type"] not in PASSAGE_GROUP_TYPES:
        return [item]

    flat = []
    subqs = item.get("subquestions", [])
    for i, sub in enumerate(subqs):
        is_objective = "options" in sub and "answer_index" in sub
        entry = {
            "id": sub["id"],
            "type": "MCQ" if is_objective else item["type"],
            # group_type always preserves the parent's original type (e.g.
            # "CLOZE", "READING") even when `type` above has been overridden
            # to "MCQ" for grading purposes - the frontend uses this to decide
            # whether to render the shared passage box and how to label the
            # question, independent of how it's graded.
            "group_type": item["type"],
            "marks": sub["marks"],
            "topic": item.get("topic", ""),
            "question": sub["question"],
            "chapter_id": item.get("chapter_id", ""),
            "chapter_title": item.get("chapter_title", ""),
            "subject": item.get("subject", ""),
            "passage": item.get("passage", ""),
            "group_id": item["id"],
            "part_label": chr(ord("a") + i),
            "part_index": i,
            "group_size": len(subqs),
        }
        if is_objective:
            entry["options"] = sub["options"]
            entry["answer_index"] = sub["answer_index"]
            entry["explanation"] = sub.get("explanation", "")
        else:
            entry["rubric"] = sub.get("rubric", [])
            entry["model_answer"] = sub.get("model_answer", "")
        if item.get("section"):
            entry["section"] = item["section"]
        flat.append(entry)
    return flat


def _pick(pool_list, count, used_ids, rng):
    """Pick `count` items from pool_list, preferring ones not in used_ids
    (so repeated calls across multiple sets favour fresh questions). Returns
    (picked_items, had_to_reuse). Mutates used_ids with newly picked ids."""
    if not pool_list:
        return [], False

    items = list(pool_list)
    rng.shuffle(items)
    fresh = [it for it in items if it["id"] not in used_ids]
    reused_pool = [it for it in items if it["id"] in used_ids]

    picked = fresh[:count]
    had_to_reuse = False
    if len(picked) < count:
        had_to_reuse = True
        picked += reused_pool[: count - len(picked)]

    for it in picked:
        used_ids.add(it["id"])
    return picked, had_to_reuse


def _set_label(i):
    return f"Set {chr(ord('A') + i)}" if i < 26 else f"Set {i + 1}"


# ---- School pattern ---------------------------------------------------------

def generate_school_pattern(chapter_ids, num_sets=1, seed=None):
    """Generate `num_sets` section-wise practice papers matching the real
    school paper format. Returns a list of dicts: questions/total_marks/
    warnings/title/set_label/sections (present subjects, in order)."""
    rng = random.Random(seed)
    pool, chapter_titles_by_subject = _build_pool(chapter_ids)
    present_subjects = [s for s in SECTION_ORDER if s in pool]

    if not present_subjects:
        return []

    used_ids = {}  # (subject, type) -> set of used bank-item ids, shared across sets
    for subj in present_subjects:
        for qtype, _ in SCHOOL_TEMPLATE[subj]:
            used_ids.setdefault((subj, qtype), set())

    results = []
    for set_idx in range(num_sets):
        questions = []
        warnings = []
        for subj in present_subjects:
            subj_pool = pool.get(subj, {})
            for qtype, count in SCHOOL_TEMPLATE[subj]:
                type_pool = subj_pool.get(qtype, [])
                picked, had_to_reuse = _pick(type_pool, count, used_ids[(subj, qtype)], rng)
                if len(picked) < count:
                    warnings.append(
                        f"{SUBJECT_LABELS[subj]}: only {len(picked)} of {count} "
                        f"{qtype} item(s) available in the bank for the selected chapter(s)."
                    )
                elif had_to_reuse and num_sets > 1:
                    warnings.append(
                        f"{SUBJECT_LABELS[subj]}: ran out of unused {qtype} questions for "
                        f"{_set_label(set_idx)} - some repeats from earlier sets were reused."
                    )
                for item in picked:
                    questions.extend(_expand_item(item))

        total_marks = sum(q["marks"] for q in questions)
        title_parts = []
        for subj in present_subjects:
            title_parts.append(" & ".join(chapter_titles_by_subject.get(subj, [])))
        title = " | ".join(f"{SUBJECT_LABELS[s]}: {t}" for s, t in zip(present_subjects, title_parts))

        results.append({
            "questions": questions,
            "total_marks": total_marks,
            "warnings": warnings,
            "title": title or "School Practice Paper",
            "set_label": _set_label(set_idx),
            "pattern": "school",
            "sections": [SUBJECT_LABELS[s] for s in present_subjects],
        })
    return results


# ---- Board (flexible mixed) pattern -----------------------------------------

# Exact question-count combinations that hit precisely 30 or 80 marks - the
# two paper lengths offered in the UI.
#
# CBSE has mandated (Circular Acad-53/2023, unchanged through 2026-27) that
# every board question paper's marks split by *typology* as: 50% Competency
# Based Questions (case-based/source-based passages with sub-questions, plus
# Assertion-Reason items), 20% plain/standalone MCQs, and 30% questions
# demanding a descriptive (short/long) answer. The combinations below are
# hand-tuned to hit that split exactly, using AR (1 mark, objective) and CBQ
# (4 marks/3 sub-questions, matching the real board paper's own convention)
# for the competency-based 50%, plain MCQ for the 20%, and 2M/3M/5M for the
# remaining 30% descriptive share. See typology_breakdown() below, which is
# attached to every generated paper so this split can be verified rather
# than just asserted. The previous map-based (MAP) question has been
# dropped from this pattern - it was a Social-Science-only bonus that Science
# chapters could never fully supply (see the README's note on the old "78
# instead of 80 marks" warning); the school pattern's own Geography section
# still includes MAP separately for chapters that have it.
#   30 marks = 6 MCQ (6) + 3 AR (3) + 3 CBQ (12) + 3x2M (6) + 1x3M (3) = 30
#     -> competency 15 (50%), MCQ 6 (20%), descriptive 9 (30%)
#   80 marks = 16 MCQ (16) + 8 AR (8) + 8 CBQ (32) + 4x2M (8) + 2x3M (6) + 2x5M (10) = 80
#     -> competency 40 (50%), MCQ 16 (20%), descriptive 24 (30%)
EXACT_BOARD_PATTERNS = {
    30: [("MCQ", 6), ("AR", 3), ("CBQ", 3), ("2M", 3), ("3M", 1)],
    80: [("MCQ", 16), ("AR", 8), ("CBQ", 8), ("2M", 4), ("3M", 2), ("5M", 2)],
}


def _board_pattern_for_marks(total_marks):
    if total_marks in EXACT_BOARD_PATTERNS:
        return EXACT_BOARD_PATTERNS[total_marks]
    if total_marks is None:
        return EXACT_BOARD_PATTERNS[30]
    # Fallback for any other total_marks value: scale proportionally from
    # the 30-mark competency-balanced pattern, preserving the same 50/20/30
    # typology split as closely as whole-question counts allow.
    scale = total_marks / 30.0
    mcq = max(1, round(6 * scale))
    ar = max(0, round(3 * scale))
    cbq = max(0, round(3 * scale))
    q2 = max(0, round(3 * scale))
    q3 = max(0, round(1 * scale))
    pattern = [("MCQ", mcq)]
    if ar:
        pattern.append(("AR", ar))
    if cbq:
        pattern.append(("CBQ", cbq))
    if q2:
        pattern.append(("2M", q2))
    if q3:
        pattern.append(("3M", q3))
    return pattern


# ---------------------------------------------------------------------------
# Typology audit - verifies a generated paper against CBSE's official
# 50% Competency-Based / 20% MCQ / 30% Descriptive typology mandate.
# ---------------------------------------------------------------------------

def typology_breakdown(questions):
    """Classify a generated paper's (already-flattened) questions into
    CBSE's three official typology buckets and return mark totals plus
    percentages for each:

    - competency: case-based/source-based passage questions (CBQ, MAP,
      READING, EXTRACT, CLOZE, EDITING, REPORTED - identified via
      group_type, which survives even for sub-questions whose own `type`
      was overridden to "MCQ" for grading) and Assertion-Reason (AR).
    - mcq: plain, standalone one-mark objective questions (type "MCQ" with
      no group_type, i.e. not part of a passage/case block).
    - descriptive: everything else (2M/3M/4M/5M, letter/article/essay-style
      questions, etc.).

    This is attached to every generated paper (see generate_paper) so the
    50/20/30 split can be verified per-paper rather than just assumed.
    """
    competency = mcq = descriptive = 0.0
    for q in questions:
        group_type = q.get("group_type")
        qtype = q.get("type")
        if group_type in PASSAGE_GROUP_TYPES or qtype == "AR":
            competency += q["marks"]
        elif qtype == "MCQ":
            mcq += q["marks"]
        else:
            descriptive += q["marks"]

    total = competency + mcq + descriptive

    def pct(x):
        return round((x / total) * 100, 1) if total else 0.0

    return {
        "competency_marks": round(competency, 1),
        "competency_pct": pct(competency),
        "mcq_marks": round(mcq, 1),
        "mcq_pct": pct(mcq),
        "descriptive_marks": round(descriptive, 1),
        "descriptive_pct": pct(descriptive),
        "total_marks": round(total, 1),
        "target": {"competency_pct": 50, "mcq_pct": 20, "descriptive_pct": 30},
    }


def _generate_flexible_paper(chapter_ids, pattern, num_sets, seed, pattern_label, default_title="Custom Paper"):
    """Shared engine behind both the fixed-total 'board' pattern and the
    user-driven 'custom' pattern: given an explicit list of (type, count)
    pairs, pool matching questions from the selected chapters, pick `count`
    of each type per set (favouring unused questions across sets, same as
    every other pattern), and flatten any passage-style items (CBQ etc.) via
    _expand_item. `pattern_label` is stamped onto each result's "pattern"
    field so the frontend/DB can tell which mode produced it."""
    rng = random.Random(seed)
    pattern_types = [t for t, _ in pattern]

    pool_flat = {t: [] for t in pattern_types}
    chapter_titles = []
    for cid in chapter_ids:
        subject, ch = find_chapter(cid)
        if not ch:
            continue
        chapter_titles.append(ch["title"])
        for q in ch["questions"]:
            if q["type"] not in pool_flat:
                continue
            q_copy = dict(q)
            q_copy["chapter_id"] = cid
            q_copy["chapter_title"] = ch["title"]
            q_copy["subject"] = subject
            pool_flat[q["type"]].append(q_copy)

    used_ids = {t: set() for t in pool_flat}

    results = []
    for set_idx in range(num_sets):
        selected = []
        warnings = []
        for qtype, count in pattern:
            if count <= 0:
                continue
            picked, had_to_reuse = _pick(pool_flat.get(qtype, []), count, used_ids[qtype], rng)
            if len(picked) < count:
                warnings.append(
                    f"Only {len(picked)} of {count} requested {qtype} questions were available "
                    f"in the bank for the selected chapter(s)."
                )
            elif had_to_reuse and num_sets > 1:
                warnings.append(
                    f"Ran out of unused {qtype} questions for {_set_label(set_idx)} - "
                    f"some repeats from earlier sets were reused."
                )
            for item in picked:
                selected.extend(_expand_item(item))

        total = sum(q["marks"] for q in selected)
        title = " + ".join(chapter_titles) if chapter_titles else default_title
        results.append({
            "questions": selected,
            "total_marks": total,
            "warnings": warnings,
            "title": title,
            "set_label": _set_label(set_idx),
            "pattern": pattern_label,
            "sections": [],
        })
    return results


def generate_board_pattern(chapter_ids, total_marks=None, num_sets=1, seed=None):
    """Generate `num_sets` flexible mixed-question papers (MCQ + 2/3/5 marks,
    plus one map-based question for the 80-mark paper - see
    EXACT_BOARD_PATTERNS), scaled to total_marks, not organised into fixed
    sections. Chapters from any subject are pooled together. MAP is a parent
    item (a shared instruction + 2 one-mark sub-questions) that gets expanded
    via _expand_item, same as in the school pattern."""
    pattern = _board_pattern_for_marks(total_marks)
    return _generate_flexible_paper(chapter_ids, pattern, num_sets, seed, pattern_label="board")


# Question types a user can pick a count for in "custom" mode. CBQ/MAP are
# deliberately excluded here - they're multi-part passage items (a shared
# context + several sub-questions worth different mark totals), so "give me
# N of them" doesn't map cleanly onto a single mark-count control the way
# MCQ/AR/2M/3M/5M do. They remain available via the "school"/"board" patterns.
CUSTOM_ALLOWED_TYPES = ["MCQ", "AR", "2M", "3M", "5M"]


def generate_custom_pattern(chapter_ids, type_counts, num_sets=1, seed=None):
    """Generate `num_sets` papers built from an explicit, user-chosen count
    per question type, e.g. {"2M": 10} for "10 questions of 2 marks", or
    {"MCQ": 5, "3M": 4} for a mixed custom set. Any type not in
    CUSTOM_ALLOWED_TYPES, or with a count <= 0, is ignored. Returns [] if no
    valid positive counts were given."""
    pattern = [
        (t, int(type_counts.get(t, 0) or 0))
        for t in CUSTOM_ALLOWED_TYPES
        if int(type_counts.get(t, 0) or 0) > 0
    ]
    if not pattern:
        return []
    return _generate_flexible_paper(chapter_ids, pattern, num_sets, seed, pattern_label="custom")


def generate_paper(chapter_ids, pattern="school", total_marks=None, num_sets=1, seed=None, custom_counts=None):
    num_sets = max(1, min(int(num_sets or 1), 10))
    if pattern == "custom":
        results = generate_custom_pattern(chapter_ids, custom_counts or {}, num_sets=num_sets, seed=seed)
    elif pattern == "board":
        results = generate_board_pattern(chapter_ids, total_marks=total_marks, num_sets=num_sets, seed=seed)
    elif pattern == "english":
        results = generate_english_pattern(chapter_ids, num_sets=num_sets, seed=seed)
    else:
        results = generate_school_pattern(chapter_ids, num_sets=num_sets, seed=seed)
    # Attach a typology audit (competency/MCQ/descriptive % vs CBSE's 50/20/30
    # mandate) to every generated paper, regardless of pattern, so compliance
    # can be checked for whatever chapters/subjects were actually selected.
    for r in results:
        r["typology"] = typology_breakdown(r["questions"])
    return results


# ---- English pattern (fixed 4-section CBSE Communicative board paper) ------
#
# Matches the structure of the real CBSE English (Communicative) board paper
# (80 marks, 3 hours, 4 sections) rather than a simplified approximation:
#
#   Section A - Reading Skills   (22 marks: one 12-mark + one 10-mark passage)
#   Section B - Writing Skills   (22 marks: Application 3 + Description 4 +
#                                  Letter 7 + Article 8)
#   Section C - Grammar          (10 marks: Cloze 3 + Editing 4 + Jumbled 1 +
#                                  Reported speech 2)
#   Section D - Literature       (26 marks: 2 extracts x 4 marks + 5 x 2-mark
#                                  short answers + 1 cross-text Compare essay
#                                  worth 8 marks)
#
# The real paper offers some questions as "answer any N of M" choices (e.g.
# 2 of 3 extracts, 5 of 6 short answers, 1 of 2 essay topics). This app
# doesn't have an "optional question" UI, so instead of asking the student to
# choose, each generated paper always includes exactly the number of
# questions that would be *required* after making that choice (2 extracts,
# 5 short answers, 1 essay) - equivalent in difficulty and totals, just
# without a discard step.

ENGLISH_SECTIONS = [
    "Section A - Reading Skills",
    "Section B - Writing Skills",
    "Section C - Grammar",
    "Section D - Literature Textbook",
]


def generate_english_pattern(chapter_ids, num_sets=1, seed=None):
    """Generate `num_sets` CBSE English (Communicative) board-style papers,
    each totalling 80 marks across the four fixed sections described above.

    Section A pulls two passages from the subject-level `reading_bank`
    (english.json) - one tagged `variant: "P1"` (12 marks) and one tagged
    `variant: "P2"` (10 marks) - not tied to any chapter, since reading
    skill is assessed independently of the literature syllabus.

    Section B and C are always drawn from the "grammar_writing" chapter,
    regardless of whether it appears in chapter_ids, since every English
    paper needs a writing & grammar section.

    Section D is drawn from whichever literature chapters (fiction/poetry/
    drama) are present in chapter_ids - if none of the recognised literature
    chapters are selected, all of them are pooled so a paper can still be
    generated. The Compare essay is drawn from a subject-level `compare_bank`
    (each prompt already names its own two texts, so it isn't filtered by
    chapter_ids either).
    """
    rng = random.Random(seed)
    subjects = _load()
    english = subjects.get("english")
    if not english:
        return []

    chapters_by_id = {c["id"]: c for c in english["chapters"]}
    grammar_chapter = chapters_by_id.get("grammar_writing")
    literature_chapter_ids = [cid for cid in chapters_by_id if cid != "grammar_writing"]

    chosen_lit_ids = [cid for cid in chapter_ids if cid in literature_chapter_ids]
    if not chosen_lit_ids:
        chosen_lit_ids = literature_chapter_ids

    # Build the Literature pool (Section D) from the chosen chapters.
    lit_pool = {"EXTRACT": [], "2M": []}
    lit_chapter_titles = []
    for cid in chosen_lit_ids:
        ch = chapters_by_id.get(cid)
        if not ch:
            continue
        lit_chapter_titles.append(ch["title"])
        for q in ch["questions"]:
            if q["type"] not in lit_pool:
                continue
            q_copy = dict(q)
            q_copy["chapter_id"] = cid
            q_copy["chapter_title"] = ch["title"]
            q_copy["subject"] = "english"
            q_copy["section"] = ENGLISH_SECTIONS[3]
            lit_pool[q["type"]].append(q_copy)

    # Compare-essay pool (also Section D) - subject-level, spans two chapters
    # each, so it isn't built from chosen_lit_ids.
    compare_pool = []
    for item in english.get("compare_bank", []):
        item_copy = dict(item)
        item_copy["chapter_id"] = "compare_bank"
        item_copy["chapter_title"] = "Literature (Comparative)"
        item_copy["subject"] = "english"
        item_copy["section"] = ENGLISH_SECTIONS[3]
        compare_pool.append(item_copy)

    # Writing & Grammar pools (Sections B and C) - always from the
    # grammar_writing chapter, independent of chapter_ids.
    grammar_pool = {
        "APPLICATION": [], "DESCRIPTION": [], "LETTER": [], "ARTICLE": [],
        "CLOZE": [], "EDITING": [], "JUMBLED": [], "REPORTED": [],
    }
    if grammar_chapter:
        for q in grammar_chapter["questions"]:
            if q["type"] not in grammar_pool:
                continue
            q_copy = dict(q)
            q_copy["chapter_id"] = "grammar_writing"
            q_copy["chapter_title"] = grammar_chapter["title"]
            q_copy["subject"] = "english"
            q_copy["section"] = ENGLISH_SECTIONS[1] if q["type"] in ("APPLICATION", "DESCRIPTION", "LETTER", "ARTICLE") else ENGLISH_SECTIONS[2]
            grammar_pool[q["type"]].append(q_copy)

    # Reading pool (Section A) from the subject-level bank, split by variant.
    reading_pool = {"P1": [], "P2": []}
    for item in english.get("reading_bank", []):
        variant = item.get("variant", "P1")
        if variant not in reading_pool:
            continue
        item_copy = dict(item)
        item_copy["chapter_id"] = "reading_bank"
        item_copy["chapter_title"] = "Reading Skills"
        item_copy["subject"] = "english"
        item_copy["section"] = ENGLISH_SECTIONS[0]
        reading_pool[variant].append(item_copy)

    used_ids = {
        "reading_p1": set(), "reading_p2": set(),
        "application": set(), "description": set(), "letter": set(), "article": set(),
        "cloze": set(), "editing": set(), "jumbled": set(), "reported": set(),
        "extract": set(), "2m": set(), "compare": set(),
    }

    results = []
    for set_idx in range(num_sets):
        selected = []
        warnings = []

        def take(pool_list, count, key, label):
            picked, had_to_reuse = _pick(pool_list, count, used_ids[key], rng)
            if len(picked) < count:
                warnings.append(f"Only {len(picked)} of {count} {label} were available in the bank.")
            elif had_to_reuse and num_sets > 1:
                warnings.append(f"Ran out of unused {label} for {_set_label(set_idx)} - some repeats were reused.")
            return picked

        # Section A - Reading Skills (22 = 12 + 10)
        for item in take(reading_pool["P1"], 1, "reading_p1", "12-mark reading passage(s)"):
            selected.extend(_expand_item(item))
        for item in take(reading_pool["P2"], 1, "reading_p2", "10-mark reading passage(s)"):
            selected.extend(_expand_item(item))

        # Section B - Writing Skills (22 = 3 + 4 + 7 + 8)
        selected.extend(take(grammar_pool["APPLICATION"], 1, "application", "application-writing question(s)"))
        selected.extend(take(grammar_pool["DESCRIPTION"], 1, "description", "factual description question(s)"))
        selected.extend(take(grammar_pool["LETTER"], 1, "letter", "letter-writing question(s)"))
        selected.extend(take(grammar_pool["ARTICLE"], 1, "article", "article-writing question(s)"))

        # Section C - Grammar (10 = 3 + 4 + 1 + 2)
        for item in take(grammar_pool["CLOZE"], 1, "cloze", "cloze/gap-fill passage(s)"):
            selected.extend(_expand_item(item))
        for item in take(grammar_pool["EDITING"], 1, "editing", "editing/omission passage(s)"):
            selected.extend(_expand_item(item))
        selected.extend(take(grammar_pool["JUMBLED"], 1, "jumbled", "jumbled-sentence question(s)"))
        for item in take(grammar_pool["REPORTED"], 1, "reported", "reported-speech question(s)"):
            selected.extend(_expand_item(item))

        # Section D - Literature Textbook (26 = 2x4 + 5x2 + 8)
        for item in take(lit_pool["EXTRACT"], 2, "extract", "literature extract passage(s)"):
            selected.extend(_expand_item(item))
        selected.extend(take(lit_pool["2M"], 5, "2m", "2-mark literature short-answer question(s)"))
        selected.extend(take(compare_pool, 1, "compare", "cross-text comparison essay question(s)"))

        total = sum(q["marks"] for q in selected)
        title = "English: " + (" + ".join(lit_chapter_titles) if lit_chapter_titles else "Practice Paper")
        results.append({
            "questions": selected,
            "total_marks": total,
            "warnings": warnings,
            "title": title,
            "set_label": _set_label(set_idx),
            "pattern": "english",
            "sections": ENGLISH_SECTIONS,
        })
    return results
