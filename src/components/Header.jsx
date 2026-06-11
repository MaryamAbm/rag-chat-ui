import { useState } from 'react'
import { BookOpen, Cpu, HelpCircle, Sun, Moon, Bookmark, Download, FileText, FileDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'

export function Header({
  onReplayTour, dark, onToggleDark, bookmarkCount, onOpenBookmarks,
  onExportMarkdown, onPrintPDF, onToggleSidebar, sidebarOpen,
}) {
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center px-4 gap-2 sm:gap-3 shrink-0 print:hidden">

      {/* Sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        onClick={onToggleSidebar}
        title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
      </Button>

      {/* Logo + Title */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
          <BookOpen size={16} className="text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-white text-sm hidden sm:block">RAG Chat</span>
          <Badge variant="default">CIS Controls v8</Badge>
        </div>
      </div>

      <div className="flex-1" />

      {/* Model indicator */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1">
        <Cpu size={12} />
        <span className="hidden lg:inline">llama-3.1-8b-instant</span>
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      </div>

      {/* Export dropdown */}
      {(onExportMarkdown || onPrintPDF) && (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-brand-500 dark:text-gray-500 dark:hover:text-brand-400"
            title="Export chat"
            onClick={() => setExportOpen((v) => !v)}
          >
            <Download size={18} />
          </Button>

          {exportOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-[160px]">
                {onExportMarkdown && (
                  <button
                    onClick={() => { onExportMarkdown(); setExportOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FileText size={14} className="text-brand-500" />
                    Export Markdown
                  </button>
                )}
                {onPrintPDF && (
                  <button
                    onClick={() => { onPrintPDF(); setExportOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FileDown size={14} className="text-brand-500" />
                    Save as PDF
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Bookmarks */}
      <Button
        variant="ghost"
        size="icon"
        className="relative text-gray-400 hover:text-brand-500 dark:text-gray-500 dark:hover:text-brand-400"
        title="Bookmarks"
        onClick={onOpenBookmarks}
      >
        <Bookmark size={18} />
        {bookmarkCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold bg-brand-500 text-white rounded-full flex items-center justify-center">
            {bookmarkCount > 9 ? '9+' : bookmarkCount}
          </span>
        )}
      </Button>

      {/* Dark mode */}
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={onToggleDark}
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </Button>

      {/* Replay Tour */}
      <Button
        data-tour="replay-tour"
        variant="ghost"
        size="icon"
        className="text-gray-400 hover:text-brand-500 dark:text-gray-500 dark:hover:text-brand-400 hidden sm:flex"
        title="Replay intro tour"
        onClick={onReplayTour}
      >
        <HelpCircle size={18} />
      </Button>
    </header>
  )
}
