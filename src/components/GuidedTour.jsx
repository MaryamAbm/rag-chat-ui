import { useState, useEffect, useRef } from 'react'
import { X, ArrowRight, ArrowLeft } from 'lucide-react'

/**
 * Each step defines one screen of the guided tour.
 * - title / body: the text shown in the tooltip
 * - target: a CSS selector for the element to highlight and point at (null = centered modal)
 * - placement: which side of the target the tooltip appears on (right/left/top/bottom/center)
 */
const STEPS = [
  {
    title: 'Welcome to RAG Chat! 👋',
    body: 'This app lets you ask questions about the CIS Controls v8 cybersecurity document and get AI-powered answers in real time.',
    target: null,
    placement: 'center',
  },
  {
    title: 'Start a new conversation',
    body: 'Click "New Chat" to create a fresh conversation thread. All your chats are saved automatically.',
    target: '[data-tour="new-chat"]',
    placement: 'right',
  },
  {
    title: 'Ask your question',
    body: 'Type your question here and press Enter (or click Send). The AI will start typing its answer immediately.',
    target: '[data-tour="input-bar"]',
    placement: 'top',
  },
  {
    title: 'Replay this tour anytime',
    body: 'Click this help button whenever you want to see this tour again.',
    target: '[data-tour="replay-tour"]',
    placement: 'bottom',
  },
  {
    title: 'Expandable source citations',
    body: 'Every answer shows which pages of the CIS Controls document were used. Click "X sources used" to expand and inspect them.',
    target: null,
    placement: 'center',
  },
  {
    title: 'Rate each answer',
    body: 'Use 👍 or 👎 to rate answers. Clicking 👎 opens a dialog to explain what went wrong — this feedback improves the AI.',
    target: null,
    placement: 'center',
  },
  {
    title: "You're all set! 🎉",
    body: 'Start by clicking "New Chat" and asking your first cybersecurity question.',
    target: null,
    placement: 'center',
  },
]

// Pixel gap between the tooltip's arrow tip and the target element's edge
const GAP = 12

/**
 * Calculate the top/left position of the tooltip and which side the arrow should be on,
 * based on the target element's bounding rectangle and the desired placement.
 * Also clamps the tooltip so it never goes off-screen.
 */
function getPlacementStyles(rect, placement, tooltipW, tooltipH) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const margin = 12

  let top, left, arrowSide, arrowOffset

  if (placement === 'right') {
    top  = rect.top + rect.height / 2 - tooltipH / 2
    left = rect.right + GAP
    arrowSide = 'left'
    arrowOffset = tooltipH / 2 - 8
  } else if (placement === 'left') {
    top  = rect.top + rect.height / 2 - tooltipH / 2
    left = rect.left - tooltipW - GAP
    arrowSide = 'right'
    arrowOffset = tooltipH / 2 - 8
  } else if (placement === 'top') {
    top  = rect.top - tooltipH - GAP
    left = rect.left + rect.width / 2 - tooltipW / 2
    arrowSide = 'bottom'
    arrowOffset = tooltipW / 2 - 8
  } else if (placement === 'bottom') {
    top  = rect.bottom + GAP
    left = rect.left + rect.width / 2 - tooltipW / 2
    arrowSide = 'top'
    arrowOffset = tooltipW / 2 - 8
  }

  // Clamp to viewport
  left = Math.max(margin, Math.min(left, vw - tooltipW - margin))
  top  = Math.max(margin, Math.min(top,  vh - tooltipH - margin))

  return { top, left, arrowSide, arrowOffset }
}

