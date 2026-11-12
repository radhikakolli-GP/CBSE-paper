"""
"Ask AI" v2 - a LangGraph agent: Router + RAG with grading.

This is the learning upgrade of ai_tutor.py. ai_tutor.py does one straight
pass (keyword search across ALL subjects -> one Groq call). That pass has two
weaknesses you can see with content_store.search_topics() today:

  * "what is power"            -> mixes Physics (lens power, electric power)
                                  with Civics (power sharing)
  * "how does a convex lens…"  -> also pulls in a Quadratic Equations section
  * "why did non-cooperation…" -> also pulls in Metals and Non-metals

This graph fixes both, one LangGraph pattern at a time:

    START
      |
    route ----------(off-syllabus / chit-chat)----------> respond_directly -> END
      |
    retrieve  <-----------------------------+
      |                                     |
    grade_documents --(nothing relevant, ---> rewrite_query
      |                tries left)
      |
    generate  <----------------------------+
      |                                    |
    check_grounding --(not supported, ------+
      |                one retry left)
     END

  1. ROUTER          route            - a small, fast model classifies the
                                        question by subject group and intent;
                                        retrieval is then limited to that
                                        subject group.
  2. RAG + GRADING   retrieve         - reuses content_store.search_topics()
                     grade_documents  - LLM marks each retrieved section
                                        relevant / not relevant; irrelevant
                                        ones are dropped
                     rewrite_query    - nothing relevant? rewrite the search
                                        query and retrieve again (max 2 times)
                     generate         - answer from the graded sections only
                     check_grounding  - LLM checks the answer is supported by
                                        those sections; if not, regenerate once
                                        with a stricter instruction

Same design rules as the rest of the backend:
  * Only ONE extra package: `langgraph` (see requirements-ai.txt). Groq is
    still called directly over HTTPS with urllib - no langchain-groq/openai.
  * Degrades gracefully: if langgraph isn't installed or GROQ_API_KEY isn't
    set, ask_graph() falls back to ai_tutor.ask_tutor() / reports why.
  * Never raises to the caller - errors come back in the `error` field.

Try it from the backend folder:
    pip3 install -r requirements-ai.txt
    export GROQ_API_KEY=...
    python3 ai_graph.py "what is power"
    python3 ai_graph.py --mermaid          # prints the graph as a Mermaid diagram
"""
import json
import os
import sys
import urllib.error
import urllib.request
from typing import List, TypedDict

import ai_tutor
import content_store

try:
    from langgraph.graph import END, START, StateGraph
    LANGGRAPH_AVAILABLE = True
except ImportError:  # optional dependency, same pattern as OCR
    LANGGRAPH_AVAILABLE = False

GROQ_API_URL = ai_tutor.GROQ_API_URL
# A small fast model is enough for classification and yes/no grading;
# the bigger model is kept for writing the actual answer.
ROUTER_MODEL = os.environ.get("GROQ_ROUTER_MODEL", "llama-3.1-8b-instant")
ANSWER_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
TIMEOUT_SECONDS = 25

RETRIEVE_CANDIDATES = 40   # pull wide from the keyword search ...
RETRIEVE_KEEP = 6          # ... then keep the top N inside the routed subject
MAX_REWRITES = 2
MAX_REGENERATIONS = 1

# subject_group values used in backend/content/*.json
SUBJECT_GROUPS = {
    "science": "Science (Physics, Chemistry, Biology)",
    "mathematics": "Mathematics",
    "social_science": "Social Science (History, Geography, Civics/Political Science, Economics)",
    "english": "English (Literature Reader, Grammar, Writing, Reading)",
}
INTENTS = ["concept_doubt", "solve_problem", "exam_tips", "off_syllabus", "chit_chat"]


# ---------------------------------------------------------------------------
# State - the single object that flows through every node.
# Each node returns only the keys it changes; LangGraph merges them in.
# ---------------------------------------------------------------------------
class TutorState(TypedDict, total=False):
    question: str            # the student's original question (never changed)
    subject_group: str       # router output: one of SUBJECT_GROUPS, or "any"
    intent: str              # router output: one of INTENTS
    search_query: str        # what we actually search with (rewritten on retry)
    rewrites: int
    docs: List[dict]         # sections returned by retrieval
    relevant_docs: List[dict]  # sections that passed grading
    answer: str
    grounded: bool
    regenerations: int
    trace: List[str]         # human-readable log of every step, for learning


