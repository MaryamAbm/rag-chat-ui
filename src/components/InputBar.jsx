import { useRef, useState, useEffect, useCallback } from 'react'
import { Send, Paperclip, Mic, MicOff, Square, X, FileText, Loader2 } from 'lucide-react'
import { Button } from './ui/Button'
import { clsx } from 'clsx'
import { extractText, formatFileSize, MAX_FILE_SIZE, ACCEPTED_TYPES } from '../lib/fileReader'

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

export function InputBar({ onSend, disabled }) {
  const [value, setValue]             = useState('')
  const [listening, setListening]     = useState(false)
  const [micError, setMicError]       = useState(null)
  const [supported]                   = useState(() => !!SpeechRecognition)
  const [attachment, setAttachment]   = useState(null)   // { name, size, text }
  const [fileLoading, setFileLoading] = useState(false)
  const [fileError, setFileError]     = useState(null)
  const textareaRef                   = useRef(null)
  const recognitionRef                = useRef(null)
  const fileInputRef                  = useRef(null)

  const resize = useCallback(() => {
    const el = textareaRef.current
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 160) + 'px' }
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    recognitionRef.current?.stop()

    let fullMessage = trimmed
    if (attachment) {
      fullMessage =
        `[Attached document: "${attachment.name}"]\n\n` +
        `${attachment.text}\n\n` +
        `---\n\n` +
        `Question: ${trimmed}`
    }

    onSend(fullMessage, attachment ? attachment.name : null)
    setValue('')
    setAttachment(null)
    setFileError(null)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [value, disabled, onSend, attachment])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleInput = (e) => { setValue(e.target.value); resize() }

  // ── File attachment ──────────────────────────────────────────────────────
  const handleFileClick = () => {
    if (disabled) return
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''                    // reset so same file can be re-picked
    setFileError(null)

    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File too large (max 5 MB). "${file.name}" is ${formatFileSize(file.size)}.`)
      return
    }

    setFileLoading(true)
    try {
      const text = await extractText(file)
      if (!text.trim()) { setFileError('The file appears to be empty or could not be read.'); return }
      setAttachment({ name: file.name, size: file.size, text })
    } catch (err) {
      setFileError(err.message)
    } finally {
      setFileLoading(false)
    }
  }

  const removeAttachment = () => { setAttachment(null); setFileError(null) }

  // ── Speech recognition ───────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!supported) { setMicError('Speech recognition not supported. Try Chrome.'); return }
    setMicError(null)
    const rec = new SpeechRecognition()
    rec.lang           = 'en-US'
    rec.continuous     = true
    rec.interimResults = true
    rec.onstart  = () => setListening(true)
    rec.onend    = () => setListening(false)
    rec.onerror  = (e) => {
      setListening(false)
      if (e.error === 'not-allowed') setMicError('Microphone access denied.')
      else if (e.error !== 'aborted') setMicError(`Mic error: ${e.error}`)
    }
    rec.onresult = (e) => {
      let final = '', interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t
        else interim += t
      }
      setValue((prev) => {
        const base = prev.replace(/\u200b.*$/, '')
        return base + (final || ('\u200b' + interim))
      })
      setTimeout(resize, 0)
    }
    recognitionRef.current = rec
    rec.start()
  }, [supported, resize])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setValue((prev) => prev.replace(/\u200b.*$/, '').trim())
  }, [])

  useEffect(() => () => recognitionRef.current?.abort(), [])

  const canSend    = value.replace(/\u200b.*$/, '').trim().length > 0 && !disabled
  const displayVal = value.replace('\u200b', '')
  const errorMsg   = micError || fileError

  return (
    <div data-tour="input-bar" className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
      <div className="max-w-3xl mx-auto">

        {/* Attachment chip */}
        {attachment && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 rounded-xl px-3 py-1.5 text-xs max-w-xs">
              <FileText size={13} className="shrink-0" />
              <span className="truncate font-medium">{attachment.name}</span>
              <span className="text-brand-400 shrink-0">{formatFileSize(attachment.size)}</span>
              <button
                onClick={removeAttachment}
                className="ml-1 text-brand-400 hover:text-brand-600 shrink-0"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        <div
          className={clsx(
            'flex items-end gap-2 rounded-2xl border bg-white px-3 py-2 transition-shadow',
            listening
              ? 'border-red-400 ring-2 ring-red-400/20'
              : attachment
              ? 'border-brand-400 ring-2 ring-brand-400/20'
              : 'border-gray-200 dark:border-gray-700 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20'
          )}
        >
          {/* Paperclip / file upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="ghost"
            size="icon"
            title="Attach a document (PDF, TXT, MD, CSV, JSON)"
            disabled={disabled || fileLoading}
            onClick={handleFileClick}
            className={clsx(
              'shrink-0 mb-0.5 transition-colors',
              attachment ? 'text-brand-500 hover:text-brand-600' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            {fileLoading
              ? <Loader2 size={18} className="animate-spin text-brand-400" />
              : <Paperclip size={18} />
            }
          </Button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={displayVal}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={listening ? 'Listening…' : 'Ask anything about CIS Controls…'}
            disabled={disabled}
            className={clsx(
              'flex-1 resize-none bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none leading-6 py-1 max-h-40 overflow-y-auto scrollbar-thin',
              listening && 'placeholder:text-red-400'
            )}
          />

          {/* Mic */}
          {supported ? (
            listening ? (
              <Button variant="ghost" size="icon" title="Stop recording" onClick={stopListening}
                className="shrink-0 mb-0.5 text-red-500 hover:text-red-600 hover:bg-red-50 animate-pulse">
                <Square size={16} fill="currentColor" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" title="Speak your question" onClick={startListening}
                disabled={disabled}
                className="shrink-0 mb-0.5 text-gray-400 hover:text-brand-500">
                <Mic size={18} />
              </Button>
            )
          ) : (
            <Button variant="ghost" size="icon" disabled title="Not supported in this browser"
              className="shrink-0 mb-0.5 text-gray-300">
              <MicOff size={18} />
            </Button>
          )}

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

        {errorMsg ? (
          <p className="text-center text-xs text-red-400 mt-1.5">{errorMsg}</p>
        ) : (
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-2">
            {attachment
              ? `"${attachment.name}" will be sent as context with your question.`
              : 'Attach PDF, TXT, MD, CSV or JSON — RAG answers may contain inaccuracies.'}
          </p>
        )}
      </div>
    </div>
  )
}