export function GuidedTour({ onFinish }) {
  const [step, setStep]           = useState(0)   // which step we're on (0-indexed)
  const [pos, setPos]             = useState(null) // {top, left, arrowSide} for positioned tooltip
  const [highlight, setHighlight] = useState(null) // bounding box of the highlighted element
  const tooltipRef                = useRef(null)   // ref to measure the tooltip's own dimensions
  const current                   = STEPS[step]
  const isLast                    = step === STEPS.length - 1

  // When the step changes, find the target element and calculate tooltip position
  useEffect(() => {
    if (!current.target) {
      setPos(null)
      setHighlight(null)
      return
    }

    // Find the target DOM element using its data-tour attribute
    const el = document.querySelector(current.target)
    if (!el) { setPos(null); setHighlight(null); return }

    const rect = el.getBoundingClientRect()

    // Store the highlight box (adds a glowing ring around the target)
    setHighlight({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })

    // Wait one frame so the tooltip has rendered and we can measure its size
    requestAnimationFrame(() => {
      if (!tooltipRef.current) return
      const tw = tooltipRef.current.offsetWidth  || 280
      const th = tooltipRef.current.offsetHeight || 160
      setPos(getPlacementStyles(rect, current.placement, tw, th))
    })
  }, [step, current])

  // Recalculate tooltip position if the window is resized
  useEffect(() => {
    const onResize = () => {
      if (!current.target) return
      const el = document.querySelector(current.target)
      if (!el || !tooltipRef.current) return
      const rect = el.getBoundingClientRect()
      setHighlight({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
      const tw = tooltipRef.current.offsetWidth  || 280
      const th = tooltipRef.current.offsetHeight || 160
      setPos(getPlacementStyles(rect, current.placement, tw, th))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [step, current])

  const isCentered = current.placement === 'center' || !current.target || !pos

  const arrowClasses = {
    left:   'right-full top-1/2 -translate-y-1/2 border-r-white border-y-transparent border-l-transparent border-[8px]',
    right:  'left-full top-1/2 -translate-y-1/2 border-l-white border-y-transparent border-r-transparent border-[8px]',
    top:    'bottom-full left-1/2 -translate-x-1/2 border-b-white border-x-transparent border-t-transparent border-[8px]',
    bottom: 'top-full left-1/2 -translate-x-1/2 border-t-white border-x-transparent border-b-transparent border-[8px]',
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 transition-all duration-300" />

      {/* Highlight cutout */}
      {highlight && (
        <div
          className="absolute rounded-xl ring-2 ring-brand-400 ring-offset-2 ring-offset-transparent bg-transparent pointer-events-none transition-all duration-300"
          style={{
            top:    highlight.top    - 4,
            left:   highlight.left   - 4,
            width:  highlight.width  + 8,
            height: highlight.height + 8,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
          }}
        />
      )}

      {/* Tooltip */}
      {isCentered ? (
        /* Centered modal */
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            ref={tooltipRef}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 pointer-events-auto"
          >
            <TooltipContent
              step={step}
              current={current}
              isLast={isLast}
              onFinish={onFinish}
              onPrev={() => setStep(s => s - 1)}
              onNext={() => setStep(s => s + 1)}
            />
          </div>
        </div>
      ) : (
        /* Positioned tooltip with arrow */
        pos && (
          <div
            ref={tooltipRef}
            className="absolute bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-72 p-5 pointer-events-auto transition-all duration-300"
            style={{ top: pos.top, left: pos.left }}
          >
            {/* Arrow */}
            <div
              className={`absolute w-0 h-0 border-solid ${arrowClasses[pos.arrowSide]}`}
              style={
                pos.arrowSide === 'left' || pos.arrowSide === 'right'
                  ? { top: pos.arrowOffset }
                  : { left: pos.arrowOffset }
              }
            />
            <TooltipContent
              step={step}
              current={current}
              isLast={isLast}
              onFinish={onFinish}
              onPrev={() => setStep(s => s - 1)}
              onNext={() => setStep(s => s + 1)}
            />
          </div>
        )
      )}
    </div>
  )
}

function TooltipContent({ step, current, isLast, onFinish, onPrev, onNext }) {
  return (
    <>
      {/* Step dots */}
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
        <X size={16} />
      </button>

      <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 pr-4 text-sm">{current.title}</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{current.body}</p>

      <div className="flex items-center justify-between mt-5">
        <button
          onClick={onPrev}
          disabled={step === 0}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-0"
        >
          <ArrowLeft size={13} /> Back
        </button>

        <button
          onClick={isLast ? onFinish : onNext}
          className="flex items-center gap-1.5 bg-brand-500 text-white text-xs font-medium rounded-xl px-4 py-1.5 hover:bg-brand-600 transition-colors"
        >
          {isLast ? 'Get started' : 'Next'}
          {!isLast && <ArrowRight size={13} />}
        </button>
      </div>
    </>
  )
}

/**
 * useTour — hook to control when the guided tour is shown.
 * - On first visit: shows automatically (no localStorage key yet)
 * - After finishing: sets 'rag-tour-done' in localStorage so it won't show again
 * - replay(): clears the key and shows the tour again (used by the ? button in the header)
 */
export function useTour() {
  const [show, setShow] = useState(false)

  // Check localStorage on mount — show tour only if user hasn't seen it before
  useEffect(() => {
    const seen = localStorage.getItem('rag-tour-done')
    if (!seen) setShow(true)
  }, [])

  // Called when user finishes or dismisses the tour
  const finish = () => {
    localStorage.setItem('rag-tour-done', '1') // mark as seen so it won't auto-show again
    setShow(false)
  }

  // Called by the ? button — resets the seen flag and shows the tour again
  const replay = () => {
    localStorage.removeItem('rag-tour-done')
    setShow(true)
  }

  return { show, finish, replay }
}
