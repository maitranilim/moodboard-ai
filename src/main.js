import { MOOD_BY_ID, MOOD_IDS, FEATURED_MOODS } from './moods.js'
import { ALIASES } from './aliases.js'
import { resolveMood, nearestMoods, normalise, toLabel } from './mood-resolver.js'
import { applyPalette, buildPalette, swatchColors } from './palette.js'
import { collectImages, describeTier, TARGET_COUNT } from './image-service.js'
import { renderPhotos, renderSkeletons, clearBusy } from './board.js'
import { createLightbox } from './lightbox.js'
import { loadScheme, saveScheme, loadRecent, pushRecent } from './storage.js'

const $ = (id) => document.getElementById(id)

/** Read the mood from the URL fragment; a malformed escape must not break boot. */
function queryFromHash() {
  try {
    return decodeURIComponent(location.hash.slice(1)).trim()
  } catch {
    return ''
  }
}

const el = {
  form: $('moodForm'),
  input: $('moodInput'),
  clear: $('clearBtn'),
  generate: $('generateBtn'),
  suggestions: $('moodSuggestions'),
  chips: $('chipRow'),
  grid: $('moodGrid'),
  empty: $('boardEmpty'),
  title: $('moodTitle'),
  note: $('moodNote'),
  palette: $('paletteStrip'),
  shuffle: $('shuffleBtn'),
  sources: $('sourceNote'),
  live: $('liveStatus'),
  toast: $('toast'),
  masthead: document.querySelector('.masthead'),
  themeToggle: $('themeToggle'),
}

const lightbox = createLightbox({
  dialog: $('lightbox'),
  image: $('lightboxImage'),
  title: $('lightboxTitle'),
  meta: $('lightboxMeta'),
  source: $('lightboxSource'),
  license: $('lightboxLicense'),
  prev: $('lightboxPrev'),
  next: $('lightboxNext'),
  close: $('lightboxClose'),
})

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

const state = {
  /** @type {'light'|'dark'|'system'} */
  scheme: loadScheme(),
  resolution: null,
  photos: [],
  page: 1,
  /** @type {AbortController|null} */
  controller: null,
  activeSuggestion: -1,
  suggestionItems: [],
}

/* ── Theme ─────────────────────────────────────────────────────────────── */

const effectiveScheme = () =>
  state.scheme === 'system' ? (prefersDark.matches ? 'dark' : 'light') : state.scheme

function applyScheme() {
  const scheme = effectiveScheme()
  document.documentElement.dataset.scheme = scheme
  document.documentElement.dataset.schemePref = state.scheme

  const label = el.themeToggle.querySelector('.sr-only')
  if (label) label.textContent = `Colour scheme: ${state.scheme}`
  el.themeToggle.title = `Colour scheme: ${state.scheme} — click to change`

  if (state.resolution) paintPalette(state.resolution.mood)
}

function cycleScheme() {
  const order = ['system', 'light', 'dark']
  state.scheme = order[(order.indexOf(state.scheme) + 1) % order.length]
  saveScheme(state.scheme)
  applyScheme()
  toast(`Colour scheme: ${state.scheme}`)
}

/* ── Palette ───────────────────────────────────────────────────────────── */

function paintPalette(mood) {
  applyPalette(mood, effectiveScheme())
  renderSwatches(mood)
}

function renderSwatches(mood) {
  el.palette.replaceChildren(
    ...swatchColors(mood, effectiveScheme()).map(({ css, hex }) => {
      const swatch = document.createElement('button')
      swatch.type = 'button'
      swatch.className = 'swatch'
      swatch.style.background = css
      swatch.dataset.hex = hex
      swatch.title = `Copy ${hex}`
      swatch.setAttribute('aria-label', `Copy colour ${hex}`)
      return swatch
    }),
  )
}

async function copySwatch(hex) {
  try {
    await navigator.clipboard.writeText(hex)
    toast(`Copied ${hex}`)
  } catch {
    // Clipboard needs a secure context and permission; neither is guaranteed.
    toast(`Colour is ${hex}`)
  }
}

