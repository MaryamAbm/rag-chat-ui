import { useState, useEffect, useRef } from 'react'
import { jsPDF } from 'jspdf'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ChatViewport } from './components/ChatViewport'
import { InputBar } from './components/InputBar'
import { GuidedTour, useTour } from './components/GuidedTour'
import { BookmarksPanel } from './components/BookmarksPanel'
import { api } from './lib/api'
import { useDarkMode } from './lib/useDarkMode'
import { useBookmarks } from './lib/useBookmarks'

function toFrontendMsg(m) {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    sources: m.sources ?? [],
    versions: m.versions ?? [],
    timestamp: m.created_at
      ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
  }
}

// Strips any CITATIONS / FOLLOWUPS block the LLM may have leaked into content
function cleanContent(text) {
  return text
    .replace(/\s*(?:#{1,3}\s*)?(?:\*{1,2}\s*)?\bCITATIONS?\b[\s\S]*$/i, '')
    .replace(/\s*(?:#{1,3}\s*)?(?:\*{1,2}\s*)?\bFOLLOW[\s\S]*$/i, '')
    .trim()
}

// ---------------------------------------------------------------------------
// Shared SSE stream reader — used by both handleSend and handleRegenerate
// ---------------------------------------------------------------------------
async function readStream(res, onToken, onSources, onFollowUps, onDone) {
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
        if (raw === '[DONE]') {
          onDone?.()
          return
        }
        if (raw.startsWith('[')) {
          try {
            const parsed = JSON.parse(raw)
            const isFollowUps = parsed.length > 0 && typeof parsed[0] === 'string' && parsed[0].endsWith('?')
            if (isFollowUps) onFollowUps?.(parsed)
            else onSources?.(parsed)
          } catch (_) {}
          continue
        }
        try {
          const token = JSON.parse(raw)
          onToken?.(token)
        } catch (_) {}
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Export helpers
// ---------------------------------------------------------------------------
function exportMarkdown(messages, title) {
  const lines = [`# ${title}\n`]
  for (const m of messages) {
    const role = m.role === 'user' ? '**You**' : '**Assistant**'
    lines.push(`${role}\n\n${m.content}`)
    lines.push('\n---\n')
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'chat'}.md`
  a.click()
  URL.revokeObjectURL(url)
}

function exportPDF(messages, title) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 18
  const maxW = pageW - margin * 2
  let y = margin

  const addPage = () => {
    doc.addPage()
    y = margin
  }

  const checkY = (needed = 8) => {
    if (y + needed > pageH - margin) addPage()
  }

  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(title || 'Chat Export', margin, y)
  y += 10

  // Date
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120)
  doc.text(new Date().toLocaleString(), margin, y)
  doc.setTextColor(0)
  y += 8

  // Divider
  doc.setDrawColor(200)
  doc.line(margin, y, pageW - margin, y)
  y += 6

  for (const m of messages) {
    const isUser = m.role === 'user'

    // Role label
    checkY(10)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(isUser ? 37 : 99, isUser ? 99 : 102, isUser ? 235 : 241)
    doc.text(isUser ? 'You' : 'Assistant', margin, y)
    doc.setTextColor(0)
    y += 5

    // Message content — strip markdown symbols for cleaner PDF
    const plain = m.content
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/^[-*]\s+/gm, '• ')
      .replace(/`([^`]+)`/g, '$1')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(plain, maxW)
    for (const line of lines) {
      checkY(6)
      doc.text(line, margin, y)
      y += 5.5
    }

    // Timestamp
    if (m.timestamp) {
      checkY(5)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(m.timestamp, margin, y)
      doc.setTextColor(0)
      y += 4
    }

    y += 4 // gap between messages
  }

  const filename = `${(title || 'chat').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
  doc.save(filename)
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const [threadId, setThreadId]         = useState(null)
  const [threadTitle, setThreadTitle]   = useState('New Chat')
  const [messages, setMessages]         = useState([])
  const [isLoading, setIsLoading]       = useState(false)
  const [refreshKey, setRefreshKey]     = useState(0)
  const [sidebarOpen, setSidebarOpen]   = useState(true)
  const { show: showTour, finish: finishTour, replay: replayTour } = useTour()
  const { dark, toggle: toggleDark }    = useDarkMode()
  const { bookmarks, add: addBookmark, remove: removeBookmark, isBookmarked } = useBookmarks()
  const [showBookmarks, setShowBookmarks] = useState(false)

  const justCreatedThread = useRef(null)

  const refreshSidebar = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    if (!threadId) { setMessages([]); return }
    if (justCreatedThread.current === threadId) {
      justCreatedThread.current = null
      return
    }
    api.getMessages(threadId).then((data) => {
      setMessages(data.map(toFrontendMsg))
    })
  }, [threadId])

  const handleNewThread = async () => {
    const t = await api.createThread()
    setThreadId(t.id)
    setThreadTitle('New Chat')
    setMessages([])
  }

  const handleSelectThread = (id, title) => {
    setThreadTitle(title || 'Chat')
    if (id === threadId) {
      api.getMessages(id).then((data) => setMessages(data.map(toFrontendMsg)))
    } else {
      setThreadId(id)
    }
  }

  const handleDeleteThread = (id) => {
    if (threadId === id) { setThreadId(null); setMessages([]) }
  }

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async (fullText, attachmentName = null) => {
    const text = attachmentName
      ? fullText.split('\n\n---\n\nQuestion: ').pop()
      : fullText
    const documentContext = attachmentName
      ? fullText.split('\n\n---\n\nQuestion: ')[0].replace(/^\[Attached document: ".*?"\]\n\n/, '').trim()
      : null

    let tid = threadId
    if (!tid) {
      const t = await api.createThread()
      tid = t.id
      justCreatedThread.current = tid
      setThreadId(tid)
    }

    const title = text.length > 50 ? text.slice(0, 50) + '…' : text
    api.renameThread(tid, title).catch(() => {})
    setThreadTitle(title)
    refreshSidebar()

    const userContent = attachmentName ? `📎 ${attachmentName}\n\n${text}` : text
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: userContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: [],
      versions: [],
    }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    const assistantId = Date.now() + 1
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setMessages((prev) => [...prev, {
      id: assistantId, role: 'assistant', content: '', timestamp, sources: [], versions: [], question: text,
    }])

    try {
      const res = await api.askStream(text, tid, documentContext)
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      setIsLoading(false)

      await readStream(
        res,
        (token) => setMessages((prev) => prev.map((m) =>
          m.id === assistantId ? { ...m, content: m.content + token } : m
        )),
        (sources) => setMessages((prev) => prev.map((m) =>
          m.id === assistantId ? { ...m, sources } : m
        )),
        (followUps) => setMessages((prev) => prev.map((m) =>
          m.id === assistantId ? { ...m, followUps } : m
        )),
        () => setMessages((prev) => prev.map((m) =>
          m.id === assistantId ? { ...m, content: cleanContent(m.content) } : m
        )),
      )
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

  // ── Regenerate ────────────────────────────────────────────────────────────
  const handleRegenerate = async (msgId, question) => {
    const tid = threadId
    if (!tid || !question) return

    // Push current content into versions, clear content
    setMessages((prev) => prev.map((m) => {
      if (m.id !== msgId) return m
      const newVersions = [...(m.versions || []), { content: m.content }]
      return { ...m, content: '', sources: [], followUps: undefined, versions: newVersions }
    }))

    try {
      const res = await api.askRegenerate(question, tid, msgId)
      if (!res.ok) throw new Error(`Server error ${res.status}`)

      await readStream(
        res,
        (token) => setMessages((prev) => prev.map((m) =>
          m.id === msgId ? { ...m, content: m.content + token } : m
        )),
        (sources) => setMessages((prev) => prev.map((m) =>
          m.id === msgId ? { ...m, sources } : m
        )),
        (followUps) => setMessages((prev) => prev.map((m) =>
          m.id === msgId ? { ...m, followUps } : m
        )),
        () => setMessages((prev) => prev.map((m) =>
          m.id === msgId ? { ...m, content: cleanContent(m.content) } : m
        )),
      )
    } catch {
      setMessages((prev) => prev.map((m) =>
        m.id === msgId ? { ...m, content: '⚠️ Regeneration failed. Please try again.' } : m
      ))
    }
  }

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExportMarkdown = () => exportMarkdown(messages, threadTitle)
  const handlePrintPDF = () => exportPDF(messages, threadTitle)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {showTour && <GuidedTour onFinish={finishTour} />}
      {showBookmarks && (
        <BookmarksPanel
          bookmarks={bookmarks}
          onRemove={removeBookmark}
          onClose={() => setShowBookmarks(false)}
        />
      )}

      {/* Sidebar — collapsible on all screen sizes */}
      <div className={`${sidebarOpen ? 'flex' : 'hidden'} shrink-0`}>
        <Sidebar
          activeThreadId={threadId}
          onSelectThread={handleSelectThread}
          onNewThread={handleNewThread}
          onDeleteThread={handleDeleteThread}
          refreshKey={refreshKey}
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <Header
          onReplayTour={replayTour}
          dark={dark}
          onToggleDark={toggleDark}
          bookmarkCount={bookmarks.length}
          onOpenBookmarks={() => setShowBookmarks(true)}
          onExportMarkdown={threadId ? handleExportMarkdown : null}
          onPrintPDF={threadId ? handlePrintPDF : null}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
        />
        {threadId ? (
          <>
            <ChatViewport
              messages={messages}
              isLoading={isLoading}
              threadId={threadId}
              onFollowUp={handleSend}
              onBookmark={(msg) => isBookmarked(msg.id) ? removeBookmark(msg.id) : addBookmark(msg)}
              isBookmarked={isBookmarked}
              onRegenerate={handleRegenerate}
            />
            <InputBar onSend={handleSend} disabled={isLoading} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 dark:bg-gray-950">
            <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center mb-4">
              <span className="text-white text-2xl">💬</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Start a conversation</h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6 max-w-sm">
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
