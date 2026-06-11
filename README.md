# RAG Chat UI

A fullstack RAG (Retrieval-Augmented Generation) chat application built on CIS Controls v8. Ask cybersecurity questions and get AI-powered, source-cited answers in real time.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3 |
| Component library | lucide-react, react-markdown, remark-gfm |
| Backend API | FastAPI (Python), uvicorn |
| Embeddings | BAAI/bge-small-en-v1.5 (Sentence Transformers) |
| Vector DB | FAISS (local, 538 chunks) |
| Reranker | cross-encoder/ms-marco-MiniLM-L-6-v2 |
| LLM | Llama-3.1-8b-instant via Groq API |
| Database | SQLite (chat history + feedback telemetry) |
| Streaming | Server-Sent Events (SSE) |

## Prerequisites

- Node.js 18+
- Python 3.11+
- [uv](https://github.com/astral-sh/uv) package manager
- A Groq API key (free at [console.groq.com](https://console.groq.com))

## Setup in 5 Minutes

### 1. Clone the repo

```bash
git clone https://github.com/MaryamAbm/rag-chat-ui.git
cd rag-chat-ui
npm install
```

### 2. Set up the Python backend

```bash
cd path/to/rag_setup/rag_setup
uv pip install fastapi uvicorn faiss-cpu groq sentence-transformers
```

> The backend requires a pre-built FAISS index. Run the Jupyter notebook `notebooks/01_RAG_setup.ipynb` first to generate `faiss_index.bin`, `texts.pkl`, and `metadata.pkl`.

### 3. Start the API server

```bash
# From rag_setup/rag_setup/
.venv\Scripts\uvicorn.exe scripts.api:app --reload --port 8000
```

The API will be live at `http://localhost:8000`.

### 4. Start the frontend

```bash
# From rag-chat-ui/
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Features

- **Real-time streaming** — answers appear token by token via SSE
- **Markdown rendering** — bold, lists, code blocks all render cleanly
- **Chat history** — all threads saved to SQLite, persist across page refreshes
- **Expandable citation accordion** — see exactly which pages of the CIS document were used
- **Human-in-the-loop feedback** — 👍/👎 rating; 👎 opens a modal with reason chips + comment
- **Guided tour** — first-time walkthrough shown on first visit
- **Thread management** — create, rename, and delete chat threads from the sidebar

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/threads` | List all chat threads |
| POST | `/threads` | Create a new thread |
| GET | `/threads/{id}/messages` | Get messages for a thread |
| DELETE | `/threads/{id}` | Delete a thread |
| PATCH | `/threads/{id}` | Rename a thread |
| POST | `/ask/stream` | Stream an answer (SSE) |
| POST | `/feedback` | Save user feedback |

## Project Structure

```
rag-chat-ui/
├── src/
│   ├── components/
│   │   ├── ui/              # Button, Badge primitives
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx      # Chat history + thread management
│   │   ├── ChatViewport.jsx
│   │   ├── ChatMessage.jsx
│   │   ├── CitationAccordion.jsx
│   │   ├── InputBar.jsx
│   │   ├── FeedbackModal.jsx
│   │   └── GuidedTour.jsx
│   ├── lib/
│   │   └── api.js           # All fetch calls to the backend
│   └── App.jsx
│
rag_setup/scripts/
├── api.py                   # FastAPI server
└── db.py                    # SQLite database layer
```
