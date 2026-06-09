import { useState } from 'react'
import { BookOpen, ThumbsUp, ThumbsDown, Flag, CheckCircle, Copy, Check } from 'lucide-react'
import { clsx } from 'clsx'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CitationAccordion } from './CitationAccordion'
import { FollowUpQuestions } from './FollowUpQuestions'
import { FeedbackModal } from './FeedbackModal'
import { api } from '../lib/api'

function Avatar({ role }) {
  if (role === 'assistant') {
    return (
      <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
        <BookOpen size={14} className="text-white" />
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-xs font-semibold text-gray-600">
      U
    </div>
  )
}

function FeedbackBar({ messageId, threadId, question, answer }) {
  const [vote, setVote] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleUp = () => {
    setVote('up')
    setSubmitted(true)
    api.sendFeedback({ message_id: messageId, thread_id: threadId, type: 'thumbs_up', question, answer, reasons: [], note: '' })
  }

  const handleDown = () => {
    setVote('down')
    setShowModal(true)
  }

  const [showFlagBox, setShowFlagBox] = useState(false)
  const [flagNote, setFlagNote] = useState('')

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
        <span className="text-xs text-gray-400">
          {vote === 'up' ? 'Thanks for the feedback!' : "Thanks \u2014 we'll use this to improve."}
        </span>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-1 mt-1 px-1">
        <span className="text-xs text-gray-400 mr-1">Was this helpful?</span>
        <button
          onClick={handleUp}
          className="p-1 rounded-md text-gray-400 hover:text-green-500 hover:bg-green-50 transition-colors"
        >
          <ThumbsUp size={13} />
        </button>
        <button
          onClick={handleDown}
          className="p-1 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors"
        >
          <ThumbsDown size={13} />
        </button>
        <button
          onClick={handleFlag}
          className="p-1 rounded-md text-gray-400 hover:text-orange-400 hover:bg-orange-50 transition-colors ml-1"
          title="Flag incorrect answer"
        >
          <Flag size={13} />
        </button>
      </div>

      {showModal && (
        <FeedbackModal
          onSubmit={handleModalSubmit}
          onClose={() => setShowModal(false)}
        />
      )}

      {showFlagBox && (
        <div className="mt-2 flex flex-col gap-2 bg-orange-50 border border-orange-200 rounded-xl p-3 max-w-sm">
          <p className="text-xs font-medium text-orange-700">Describe the problem with this answer:</p>
          <textarea
            autoFocus
            rows={3}
            value={flagNote}
            onChange={(e) => setFlagNote(e.target.value)}
            placeholder="e.g. The answer is incorrect, missing key information..."
            className="text-xs border border-orange-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
          />
          <div className="flex gap-2">
            <button
              onClick={submitFlag}
              className="text-xs bg-orange-500 text-white rounded-lg px-3 py-1 hover:bg-orange-600"
            >
              Submit
            </button>
            <button
              onClick={() => setShowFlagBox(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      title="Copy answer"
    >
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  )
}

export function ChatMessage({ message, threadId, onFollowUp }) {
  const isUser = message.role === 'user'

  return (
    <div className={clsx('flex gap-3', isUser && 'flex-row-reverse')}>
      <Avatar role={message.role} />

      <div className={clsx('flex flex-col gap-1 max-w-[75%]', isUser && 'items-end')}>
        <div
          className={clsx(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-brand-500 text-white rounded-tr-sm whitespace-pre-wrap'
              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-xs'
          )}
        >
          {isUser ? message.content : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Citation accordion with confidence scores */}
        {!isUser && (
          <CitationAccordion sources={message.sources} />
        )}

        {/* Follow-up questions */}
        {!isUser && message.followUps && message.followUps.length > 0 && (
          <FollowUpQuestions questions={message.followUps} onSelect={onFollowUp} />
        )}

        <div className="flex items-center gap-1 px-1">
          <span className="text-xs text-gray-400">{message.timestamp}</span>
          {!isUser && message.content && <CopyButton text={message.content} />}
        </div>

        {/* Human-in-the-loop feedback */}
        {!isUser && message.sources !== undefined && (
          <FeedbackBar
            messageId={message.id}
            threadId={threadId}
            question={message.question ?? ''}
            answer={message.content}
          />
        )}
      </div>
    </div>
  )
}
