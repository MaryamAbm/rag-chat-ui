import { X, Bookmark, Trash2, BookOpen } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function BookmarksPanel({ bookmarks, onRemove, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark size={16} className="text-brand-500" fill="currentColor" />
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
              Bookmarks
            </h2>
            {bookmarks.length > 0 && (
              <span className="text-xs bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-full px-2 py-0.5 font-medium">
                {bookmarks.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Bookmark size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No bookmarks yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-600">
                Click the bookmark icon on any answer to save it here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {bookmarks.map((b) => (
                <div key={b.id} className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  {/* Question */}
                  {b.question && (
                    <p className="text-xs text-brand-500 dark:text-brand-400 font-medium mb-2 flex items-center gap-1">
                      <BookOpen size={11} />
                      {b.question.length > 80 ? b.question.slice(0, 80) + '…' : b.question}
                    </p>
                  )}

                  {/* Answer preview */}
                  <div className="text-xs text-gray-700 dark:text-gray-300 prose prose-xs dark:prose-invert max-w-none line-clamp-4 prose-p:my-0.5 prose-ul:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {b.content.length > 300 ? b.content.slice(0, 300) + '…' : b.content}
                    </ReactMarkdown>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400 dark:text-gray-600">
                      {new Date(b.savedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => onRemove(b.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all"
                      title="Remove bookmark"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
