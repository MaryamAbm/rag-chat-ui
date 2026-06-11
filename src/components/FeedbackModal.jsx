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
    if (selected.length === 0) return
    onSubmit({ reasons: selected, note: comment })
    onClose()
  }

  const canSubmit = selected.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">What went wrong?</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Select at least one reason: <span className="text-red-500">*</span>
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {REASON_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => toggle(chip)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                selected.includes(chip)
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-red-300 hover:text-red-500'
              )}
            >
              {chip}
            </button>
          ))}
        </div>

        {selected.length === 0 && (
          <p className="text-xs text-red-400 mb-3">Please select at least one reason to submit.</p>
        )}

        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment (optional)..."
          className="w-full text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={clsx(
              'flex-1 text-sm font-medium rounded-xl py-2 transition-colors',
              canSubmit
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            )}
          >
            Submit feedback
          </button>
          <button
            onClick={onClose}
            className="px-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
