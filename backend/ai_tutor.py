"""
Real-time "Ask AI" tutor - Groq-backed, grounded (RAG) in this app's own
curated content bank.

Retrieval: reuses content_store.search_topics(), the same keyword/relevance
search that already powers "Ask a Topic" - so the tutor is grounded in the
~1,800 hand-verified CBSE Class 10 notes sections/questions already in
backend/content/*.json, not just the model's own general knowledge. No new
indexing step, no new dependency for retrieval.

Generation: calls Groq's OpenAI-compatible chat completions REST API
directly via urllib.request - Groq's API is plain HTTPS + JSON, so no `groq`
or `openai` pip package is needed. This keeps the core app's "Python
standard library only" design intact; the AI tutor is the one feature that
also needs outbound internet access and a live API key.

Degrades gracefully (same pattern as ocr.py) if GROQ_API_KEY isn't set: the
feature reports itself unavailable via ai_status() rather than the app
breaking, and the frontend is expected to check that status before showing
the question box (see AskAIView in frontend/index.html).
"""
import json
import os
import urllib.request
import urllib.error

import content_store

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
TIMEOUT_SECONDS = 25
RETRIEVAL_LIMIT = 5

SYSTEM_PROMPT = (
    "You are a friendly, patient tutor for a CBSE Class 10 student in India. "
    "Explain concepts clearly and step by step, the way a good teacher would "
    "explain something to someone learning it for the first time. "
    "\n\n"
    "You will sometimes be given a CONTEXT section pulled from this app's own "
    "curated CBSE Class 10 notes and question bank. When it contains material "
    "relevant to the student's question, ground your answer in it and stay "
    "consistent with its terminology, scope and level - do not go beyond "
    "CBSE Class 10 syllabus depth (e.g. don't bring in Class 11/12 detail). "
    "If the context doesn't cover the question, answer from your own "
    "knowledge but still keep strictly to a CBSE Class 10 level, and say "
    "plainly if you're not certain about an exam-specific detail (like exact "
    "mark-scheme wording) instead of guessing. "
    "\n\n"
    "Keep answers focused and not overly long - a student is reading this "
    "mid-homework, not a textbook chapter."
)


def ai_status():
    """Mirrors ocr.ocr_status()'s shape, for the same proactive frontend check."""
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        return {
            "available": False,
            "reason": "GROQ_API_KEY environment variable is not set (get a free key at console.groq.com/keys)",
        }
    return {"available": True, "reason": None, "model": GROQ_MODEL}


def _retrieve_context(question, limit=RETRIEVAL_LIMIT):
    """
    RAG retrieval step: reuse the existing topic search over notes.sections
    across every subject. Returns (context_text, sources) - sources is a
    list of {chapter_id, chapter_title, subject_label, section_title} the
    frontend can display so the student can see what grounded the answer.
    """
    try:
        results = content_store.search_topics(question, limit=limit)
    except Exception:
        return "", []
    if not results:
        return "", []
    blocks = []
    sources = []
    for r in results:
        blocks.append(
            f"[{r['subject_label']} – {r['chapter_title']} – {r['section_title']}]\n{r['content']}"
        )
        sources.append({
            "chapter_id": r["chapter_id"],
            "chapter_title": r["chapter_title"],
            "subject_label": r["subject_label"],
            "section_title": r["section_title"],
        })
    return "\n\n".join(blocks), sources


def ask_tutor(question, limit=RETRIEVAL_LIMIT):
    """
    Returns {"answer": str, "sources": [...], "error": str|None}.

    Never raises - every failure mode (missing key, network error, bad
    response from Groq) is caught and returned as a clear `error` string
    instead, same graceful-degradation approach used throughout ocr.py.
    """
    question = (question or "").strip()
    if not question:
        return {"answer": "", "sources": [], "error": "Please type a question first."}
    if len(question) > 2000:
        return {"answer": "", "sources": [], "error": "That question is too long - please shorten it to under 2000 characters."}

    status = ai_status()
    if not status["available"]:
        return {"answer": "", "sources": [], "error": status["reason"]}

    context, sources = _retrieve_context(question, limit=limit)
    user_content = (
        (f"CONTEXT (from this app's own CBSE Class 10 notes/question bank - "
         f"may or may not be relevant to this question):\n{context}\n\n" if context else "")
        + f"Student's question: {question}"
    )

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        "temperature": 0.3,
        "max_tokens": 700,
    }
    req = urllib.request.Request(
        GROQ_API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {os.environ.get('GROQ_API_KEY', '')}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
            body = json.loads(resp.read().decode("utf-8"))
        answer = body["choices"][0]["message"]["content"].strip()
        return {"answer": answer, "sources": sources, "error": None}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            msg = json.loads(raw).get("error", {}).get("message", raw)
        except Exception:
            msg = raw
        return {"answer": "", "sources": sources, "error": f"Groq API error ({e.code}): {msg}"}
    except urllib.error.URLError as e:
        return {"answer": "", "sources": sources, "error": f"Couldn't reach Groq's API - check the server's internet connection. ({e.reason})"}
    except Exception as e:
        return {"answer": "", "sources": sources, "error": f"Unexpected error calling the AI tutor: {e}"}
