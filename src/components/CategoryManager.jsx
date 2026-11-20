import { useId, useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { MAX_CATEGORY_LENGTH } from '../utils/constants'

function CategoryForm({ initialValue = '', existingNames, onSubmit, onCancel, label }) {
  const [name, setName] = useState(initialValue)
  const inputId = useId()
  const errorId = useId()
  const trimmed = name.trim()
  const duplicate =
    trimmed && trimmed.toLowerCase() !== initialValue.trim().toLowerCase() && existingNames.has(trimmed.toLowerCase())

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!trimmed || duplicate) return
    onSubmit(trimmed)
  }

  return (
    <form
      className="category-form"
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          onCancel()
        }
      }}
    >
      <label className="visually-hidden" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className={`category-form__input ${duplicate ? 'has-error' : ''}`}
        value={name}
        maxLength={MAX_CATEGORY_LENGTH}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name"
        autoFocus
        aria-invalid={duplicate || undefined}
        aria-describedby={duplicate ? errorId : undefined}
      />
      <button type="submit" className="icon-btn icon-btn--sm" aria-label="Save category" disabled={!trimmed || duplicate}>
        <Check size={15} />
      </button>
      <button type="button" className="icon-btn icon-btn--sm" aria-label="Cancel" onClick={onCancel}>
        <X size={15} />
      </button>
      {duplicate && (
        <p className="category-form__error" id={errorId} role="alert">
          A category with this name already exists.
        </p>
      )}
    </form>
  )
}

export default function CategoryManager({ categories, counts, activeView, onSelect, onAdd, onRename, onDelete }) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const existingNames = new Set(categories.map((c) => c.name.toLowerCase()))

  return (
    <section className="categories" aria-labelledby="categories-heading">
      <div className="categories__header">
        <h2 id="categories-heading" className="section-label">
          Categories
        </h2>
        <button
          type="button"
          className="icon-btn icon-btn--sm"
          onClick={() => {
            setEditingId(null)
            setAdding(true)
          }}
          aria-label="Add category"
          title="Add category"
        >
          <Plus size={15} />
        </button>
      </div>

      <ul className="nav-list">
        {categories.map((category) => {
          const viewId = `category:${category.id}`
          if (editingId === category.id) {
            return (
              <li key={category.id}>
                <CategoryForm
                  label={`Rename ${category.name}`}
                  initialValue={category.name}
                  existingNames={existingNames}
                  onSubmit={(name) => {
                    if (name !== category.name) onRename(category.id, name)
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            )
          }
          return (
            <li key={category.id} className="category-row">
              <button
                type="button"
                className={`nav-item ${activeView === viewId ? 'is-active' : ''}`}
                onClick={() => onSelect(viewId)}
                aria-current={activeView === viewId ? 'page' : undefined}
              >
                <span className={`category-dot category-dot--${category.color}`} aria-hidden="true" />
                <span className="nav-item__label">{category.name}</span>
                {counts[category.id] > 0 && <span className="nav-item__count">{counts[category.id]}</span>}
              </button>
              <div className="category-row__actions">
                <button
                  type="button"
                  className="icon-btn icon-btn--xs"
                  onClick={() => {
                    setAdding(false)
                    setEditingId(category.id)
                  }}
                  aria-label={`Rename ${category.name}`}
                  title="Rename"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  className="icon-btn icon-btn--xs icon-btn--danger"
                  onClick={() => onDelete(category)}
                  aria-label={`Delete ${category.name}`}
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {categories.length === 0 && !adding && <p className="categories__empty">No categories yet.</p>}

      {adding ? (
        <CategoryForm
          label="New category name"
          existingNames={existingNames}
          onSubmit={(name) => {
            onAdd(name)
            setAdding(false)
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button type="button" className="add-category-btn" onClick={() => setAdding(true)}>
          <Plus size={15} />
          Add Category
        </button>
      )}
    </section>
  )
}