/* ── Toast ─────────────────────────────────────────────────────────────── */

let toastTimer
function toast(message) {
  el.toast.textContent = message
  el.toast.hidden = false
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    el.toast.hidden = true
  }, 2200)
}

/* ── Chips ─────────────────────────────────────────────────────────────── */

function moodDot(id) {
  const mood = MOOD_BY_ID.get(id)
  if (!mood) return 'var(--accent)'
  return buildPalette(mood, effectiveScheme())['--accent']
}

function chip(id, { current = false } = {}) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'chip'
  button.dataset.mood = id
  if (current) button.setAttribute('aria-current', 'true')

  const dot = document.createElement('span')
  dot.className = 'chip__dot'
  dot.style.background = moodDot(id)

  const label = document.createElement('span')
  label.textContent = id

  button.append(dot, label)
  return button
}

function renderChips() {
  const recent = loadRecent()
  const current = state.resolution?.mood?.id

  // Recents first, then featured moods that are not already shown.
  const featured = FEATURED_MOODS.filter((id) => !recent.includes(id))
  const shown = [...recent, ...featured].slice(0, 12)

  const nodes = shown.map((id) => chip(id, { current: id === current }))

  // After a shaky match, offer the alternatives the resolver considered.
  const suggestions = state.resolution?.suggestions ?? []
  if (
    suggestions.length &&
    (state.resolution.matchType === 'fuzzy' || state.resolution.matchType === 'novel')
  ) {
    const label = document.createElement('span')
    label.className = 'chips__label'
    label.textContent = 'Try:'
    nodes.push(label, ...suggestions.slice(0, 3).map((id) => chip(id)))
  }

  el.chips.replaceChildren(...nodes)
}

/* ── Typeahead ─────────────────────────────────────────────────────────── */

/** Rank lexicon entries for the current input: prefixes first, then fuzzy. */
function suggestFor(raw) {
  const query = normalise(raw)
  if (!query) return []

  const seen = new Set()
  const out = []

  const push = (id, note) => {
    if (!id || seen.has(id) || !MOOD_BY_ID.has(id)) return
    seen.add(id)
    out.push({ id, note })
  }

  for (const id of MOOD_IDS) {
    if (id.startsWith(query)) push(id, 'mood')
    if (out.length >= 8) break
  }

  if (out.length < 8) {
    for (const [alias, id] of Object.entries(ALIASES)) {
      if (alias.startsWith(query)) push(id, alias)
      if (out.length >= 8) break
    }
  }

  if (out.length < 5) {
    for (const { id, score } of nearestMoods(query, { limit: 6 })) {
      if (score > 0.45) push(id, 'closest')
    }
  }

  return out.slice(0, 8)
}

function closeSuggestions() {
  el.suggestions.hidden = true
  el.suggestions.replaceChildren()
  el.input.setAttribute('aria-expanded', 'false')
  el.input.removeAttribute('aria-activedescendant')
  state.activeSuggestion = -1
  state.suggestionItems = []
}

function highlightSuggestion(next) {
  const items = state.suggestionItems
  if (!items.length) return

  state.activeSuggestion = (next + items.length) % items.length
  items.forEach((item, index) => {
    const active = index === state.activeSuggestion
    item.setAttribute('aria-selected', String(active))
    if (active) {
      el.input.setAttribute('aria-activedescendant', item.id)
      item.scrollIntoView({ block: 'nearest' })
    }
  })
}

function openSuggestions(raw) {
  const matches = suggestFor(raw)
  if (!matches.length) return closeSuggestions()

  const items = matches.map(({ id, note }, index) => {
    const item = document.createElement('li')
    item.className = 'suggestion'
    item.id = `suggestion-${index}`
    item.setAttribute('role', 'option')
    item.dataset.mood = id
    item.setAttribute('aria-selected', 'false')

    const dot = document.createElement('span')
    dot.className = 'suggestion__dot'
    dot.style.background = moodDot(id)

    const name = document.createElement('span')
    name.className = 'suggestion__name'
    name.textContent = id

    const meta = document.createElement('span')
    meta.className = 'suggestion__meta'
    meta.textContent = note === 'mood' ? '' : note

    item.append(dot, name, meta)
    return item
  })

  state.suggestionItems = items
  state.activeSuggestion = -1
  el.suggestions.replaceChildren(...items)
  el.suggestions.hidden = false
  el.input.setAttribute('aria-expanded', 'true')
  el.input.removeAttribute('aria-activedescendant')
}

