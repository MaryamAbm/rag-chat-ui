import { useEffect, useState } from 'react'
import { Plus, MessageSquare, Trash2, PenLine, Check, X, Trash, Search } from 'lucide-react'
import { clsx } from 'clsx'
import { api } from '../lib/api'

export function Sidebar({ activeThreadId, onSelectThread, onNewThread, onDeleteThread, refreshKey }) {
  const [threads, setThreads]           = useState([])
  const [editingId, setEditingId]       = useState(null)
  const [editTitle, setEditTitle]       = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [query, setQuery]               = useState('')

  const filtered = query.trim()
    ? threads.filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
    : threads

  const loadThreads = async () => {
    try {
      const data = await api.getThreads()
      setThreads(data)
    } catch (_) {}
  }

  useEffect(() => {
    loadThreads()
    const interval = setInterval(loadThreads, 30000)
    return () => clearInterval(interval)
  }, [activeThreadId, refreshKey])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    await api.deleteThread(id)
    onDeleteThread(id)
    loadThreads()
  }

  const handleClearAll = async () => {
    for (const t of threads) {
      await api.deleteThread(t.id)
      onDeleteThread(t.id)
    }
    setThreads([])
    setConfirmClear(false)
  }

  const startEdit = (e, thread) => {
    e.stopPropagation()
    setEditingId(thread.id)
    setEditTitle(thread.title)
  }

  const saveEdit = async (e, id) => {
    e.stopPropagation()
    await api.renameThread(id, editTitle)
    setEditingId(null)
    loadThreads()
  }

  return (
    <aside className="w-64 shrink-0 bg-pink-900 flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-pink-700">
        <span className="text-white font-semibold text-sm">RAG Chat</span>
      </div>

      {/* New Chat */}
      <div className="p-3 pb-2">
        <button
          data-tour="new-chat"
          onClick={onNewThread}
          className="w-full flex items-center gap-2 rounded-lg border border-pink-600 text-pink-100 hover:bg-pink-700 hover:text-white px-3 py-2 text-sm transition-colors"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Search */}
      {threads.length > 0 && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 bg-pink-800 rounded-lg px-2.5 py-1.5 border border-pink-700 focus-within:border-pink-400 transition-colors">
            <Search size={13} className="text-pink-300 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search chats…"
              className="flex-1 bg-transparent text-xs text-pink-100 placeholder:text-pink-400 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-pink-400 hover:text-pink-200">
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {threads.length === 0 && (
          <p className="text-pink-300 text-xs text-center mt-6">No conversations yet</p>
        )}
        {filtered.length === 0 && query && (
          <p className="text-pink-400 text-xs text-center mt-6">No chats match "{query}"</p>
        )}
        {filtered.map((t) => (
          <div
            key={t.id}
            onClick={() => { onSelectThread(t.id, t.title); setQuery('') }}
            className={clsx(
              'group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer text-sm transition-colors',
              activeThreadId === t.id
                ? 'bg-pink-700 text-white'
                : 'text-pink-200 hover:bg-pink-800 hover:text-white'
            )}
          >
            <MessageSquare size={14} className="shrink-0" />

            {editingId === t.id ? (
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(e, t.id) }}
                className="flex-1 bg-pink-700 text-white text-xs rounded px-1 py-0.5 outline-none"
              />
            ) : (
              <span className="flex-1 truncate">{t.title}</span>
            )}

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
              {editingId === t.id ? (
                <>
                  <button onClick={(e) => saveEdit(e, t.id)} className="hover:text-green-400"><Check size={12} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setEditingId(null) }} className="hover:text-red-400"><X size={12} /></button>
                </>
              ) : (
                <>
                  <button onClick={(e) => startEdit(e, t)} className="hover:text-white"><PenLine size={12} /></button>
                  <button onClick={(e) => handleDelete(e, t.id)} className="hover:text-red-400"><Trash2 size={12} /></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Clear history */}
      {threads.length > 0 && (
        <div className="px-3 pb-4 border-t border-pink-700 pt-3">
          {confirmClear ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-pink-200 text-center">Delete all {threads.length} chats?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleClearAll}
                  className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg py-1.5 transition-colors"
                >
                  Yes, clear all
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 text-xs text-pink-300 hover:text-white border border-pink-600 rounded-lg py-1.5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full flex items-center gap-2 text-xs text-pink-400 hover:text-red-300 px-2 py-1.5 rounded-lg hover:bg-pink-800 transition-colors"
            >
              <Trash size={13} />
              Clear history
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
