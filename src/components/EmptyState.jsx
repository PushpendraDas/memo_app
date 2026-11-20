import { Archive, FileText, Plus, SearchX, Star, Tag, Trash2 } from 'lucide-react'

const PRESETS = {
  all: { icon: FileText, title: 'Your space is ready', text: 'Capture ideas, plans and lists. Your notes are saved automatically.' },
  favorites: { icon: Star, title: 'No favorites yet', text: 'Star the notes you reach for most and they will appear here.' },
  archived: { icon: Archive, title: 'Nothing archived', text: 'Archive notes you want to keep but no longer need every day.' },
  trash: { icon: Trash2, title: 'Trash is empty', text: 'Deleted notes land here so you can restore them if you change your mind.' },
  category: { icon: Tag, title: 'No notes in this category', text: 'Create a note here, or assign a category from the note editor.' },
  search: { icon: SearchX, title: 'No matching notes', text: 'Try a different keyword, or clear the search to see everything.' },
}

export default function EmptyState({ kind, query, onCreate, onClearSearch }) {
  const preset = PRESETS[kind] ?? PRESETS.all
  const Icon = preset.icon
  const canCreate = kind === 'all' || kind === 'category' || kind === 'favorites'

  return (
    <div className="empty-state">
      <div className="empty-state__art" aria-hidden="true">
        <span className="empty-state__blob empty-state__blob--a" />
        <span className="empty-state__blob empty-state__blob--b" />
        <span className="empty-state__paper empty-state__paper--back" />
        <span className="empty-state__paper">
          <Icon size={30} strokeWidth={1.8} />
        </span>
      </div>
      <h2 className="empty-state__title">{preset.title}</h2>
      <p className="empty-state__text">
        {kind === 'search' ? (
          <>
            Nothing matches “<strong>{query}</strong>”. {preset.text}
          </>
        ) : (
          preset.text
        )}
      </p>
      {kind === 'search' && (
        <button type="button" className="btn btn--ghost" onClick={onClearSearch}>
          Clear search
        </button>
      )}
      {canCreate && (
        <button type="button" className="btn btn--primary" onClick={onCreate}>
          <Plus size={17} strokeWidth={2.4} />
          Create a note
        </button>
      )}
    </div>
  )
}
