import { BookOpen, Cpu, Settings } from 'lucide-react'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'

export function Header() {
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 gap-3 shrink-0">
      {/* Logo + Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
          <BookOpen size={16} className="text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm">RAG Chat</span>
          <Badge variant="default">CIS Controls v8</Badge>
        </div>
      </div>

      <div className="flex-1" />

      {/* Model indicator */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1">
        <Cpu size={12} />
        <span>llama-3.1-8b-instant</span>
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      </div>

      {/* Settings */}
      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
        <Settings size={18} />
      </Button>
    </header>
  )
}
