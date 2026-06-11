@echo off
echo Rebuilding feature branches from current main (latest code)...
cd /d "C:\Users\User\Downloads\rag-chat-ui-main"

git fetch origin
git checkout main
git pull origin main

if not exist docs\features mkdir docs\features

:: ── feat/initial-setup ──────────────────────────────────────────────────────
git checkout -b feat/initial-setup 2>nul || (git checkout main && git branch -D feat/initial-setup && git checkout -b feat/initial-setup)
(
echo # Initial Project Setup
echo.
echo Scaffolds the project with React, Vite, and Tailwind CSS.
echo.
echo ## Files
echo - `index.html` — app entry point
echo - `vite.config.js` — Vite build config
echo - `tailwind.config.js` — Tailwind CSS config
echo - `src/main.jsx` — React root mount
) > docs\features\initial-setup.md
git add docs\features\initial-setup.md
git commit -m "feat: initial project scaffold with React, Vite, and Tailwind CSS"
git push origin feat/initial-setup --force
git checkout main && git branch -D feat/initial-setup

:: ── feat/backend-api ─────────────────────────────────────────────────────────
git checkout -b feat/backend-api
(
echo # Backend API
echo.
echo FastAPI backend with SQLite persistence and Groq LLM streaming.
echo.
echo ## Files
echo - `backend/api.py` — FastAPI app with chat endpoints
echo - `backend/.env` — environment variables ^(GROQ_API_KEY^)
echo - `backend/requirements.txt` — Python dependencies
echo.
echo ## Endpoints
echo - `POST /threads` — create a new chat thread
echo - `GET /threads` — list all threads
echo - `POST /threads/{id}/ask` — stream LLM response
echo - `GET /threads/{id}/messages` — fetch message history
) > docs\features\backend-api.md
git add docs\features\backend-api.md
git commit -m "feat: add FastAPI backend with SQLite chat persistence and Groq LLM"
git push origin feat/backend-api --force
git checkout main && git branch -D feat/backend-api

:: ── feat/chat-threads ────────────────────────────────────────────────────────
git checkout -b feat/chat-threads
(
echo # Chat Threads Sidebar
echo.
echo Sidebar showing all previous conversations with search and delete.
echo.
echo ## Files
echo - `src/components/chatthreads.jsx` — Sidebar component
echo.
echo ## Features
echo - Lists all threads sorted by recency
echo - Search/filter threads by title
echo - Delete individual threads
echo - Polls for new threads every 30 seconds
) > docs\features\chat-threads.md
git add docs\features\chat-threads.md
git commit -m "feat: add chat threads sidebar with search and delete"
git push origin feat/chat-threads --force
git checkout main && git branch -D feat/chat-threads

:: ── feat/chat-streaming ──────────────────────────────────────────────────────
git checkout -b feat/chat-streaming
(
echo # Chat Streaming
echo.
echo Real-time token streaming from the backend with markdown rendering.
echo.
echo ## Files
echo - `src/components/ChatMessage.jsx` — message bubble component
echo - `src/components/autoscroll.jsx` — chat viewport with auto-scroll
echo - `src/lib/api.js` — API client with SSE stream reader
echo.
echo ## Features
echo - Server-Sent Events ^(SSE^) streaming
echo - Markdown rendering with remark-gfm
echo - Auto-scroll to latest message
) > docs\features\chat-streaming.md
git add docs\features\chat-streaming.md
git commit -m "feat: add streaming chat messages with markdown rendering"
git push origin feat/chat-streaming --force
git checkout main && git branch -D feat/chat-streaming

:: ── feat/input-bar ───────────────────────────────────────────────────────────
git checkout -b feat/input-bar
(
echo # Input Bar
echo.
echo Message input with send button and file attachment support.
echo.
echo ## Files
echo - `src/components/InputBar.jsx` — input bar component
echo.
echo ## Features
echo - Auto-growing textarea
echo - Send on Enter ^(Shift+Enter for newline^)
echo - File attachment for document context
) > docs\features\input-bar.md
git add docs\features\input-bar.md
git commit -m "feat: add message input bar with file attachment support"
git push origin feat/input-bar --force
git checkout main && git branch -D feat/input-bar

