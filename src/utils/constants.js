export const APP_VERSION = '1.0.0'

export const STORAGE_KEYS = {
  notes: 'memospace:notes',
  categories: 'memospace:categories',
  theme: 'memospace:theme',
  viewMode: 'memospace:view-mode',
  sort: 'memospace:sort',
}

export const NOTE_COLORS = [
  { id: 'default', label: 'Default' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'green', label: 'Green' },
  { id: 'blue', label: 'Blue' },
  { id: 'purple', label: 'Purple' },
  { id: 'pink', label: 'Pink' },
  { id: 'orange', label: 'Orange' },
]

export const CATEGORY_COLORS = ['indigo', 'emerald', 'amber', 'rose', 'sky', 'violet', 'teal', 'orange']

export const SORT_OPTIONS = [
  { id: 'updated', label: 'Recently updated' },
  { id: 'created', label: 'Recently created' },
  { id: 'alpha', label: 'Alphabetical' },
]

export const VIEWS = {
  all: 'all',
  favorites: 'favorites',
  archived: 'archived',
  trash: 'trash',
}

export const MAX_TITLE_LENGTH = 120
export const MAX_CATEGORY_LENGTH = 40
