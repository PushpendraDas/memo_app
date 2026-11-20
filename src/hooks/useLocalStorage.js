import { useEffect, useRef, useState } from 'react'

const resolve = (value) => (typeof value === 'function' ? value() : value)

/**
 * Reads a JSON value from localStorage, returning `undefined` when the key is missing.
 * Corrupted (unparseable) data is copied to `<key>:corrupt` so it is never silently lost.
 */
export function readStorage(key) {
  let raw
  try {
    raw = window.localStorage.getItem(key)
  } catch {
    return undefined // storage unavailable (private mode, blocked cookies, ...)
  }
  if (raw === null) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    try {
      window.localStorage.setItem(`${key}:corrupt`, raw)
    } catch {
      /* ignore */
    }
    return undefined
  }
}

function loadValue(key, defaultValue, validate) {
  const parsed = readStorage(key)
  if (parsed === undefined) return resolve(defaultValue)
  const clean = validate ? validate(parsed) : parsed
  return clean === undefined ? resolve(defaultValue) : clean
}

/**
 * useState that persists to localStorage.
 * - `validate(parsed)` must return a clean value, or `undefined` to fall back to the default.
 * - Stays in sync with other tabs via the `storage` event.
 */
export function useLocalStorage(key, defaultValue, { validate } = {}) {
  const [value, setValue] = useState(() => loadValue(key, defaultValue, validate))
  const optionsRef = useRef({ defaultValue, validate })
  useEffect(() => {
    optionsRef.current = { defaultValue, validate }
  })
  // Tracks the last serialized value so we neither re-write unchanged data nor echo other tabs.
  const lastWritten = useRef(null)

  useEffect(() => {
    const serialized = JSON.stringify(value)
    if (serialized === lastWritten.current) return
    lastWritten.current = serialized
    try {
      window.localStorage.setItem(key, serialized)
    } catch (error) {
      console.warn(`MemoSpace: could not save "${key}" to localStorage.`, error)
    }
  }, [key, value])

  useEffect(() => {
    const onStorage = (event) => {
      if (event.storageArea !== window.localStorage || event.key !== key) return
      const next = loadValue(key, optionsRef.current.defaultValue, optionsRef.current.validate)
      lastWritten.current = JSON.stringify(next)
      setValue(next)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  return [value, setValue]
}
