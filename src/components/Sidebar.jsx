import { useEffect, useState } from 'react'
import { Plus, MessageSquare, Trash2, PenLine, Check, X } from 'lucide-react'
import { clsx } from 'clsx'
import { api } from '../lib/api'

export function Sidebar({ activeThreadId, onSelectThread, onNewThread, onDeleteThread, refreshKey }) {
  const [threads, setThreads] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  const loadThreads = async () => {
    try {
      const data = await api.getThreads()
      setThreads(data)
    } catch (_) {}
  }

  useEffect(() => {
    loadThreads()
    const interval = setInterval(loadThreads, 10000)
    return () => clearInterval(interval)
  }, [activeThreadId, refreshKey])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    await api.deleteThread(id)
    onDeleteThread(id)
    loadThreads()
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
    <aside className="w-64 shrink-0 bg-gray-900 flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-gray-700">
        <span className="text-white font-semibold text-sm">RAG Chat</span>
      </div>

      {/* New Chat */}
      <div className="p-3">
        <button
          onClick={onNewThread}
          className="w-full flex items-center gap-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 text-sm transition-colors"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {threads.length === 0 && (
          <p className="text-gray-500 text-xs text-center mt-6">No conversations yet</p>
        )}
        {threads.map((t) => (
          <div
            key={t.id}
            onClick={() => onSelectThread(t.id)}
            className={clsx(
              'group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer text-sm transition-colors',
              activeThreadId === t.id
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
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
                className="flex-1 bg-gray-600 text-white text-xs rounded px-1 py-0.5 outline-none"
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
    </aside>
  )
}
