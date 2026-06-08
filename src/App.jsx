import { useState } from 'react'
import { Header } from './components/Header'
import { ChatViewport } from './components/ChatViewport'
import { InputBar } from './components/InputBar'
import { mockMessages } from './data/mockMessages'

export default function App() {
  const [messages, setMessages] = useState(mockMessages)
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = (text) => {
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    // Simulate assistant response (static demo)
    setTimeout(() => {
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'This is a static demo. Connect this component to your RAG backend to get live answers from the CIS Controls v8 knowledge base.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: ['CIS Controls v8 · Demo Mode'],
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <ChatViewport messages={messages} isLoading={isLoading} />
      <InputBar onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
