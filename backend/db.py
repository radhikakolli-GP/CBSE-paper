"""
Persistence layer for the CBSE SST Practice app.

Two backends, chosen automatically:

- SQLite (default): zero-install, used when no DATABASE_URL env var is set.
  This is what local development and the original single-file deploy use.
- Postgres (e.g. Supabase): used when DATABASE_URL is set. Meant for hosts
  like Render whose free tier has an ephemeral filesystem - pointing this
  at a Supabase Postgres database keeps generated papers and attempt
  history persistent for free, without needing a paid disk.

  IMPORTANT: use Supabase's "Session pooler" connection string, not the
  "Direct connection" one. Supabase's direct connection is IPv6-only, and
  hosts like Render/Railway don't support outbound IPv6, so that string
  will fail to connect from them. The pooler connection string is IPv4
  and works everywhere. See DEPLOY.md for the exact steps.

  This backend needs the psycopg2-binary package (see requirements.txt) -
  it's only imported when DATABASE_URL is actually set, so plain local
  SQLite use still needs nothing beyond the standard library.
"""
import json
import os
import threading

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app.db")
DATABASE_URL = os.environ.get("DATABASE_URL")
_USE_POSTGRES = bool(DATABASE_URL)

_local = threading.local()


# ---------------------------------------------------------------------------
# Connection handling
# ---------------------------------------------------------------------------
def get_conn():
    """Return a thread-local connection to whichever backend is active."""
    if _USE_POSTGRES:
        return _get_pg_conn()
    return _get_sqlite_conn()


def _get_sqlite_conn():
    import sqlite3
    if not hasattr(_local, "conn"):
        _local.conn = sqlite3.connect(DB_PATH)
        _local.conn.row_factory = sqlite3.Row
        _local.conn.execute("PRAGMA foreign_keys = ON")
    return _local.conn


def _get_pg_conn():
    if not hasattr(_local, "conn"):
        try:
            import psycopg2
            import psycopg2.extras
        except ImportError:
            raise RuntimeError(
                "DATABASE_URL is set (Postgres/Supabase mode) but the 'psycopg2-binary' "
                "package isn't installed. It's listed in backend/requirements.txt - make "
                "sure your host's build step runs `pip install -r backend/requirements.txt`."
            )
        _local.conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    return _local.conn


def _q(sql):
    """Translate SQLite's `?` placeholders to Postgres's `%s` when needed.
    Safe because none of this module's SQL text contains a literal `?` -
    every `?` that appears is a bind-parameter placeholder."""
    return sql.replace("?", "%s") if _USE_POSTGRES else sql


def _execute(conn, sql, params=()):
    """Run a query on either backend and return a cursor with
    .fetchone()/.fetchall(), matching sqlite3's conn.execute() shape."""
    if _USE_POSTGRES:
        cur = conn.cursor()
        cur.execute(_q(sql), params)
        return cur
    return conn.execute(sql, params)


def _insert(conn, sql, params):
    """Run an INSERT and return the new row's id, on either backend."""
    if _USE_POSTGRES:
        cur = conn.cursor()
        cur.execute(_q(sql) + " RETURNING id", params)
        new_id = cur.fetchone()["id"]
        conn.commit()
        return new_id
    cur = conn.execute(sql, params)
    conn.commit()
    return cur.lastrowid


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------
SQLITE_SCHEMA = """
CREATE TABLE IF NOT EXISTS papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    chapters_json TEXT NOT NULL,      -- list of chapter ids included
    total_marks INTEGER NOT NULL,
    questions_json TEXT NOT NULL,     -- full question objects (incl. answer key/rubric) - server-side only
    pattern TEXT DEFAULT '',          -- "board" / "school" / "english" - needed to re-render a saved paper later
    sections_json TEXT DEFAULT '[]',  -- section labels (English/school patterns) - needed for history re-view
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id INTEGER NOT NULL REFERENCES papers(id),
    student_name TEXT NOT NULL,
    answers_json TEXT NOT NULL,       -- raw answers submitted by student
    results_json TEXT NOT NULL,       -- graded results (per-question score + feedback)
    total_score REAL NOT NULL,
    total_marks INTEGER NOT NULL,
    submitted_at TEXT DEFAULT (datetime('now'))
);
"""

