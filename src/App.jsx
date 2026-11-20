import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import NoteCard from './components/NoteCard'
import NoteEditor from './components/NoteEditor'
import ConfirmDialog from './components/ConfirmDialog'
import ToastContainer from './components/Toast'
import EmptyState from './components/EmptyState'
import { useNotes } from './hooks/useNotes'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useToast } from './hooks/useToast'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useNow } from './hooks/useNow'
import { SORT_OPTIONS, STORAGE_KEYS, VIEWS } from './utils/constants'

const VIEW_TITLES = {
  [VIEWS.all]: 'All Notes',
  [VIEWS.favorites]: 'Favorites',
  [VIEWS.archived]: 'Archived',
  [VIEWS.trash]: 'Trash',
}

const VIEW_SUBTITLES = {
  [VIEWS.archived]: 'Out of the way, never lost',
  [VIEWS.trash]: 'Restore notes or delete them forever',
}

const validTheme = (v) => (v === 'light' || v === 'dark' ? v : undefined)
const validViewMode = (v) => (v === 'grid' || v === 'list' ? v : undefined)
const validSort = (v) => (SORT_OPTIONS.some((o) => o.id === v) ? v : undefined)
const systemTheme = () => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

const isActive = (n) => !n.trashed && !n.archived
const VIEW_FILTERS = {
  [VIEWS.all]: isActive,
  [VIEWS.favorites]: (n) => n.favorite && !n.trashed,
  [VIEWS.archived]: (n) => n.archived && !n.trashed,
  [VIEWS.trash]: (n) => n.trashed,
}

const SORTERS = {
  updated: (a, b) => b.updatedAt - a.updatedAt,
  created: (a, b) => b.createdAt - a.createdAt,
  alpha: (a, b) =>
    (a.title.trim() || 'Untitled').localeCompare(b.title.trim() || 'Untitled', undefined, { sensitivity: 'base' }) ||
    b.updatedAt - a.updatedAt,
}

let editorSession = 0

