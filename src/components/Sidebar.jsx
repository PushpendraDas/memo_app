import { Archive, FileText, Moon, NotebookPen, Star, Sun, Trash2, X } from 'lucide-react'
import CategoryManager from './CategoryManager'
import { APP_VERSION, VIEWS } from '../utils/constants'

const NAV_ITEMS = [
  { id: VIEWS.all, label: 'All Notes', icon: FileText },
  { id: VIEWS.favorites, label: 'Favorites', icon: Star },
  { id: VIEWS.archived, label: 'Archived', icon: Archive },
  { id: VIEWS.trash, label: 'Trash', icon: Trash2 },
]

export default function Sidebar({
  inert,
  open,
  onClose,
  view,
  onSelectView,
  counts,
  categories,
  categoryCounts,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  theme,
  onToggleTheme,
}) {
  const isDark = theme === 'dark'

  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'is-visible' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Main navigation" inert={inert}>
        <div className="sidebar__brand">
          <div className="brand-logo" aria-hidden="true">
            <NotebookPen size={18} strokeWidth={2.2} />
          </div>
          <span className="brand-name">MemoSpace</span>
          <button type="button" className="icon-btn sidebar__close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar__scroll">
          <ul className="nav-list">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  className={`nav-item ${view === id ? 'is-active' : ''}`}
                  onClick={() => onSelectView(id)}
                  aria-current={view === id ? 'page' : undefined}
                >
                  <Icon size={17} className="nav-item__icon" />
                  <span className="nav-item__label">{label}</span>
                  {counts[id] > 0 && <span className="nav-item__count">{counts[id]}</span>}
                </button>
              </li>
            ))}
          </ul>

          <CategoryManager
            categories={categories}
            counts={categoryCounts}
            activeView={view}
            onSelect={onSelectView}
            onAdd={onAddCategory}
            onRename={onRenameCategory}
            onDelete={onDeleteCategory}
          />
        </nav>

        <div className="sidebar__footer">
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            role="switch"
            aria-checked={isDark}
          >
            <span className="theme-toggle__label">
              {isDark ? <Moon size={16} /> : <Sun size={16} />}
              Dark mode
            </span>
            <span className={`switch ${isDark ? 'is-on' : ''}`} aria-hidden="true">
              <span className="switch__thumb" />
            </span>
          </button>
          <p className="app-version">MemoSpace v{APP_VERSION} · Stored locally</p>
        </div>
      </aside>
    </>
  )
}
