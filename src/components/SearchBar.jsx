import { Search, X } from 'lucide-react'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

export default function SearchBar({ value, onChange, inputRef }) {
  return (
    <div className="search">
      <Search size={17} className="search__icon" aria-hidden="true" />
      <label htmlFor="note-search" className="visually-hidden">
        Search notes
      </label>
      <input
        ref={inputRef}
        id="note-search"
        type="search"
        className="search__input"
        placeholder="Search notes…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onChange('')
            e.currentTarget.blur()
          }
        }}
        autoComplete="off"
      />
      {value ? (
        <button type="button" className="icon-btn icon-btn--xs search__clear" onClick={() => onChange('')} aria-label="Clear search">
          <X size={14} />
        </button>
      ) : (
        <kbd className="search__kbd" aria-hidden="true">
          {isMac ? '⌘' : 'Ctrl'} K
        </kbd>
      )}
    </div>
  )
}
