import { useCallback, useEffect, useRef, useState } from 'react'
import { createId } from '../utils/id'

const DEFAULT_DURATION = 3200

/** Minimal toast queue. `show({ message, type, action })` returns the toast id. */
export function useToast() {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    ({ message, type = 'success', action, duration = DEFAULT_DURATION }) => {
      const id = createId('toast')
      setToasts((prev) => [...prev.slice(-3), { id, message, type, action }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), action ? duration + 2000 : duration),
      )
      return id
    },
    [dismiss],
  )

  useEffect(() => {
    const map = timers.current
    return () => map.forEach((timer) => clearTimeout(timer))
  }, [])

  return { toasts, show, dismiss }
}
