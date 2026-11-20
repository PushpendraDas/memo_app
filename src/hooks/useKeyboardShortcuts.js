import { useEffect, useRef } from 'react'

/**
 * Global shortcuts.
 * Ctrl/Cmd+N → new note (Alt+N as a fallback, since some browsers reserve Ctrl+N for "new window").
 * Ctrl/Cmd+K → focus search.
 */
export function useKeyboardShortcuts({ onNewNote, onSearch }) {
  const handlers = useRef({ onNewNote, onSearch })
  useEffect(() => {
    handlers.current = { onNewNote, onSearch }
  })

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase()
      const mod = event.ctrlKey || event.metaKey
      if (event.shiftKey) return
      if ((mod && !event.altKey && key === 'n') || (event.altKey && !mod && event.code === 'KeyN')) {
        event.preventDefault()
        handlers.current.onNewNote?.()
      } else if (mod && !event.altKey && key === 'k') {
        event.preventDefault()
        handlers.current.onSearch?.()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