# ---------------------------------------------------------------------------
# Groq helper
# ---------------------------------------------------------------------------
class LLMError(Exception):
    pass


def _groq(messages, model, temperature=0.0, max_tokens=500, json_mode=False):
    payload = {"model": model, "messages": messages,
               "temperature": temperature, "max_tokens": max_tokens}
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    req = urllib.request.Request(
        GROQ_API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "cbse-study-app/1.0",  # see note in ai_tutor.py
            "Authorization": f"Bearer {os.environ.get('GROQ_API_KEY', '')}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
            body = json.loads(resp.read().decode("utf-8"))
        return body["choices"][0]["message"]["content"].strip()
    except urllib.error.HTTPError as e:
        raise LLMError(f"Groq API error ({e.code}): {e.read().decode('utf-8', 'replace')[:300]}")
    except urllib.error.URLError as e:
        raise LLMError(f"Couldn't reach Groq's API ({e.reason})")


def _llm_json(system, user, model=ROUTER_MODEL):
    """Ask for a JSON object back. Tests replace this function with a fake."""
    raw = _groq([{"role": "system", "content": system},
                 {"role": "user", "content": user}],
                model=model, json_mode=True, max_tokens=400)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise LLMError(f"Model did not return valid JSON: {raw[:200]}")


def _llm_text(system, user, model=ANSWER_MODEL):
    """Free-text answer. Tests replace this function with a fake."""
    return _groq([{"role": "system", "content": system},
                  {"role": "user", "content": user}],
                 model=model, temperature=0.3, max_tokens=700)


def _context_block(docs):
    return "\n\n".join(
        f"[{i}] {d['subject_label']} - {d['chapter_title']} - {d['section_title']}\n{d['content']}"
        for i, d in enumerate(docs)
    )


# ---------------------------------------------------------------------------
# Nodes
# ---------------------------------------------------------------------------
def route(state: TutorState) -> dict:
    """PATTERN 1 - Router: decide subject group and intent."""
    groups = "\n".join(f"- {k}: {v}" for k, v in SUBJECT_GROUPS.items())
    system = (
        "You route questions from a CBSE Class 10 student to the right subject. "
        "Reply with JSON only: {\"subject_group\": ..., \"intent\": ..., \"reason\": ...}.\n"
        f"subject_group must be one of:\n{groups}\n- any: genuinely spans subjects or is unclear\n"
        f"intent must be one of: {', '.join(INTENTS)}.\n"
        "Use off_syllabus for questions outside CBSE Class 10 study, chit_chat for greetings or small talk. "
        "Watch for words that mean different things in different subjects: "
        "'power' (physics: electric power/power of a lens; civics: power sharing), "
        "'resources' (geography vs economics), 'movement' (physics motion vs history)."
    )
    out = _llm_json(system, f"Question: {state['question']}")
    group = out.get("subject_group", "any")
    if group not in SUBJECT_GROUPS:
        group = "any"
    intent = out.get("intent", "concept_doubt")
    if intent not in INTENTS:
        intent = "concept_doubt"
    return {
        "subject_group": group,
        "intent": intent,
        "search_query": state["question"],
        "rewrites": 0,
        "regenerations": 0,
        "trace": state.get("trace", []) + [
            f"route: subject_group={group}, intent={intent} ({out.get('reason', '')})"],
    }


def retrieve(state: TutorState) -> dict:
    """Keyword search over the content bank, limited to the routed subject."""
    hits = content_store.search_topics(state["search_query"], limit=RETRIEVE_CANDIDATES)
    group = state.get("subject_group", "any")
    if group != "any":
        hits = [h for h in hits if h.get("subject_group") == group]
    hits = hits[:RETRIEVE_KEEP]
    titles = "; ".join(f"{h['chapter_title']} / {h['section_title']}" for h in hits) or "nothing"
    return {
        "docs": hits,
        "trace": state["trace"] + [f"retrieve '{state['search_query']}' in {group}: {len(hits)} sections -> {titles}"],
    }


def grade_documents(state: TutorState) -> dict:
    """PATTERN 2a - grade each retrieved section; keep only relevant ones."""
    docs = state.get("docs", [])
    if not docs:
        return {"relevant_docs": [], "trace": state["trace"] + ["grade: no sections to grade"]}
    system = (
        "You check whether study-note sections are relevant to a student's question. "
        "A section is relevant if it contains facts needed to answer the question, "
        "not merely a shared keyword. Reply with JSON only: "
        "{\"grades\": [{\"index\": 0, \"relevant\": true, \"reason\": \"...\"}, ...]} "
        "with one entry per section."
    )
    user = f"Question: {state['question']}\n\nSections:\n{_context_block(docs)}"
    out = _llm_json(system, user)
    keep = {g.get("index") for g in out.get("grades", []) if g.get("relevant") is True}
    relevant = [d for i, d in enumerate(docs) if i in keep]
    dropped = [d["section_title"] for i, d in enumerate(docs) if i not in keep]
    return {
        "relevant_docs": relevant,
        "trace": state["trace"] + [
            f"grade: kept {len(relevant)}/{len(docs)}" + (f", dropped: {'; '.join(dropped)}" if dropped else "")],
    }


def rewrite_query(state: TutorState) -> dict:
    """PATTERN 2b - nothing relevant came back: rewrite the search query."""
    system = (
        "Rewrite a student's question into a short keyword search query for CBSE Class 10 "
        "notes: use the textbook terms a chapter heading would use, drop filler words. "
        "Reply with JSON only: {\"query\": \"...\"}."
    )
    user = (f"Question: {state['question']}\nSubject: {state.get('subject_group')}\n"
            f"Previous query that found nothing useful: {state['search_query']}")
    out = _llm_json(system, user)
    new_q = (out.get("query") or state["question"]).strip()
    return {
        "search_query": new_q,
        "rewrites": state.get("rewrites", 0) + 1,
        "trace": state["trace"] + [f"rewrite #{state.get('rewrites', 0) + 1}: '{new_q}'"],
    }


def generate(state: TutorState) -> dict:
    """Write the answer from the graded sections only."""
    docs = state.get("relevant_docs", [])
    strict = state.get("regenerations", 0) > 0
    if docs:
        user = (f"CONTEXT (from this app's own CBSE Class 10 notes):\n{_context_block(docs)}\n\n"
                f"Student's question: {state['question']}")
        if strict:
            user += ("\n\nIMPORTANT: your previous answer included claims not supported by the "
                     "CONTEXT. Use only facts from the CONTEXT; if something is missing, say so.")
    else:
        user = (f"(No matching section was found in the app's notes.)\n\n"
                f"Student's question: {state['question']}\n\n"
                "Answer at CBSE Class 10 level and start by saying this isn't covered in the app's notes.")
    answer = _llm_text(ai_tutor.SYSTEM_PROMPT, user)
    return {
        "answer": answer,
        "trace": state["trace"] + [f"generate{' (strict retry)' if strict else ''}: {len(answer)} chars from {len(docs)} sections"],
    }


def check_grounding(state: TutorState) -> dict:
    """PATTERN 2c - is the answer actually supported by the sections used?"""
    docs = state.get("relevant_docs", [])
    if not docs:
        return {"grounded": False,
                "trace": state["trace"] + ["grounding: skipped (answer not from notes)"]}
    system = (
        "You check a tutor's answer against source notes. grounded=true if every factual "
        "claim in the answer is supported by the notes (explanations and rephrasing are fine). "
        "Reply with JSON only: {\"grounded\": true/false, \"unsupported\": [\"claim\", ...]}."
    )
    user = f"NOTES:\n{_context_block(docs)}\n\nANSWER:\n{state['answer']}"
    out = _llm_json(system, user)
    grounded = out.get("grounded") is True
    note = "" if grounded else f" unsupported: {out.get('unsupported', [])}"
    return {
        "grounded": grounded,
        "regenerations": state.get("regenerations", 0) + (0 if grounded else 1),
        "trace": state["trace"] + [f"grounding: {'supported' if grounded else 'NOT supported'}.{note}"],
    }


def respond_directly(state: TutorState) -> dict:
    """Off-syllabus or chit-chat: no retrieval needed."""
    if state.get("intent") == "chit_chat":
        answer = "Hi! Ask me any CBSE Class 10 doubt - Science, Maths, Social Science or English."
    else:
        answer = ("That looks outside the CBSE Class 10 syllabus, so I'll skip it here. "
                  "Try asking about a chapter from Science, Maths, Social Science or English.")
    return {"answer": answer, "grounded": False,
            "trace": state["trace"] + ["respond_directly: no retrieval"]}


# ---------------------------------------------------------------------------
# Conditional edges - plain functions that look at the state and name the next node
# ---------------------------------------------------------------------------
def after_route(state: TutorState) -> str:
    return "respond_directly" if state.get("intent") in ("off_syllabus", "chit_chat") else "retrieve"


def after_grading(state: TutorState) -> str:
    if state.get("relevant_docs"):
        return "generate"
    if state.get("rewrites", 0) < MAX_REWRITES:
        return "rewrite_query"
    return "generate"   # give up searching; generate() says it's not in the notes


def after_grounding(state: TutorState) -> str:
    if state.get("grounded") or not state.get("relevant_docs"):
        return END
    if state.get("regenerations", 0) <= MAX_REGENERATIONS:
        return "generate"
    return END


def build_graph():
    g = StateGraph(TutorState)
    g.add_node("route", route)
    g.add_node("respond_directly", respond_directly)
    g.add_node("retrieve", retrieve)
    g.add_node("grade_documents", grade_documents)
    g.add_node("rewrite_query", rewrite_query)
    g.add_node("generate", generate)
    g.add_node("check_grounding", check_grounding)

    g.add_edge(START, "route")
    g.add_conditional_edges("route", after_route, ["retrieve", "respond_directly"])
    g.add_edge("respond_directly", END)
    g.add_edge("retrieve", "grade_documents")
    g.add_conditional_edges("grade_documents", after_grading, ["generate", "rewrite_query"])
    g.add_edge("rewrite_query", "retrieve")
    g.add_edge("generate", "check_grounding")
    g.add_conditional_edges("check_grounding", after_grounding, ["generate", END])
    return g.compile()


_graph = None


def _get_graph():
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph


# ---------------------------------------------------------------------------
# Public API - same response shape as ai_tutor.ask_tutor(), plus extras
# ---------------------------------------------------------------------------
def ask_graph(question):
    """
    Returns {"answer", "sources", "error", "route", "grounded", "trace", "engine"}.
    Falls back to ai_tutor.ask_tutor() when langgraph isn't installed.
    """
    question = (question or "").strip()
    if not LANGGRAPH_AVAILABLE:
        result = ai_tutor.ask_tutor(question)
        result.update({"engine": "ai_tutor (langgraph not installed)", "trace": [], "route": None})
        return result
    if not question:
        return {"answer": "", "sources": [], "error": "Please type a question first."}
    if len(question) > 2000:
        return {"answer": "", "sources": [], "error": "That question is too long - please shorten it to under 2000 characters."}
    status = ai_tutor.ai_status()
    if not status["available"]:
        return {"answer": "", "sources": [], "error": status["reason"]}

    try:
        final = _get_graph().invoke({"question": question, "trace": []})
    except LLMError as e:
        return {"answer": "", "sources": [], "error": str(e), "engine": "langgraph"}
    except Exception as e:
        return {"answer": "", "sources": [], "error": f"Unexpected error in the AI tutor graph: {e}", "engine": "langgraph"}

    sources = [{
        "chapter_id": d["chapter_id"], "chapter_title": d["chapter_title"],
        "subject_label": d["subject_label"], "section_title": d["section_title"],
    } for d in final.get("relevant_docs", [])]
    return {
        "answer": final.get("answer", ""),
        "sources": sources,
        "error": None,
        "route": {"subject_group": final.get("subject_group"), "intent": final.get("intent")},
        "grounded": final.get("grounded", False),
        "trace": final.get("trace", []),
        "engine": "langgraph",
    }


if __name__ == "__main__":
    if not LANGGRAPH_AVAILABLE:
        sys.exit("langgraph is not installed - run: pip3 install -r requirements-ai.txt")
    if len(sys.argv) > 1 and sys.argv[1] == "--mermaid":
        print(_get_graph().get_graph().draw_mermaid())
        sys.exit(0)
    q = " ".join(sys.argv[1:]) or "what is power"
    res = ask_graph(q)
    if res.get("error"):
        sys.exit(f"Error: {res['error']}")
    print("\n".join("  - " + t for t in res["trace"]))
    print(f"\nRoute: {res['route']}   Grounded: {res['grounded']}\n")
    print(res["answer"])
    if res["sources"]:
        print("\nSources:")
        for s in res["sources"]:
            print(f"  - {s['subject_label']} / {s['chapter_title']} / {s['section_title']}")
