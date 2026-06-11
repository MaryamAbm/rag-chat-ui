import { useRef, useState } from 'react'
import { Send, Paperclip, Mic, MicOff } from 'lucide-react'
import { Button } from './ui/Button'
import { clsx } from 'clsx'

export function InputBar({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [attachmentName, setAttachmentName] = useState(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed, attachmentName)
    setValue('')
    setAttachmentName(null)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
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

  // ── File attachment ────────────────────────────────────────────────────────
  const handleAttach = () => {
    if (disabled) return
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target.result
      setAttachmentName(file.name)
      setValue(`[Attached document: "${file.name}"]\n\n${text}\n\n---\n\nQuestion: `)
      setTimeout(() => textareaRef.current?.focus(), 0)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── Voice input ────────────────────────────────────────────────────────────
  const handleMic = () => {
    if (disabled) return
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Try Chrome.')
      return
    }
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    const rec = new SpeechRecognition()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setValue((prev) => prev ? prev + ' ' + transcript : transcript)
    }
    rec.onend = () => setIsListening(false)
    rec.onerror = () => setIsListening(false)
    recognitionRef.current = rec
    rec.start()
    setIsListening(true)
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
      <div className="max-w-3xl mx-auto">
        {attachmentName && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-xs bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-700 rounded-lg px-2 py-1">
              📎 {attachmentName}
            </span>
            <button onClick={() => { setAttachmentName(null); setValue('') }} className="text-xs text-gray-400 hover:text-red-400">✕</button>
          </div>
        )}
        <div
          className={clsx(
            'flex items-end gap-2 rounded-2xl border bg-white dark:bg-gray-800 px-3 py-2 transition-shadow',
            'border-gray-200 dark:border-gray-600 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20'
          )}
        >
          {/* Attachment */}
          <input ref={fileInputRef} type="file" accept=".txt,.md,.pdf,.csv" className="hidden" onChange={handleFileChange} />
          <Button variant="ghost" size="icon" className="shrink-0 mb-0.5 text-gray-400 hover:text-brand-500" disabled={disabled} onClick={handleAttach} title="Attach file">
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
            className="flex-1 resize-none bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none leading-6 py-1 max-h-40 overflow-y-auto scrollbar-thin"
          />

          {/* Mic */}
          <Button
            variant="ghost"
            size="icon"
            className={clsx('shrink-0 mb-0.5', isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-brand-500')}
            disabled={disabled}
            onClick={handleMic}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
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
