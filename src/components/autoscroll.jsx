import { useEffect, useRef } from 'react'
import { ChatMessage } from './ChatMessage'
import { Loader2 } from 'lucide-react'

export function ChatViewport({ messages, isLoading, threadId, onFollowUp, onBookmark, isBookmarked, onRegenerate }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 print:overflow-visible">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            threadId={threadId}
            onFollowUp={onFollowUp}
            onBookmark={onBookmark}
            isBookmarked={isBookmarked?.(msg.id)}
            onRegenerate={msg.role === 'assistant' ? onRegenerate : undefined}
          />
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
              <Loader2 size={14} className="text-white animate-spin" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
