import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function ComparisonModal({ currentContent, versions, onClose }) {
  const [leftIdx, setLeftIdx]   = useState(0)                  // index into versions array
  const [rightIdx, setRightIdx] = useState(-1)                 // -1 = current

  const allVersions = [...versions, { content: currentContent, isCurrent: true }]
  const total = allVersions.length

  const leftContent  = allVersions[leftIdx]?.content ?? ''
  const rightContent = rightIdx === -1 ? currentContent : allVersions[rightIdx]?.content ?? ''

  const leftLabel  = leftIdx === total - 1 ? 'Current' : `Version ${leftIdx + 1}`
  const rightLabel = rightIdx === -1 || rightIdx === total - 1 ? 'Current' : `Version ${rightIdx + 1}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Compare Versions</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={18} />
          </button>
        </div>

        {/* Columns */}
        <div className="flex flex-1 overflow-hidden divide-x divide-gray-200 dark:divide-gray-700 min-h-0">
          {/* Left */}
          <PanelColumn
            label={leftLabel}
            content={leftContent}
            index={leftIdx}
            total={total}
            onChange={setLeftIdx}
            isCurrent={leftIdx === total - 1}
          />
          {/* Right */}
          <PanelColumn
            label={rightLabel}
            content={rightContent}
            index={rightIdx === -1 ? total - 1 : rightIdx}
            total={total}
            onChange={(i) => setRightIdx(i === total - 1 ? -1 : i)}
            isCurrent={rightIdx === -1 || rightIdx === total - 1}
          />
        </div>
      </div>
    </div>
  )
}

function PanelColumn({ label, content, index, total, onChange, isCurrent }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <button
          onClick={() => onChange(Math.max(0, index - 1))}
          disabled={index === 0}
          className="p-0.5 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          isCurrent
            ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
          {label}
        </span>
        <button
          onClick={() => onChange(Math.min(total - 1, index + 1))}
          disabled={index === total - 1}
          className="p-0.5 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 text-sm text-gray-800 dark:text-gray-200 prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1 prose-code:rounded prose-code:text-xs">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  )
}
