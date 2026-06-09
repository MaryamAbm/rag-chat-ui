import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ChatViewport } from './components/ChatViewport'
import { InputBar } from './components/InputBar'
import { GuidedTour, useTour } from './components/GuidedTour'
import { api } from './lib/api'

const API_URL = 'http://localhost:8000'

function toFrontendMsg(m) {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    sources: m.sources ?? [],
    timestamp: m.created_at
      ? new Date(m.created_at + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
  }
}

export default function App() {
  const [threadId, setThreadId]     = useState(null)
  const [messages, setMessages]     = useState([])
  const [isLoading, setIsLoading]   = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { show: showTour, finish: finishTour } = useTour()

  const refreshSidebar = () => setRefreshKey((k) => k + 1)

  // Load messages when switching threads
  useEffect(() => {
    if (!threadId) { setMessages([]); return }
    api.getMessages(threadId).then((data) => setMessages(data.map(toFrontendMsg)))
  }, [threadId])

  const handleNewThread = async () => {
    const t = await api.createThread()
    setThreadId(t.id)
    setMessages([])
  }

  const handleSelectThread = (id) => {
    setThreadId(id)
  }

  const handleDeleteThread = (id) => {
    if (threadId === id) { setThreadId(null); setMessages([]) }
  }

  const handleSend = async (text) => {
    // Auto-create thread if none
    let tid = threadId
    if (!tid) {
      const t = await api.createThread()
      tid = t.id
      setThreadId(tid)
    }

    // Title the thread immediately from frontend (first 50 chars of question)
    const title = text.length > 50 ? text.slice(0, 50) + '…' : text
    api.renameThread(tid, title).catch(() => {})
    refreshSidebar()

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: [],
    }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    const assistantId = Date.now() + 1
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setMessages((prev) => [...prev, {
      id: assistantId, role: 'assistant', content: '', timestamp, sources: [], question: text,
    }])

    try {
      const res = await api.askStream(text, tid)
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      setIsLoading(false)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (line.startsWith('event: sources') || line.startsWith('event: followups')) continue
          if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim()
            if (raw === '[DONE]') break
            if (raw.startsWith('[')) {
              try {
                const parsed = JSON.parse(raw)
                // Detect if it's sources (objects or strings) or followups (plain strings)
                const isFollowUps = parsed.length > 0 && typeof parsed[0] === 'string' && parsed[0].endsWith('?')
                if (isFollowUps) {
                  setMessages((prev) => prev.map((m) =>
                    m.id === assistantId ? { ...m, followUps: parsed } : m
                  ))
                } else {
                  setMessages((prev) => prev.map((m) =>
                    m.id === assistantId ? { ...m, sources: parsed } : m
                  ))
                }
              } catch (_) {}
              continue
            }
            try {
              const token = JSON.parse(raw)
              setMessages((prev) => prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + token } : m
              ))
            } catch (_) {}
          }
        }
      }
    } catch (err) {
      setMessages((prev) => prev.map((m) =>
        m.id === assistantId
          ? { ...m, content: '⚠️ Could not reach the RAG backend. Make sure the API server is running.' }
          : m
      ))
    } finally {
      setIsLoading(false)
      refreshSidebar()
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {showTour && <GuidedTour onFinish={finishTour} />}

      <Sidebar
        activeThreadId={threadId}
        onSelectThread={handleSelectThread}
        onNewThread={handleNewThread}
        onDeleteThread={handleDeleteThread}
        refreshKey={refreshKey}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        {threadId ? (
          <>
            <ChatViewport messages={messages} isLoading={isLoading} threadId={threadId} onFollowUp={handleSend} />
            <InputBar onSend={handleSend} disabled={isLoading} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center mb-4">
              <span className="text-white text-2xl">💬</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Start a conversation</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">
              Click "New Chat" to ask anything about the CIS Controls v8 cybersecurity document.
            </p>
            <button
              data-tour="new-chat"
              onClick={handleNewThread}
              className="bg-brand-500 text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              New Chat
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