:: ── feat/dark-mode ───────────────────────────────────────────────────────────
git checkout -b feat/dark-mode
(
echo # Dark Mode
echo.
echo Dark/light mode toggle persisted in localStorage.
echo.
echo ## Files
echo - `src/lib/useDarkMode.js` — custom hook
echo.
echo ## Features
echo - Toggles Tailwind dark class on root element
echo - Persists user preference across sessions
) > docs\features\dark-mode.md
git add docs\features\dark-mode.md
git commit -m "feat: add dark mode toggle with localStorage persistence"
git push origin feat/dark-mode --force
git checkout main && git branch -D feat/dark-mode

:: ── feat/bookmarks ───────────────────────────────────────────────────────────
git checkout -b feat/bookmarks
(
echo # Bookmarks
echo.
echo Bookmark any AI response and view saved bookmarks in a side panel.
echo.
echo ## Files
echo - `src/components/BookmarksPanel.jsx` — bookmarks panel
echo - `src/lib/useBookmarks.js` — bookmark state hook
echo.
echo ## Features
echo - Bookmark/unbookmark any assistant message
echo - Persistent bookmarks panel
echo - Badge count on header icon
) > docs\features\bookmarks.md
git add docs\features\bookmarks.md
git commit -m "feat: add message bookmarking with bookmarks panel"
git push origin feat/bookmarks --force
git checkout main && git branch -D feat/bookmarks

:: ── feat/guided-tour ─────────────────────────────────────────────────────────
git checkout -b feat/guided-tour
(
echo # Guided Tour
echo.
echo Interactive onboarding tour for new users.
echo.
echo ## Files
echo - `src/components/GuidedTour.jsx` — tour component
echo.
echo ## Features
echo - Step-by-step tour highlighting key UI elements
echo - Shows automatically on first visit
echo - Can be replayed from the help icon
) > docs\features\guided-tour.md
git add docs\features\guided-tour.md
git commit -m "feat: add onboarding guided tour for new users"
git push origin feat/guided-tour --force
git checkout main && git branch -D feat/guided-tour

:: ── feat/citations ───────────────────────────────────────────────────────────
git checkout -b feat/citations
(
echo # Citations and Sources
echo.
echo Inline citation markers with hover tooltips and collapsible source details.
echo.
echo ## Files
echo - `src/components/ChatMessage.jsx` — CitationBadge, CitedMarkdown, CitationAccordion
echo - `backend/api.py` — SYSTEM_PROMPT updated to output CITATIONS JSON
echo.
echo ## Features
echo - Inline [1] [2] badges in AI responses
echo - Hover tooltip shows source snippet
echo - Collapsible accordion with full citation metadata
echo - LLM instructed to output structured CITATIONS JSON
) > docs\features\citations.md
git add docs\features\citations.md
git commit -m "feat: add inline citation badges with hover tooltips and source accordion"
git push origin feat/citations --force
git checkout main && git branch -D feat/citations

:: ── feat/response-regeneration ───────────────────────────────────────────────
git checkout -b feat/response-regeneration
(
echo # Response Regeneration
echo.
echo Regenerate any AI response and navigate between all previous versions.
echo.
echo ## Files
echo - `src/components/ChatMessage.jsx` — regenerate button, VersionNav
echo - `src/lib/api.js` — askRegenerate method
echo - `backend/api.py` — POST /messages/{id}/regenerate endpoint
echo.
echo ## Features
echo - Regenerate button on every assistant message
echo - Version history stored in database
echo - Navigate between versions with prev/next controls
echo - Versions persisted across sessions
) > docs\features\response-regeneration.md
git add docs\features\response-regeneration.md
git commit -m "feat: add response regeneration with version history navigation"
git push origin feat/response-regeneration --force
git checkout main && git branch -D feat/response-regeneration

:: ── feat/user-feedback ───────────────────────────────────────────────────────
git checkout -b feat/user-feedback
(
echo # User Feedback
echo.
echo Thumbs up/down on every AI response with mandatory reason for negative ratings.
echo.
echo ## Files
echo - `src/components/ChatMessage.jsx` — FeedbackBar component
echo - `src/components/FeedbackModal.jsx` — reason selection modal
echo.
echo ## Features
echo - Thumbs up / thumbs down on every assistant message
echo - Negative feedback requires selecting at least one reason
echo - Feedback persisted to database
) > docs\features\user-feedback.md
git add docs\features\user-feedback.md
git commit -m "feat: add thumbs up/down feedback with mandatory reason selection"
git push origin feat/user-feedback --force
git checkout main && git branch -D feat/user-feedback

