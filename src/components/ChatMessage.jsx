import { BookOpen } from 'lucide-react'
import { Badge } from './ui/Badge'
import { clsx } from 'clsx'

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

export function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={clsx('flex gap-3', isUser && 'flex-row-reverse')}>
      <Avatar role={message.role} />

      <div className={clsx('flex flex-col gap-1 max-w-[75%]', isUser && 'items-end')}>
        <div
          className={clsx(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'bg-brand-500 text-white rounded-tr-sm'
              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
          )}
        >
          {message.content}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {message.sources.map((src, i) => (
              <Badge key={i} variant="secondary" className="flex items-center gap-1">
                <BookOpen size={10} />
                {src}
              </Badge>
            ))}
          </div>
        )}

        <span className="text-xs text-gray-400 px-1">{message.timestamp}</span>
      </div>
    </div>
  )
}