# Same shape as SQLITE_SCHEMA, translated to Postgres DDL. created_at /
# submitted_at are deliberately kept as TEXT (via to_char) rather than a
# native TIMESTAMP column - psycopg2 would otherwise hand back a Python
# datetime object, which json.dumps() can't serialize, and server.py's
# _send_json() would break on every response that includes one.
POSTGRES_SCHEMA = """
CREATE TABLE IF NOT EXISTS papers (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    chapters_json TEXT NOT NULL,
    total_marks INTEGER NOT NULL,
    questions_json TEXT NOT NULL,
    pattern TEXT DEFAULT '',
    sections_json TEXT DEFAULT '[]',
    created_at TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    paper_id INTEGER NOT NULL REFERENCES papers(id),
    student_name TEXT NOT NULL,
    answers_json TEXT NOT NULL,
    results_json TEXT NOT NULL,
    total_score REAL NOT NULL,
    total_marks INTEGER NOT NULL,
    submitted_at TEXT DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
);
"""


def init_db():
    conn = get_conn()
    if _USE_POSTGRES:
        cur = conn.cursor()
        cur.execute(POSTGRES_SCHEMA)
        conn.commit()
    else:
        conn.executescript(SQLITE_SCHEMA)
        conn.commit()


# ---------------------------------------------------------------------------
# Papers
# ---------------------------------------------------------------------------
def save_paper(title, chapters, total_marks, questions, pattern="", sections=None):
    conn = get_conn()
    return _insert(
        conn,
        "INSERT INTO papers (title, chapters_json, total_marks, questions_json, pattern, sections_json) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (title, json.dumps(chapters), total_marks, json.dumps(questions), pattern, json.dumps(sections or [])),
    )


def get_paper(paper_id):
    conn = get_conn()
    row = _execute(conn, "SELECT * FROM papers WHERE id = ?", (paper_id,)).fetchone()
    if not row:
        return None
    keys = row.keys()
    return {
        "id": row["id"],
        "title": row["title"],
        "chapters": json.loads(row["chapters_json"]),
        "total_marks": row["total_marks"],
        "questions": json.loads(row["questions_json"]),
        # older rows saved before these columns existed won't have them -
        # fall back gracefully instead of raising.
        "pattern": row["pattern"] if "pattern" in keys and row["pattern"] is not None else "",
        "sections": json.loads(row["sections_json"]) if "sections_json" in keys and row["sections_json"] else [],
        "created_at": row["created_at"],
    }


# ---------------------------------------------------------------------------
# Submissions
# ---------------------------------------------------------------------------
def save_submission(paper_id, student_name, answers, results, total_score, total_marks):
    conn = get_conn()
    return _insert(
        conn,
        "INSERT INTO submissions (paper_id, student_name, answers_json, results_json, total_score, total_marks) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (paper_id, student_name, json.dumps(answers), json.dumps(results), total_score, total_marks),
    )


def get_submission(sub_id):
    conn = get_conn()
    row = _execute(conn, "SELECT * FROM submissions WHERE id = ?", (sub_id,)).fetchone()
    if not row:
        return None
    return _row_to_submission(row)


def get_submissions_for_student(student_name):
    conn = get_conn()
    rows = _execute(
        conn,
        "SELECT * FROM submissions WHERE student_name = ? ORDER BY submitted_at ASC",
        (student_name,),
    ).fetchall()
    return [_row_to_submission(r) for r in rows]


def get_all_students():
    conn = get_conn()
    rows = _execute(conn, "SELECT DISTINCT student_name FROM submissions ORDER BY student_name").fetchall()
    return [r["student_name"] for r in rows]


def _row_to_submission(row):
    return {
        "id": row["id"],
        "paper_id": row["paper_id"],
        "student_name": row["student_name"],
        "answers": json.loads(row["answers_json"]),
        "results": json.loads(row["results_json"]),
        "total_score": row["total_score"],
        "total_marks": row["total_marks"],
        "submitted_at": row["submitted_at"],
    }