/* ── Rendering ─────────────────────────────────────────────────────────── */

/** Wrap a DOM swap in a view transition where the browser supports one. */
function withTransition(update) {
  if (prefersReducedMotion.matches || !document.startViewTransition) return update()
  document.startViewTransition(update)
}

function describeMatch(resolution) {
  const { matchType, query, mood } = resolution
  switch (matchType) {
    case 'exact':
    case 'phrase':
      return ''
    case 'alias':
    case 'token':
    case 'stem':
      return `“${query}” → ${mood.id}`
    case 'fuzzy':
      return `Closest match to “${query}” is ${mood.id}`
    case 'novel':
      return `“${query}” is not in the library — searching your words directly`
    default:
      return ''
  }
}

/** Tiers worth calling out: they mean the board is not a literal match. */
const WIDENED_TIERS = new Set(['related', 'generic', 'fallback'])

function setNote(resolution, result) {
  const matchNote = describeMatch(resolution)

  // Only add the tier note when it says something the match note did not —
  // otherwise the line reads as two ways of saying the same thing.
  const tierNote =
    result && (WIDENED_TIERS.has(result.tier) || !matchNote) ? describeTier(result.tier, resolution) : ''

  el.note.textContent = [matchNote, tierNote].filter(Boolean).join(' · ')
}

function showEmpty(resolution) {
  el.empty.hidden = false
  el.empty.replaceChildren()

  const heading = document.createElement('h3')
  heading.textContent = `Nothing came back for “${resolution.query}”`

  const body = document.createElement('p')
  body.textContent = 'The image services may be unreachable. Try another mood, or check your connection.'

  el.empty.append(heading, body)
}

/* ── Search ────────────────────────────────────────────────────────────── */

/**
 * @param {string} raw text from the field, a chip, or the URL
 * @param {{ page?: number, push?: boolean }} [options]
 */
async function search(raw, { page = 1, push = true } = {}) {
  state.controller?.abort()
  const controller = new AbortController()
  state.controller = controller

  const resolution = resolveMood(raw)
  state.resolution = resolution
  state.page = page

  const heading = resolution.matchType === 'novel' ? resolution.label : resolution.mood.id
  document.title = `${toLabel(heading)} — Moodboard AI`
  el.title.textContent = heading
  el.empty.hidden = true
  el.sources.textContent = ''

  paintPalette(resolution.mood)
  renderChips()
  setNote(resolution, null)
  renderSkeletons(el.grid, TARGET_COUNT)

  el.generate.disabled = true
  el.shuffle.dataset.busy = 'true'
  el.live.textContent = `Searching for ${heading}…`

  if (push && resolution.query) {
    const hash = `#${encodeURIComponent(resolution.query)}`
    if (location.hash !== hash) history.pushState({ query: resolution.query }, '', hash)
    pushRecent(resolution.mood.id)
  }

  let painted = false
  const paint = (photos) => {
    painted = true
    state.photos = photos
    withTransition(() =>
      renderPhotos(el.grid, photos, { onSelect: (_, index) => lightbox.open(state.photos, index) }),
    )
  }

  try {
    const result = await collectImages(resolution, {
      signal: controller.signal,
      page,
      onPartial: (photos) => {
        if (!controller.signal.aborted) paint(photos)
      },
    })

    if (controller.signal.aborted) return

    if (result.photos.length) {
      paint(result.photos)
      setNote(resolution, result)

      const sources = result.sources.join(', ')
      el.sources.textContent = result.usedFallback
        ? 'No image service responded — showing placeholders so the layout stays intact.'
        : `${result.photos.length} images from ${sources}.`
      el.live.textContent = `${result.photos.length} images for ${heading}. ${describeTier(result.tier, resolution)}`
    } else {
      el.grid.replaceChildren()
      showEmpty(resolution)
      el.live.textContent = `No images found for ${heading}.`
    }

    renderChips()
  } catch {
    if (controller.signal.aborted) return
    if (!painted) {
      el.grid.replaceChildren()
      showEmpty(resolution)
    }
    el.live.textContent = 'The search failed.'
  } finally {
    if (!controller.signal.aborted) {
      clearBusy(el.grid)
      el.generate.disabled = false
      delete el.shuffle.dataset.busy
    }
  }
}

