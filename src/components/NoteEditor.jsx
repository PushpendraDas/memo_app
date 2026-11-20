import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Archive,
  ArchiveRestore,
  Calendar,
  Check,
  Clock,
  LoaderCircle,
  Pin,
  RotateCcw,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { useDialog } from '../hooks/useDialog'
import { MAX_TITLE_LENGTH, NOTE_COLORS } from '../utils/constants'
import { formatFullDate, formatRelativeTime } from '../utils/dateUtils'

const AUTOSAVE_DELAY = 500

const toDraft = (source) => ({
  title: source.title ?? '',
  content: source.content ?? '',
  categoryId: source.categoryId ?? null,
  color: source.color ?? 'default',
  favorite: Boolean(source.favorite),
  pinned: Boolean(source.pinned),
})

const serialize = (draft) => JSON.stringify(draft)
const isBlank = (draft) => !draft.title.trim() && !draft.content.trim()

/**
 * Modal editor. Changes are auto-saved after a short pause and flushed on close.
 * A brand-new note is only persisted once it has a title or some content.
 */
export default function NoteEditor({ note, defaults, categories, now, onCreate, onUpdate, onClose, onArchive, onTrash, onRestore }) {
  const [draft, setDraft] = useState(() => toDraft(note ?? defaults ?? {}))
  // For an existing note the initial draft is already saved; for a new note nothing is saved yet.
  const [savedSnapshot, setSavedSnapshot] = useState(() => (note ? serialize(toDraft(note)) : null))
  const savedAny = useRef(false)
  const createdHere = useRef(false)
  const titleRef = useRef(null)
  const contentRef = useRef(null)

  const noteId = note?.id ?? null
  const readOnly = Boolean(note?.trashed)
  const snapshot = serialize(draft)
  const isNewAndBlank = !noteId && isBlank(draft)
  const dirty = !readOnly && !isNewAndBlank && snapshot !== savedSnapshot

  const flush = useCallback(() => {
    if (!dirty) return
    if (noteId) onUpdate(noteId, draft)
    else {
      onCreate(draft)
      createdHere.current = true
    }
    savedAny.current = true
    setSavedSnapshot(snapshot)
  }, [dirty, noteId, draft, snapshot, onCreate, onUpdate])

  useEffect(() => {
    if (!dirty) return
    const timer = setTimeout(flush, AUTOSAVE_DELAY)
    return () => clearTimeout(timer)
  }, [dirty, flush])

  const handleClose = useCallback(() => {
    flush()
    onClose({ saved: savedAny.current || dirty, created: createdHere.current || (dirty && !noteId) })
  }, [flush, onClose, dirty, noteId])

  const dialogRef = useDialog(handleClose)

  useEffect(() => {
    if (note) {
      const el = contentRef.current
      el?.focus()
      el?.setSelectionRange(el.value.length, el.value.length)
    } else {
      titleRef.current?.focus()
    }
    // Only on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const update = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }))

  const runAndClose = (action) => {
    flush()
    action()
    onClose({ saved: false })
  }

  const words = draft.content.trim() ? draft.content.trim().split(/\s+/).length : 0
  let status
  if (readOnly) status = { icon: Trash2, text: 'In Trash · read only' }
  else if (isNewAndBlank) status = { icon: Clock, text: 'Start typing — saves automatically' }
  else if (dirty) status = { icon: LoaderCircle, text: 'Saving…', spin: true }
  else status = { icon: Check, text: 'All changes saved' }
  const StatusIcon = status.icon

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && handleClose()}>
      <div
        ref={dialogRef}
        className={`editor note-color--${draft.color}`}
        role="dialog"
        aria-modal="true"
        aria-label={note ? 'Edit note' : 'New note'}
      >
        <div className="editor__topbar">
          <span className={`editor__status ${dirty ? 'is-saving' : ''}`} aria-live="polite">
            <StatusIcon size={14} className={status.spin ? 'spin' : ''} aria-hidden="true" />
            {status.text}
          </span>
          <div className="editor__top-actions">
            {!readOnly && (
              <>
                <button
                  type="button"
                  className={`icon-btn ${draft.pinned ? 'is-active' : ''}`}
                  onClick={() => update('pinned', !draft.pinned)}
                  aria-pressed={draft.pinned}
                  aria-label={draft.pinned ? 'Unpin note' : 'Pin note'}
                  title={draft.pinned ? 'Unpin' : 'Pin to top'}
                  disabled={note?.archived}
                >
                  <Pin size={17} fill={draft.pinned ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  className={`icon-btn icon-btn--star ${draft.favorite ? 'is-active' : ''}`}
                  onClick={() => update('favorite', !draft.favorite)}
                  aria-pressed={draft.favorite}
                  aria-label={draft.favorite ? 'Remove from favorites' : 'Add to favorites'}
                  title={draft.favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star size={17} fill={draft.favorite ? 'currentColor' : 'none'} />
                </button>
              </>
            )}
            <button type="button" className="icon-btn" onClick={handleClose} aria-label="Close editor" title="Close (Esc)">
              <X size={19} />
            </button>
          </div>
        </div>

        {readOnly && (
          <div className="editor__banner">
            <span>This note is in Trash. Restore it to make changes.</span>
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => runAndClose(() => onRestore(noteId))}>
              <RotateCcw size={14} />
              Restore
            </button>
          </div>
        )}

        <div className="editor__body">
          <label htmlFor="note-title" className="visually-hidden">
            Title
          </label>
          <input
            ref={titleRef}
            id="note-title"
            className="editor__title"
            placeholder="Untitled note"
            value={draft.title}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(e) => update('title', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                contentRef.current?.focus()
              }
            }}
            readOnly={readOnly}
          />

          <div className="editor__meta-row">
            <div className="field">
              <label htmlFor="note-category" className="field__label">
                Category
              </label>
              <select
                id="note-category"
                className="field__select"
                value={draft.categoryId ?? ''}
                onChange={(e) => update('categoryId', e.target.value || null)}
                disabled={readOnly}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="field color-picker" disabled={readOnly}>
              <legend className="field__label">Color</legend>
              <div className="color-picker__swatches">
                {NOTE_COLORS.map((c) => (
                  <label key={c.id} className={`swatch swatch--${c.id}`} title={c.label}>
                    <input
                      type="radio"
                      name="note-color"
                      value={c.id}
                      checked={draft.color === c.id}
                      onChange={() => update('color', c.id)}
                      className="visually-hidden"
                    />
                    <span className="visually-hidden">{c.label}</span>
                    {draft.color === c.id && <Check size={13} strokeWidth={3} aria-hidden="true" />}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <label htmlFor="note-content" className="visually-hidden">
            Content
          </label>
          <textarea
            ref={contentRef}
            id="note-content"
            className="editor__content"
            placeholder="Write something wonderful…"
            value={draft.content}
            onChange={(e) => update('content', e.target.value)}
            readOnly={readOnly}
          />
        </div>

        <div className="editor__footer">
          <div className="editor__stats">
            <span>{draft.content.length.toLocaleString()} characters</span>
            <span aria-hidden="true">·</span>
            <span>
              {words.toLocaleString()} {words === 1 ? 'word' : 'words'}
            </span>
            {note && (
              <>
                <span className="editor__date" title={formatFullDate(note.createdAt)}>
                  <Calendar size={13} aria-hidden="true" /> Created {formatFullDate(note.createdAt)}
                </span>
                <span className="editor__date" title={formatFullDate(note.updatedAt)}>
                  <Clock size={13} aria-hidden="true" /> Updated {formatRelativeTime(note.updatedAt, now).toLowerCase()}
                </span>
              </>
            )}
          </div>
          {note && !readOnly && (
            <div className="editor__footer-actions">
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                onClick={() => runAndClose(() => onArchive(noteId, !note.archived))}
              >
                {note.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                {note.archived ? 'Unarchive' : 'Archive'}
              </button>
              <button type="button" className="btn btn--sm btn--danger-ghost" onClick={() => runAndClose(() => onTrash(noteId))}>
                <Trash2 size={15} />
                Move to Trash
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
