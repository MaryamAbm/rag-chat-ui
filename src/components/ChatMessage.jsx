import { useState } from 'react'
import {
  BookOpen, ThumbsUp, ThumbsDown, Flag, CheckCircle,
  Copy, Check, Bookmark, RefreshCw, ChevronLeft, ChevronRight,
  GitCompare, Loader2,
} from 'lucide-react'
import { clsx } from 'clsx'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CitationAccordion } from './CitationAccordion'
import { FollowUpQuestions } from './FollowUpQuestions'
import { FeedbackModal } from './FeedbackModal'
import { ComparisonModal } from './ComparisonModal'
import { api } from '../lib/api'

// ---------------------------------------------------------------------------
// Citation badge — shown inline in text for [1], [2] etc.
// ---------------------------------------------------------------------------
function CitationBadge({ num, source }) {
  const [hovered, setHovered] = useState(false)
  return (
    <span className="relative inline-block mx-0.5 align-middle">
      <span
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-[10px] font-bold cursor-default select-none hover:bg-brand-200 dark:hover:bg-brand-500/30 transition-colors"
      >
        {num}
      </span>
      {hovered && source && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 w-56 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-xl px-3 py-2 shadow-lg pointer-events-none">
          <span className="font-semibold block mb-0.5">{source.label}</span>
          {source.snippet && <span className="text-gray-300 dark:text-gray-400">{source.snippet}</span>}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </span>
      )}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Process React children to inject CitationBadge for [N] patterns
// ---------------------------------------------------------------------------
function processNode(child, sources, key) {
  if (typeof child === 'string') {
    const parts = child.split(/(\[\d+\])/g)
    if (parts.length === 1) return child
    return parts.map((part, i) => {
      const match = part.match(/^\[(\d+)\]$/)
      if (match) {
        const idx = parseInt(match[1], 10) - 1
        return <CitationBadge key={`${key}-${i}`} num={match[1]} source={sources?.[idx]} />
      }
      return part
    })
  }
  if (child && typeof child === 'object' && child.props?.children) {
    const newChildren = processChildren(child.props.children, sources, key)
    return { ...child, props: { ...child.props, children: newChildren } }
  }
  return child
}

function processChildren(children, sources, keyPrefix = 'c') {
  if (!children) return children
  if (typeof children === 'string' || typeof children === 'number') {
    return processNode(children, sources, keyPrefix)
  }
  if (Array.isArray(children)) {
    return children.flatMap((c, i) => {
      const result = processNode(c, sources, `${keyPrefix}-${i}`)
      return Array.isArray(result) ? result : [result]
    })
  }
  return processNode(children, sources, keyPrefix)
}

// ---------------------------------------------------------------------------
// Markdown renderer with inline citation support
// ---------------------------------------------------------------------------
function CitedMarkdown({ content, sources }) {
  const hasCitations = sources && sources.length > 0

  const components = hasCitations ? {
    p: ({ children, ...props }) => (
      <p {...props}>{processChildren(children, sources, 'p')}</p>
    ),
    li: ({ children, ...props }) => (
      <li {...props}>{processChildren(children, sources, 'li')}</li>
    ),
    td: ({ children, ...props }) => (
      <td {...props}>{processChildren(children, sources, 'td')}</td>
    ),
  } : {}

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  )
}

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------
function Avatar({ role }) {
  if (role === 'assistant') {
    return (
      <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
        <BookOpen size={14} className="text-white" />
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 text-xs font-semibold text-gray-600 dark:text-gray-300">
      U
    </div>
  )
}

// ---------------------------------------------------------------------------
// Feedback bar
// ---------------------------------------------------------------------------
function FeedbackBar({ messageId, threadId, question, answer }) {
  const [vote, setVote]           = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showFlagBox, setShowFlagBox] = useState(false)
  const [flagNote, setFlagNote]   = useState('')

  const handleUp = () => {
    setVote('up')
    setSubmitted(true)
    api.sendFeedback({ message_id: messageId, thread_id: threadId, type: 'thumbs_up', question, answer, reasons: [], note: '' })
  }

  const handleDown = () => {
    setVote('down')
    setShowModal(true)
  }

  const handleFlag = () => setShowFlagBox(true)

  const submitFlag = () => {
    setSubmitted(true)
    setShowFlagBox(false)
    api.sendFeedback({ message_id: messageId, thread_id: threadId, type: 'flagged', question, answer, reasons: [], note: flagNote })
  }

  const handleModalSubmit = ({ reasons, note }) => {
    setSubmitted(true)
    api.sendFeedback({ message_id: messageId, thread_id: threadId, type: 'thumbs_down', question, answer, reasons, note })
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-1.5 mt-1 px-1">
        <CheckCircle size={13} className="text-green-500" />
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {vote === 'up' ? 'Thanks for the feedback!' : "Thanks — we'll use this to improve."}
        </span>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-1 mt-1 px-1">
        <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">Was this helpful?</span>
        <button onClick={handleUp} className="p-1 rounded-md text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors">
          <ThumbsUp size={13} />
        </button>
        <button onClick={handleDown} className="p-1 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
          <ThumbsDown size={13} />
        </button>
        <button onClick={handleFlag} className="p-1 rounded-md text-gray-400 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 ml-1 transition-colors" title="Flag incorrect answer">
          <Flag size={13} />
        </button>
      </div>

      {showModal && (
        <FeedbackModal onSubmit={handleModalSubmit} onClose={() => setShowModal(false)} />
      )}

      {showFlagBox && (
        <div className="mt-2 flex flex-col gap-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-3 max-w-sm">
          <p className="text-xs font-medium text-orange-700 dark:text-orange-400">Describe the problem:</p>
          <textarea
            autoFocus rows={3} value={flagNote}
            onChange={(e) => setFlagNote(e.target.value)}
            placeholder="e.g. The answer is incorrect..."
            className="text-xs border border-orange-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white dark:bg-gray-800 dark:border-orange-700 dark:text-gray-200"
          />
          <div className="flex gap-2">
            <button onClick={submitFlag} className="text-xs bg-orange-500 text-white rounded-lg px-3 py-1 hover:bg-orange-600">Submit</button>
            <button onClick={() => setShowFlagBox(false)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Copy answer">
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Version navigation bar
// ---------------------------------------------------------------------------
function VersionNav({ versions, currentVersionIndex, onVersionChange, onCompare }) {
  if (!versions || versions.length === 0) return null

  const total = versions.length + 1  // versions are old ones; +1 for current
  const displayed = currentVersionIndex === -1 ? total : currentVersionIndex + 1

  return (
    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-1 px-1">
      <button
        onClick={() => onVersionChange(currentVersionIndex <= 0 ? -1 : currentVersionIndex - 1 === versions.length - 1 ? -1 : currentVersionIndex - 1)}
        disabled={currentVersionIndex === 0}
        className="p-0.5 rounded hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
        title="Previous version"
      >
        <ChevronLeft size={13} />
      </button>
      <span>{displayed}/{total}</span>
      <button
        onClick={() => onVersionChange(currentVersionIndex === -1 ? -1 : currentVersionIndex + 1 >= versions.length ? -1 : currentVersionIndex + 1)}
        disabled={currentVersionIndex === -1}
        className="p-0.5 rounded hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
        title="Next version"
      >
        <ChevronRight size={13} />
      </button>
      {versions.length >= 1 && (
        <button
          onClick={onCompare}
          className="ml-1 flex items-center gap-1 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 hover:border-brand-400 hover:text-brand-500 transition-colors"
          title="Compare versions"
        >
          <GitCompare size={11} />
          Compare
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main ChatMessage component
// ---------------------------------------------------------------------------
export function ChatMessage({ message, threadId, onFollowUp, onBookmark, isBookmarked, onRegenerate }) {
  const isUser = message.role === 'user'
  const [versionIndex, setVersionIndex]   = useState(-1)  // -1 = current/latest
  const [showCompare, setShowCompare]     = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const versions = message.versions || []

  // Displayed content: current version or a historical one
  const displayContent = versionIndex === -1
    ? message.content
    : versions[versionIndex]?.content ?? message.content

  const handleRegenerate = async () => {
    if (!onRegenerate || isRegenerating) return
    setIsRegenerating(true)
    setVersionIndex(-1)
    try {
      await onRegenerate(message.id, message.question ?? '')
    } finally {
      setIsRegenerating(false)
    }
  }

  // Navigate version: positive index = historical, -1 = current
  const handleVersionChange = (idx) => setVersionIndex(idx)

  if (isUser) {
    return (
      <div className="flex gap-3 flex-row-reverse">
        <Avatar role="user" />
        <div className="flex flex-col gap-1 max-w-[75%] sm:max-w-[70%] items-end">
          <div className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed bg-brand-500 text-white whitespace-pre-wrap">
            {message.content}
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 px-1">{message.timestamp}</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-3">
        <Avatar role="assistant" />

        <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]">
          {/* Message bubble */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1 prose-code:rounded prose-code:text-xs">
            {isRegenerating && !displayContent ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 size={14} className="animate-spin" />
                <span>Regenerating…</span>
              </div>
            ) : (
              <CitedMarkdown content={displayContent} sources={message.sources} />
            )}
          </div>

          {/* Citations accordion */}
          {!isRegenerating && versionIndex === -1 && (
            <CitationAccordion sources={message.sources} />
          )}

          {/* Follow-up questions */}
          {!isRegenerating && versionIndex === -1 && message.followUps?.length > 0 && (
            <FollowUpQuestions questions={message.followUps} onSelect={onFollowUp} />
          )}

          {/* Version navigation */}
          <VersionNav
            versions={versions}
            currentVersionIndex={versionIndex}
            onVersionChange={handleVersionChange}
            onCompare={() => setShowCompare(true)}
          />

          {/* Toolbar */}
          <div className="flex items-center gap-1 px-1 flex-wrap">
            <span className="text-xs text-gray-400 dark:text-gray-500">{message.timestamp}</span>

            {message.content && <CopyButton text={displayContent} />}

            {/* Bookmark */}
            {message.content && onBookmark && (
              <button
                onClick={() => onBookmark(message)}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this answer'}
                className={`p-1 rounded-md transition-colors ${
                  isBookmarked
                    ? 'text-brand-500'
                    : 'text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10'
                }`}
              >
                <Bookmark size={13} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            )}

            {/* Regenerate */}
            {message.content && onRegenerate && (
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                title="Regenerate response"
                className="p-1 rounded-md text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors disabled:opacity-40"
              >
                <RefreshCw size={13} className={isRegenerating ? 'animate-spin' : ''} />
              </button>
            )}
          </div>

          {/* Feedback */}
          {message.sources !== undefined && versionIndex === -1 && (
            <FeedbackBar
              messageId={message.id}
              threadId={threadId}
              question={message.question ?? ''}
              answer={message.content}
            />
          )}
        </div>
      </div>

      {/* Comparison modal */}
      {showCompare && versions.length > 0 && (
        <ComparisonModal
          currentContent={message.content}
          versions={versions}
          onClose={() => setShowCompare(false)}
        />
      )}
    </>
  )
}