export default function App() {
  const {
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
  } = useNotes()

  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.theme, systemTheme, { validate: validTheme })
  const [viewMode, setViewMode] = useLocalStorage(STORAGE_KEYS.viewMode, 'grid', { validate: validViewMode })
  const [sort, setSort] = useLocalStorage(STORAGE_KEYS.sort, 'updated', { validate: validSort })

  const [selectedView, setSelectedView] = useState(VIEWS.all)
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editing, setEditing] = useState(null) // { key, id, defaults }
  const [confirm, setConfirm] = useState(null)

  const searchRef = useRef(null)
  const { toasts, show: showToast, dismiss: dismissToast } = useToast()
  const now = useNow()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  // A category view whose category was deleted falls back to All Notes.
  const activeCategory = selectedView.startsWith('category:') ? categoryMap.get(selectedView.slice(9)) : null
  const view = selectedView.startsWith('category:') && !activeCategory ? VIEWS.all : selectedView

  const counts = useMemo(() => {
    const result = { categories: {} }
    for (const [id, filter] of Object.entries(VIEW_FILTERS)) result[id] = notes.filter(filter).length
    for (const n of notes) {
      if (isActive(n) && n.categoryId) result.categories[n.categoryId] = (result.categories[n.categoryId] ?? 0) + 1
    }
    return result
  }, [notes])

  const viewNotes = useMemo(() => {
    const filter = activeCategory ? (n) => isActive(n) && n.categoryId === activeCategory.id : VIEW_FILTERS[view]
    return notes.filter(filter)
  }, [notes, view, activeCategory])

  const visibleNotes = useMemo(() => {
    const q = search.trim().toLowerCase()
    const matches = q
      ? viewNotes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      : viewNotes
    const sorter = SORTERS[sort] ?? SORTERS.updated
    return [...matches].sort((a, b) => Number(b.pinned) - Number(a.pinned) || sorter(a, b))
  }, [viewNotes, search, sort])

  const pinnedNotes = view === VIEWS.trash ? [] : visibleNotes.filter((n) => n.pinned)
  const otherNotes = view === VIEWS.trash ? visibleNotes : visibleNotes.filter((n) => !n.pinned)

  const editorNote = editing?.id ? notes.find((n) => n.id === editing.id) : null
  const editorOpen = Boolean(editing) && (!editing.id || Boolean(editorNote))

  /* ---------- actions ---------- */

  const selectView = useCallback((id) => {
    setSelectedView(id)
    setSidebarOpen(false)
  }, [])

  const openNewNote = useCallback(() => {
    if (editorOpen || confirm) return
    const defaults = {}
    if (activeCategory) defaults.categoryId = activeCategory.id
    if (view === VIEWS.favorites) defaults.favorite = true
    if (view === VIEWS.archived || view === VIEWS.trash) setSelectedView(VIEWS.all)
    setSidebarOpen(false)
    setEditing({ key: ++editorSession, id: null, defaults })
  }, [editorOpen, confirm, activeCategory, view])

  const openNote = useCallback((id) => setEditing({ key: ++editorSession, id }), [])

  const focusSearch = useCallback(() => {
    if (editorOpen || confirm) return
    setSidebarOpen(false)
    searchRef.current?.focus()
    searchRef.current?.select()
  }, [editorOpen, confirm])

  useKeyboardShortcuts({ onNewNote: openNewNote, onSearch: focusSearch })

  const handleEditorCreate = useCallback(
    (fields) => {
      const id = createNote(fields)
      setEditing((prev) => (prev ? { ...prev, id } : prev))
    },
    [createNote],
  )

  const handleEditorClose = useCallback(
    ({ saved, created } = {}) => {
      setEditing(null)
      if (created) showToast({ message: 'Note created' })
      else if (saved) showToast({ message: 'Note saved' })
    },
    [showToast],
  )

  const handleTrash = useCallback(
    (id) => {
      moveToTrash(id)
      showToast({
        message: 'Moved to Trash',
        type: 'delete',
        action: { label: 'Undo', onClick: () => restoreNote(id) },
      })
    },
    [moveToTrash, restoreNote, showToast],
  )

  const handleRestore = useCallback(
    (id) => {
      restoreNote(id)
      showToast({ message: 'Note restored' })
    },
    [restoreNote, showToast],
  )

  const handleArchive = useCallback(
    (id, archived) => {
      setArchived(id, archived)
      showToast({
        message: archived ? 'Note archived' : 'Note moved back to notes',
        type: 'info',
        action: { label: 'Undo', onClick: () => setArchived(id, !archived) },
      })
    },
    [setArchived, showToast],
  )

  const handleToggleFavorite = useCallback(
    (id) => {
      const note = notes.find((n) => n.id === id)
      toggleFavorite(id)
      showToast({ message: note?.favorite ? 'Removed from favorites' : 'Added to favorites', type: 'info' })
    },
    [notes, toggleFavorite, showToast],
  )

  const askDeleteForever = useCallback(
    (note) =>
      setConfirm({
        title: 'Delete note forever?',
        message: `“${note.title.trim() || 'Untitled note'}” will be permanently deleted. This cannot be undone.`,
        confirmLabel: 'Delete forever',
        onConfirm: () => {
          deleteForever(note.id)
          showToast({ message: 'Note permanently deleted', type: 'delete' })
        },
      }),
    [deleteForever, showToast],
  )

  const askEmptyTrash = useCallback(
    () =>
      setConfirm({
        title: 'Empty Trash?',
        message: `All ${counts.trash} ${counts.trash === 1 ? 'note' : 'notes'} in Trash will be permanently deleted. This cannot be undone.`,
        confirmLabel: 'Empty Trash',
        onConfirm: () => {
          emptyTrash()
          showToast({ message: 'Trash emptied', type: 'delete' })
        },
      }),
    [counts.trash, emptyTrash, showToast],
  )

  const askDeleteCategory = useCallback(
    (category) => {
      const inUse = notes.filter((n) => n.categoryId === category.id).length
      setConfirm({
        title: `Delete “${category.name}”?`,
        message:
          inUse > 0
            ? `${inUse} ${inUse === 1 ? 'note uses' : 'notes use'} this category. The notes will be kept and become uncategorized.`
            : 'This category is empty and will be removed.',
        confirmLabel: 'Delete category',
        onConfirm: () => {
          deleteCategory(category.id)
          showToast({ message: `Category “${category.name}” deleted`, type: 'delete' })
        },
      })
    },
    [notes, deleteCategory, showToast],
  )

  const handleAddCategory = useCallback(
    (name) => {
      const category = addCategory(name)
      if (category) {
        showToast({ message: `Category “${category.name}” created` })
        setSelectedView(`category:${category.id}`)
      }
    },
    [addCategory, showToast],
  )

  const handleRenameCategory = useCallback(
    (id, name) => {
      renameCategory(id, name)
      showToast({ message: 'Category renamed' })
    },
    [renameCategory, showToast],
  )

  /* ---------- render ---------- */

  const modalOpen = editorOpen || Boolean(confirm)

  const title = activeCategory ? activeCategory.name : VIEW_TITLES[view]
  const subtitle = activeCategory ? 'Category' : VIEW_SUBTITLES[view]
  const emptyKind = search.trim() && viewNotes.length > 0 ? 'search' : activeCategory ? 'category' : view

  const renderCards = (list) =>
    list.map((note) => (
      <NoteCard
        key={note.id}
        note={note}
        category={note.categoryId ? categoryMap.get(note.categoryId) : null}
        query={search}
        now={now}
        layout={viewMode}
        onOpen={openNote}
        onTogglePin={togglePin}
        onToggleFavorite={handleToggleFavorite}
        onArchive={handleArchive}
        onTrash={handleTrash}
        onRestore={handleRestore}
        onDeleteForever={askDeleteForever}
      />
    ))

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to notes
      </a>
      <Sidebar
        inert={modalOpen}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        view={view}
        onSelectView={selectView}
        counts={counts}
        categories={categories}
        categoryCounts={counts.categories}
        onAddCategory={handleAddCategory}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={askDeleteCategory}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />

      <main className="main" id="main" inert={modalOpen}>
        <Header
          title={title}
          subtitle={subtitle}
          count={visibleNotes.length}
          search={search}
          onSearchChange={setSearch}
          searchRef={searchRef}
          sort={sort}
          onSortChange={setSort}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateNote={openNewNote}
          onOpenMenu={() => setSidebarOpen(true)}
          isTrash={view === VIEWS.trash}
          onEmptyTrash={askEmptyTrash}
          trashCount={counts.trash}
        />

        <div className="content">
          {visibleNotes.length === 0 ? (
            <EmptyState kind={emptyKind} query={search.trim()} onCreate={openNewNote} onClearSearch={() => setSearch('')} />
          ) : (
            <>
              {pinnedNotes.length > 0 && (
                <section className="note-section" aria-labelledby="pinned-heading">
                  <h2 id="pinned-heading" className="section-label">
                    Pinned
                  </h2>
                  <div className={`notes notes--${viewMode}`}>{renderCards(pinnedNotes)}</div>
                </section>
              )}
              {otherNotes.length > 0 && (
                <section className="note-section" aria-labelledby={pinnedNotes.length > 0 ? 'others-heading' : undefined} aria-label={pinnedNotes.length > 0 ? undefined : title}>
                  {pinnedNotes.length > 0 && (
                    <h2 id="others-heading" className="section-label">
                      Others
                    </h2>
                  )}
                  <div className={`notes notes--${viewMode}`}>
                    {renderCards(otherNotes)}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {editorOpen && (
        <NoteEditor
          key={editing.key}
          note={editorNote}
          defaults={editing.defaults}
          categories={categories}
          now={now}
          onCreate={handleEditorCreate}
          onUpdate={updateNote}
          onClose={handleEditorClose}
          onArchive={handleArchive}
          onTrash={handleTrash}
          onRestore={handleRestore}
        />
      )}

      {confirm && (
        <ConfirmDialog
          {...confirm}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            confirm.onConfirm()
            setConfirm(null)
          }}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
