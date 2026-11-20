import { useEffect, useState } from 'react'

/** Current time, refreshed periodically so relative timestamps stay accurate. */
export function useNow(interval = 30 * 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(timer)
  }, [interval])
  return now
}
