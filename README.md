# RAG Chat UI

A modern chat interface for the RAG (Retrieval-Augmented Generation) assistant, built with React, Vite, and Tailwind CSS.

## Stack

| Tool | Purpose |
|---|---|
| React 18 | UI library |
| Vite 5 | Build tool & dev server |
| Tailwind CSS 3 | Utility-first styling |
| lucide-react | Icon library |
| clsx + tailwind-merge | Conditional class utilities |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/          # Base UI primitives (Button, Badge)
│   ├── Header.jsx
│   ├── ChatViewport.jsx
│   ├── ChatMessage.jsx
│   └── InputBar.jsx
├── data/
│   └── mockMessages.js   # Static demo messages
├── App.jsx
├── main.jsx
└── index.css
```

## Features

- Full-height chat layout (header / scrollable viewport / sticky input bar)
- User & assistant message bubbles with timestamps
- Source citation badges on assistant messages
- Auto-growing textarea (Shift+Enter for newline, Enter to send)
- Loading indicator with animated dots
- Simulated assistant response (replace with real RAG backend)
