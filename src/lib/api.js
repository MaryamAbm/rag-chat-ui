const BASE = 'http://localhost:8000'

export const api = {
  // Threads
  getThreads:       ()           => fetch(`${BASE}/threads`).then(r => r.json()),
  createThread:     ()           => fetch(`${BASE}/threads`, { method: 'POST' }).then(r => r.json()),
  deleteThread:     (id)         => fetch(`${BASE}/threads/${id}`, { method: 'DELETE' }),
  renameThread:     (id, title)  => fetch(`${BASE}/threads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  }),
  getMessages:      (id)         => fetch(`${BASE}/threads/${id}/messages`).then(r => r.json()),

  // Feedback
  sendFeedback: (payload) => fetch(`${BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),

  // Streaming ask
  askStream: (question, thread_id) => fetch(`${BASE}/ask/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, thread_id }),
  }),
}
