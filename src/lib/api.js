const BASE = 'http://localhost:8000'

export const api = {

  // ── THREAD ENDPOINTS ──────────────────────────────────────────────────────
  getThreads: () => fetch(`${BASE}/threads`).then(r => r.json()),
  createThread: () => fetch(`${BASE}/threads`, { method: 'POST' }).then(r => r.json()),
  deleteThread: (id) => fetch(`${BASE}/threads/${id}`, { method: 'DELETE' }),
  renameThread: (id, title) => fetch(`${BASE}/threads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  }),
  getMessages: (id) => fetch(`${BASE}/threads/${id}/messages`).then(r => r.json()),

  // ── FEEDBACK ──────────────────────────────────────────────────────────────
  sendFeedback: (payload) => fetch(`${BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),

  // ── STREAMING ASK ─────────────────────────────────────────────────────────
  askStream: (question, thread_id, document_context = null) => fetch(`${BASE}/ask/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, thread_id, document_context }),
  }),

  // ── REGENERATE ────────────────────────────────────────────────────────────
  askRegenerate: (question, thread_id, message_id) =>
    fetch(`${BASE}/messages/${message_id}/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, thread_id }),
    }),
}
