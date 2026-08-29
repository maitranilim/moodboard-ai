/**
 * localStorage helpers.
 *
 * Every access is guarded: Safari in private mode and browsers with site data
 * blocked throw on read as well as write, and a preference is never worth
 * breaking the page over.
 */

const THEME_KEY = 'moodboard:scheme'
const RECENT_KEY = 'moodboard:recent'
const RECENT_LIMIT = 6

function read(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* preference is best-effort */
  }
}

/** @returns {'light'|'dark'|'system'} */
export function loadScheme() {
  const stored = read(THEME_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

/** @param {'light'|'dark'|'system'} scheme */
export function saveScheme(scheme) {
  write(THEME_KEY, scheme)
}

/** @returns {string[]} */
export function loadRecent() {
  try {
    const parsed = JSON.parse(read(RECENT_KEY) ?? '[]')
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === 'string').slice(0, RECENT_LIMIT)
      : []
  } catch {
    return []
  }
}

/** Most recent first, de-duplicated, capped. */
export function pushRecent(query) {
  const trimmed = String(query ?? '').trim()
  if (!trimmed) return loadRecent()

  const next = [trimmed, ...loadRecent().filter((item) => item !== trimmed)].slice(0, RECENT_LIMIT)
  write(RECENT_KEY, JSON.stringify(next))
  return next
}
