"""
RAG Chat – FastAPI backend using Groq (no FAISS required).
Run with:  python -m uvicorn api:app --reload --port 8000
"""

import json
import os
import re
import sqlite3
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from groq import Groq
from pydantic import BaseModel

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
MODEL = "llama-3.1-8b-instant"
DB_PATH = "chat.db"

SYSTEM_PROMPT = """You are a helpful cybersecurity assistant trained exclusively on the
CIS Controls v8 document. Answer questions about CIS Controls, safeguards, implementation
groups, and cybersecurity best practices based on this framework.

Rules:
- Only answer questions related to CIS Controls v8 and cybersecurity.
- For irrelevant questions, politely decline and redirect to CIS Controls topics.
- When referencing specific CIS Controls or safeguards, add inline citation markers [1], [2], etc.
- Be concise but thorough. Use bullet points and markdown formatting for your answer.

CRITICAL FORMATTING — after your answer write EXACTLY these two lines, with no markdown, no headers, no code fences:
CITATIONS: [{"label": "CIS Control X · Safeguard X.Y", "snippet": "one-line description"}]
FOLLOWUPS: ["question1?", "question2?", "question3?"]

Do NOT wrap them in ``` or ## or **. Output them as plain text on their own lines.
"""

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS threads (
            id TEXT PRIMARY KEY,
            title TEXT DEFAULT 'New Chat',
            created_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            thread_id TEXT,
            role TEXT,
            content TEXT,
            sources TEXT DEFAULT '[]',
            versions TEXT DEFAULT '[]',
            created_at TEXT,
            FOREIGN KEY (thread_id) REFERENCES threads(id)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id TEXT PRIMARY KEY,
            message_id TEXT,
            thread_id TEXT,
            type TEXT,
            question TEXT,
            answer TEXT,
            reasons TEXT DEFAULT '[]',
            note TEXT DEFAULT '',
            created_at TEXT
        )
    """)
    # Migrations for older DBs
    for col, definition in [
        ("versions", "TEXT DEFAULT '[]'"),
    ]:
        try:
            conn.execute(f"ALTER TABLE messages ADD COLUMN {col} {definition}")
        except sqlite3.OperationalError:
            pass
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# App startup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=GROQ_API_KEY)

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class AskRequest(BaseModel):
    question: str
    thread_id: str
    document_context: str | None = None


class FeedbackRequest(BaseModel):
    message_id: str
    thread_id: str
    type: str
    question: str
    answer: str
    reasons: list[str] = []
    note: str = ""


class RenameRequest(BaseModel):
    title: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def now_iso():
    return datetime.now(timezone.utc).isoformat()


def thread_to_dict(row):
    return {"id": row["id"], "title": row["title"], "created_at": row["created_at"]}


def msg_to_dict(row):
    return {
        "id": row["id"],
        "role": row["role"],
        "content": row["content"],
        "sources": json.loads(row["sources"] or "[]"),
        "versions": json.loads(row["versions"] or "[]"),
        "created_at": row["created_at"],
    }


def save_with_retry(fn, retries=3):
    for attempt in range(retries):
        try:
            fn()
            return
        except sqlite3.OperationalError:
            if attempt == retries - 1:
                raise
            time.sleep(0.1 * (attempt + 1))


# Matches CITATIONS / FOLLOWUPS regardless of markdown formatting the LLM might add
_CITE_RE = re.compile(
    r'(?:#{1,3}\s*|\*{1,2}\s*)?CITATIONS\s*\*{0,2}\s*:?',
    re.IGNORECASE,
)
_FUPS_RE = re.compile(
    r'(?:#{1,3}\s*|\*{1,2}\s*)?FOLLOW[\-\s]?UPS?\s*\*{0,2}\s*:?',
    re.IGNORECASE,
)


def _extract_json_array(text: str):
    """Extract the first JSON array from text, tolerating markdown code fences."""
    text = re.sub(r'```(?:json)?\s*', '', text, flags=re.IGNORECASE)
    text = text.replace('```', '').strip()
    start = text.find('[')
    end = text.rfind(']')
    if start != -1 and end > start:
        try:
            return json.loads(text[start:end + 1])
        except json.JSONDecodeError:
            pass
    return None


def build_stream_generator(question, temperature=0.3):
    """Stream all tokens live, then post-process to extract CITATIONS/FOLLOWUPS."""
    stream = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": question},
        ],
        stream=True,
        temperature=temperature,
        max_tokens=1024,
    )

    full_content = ""
    for chunk in stream:
        token = chunk.choices[0].delta.content or ""
        full_content += token
        yield ("token", token)

    # Post-stream: extract CITATIONS
    save_content = full_content
    cite_match = _CITE_RE.search(full_content)
    if cite_match:
        after = full_content[cite_match.end():]
        fups_m = _FUPS_RE.search(after)
        section = after[:fups_m.start()] if fups_m else after
        parsed = _extract_json_array(section)
        if parsed:
            yield ("sources", parsed)
        save_content = full_content[:cite_match.start()].strip()

    # Post-stream: extract FOLLOWUPS
    fups_match = _FUPS_RE.search(full_content)
    if fups_match:
        after = full_content[fups_match.end():]
        cite_m2 = _CITE_RE.search(after)
        section = after[:cite_m2.start()] if cite_m2 else after
        parsed = _extract_json_array(section)
        if parsed:
            yield ("followups", parsed)
        candidate = full_content[:fups_match.start()].strip()
        if len(candidate) < len(save_content):
            save_content = candidate

    yield ("done", save_content)


def sse_from_generator(gen):
    """Convert (type, data) tuples into SSE strings."""
    for event_type, data in gen:
        if event_type == "token":
            yield f"data: {json.dumps(data)}\n\n"
        elif event_type == "sources":
            yield f"event: sources\ndata: {json.dumps(data)}\n\n"
            yield f"data: {json.dumps(data)}\n\n"
        elif event_type == "followups":
            yield f"event: followups\ndata: {json.dumps(data)}\n\n"
            yield f"data: {json.dumps(data)}\n\n"
        elif event_type == "done":
            yield "data: [DONE]\n\n"


# ---------------------------------------------------------------------------
# Routes – threads
# ---------------------------------------------------------------------------

@app.get("/")
def health():
    return {"status": "ok"}


@app.get("/threads")
def list_threads():
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM threads ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [thread_to_dict(r) for r in rows]


@app.post("/threads")
def create_thread():
    conn = get_db()
    tid = str(uuid.uuid4())
    now = now_iso()
    conn.execute(
        "INSERT INTO threads (id, title, created_at) VALUES (?, ?, ?)",
        (tid, "New Chat", now),
    )
    conn.commit()
    conn.close()
    return {"id": tid, "title": "New Chat", "created_at": now}


@app.delete("/threads/{thread_id}")
def delete_thread(thread_id: str):
    conn = get_db()
    conn.execute("DELETE FROM messages WHERE thread_id = ?", (thread_id,))
    conn.execute("DELETE FROM threads WHERE id = ?", (thread_id,))
    conn.commit()
    conn.close()
    return {"ok": True}


@app.patch("/threads/{thread_id}")
def rename_thread(thread_id: str, body: RenameRequest):
    conn = get_db()
    conn.execute(
        "UPDATE threads SET title = ? WHERE id = ?", (body.title, thread_id)
    )
    conn.commit()
    conn.close()
    return {"ok": True}


@app.get("/threads/{thread_id}/messages")
def get_messages(thread_id: str):
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC",
        (thread_id,),
    ).fetchall()
    conn.close()
    return [msg_to_dict(r) for r in rows]


# ---------------------------------------------------------------------------
# Routes – ask (streaming)
# ---------------------------------------------------------------------------

@app.post("/ask/stream")
def ask_stream(body: AskRequest):
    conn = get_db()

    # Save user message
    user_id = str(uuid.uuid4())
    user_now = now_iso()

    def save_user():
        c = get_db()
        c.execute(
            "INSERT INTO messages (id, thread_id, role, content, sources, versions, created_at) VALUES (?,?,?,?,?,?,?)",
            (user_id, body.thread_id, "user", body.question, "[]", "[]", user_now),
        )
        c.commit()
        c.close()

    save_with_retry(save_user)

    assistant_id = str(uuid.uuid4())
    assistant_now = now_iso()

    question = body.question
    if body.document_context:
        question = f"Context from uploaded document:\n{body.document_context}\n\nQuestion: {body.question}"

    gen = build_stream_generator(question)

    def stream():
        sources = []
        clean_content = ""
        for event_type, data in gen:
            if event_type == "token":
                yield f"data: {json.dumps(data)}\n\n"
            elif event_type == "sources":
                sources = data
                yield f"event: sources\ndata: {json.dumps(data)}\n\n"
                yield f"data: {json.dumps(data)}\n\n"
            elif event_type == "followups":
                yield f"event: followups\ndata: {json.dumps(data)}\n\n"
                yield f"data: {json.dumps(data)}\n\n"
            elif event_type == "done":
                clean_content = data
                yield "data: [DONE]\n\n"

        def save_assistant():
            c = get_db()
            c.execute(
                "INSERT INTO messages (id, thread_id, role, content, sources, versions, created_at) VALUES (?,?,?,?,?,?,?)",
                (assistant_id, body.thread_id, "assistant", clean_content,
                 json.dumps(sources), "[]", assistant_now),
            )
            c.commit()
            c.close()

        save_with_retry(save_assistant)

    conn.close()
    return StreamingResponse(stream(), media_type="text/event-stream")


# ---------------------------------------------------------------------------
# Routes – feedback
# ---------------------------------------------------------------------------

@app.post("/feedback")
def send_feedback(body: FeedbackRequest):
    conn = get_db()
    conn.execute(
        "INSERT INTO feedback (id, message_id, thread_id, type, question, answer, reasons, note, created_at) VALUES (?,?,?,?,?,?,?,?,?)",
        (
            str(uuid.uuid4()),
            body.message_id,
            body.thread_id,
            body.type,
            body.question,
            body.answer,
            json.dumps(body.reasons),
            body.note,
            now_iso(),
        ),
    )
    conn.commit()
    conn.close()
    return {"ok": True}