:: ── feat/comparison-mode ─────────────────────────────────────────────────────
git checkout -b feat/comparison-mode
(
echo # Response Comparison Mode
echo.
echo Side-by-side modal for comparing two versions of an AI response.
echo.
echo ## Files
echo - `src/components/ComparisonModal.jsx` — comparison modal
echo - `src/components/ChatMessage.jsx` — Compare button in VersionNav
echo.
echo ## Features
echo - Compare any two versions side by side
echo - Panel navigation controls
echo - Markdown rendered in both panels
) > docs\features\comparison-mode.md
git add docs\features\comparison-mode.md
git commit -m "feat: add side-by-side response version comparison modal"
git push origin feat/comparison-mode --force
git checkout main && git branch -D feat/comparison-mode

:: ── feat/responsive-ui ───────────────────────────────────────────────────────
git checkout -b feat/responsive-ui
(
echo # Responsive UI
echo.
echo Fully responsive layout with collapsible sidebar for mobile screens.
echo.
echo ## Files
echo - `src/components/Header.jsx` — mobile sidebar toggle button
echo - `src/App.jsx` — sidebarOpen state, conditional sidebar render
echo - `src/index.css` — print media query styles
echo.
echo ## Features
echo - Hamburger menu to toggle sidebar on mobile
echo - Sidebar hidden by default on small screens
echo - Clean print styles for PDF export
) > docs\features\responsive-ui.md
git add docs\features\responsive-ui.md
git commit -m "feat: add responsive mobile sidebar toggle and layout"
git push origin feat/responsive-ui --force
git checkout main && git branch -D feat/responsive-ui

:: ── feat/citation-fixes ───────────────────────────────────────────────────────
git checkout -b feat/citation-fixes
(
echo # Citation Rendering Fix
echo.
echo Fixes CITATIONS and FOLLOWUPS leaking as raw markdown into the chat UI.
echo.
echo ## Files
echo - `backend/api.py` — regex-based extraction, _extract_json_array helper
echo - `src/App.jsx` — cleanContent^(^) function, onDone cleanup callback
echo.
echo ## Root cause
echo The LLM formatted CITATIONS as markdown headers and code fences.
echo The old parser only matched plain `CITATIONS:` text.
echo.
echo ## Fix
echo - Backend uses flexible regex to match any markdown variant of the markers
echo - JSON extracted by stripping code fences before parsing
echo - Frontend cleans up any leaked text on stream completion
) > docs\features\citation-fixes.md
git add docs\features\citation-fixes.md
git commit -m "fix: resolve citation and followup rendering artifacts from LLM stream"
git push origin feat/citation-fixes --force
git checkout main && git branch -D feat/citation-fixes

:: ── feat/pdf-export ──────────────────────────────────────────────────────────
git checkout -b feat/pdf-export
(
echo # PDF Export
echo.
echo Direct one-click PDF download using jsPDF — no browser print dialog.
echo.
echo ## Files
echo - `src/App.jsx` — exportPDF^(^) function using jsPDF
echo - `src/components/Header.jsx` — "Save as PDF" button in export dropdown
echo - `package.json` — jspdf dependency added
echo.
echo ## Features
echo - Exports chat as formatted A4 PDF
echo - Includes title, date, role labels, and timestamps
echo - Filename matches the chat thread title
) > docs\features\pdf-export.md
git add docs\features\pdf-export.md
git commit -m "feat: add direct PDF download using jsPDF"
git push origin feat/pdf-export --force
git checkout main && git branch -D feat/pdf-export

:: ── feat/export ──────────────────────────────────────────────────────────────
git checkout -b feat/export
(
echo # Chat Export ^(Markdown + PDF^)
echo.
echo Export current chat conversation as Markdown or PDF.
echo.
echo ## Files
echo - `src/App.jsx` — exportMarkdown^(^) and exportPDF^(^) helpers
echo - `src/components/Header.jsx` — export dropdown with two options
echo.
echo ## Features
echo - Export Markdown: downloads a `.md` file
echo - Save as PDF: downloads a formatted `.pdf` file via jsPDF
echo - Filename based on chat thread title
) > docs\features\export.md
git add docs\features\export.md
git commit -m "feat: add Markdown and PDF export for chat conversations"
git push origin feat/export --force
git checkout main && git branch -D feat/export

echo.
echo All branches rebuilt and pushed successfully!
echo.
echo Now go to: https://github.com/MaryamAbm/rag-chat-ui/pulls
echo Click "New pull request" for each branch.
echo.
pause
