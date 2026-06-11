import { useState, useEffect } from 'react'

const KEY = 'rag_bookmarks'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? [] } catch { return [] }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(bookmarks))
  }, [bookmarks])

  const add = (msg) => {
    setBookmarks((prev) => {
      if (prev.find((b) => b.id === msg.id)) return prev
      return [{ ...msg, savedAt: new Date().toISOString() }, ...prev]
    })
  }

  const remove = (id) => setBookmarks((prev) => prev.filter((b) => b.id !== id))

  const isBookmarked = (id) => bookmarks.some((b) => b.id === id)

  return { bookmarks, add, remove, isBookmarked }
}
