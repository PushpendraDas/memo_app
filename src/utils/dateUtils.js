const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

const fullFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const shortFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function plural(value, unit) {
  return `${value} ${unit}${value === 1 ? '' : 's'} ago`
}

/** Human friendly relative time, e.g. "5 minutes ago". */
export function formatRelativeTime(timestamp, now = Date.now()) {
  const diff = Math.max(0, now - timestamp)
  if (diff < 45 * 1000) return 'Just now'
  if (diff < HOUR) return plural(Math.max(1, Math.round(diff / MINUTE)), 'minute')
  if (diff < DAY) return plural(Math.round(diff / HOUR), 'hour')
  if (diff < 2 * DAY) return 'Yesterday'
  if (diff < WEEK) return plural(Math.round(diff / DAY), 'day')
  if (diff < 5 * WEEK) return plural(Math.round(diff / WEEK), 'week')
  return shortFormatter.format(timestamp)
}

/** Absolute date + time, e.g. "Nov 19, 2026, 7:42 PM". */
export function formatFullDate(timestamp) {
  return fullFormatter.format(timestamp)
}
