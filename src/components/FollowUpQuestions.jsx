import { Sparkles } from 'lucide-react'

export function FollowUpQuestions({ questions, onSelect }) {
  if (!questions || questions.length === 0) return null

  return (
    <div className="mt-3 flex flex-col gap-2">
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <Sparkles size={11} />
        Suggested follow-ups
      </p>
      <div className="flex flex-col gap-1.5">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            className="text-left text-xs text-brand-600 border border-brand-100 bg-brand-50 hover:bg-brand-100 rounded-xl px-3 py-2 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
