import { useState } from 'react'
import { ChevronDown, BookOpen } from 'lucide-react'
import { clsx } from 'clsx'

function ConfidenceBar({ value }) {
  const color = value >= 80 ? 'bg-green-500' : value >= 65 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right">{value}%</span>
    </div>
  )
}

export function CitationAccordion({ sources }) {
  const [open, setOpen] = useState(false)
  if (!sources || sources.length === 0) return null

  // Support both string sources (legacy) and object sources {label, confidence}
  const normalized = sources.map((s) =>
    typeof s === 'string' ? { label: s, confidence: null } : s
  )

  return (
    <div className="mt-2 rounded-xl border border-gray-200 overflow-hidden text-xs w-full">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600"
      >
        <div className="flex items-center gap-1.5">
          <BookOpen size={12} />
          <span className="font-medium">{normalized.length} source{normalized.length > 1 ? 's' : ''} used</span>
        </div>
        <ChevronDown
          size={14}
          className={clsx('transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="divide-y divide-gray-100">
          {normalized.map((src, i) => {
            const parts = src.label.split('·').map((s) => s.trim())
            const doc  = parts[0] ?? src.label
            const page = parts[1] ?? null

            return (
              <div key={i} className="flex items-start gap-2 px-3 py-2.5 bg-white hover:bg-gray-50">
                <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shrink-0 font-semibold mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700">{doc}</p>
                  {page && <p className="text-gray-400 mt-0.5">{page}</p>}
                  {src.confidence !== null && <ConfidenceBar value={src.confidence} />}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
