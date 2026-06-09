import { useState } from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

const REASON_CHIPS = [
  'Incorrect information',
  'Not relevant to my question',
  'Too vague or incomplete',
  'Wrong document cited',
  'Confusing or unclear',
  'Other',
]

export function FeedbackModal({ onSubmit, onClose }) {
  const [selected, setSelected] = useState([])
  const [comment, setComment] = useState('')

  const toggle = (chip) =>
    setSelected((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    )

  const handleSubmit = () => {
    onSubmit({ reasons: selected, note: comment })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">What went wrong?</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Reason chips */}
        <p className="text-sm text-gray-500 mb-3">Select all that apply:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {REASON_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => toggle(chip)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                selected.includes(chip)
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-500'
              )}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment (optional)..."
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-red-500 text-white text-sm font-medium rounded-xl py-2 hover:bg-red-600 transition-colors"
          >
            Submit feedback
          </button>
          <button
            onClick={onClose}
            className="px-4 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
