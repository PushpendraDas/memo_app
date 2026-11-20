import { ArrowUpDown, LayoutGrid, List, Menu, Plus, Trash2 } from 'lucide-react'
import SearchBar from './SearchBar'
import { SORT_OPTIONS } from '../utils/constants'

export default function Header({
  title,
  subtitle,
  count,
  search,
  onSearchChange,
  searchRef,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  onCreateNote,
  onOpenMenu,
  isTrash,
  onEmptyTrash,
  trashCount,
}) {
  return (
    <header className="header">
      <div className="header__top">
        <button type="button" className="icon-btn header__menu" onClick={onOpenMenu} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div className="header__titles">
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">
            <span className="count-pill">
              {count} {count === 1 ? 'note' : 'notes'}
            </span>
            {subtitle && <span>{subtitle}</span>}
          </p>
        </div>
        {isTrash ? (
          <button type="button" className="btn btn--danger-ghost" onClick={onEmptyTrash} disabled={trashCount === 0}>
            <Trash2 size={16} />
            <span className="btn__label">Empty Trash</span>
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={onCreateNote} title="New note (Ctrl/Cmd + N)">
            <Plus size={17} strokeWidth={2.4} />
            <span className="btn__label">New Note</span>
          </button>
        )}
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={onSearchChange} inputRef={searchRef} />
        <div className="toolbar__controls">
          <div className="select">
            <ArrowUpDown size={15} className="select__icon" aria-hidden="true" />
            <label htmlFor="sort-select" className="visually-hidden">
              Sort notes
            </label>
            <select id="sort-select" value={sort} onChange={(e) => onSortChange(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="segmented" role="group" aria-label="Layout">
            <button
              type="button"
              className={`segmented__btn ${viewMode === 'grid' ? 'is-active' : ''}`}
              onClick={() => onViewModeChange('grid')}
              aria-pressed={viewMode === 'grid'}
              aria-label="Grid view"
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className={`segmented__btn ${viewMode === 'list' ? 'is-active' : ''}`}
              onClick={() => onViewModeChange('list')}
              aria-pressed={viewMode === 'list'}
              aria-label="List view"
              title="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
