import { useCallback, useMemo, useState } from 'react'
import { useLocalStorage, readStorage } from './useLocalStorage'
import { createDemoData } from '../data/demoData'
import { createId } from '../utils/id'
import { CATEGORY_COLORS, NOTE_COLORS, STORAGE_KEYS } from '../utils/constants'

const noteColorIds = new Set(NOTE_COLORS.map((c) => c.id))
const isTimestamp = (v) => typeof v === 'number' && Number.isFinite(v) && v > 0

function sanitizeNotes(data) {
  if (!Array.isArray(data)) return undefined
  const seen = new Set()
  const now = Date.now()
  const result = []
  for (const item of data) {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string' || seen.has(item.id)) continue
    seen.add(item.id)
    const createdAt = isTimestamp(item.createdAt) ? item.createdAt : now
    result.push({
      id: item.id,
      title: typeof item.title === 'string' ? item.title : '',
      content: typeof item.content === 'string' ? item.content : '',
      categoryId: typeof item.categoryId === 'string' ? item.categoryId : null,
      color: noteColorIds.has(item.color) ? item.color : 'default',
      favorite: item.favorite === true,
      pinned: item.pinned === true,
      archived: item.archived === true,
      trashed: item.trashed === true,
      trashedAt: isTimestamp(item.trashedAt) ? item.trashedAt : null,
      createdAt,
      updatedAt: isTimestamp(item.updatedAt) ? item.updatedAt : createdAt,
    })
  }
  return result
}

function sanitizeCategories(data) {
  if (!Array.isArray(data)) return undefined
  const seen = new Set()
  return data
    .filter((c) => c && typeof c.id === 'string' && typeof c.name === 'string' && c.name.trim())
    .filter((c) => !seen.has(c.id) && seen.add(c.id))
    .map((c) => ({
      id: c.id,
      name: c.name.trim(),
      color: CATEGORY_COLORS.includes(c.color) ? c.color : CATEGORY_COLORS[0],
      createdAt: isTimestamp(c.createdAt) ? c.createdAt : Date.now(),
    }))
}

/** First launch = neither notes nor categories have ever been stored. */
function getFirstLaunchSeed() {
  const hasNotes = readStorage(STORAGE_KEYS.notes) !== undefined
  const hasCategories = readStorage(STORAGE_KEYS.categories) !== undefined
  return hasNotes || hasCategories ? null : createDemoData()
}

const EDITABLE_FIELDS = ['title', 'content', 'categoryId', 'color', 'favorite', 'pinned']

function pickEditable(fields) {
  const out = {}
  for (const key of EDITABLE_FIELDS) if (key in fields) out[key] = fields[key]
  return out
}

export function useNotes() {
  const [seed] = useState(getFirstLaunchSeed)
  const [notes, setNotes] = useLocalStorage(STORAGE_KEYS.notes, () => seed?.notes ?? [], {
    validate: sanitizeNotes,
  })
  const [categories, setCategories] = useLocalStorage(
    STORAGE_KEYS.categories,
    () => seed?.categories ?? [],
    { validate: sanitizeCategories },
  )

  const patchNote = useCallback(
    (id, patch) => setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n))),
    [setNotes],
  )

  const createNote = useCallback(
    (fields = {}) => {
      const now = Date.now()
      const note = {
        id: createId('note'),
        title: '',
        content: '',
        categoryId: null,
        color: 'default',
        favorite: false,
        pinned: false,
        ...pickEditable(fields),
        archived: false,
        trashed: false,
        trashedAt: null,
        createdAt: now,
        updatedAt: now,
      }
      setNotes((prev) => [note, ...prev])
      return note.id
    },
    [setNotes],
  )

  /** Content edits bump `updatedAt`. */
  const updateNote = useCallback(
    (id, fields) => patchNote(id, { ...pickEditable(fields), updatedAt: Date.now() }),
    [patchNote],
  )

  const toggleFavorite = useCallback(
    (id) =>
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, favorite: !n.favorite, updatedAt: Date.now() } : n)),
      ),
    [setNotes],
  )

  // Organisational actions do not count as edits, so they keep `updatedAt` unchanged.
  const togglePin = useCallback(
    (id) => setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))),
    [setNotes],
  )
  const setArchived = useCallback(
    (id, archived) => patchNote(id, archived ? { archived, pinned: false } : { archived }),
    [patchNote],
  )
  const moveToTrash = useCallback(
    (id) => patchNote(id, { trashed: true, trashedAt: Date.now(), pinned: false }),
    [patchNote],
  )
  const restoreNote = useCallback((id) => patchNote(id, { trashed: false, trashedAt: null }), [patchNote])
  const deleteForever = useCallback((id) => setNotes((prev) => prev.filter((n) => n.id !== id)), [setNotes])
  const emptyTrash = useCallback(() => setNotes((prev) => prev.filter((n) => !n.trashed)), [setNotes])

  const addCategory = useCallback(
    (name) => {
      const trimmed = name.trim()
      if (!trimmed) return null
      const category = {
        id: createId('cat'),
        name: trimmed,
        color: CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
        createdAt: Date.now(),
      }
      setCategories((prev) => [...prev, category])
      return category
    },
    [categories.length, setCategories],
  )

  const renameCategory = useCallback(
    (id, name) => {
      const trimmed = name.trim()
      if (!trimmed) return
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c)))
    },
    [setCategories],
  )

  /** Removes a category; its notes become uncategorised rather than deleted. */
  const deleteCategory = useCallback(
    (id) => {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      setNotes((prev) => prev.map((n) => (n.categoryId === id ? { ...n, categoryId: null } : n)))
    },
    [setCategories, setNotes],
  )

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  return {
    notes,
    categories,
    categoryMap,
    createNote,
    updateNote,
    toggleFavorite,
    togglePin,
    setArchived,
    moveToTrash,
    restoreNote,
    deleteForever,
    emptyTrash,
    addCategory,
    renameCategory,
    deleteCategory,
  }
}
