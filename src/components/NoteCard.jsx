import { Archive, ArchiveRestore, Pin, RotateCcw, Star, Trash2, X } from 'lucide-react'
import Highlight from './Highlight'
import { formatFullDate, formatRelativeTime } from '../utils/dateUtils'

const PREVIEW_LENGTH = 320

function snippet(content, query) {
  const q = query.trim().toLowerCase()
  if (!q || content.length <= PREVIEW_LENGTH) return content.slice(0, PREVIEW_LENGTH)
  // Make sure a match deep inside a long note is visible in the preview.
  const index = content.toLowerCase().indexOf(q)
  if (index < PREVIEW_LENGTH - q.length) return content.slice(0, PREVIEW_LENGTH)
  const start = Math.max(0, index - 80)
  return `…${content.slice(start, start + PREVIEW_LENGTH)}`
}

function ActionButton({ label, onClick, active, danger, children }) {
  return (
    <button
      type="button"
      className={`card-action ${active ? 'is-active' : ''} ${danger ? 'card-action--danger' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      title={label}
    >
      {children}
    </button>
  )
}

export default function NoteCard({
  note,
  category,
  query,
  now,
  layout,
  onOpen,
  onTogglePin,
  onToggleFavorite,
  onArchive,
  onTrash,
  onRestore,
  onDeleteForever,
}) {
  const title = note.title.trim() || 'Untitled note'
  const preview = snippet(note.content, query)
  const timeLabel = note.trashed && note.trashedAt ? `Deleted ${formatRelativeTime(note.trashedAt, now).toLowerCase()}` : formatRelativeTime(note.updatedAt, now)

  return (
    <article className={`note-card note-card--${note.color} note-card--${layout} ${note.pinned ? 'is-pinned' : ''}`}>
      <div className="note-card__head">
        <h3 className={`note-card__title ${note.title.trim() ? '' : 'is-placeholder'}`}>
          <button type="button" className="note-card__open" onClick={() => onOpen(note.id)}>
            <Highlight text={title} query={query} />
          </button>
        </h3>
        <div className="note-card__badges">
          {note.pinned && (
            <span className="badge-icon" title="Pinned">
              <Pin size={13} fill="currentColor" aria-label="Pinned" />
            </span>
          )}
          {note.favorite && (
            <span className="badge-icon badge-icon--star" title="Favorite">
              <Star size={13} fill="currentColor" aria-label="Favorite" />
            </span>
          )}
        </div>
      </div>

      {preview ? (
        <p className="note-card__content">
          <Highlight text={preview} query={query} />
        </p>
      ) : (
        <p className="note-card__content is-placeholder">No content</p>
      )}

      <div className="note-card__footer">
        <div className="note-card__meta">
          {category && (
            <span className={`category-chip category-chip--${category.color}`}>
              <span className={`category-dot category-dot--${category.color}`} aria-hidden="true" />
              {category.name}
            </span>
          )}
          <span className="note-card__stamp">
            <time
              dateTime={new Date(note.updatedAt).toISOString()}
              title={`Created ${formatFullDate(note.createdAt)}\nUpdated ${formatFullDate(note.updatedAt)}`}
            >
              {timeLabel}
            </time>
            <span aria-hidden="true">·</span>
            <span>{note.content.length.toLocaleString()} chars</span>
          </span>
        </div>

        <div className="note-card__actions">
          {note.trashed ? (
            <>
              <ActionButton label="Restore note" onClick={() => onRestore(note.id)}>
                <RotateCcw size={15} />
              </ActionButton>
              <ActionButton label="Delete forever" onClick={() => onDeleteForever(note)} danger>
                <X size={16} />
              </ActionButton>
            </>
          ) : (
            <>
              {!note.archived && (
                <ActionButton label={note.pinned ? 'Unpin note' : 'Pin note'} onClick={() => onTogglePin(note.id)} active={note.pinned}>
                  <Pin size={15} />
                </ActionButton>
              )}
              <ActionButton
                label={note.favorite ? 'Remove from favorites' : 'Add to favorites'}
                onClick={() => onToggleFavorite(note.id)}
                active={note.favorite}
              >
                <Star size={15} />
              </ActionButton>
              <ActionButton label={note.archived ? 'Unarchive note' : 'Archive note'} onClick={() => onArchive(note.id, !note.archived)}>
                {note.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
              </ActionButton>
              <ActionButton label="Move to trash" onClick={() => onTrash(note.id)} danger>
                <Trash2 size={15} />
              </ActionButton>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
