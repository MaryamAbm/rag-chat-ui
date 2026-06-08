import { useRef, useState } from 'react'
import { Send, Paperclip, Mic } from 'lucide-react'
import { Button } from './ui/Button'
import { clsx } from 'clsx'

export function InputBar({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    setValue(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 160) + 'px'
    }
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div
          className={clsx(
            'flex items-end gap-2 rounded-2xl border bg-white px-3 py-2 transition-shadow',
            'border-gray-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20'
          )}
        >
          {/* Attachment */}
          <Button variant="ghost" size="icon" className="shrink-0 mb-0.5 text-gray-400 hover:text-gray-600" disabled={disabled}>
            <Paperclip size={18} />
          </Button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about CIS Controls…"
            disabled={disabled}
            className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none leading-6 py-1 max-h-40 overflow-y-auto scrollbar-thin"
          />

          {/* Mic */}
          <Button variant="ghost" size="icon" className="shrink-0 mb-0.5 text-gray-400 hover:text-gray-600" disabled={disabled}>
            <Mic size={18} />
          </Button>

          {/* Send */}
          <Button
            size="icon"
            variant={canSend ? 'primary' : 'ghost'}
            disabled={!canSend}
            onClick={handleSend}
            className="shrink-0 mb-0.5 rounded-xl"
          >
            <Send size={16} className={canSend ? 'text-white' : 'text-gray-400'} />
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-2">
          RAG answers are based on the CIS Controls v8 document. May contain inaccuracies.
        </p>
      </div>
    </div>
  )
}
