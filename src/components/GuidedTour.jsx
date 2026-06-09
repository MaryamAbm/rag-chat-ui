import { useState, useEffect } from 'react'
import { X, ArrowRight, ArrowLeft } from 'lucide-react'

const STEPS = [
  {
    title: 'Welcome to RAG Chat! 👋',
    body: 'This app lets you ask questions about the CIS Controls v8 cybersecurity document and get AI-powered answers in real time.',
    target: null,
  },
  {
    title: 'Start a new conversation',
    body: 'Click "New Chat" in the sidebar to create a fresh conversation thread. All your chats are saved automatically.',
    highlight: '[data-tour="new-chat"]',
  },
  {
    title: 'Ask your question',
    body: 'Type your question here and press Enter (or click the Send button). The AI will start typing its answer immediately.',
    highlight: '[data-tour="input-bar"]',
  },
  {
    title: 'Expandable source citations',
    body: 'Every AI answer shows which pages of the CIS Controls document it used. Click "X sources used" to expand and inspect them.',
    highlight: null,
  },
  {
    title: 'Rate the answer',
    body: 'Use 👍 or 👎 to rate each answer. If you click 👎, a dialog will ask you to explain what went wrong — this feedback improves the AI.',
    highlight: null,
  },
  {
    title: "You're all set!",
    body: 'Start by clicking "New Chat" and asking your first question. Good luck!',
    target: null,
  },
]

export function GuidedTour({ onFinish }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 z-10">
        {/* Step indicator */}
        <div className="flex gap-1 mb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-brand-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        {/* Close */}
        <button
          onClick={onFinish}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        <h2 className="font-semibold text-gray-900 mb-2">{current.title}</h2>
        <p className="text-sm text-gray-500 leading-relaxed">{current.body}</p>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-0"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <button
            onClick={isLast ? onFinish : () => setStep((s) => s + 1)}
            className="flex items-center gap-1.5 bg-brand-500 text-white text-sm font-medium rounded-xl px-4 py-2 hover:bg-brand-600 transition-colors"
          >
            {isLast ? 'Get started' : 'Next'}
            {!isLast && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export function useTour() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('rag-tour-done')
    if (!seen) setShow(true)
  }, [])

  const finish = () => {
    localStorage.setItem('rag-tour-done', '1')
    setShow(false)
  }

  return { show, finish }
}