/* ── Events ────────────────────────────────────────────────────────────── */

el.form.addEventListener('submit', (event) => {
  event.preventDefault()
  closeSuggestions()
  search(el.input.value)
  el.input.blur()
})

el.input.addEventListener('input', () => {
  el.clear.hidden = !el.input.value
  openSuggestions(el.input.value)
})

el.input.addEventListener('keydown', (event) => {
  if (el.suggestions.hidden) {
    if (event.key === 'ArrowDown') openSuggestions(el.input.value)
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightSuggestion(state.activeSuggestion + 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightSuggestion(state.activeSuggestion - 1)
      break
    case 'Enter': {
      const active = state.suggestionItems[state.activeSuggestion]
      if (!active) return // let the form submit with the raw text
      event.preventDefault()
      el.input.value = active.dataset.mood
      closeSuggestions()
      search(active.dataset.mood)
      el.input.blur()
      break
    }
    case 'Escape':
      // A search input clears itself on Escape; here Escape only dismisses the
      // list, so the visitor does not lose what they typed.
      event.preventDefault()
      closeSuggestions()
      break
    case 'Tab':
      closeSuggestions()
      break
    default:
      break
  }
})

el.suggestions.addEventListener('mousedown', (event) => {
  // mousedown, not click: blur would close the list before click fires.
  const item = event.target.closest('.suggestion')
  if (!item) return
  event.preventDefault()
  el.input.value = item.dataset.mood
  closeSuggestions()
  search(item.dataset.mood)
})

el.input.addEventListener('blur', () => {
  // Let a pending mousedown on the list win the race.
  setTimeout(closeSuggestions, 120)
})

el.clear.addEventListener('click', () => {
  el.input.value = ''
  el.clear.hidden = true
  closeSuggestions()
  el.input.focus()
})

el.chips.addEventListener('click', (event) => {
  const button = event.target.closest('[data-mood]')
  if (!button) return
  el.input.value = button.dataset.mood
  el.clear.hidden = false
  search(button.dataset.mood)
})

el.palette.addEventListener('click', (event) => {
  const swatch = event.target.closest('.swatch')
  if (swatch) copySwatch(swatch.dataset.hex)
})

el.shuffle.addEventListener('click', () => {
  if (!state.resolution) return
  search(state.resolution.query || state.resolution.mood.id, { page: state.page + 1, push: false })
})

el.themeToggle.addEventListener('click', cycleScheme)

prefersDark.addEventListener('change', () => {
  if (state.scheme === 'system') applyScheme()
})

// "/" focuses the field, the way search-first products behave.
document.addEventListener('keydown', (event) => {
  if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return

  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return

  event.preventDefault()
  el.input.focus()
  el.input.select()
})

window.addEventListener('popstate', () => {
  const query = queryFromHash()
  el.input.value = query
  el.clear.hidden = !query
  search(query || 'serene', { push: false })
})

let ticking = false
window.addEventListener(
  'scroll',
  () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      el.masthead.dataset.stuck = String(window.scrollY > 8)
      ticking = false
    })
  },
  { passive: true },
)

/* ── Boot ──────────────────────────────────────────────────────────────── */

function start() {
  applyScheme()

  const fromUrl = queryFromHash()
  const opening = fromUrl || FEATURED_MOODS[Math.floor(Math.random() * FEATURED_MOODS.length)]

  if (fromUrl) {
    el.input.value = fromUrl
    el.clear.hidden = false
  }

  renderChips()
  search(opening, { push: false })
}

start()
