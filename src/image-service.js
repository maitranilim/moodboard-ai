import { PROVIDERS, FALLBACK_PROVIDER } from './providers.js'
import { relatedMoods } from './mood-resolver.js'

/**
 * Turns a resolved mood into a board's worth of images.
 *
 * The strategy is API-first and widens only as far as it has to:
 *
 *   1. verbatim  — the visitor's own words, sent to the APIs untouched
 *   2. mood      — the curated search terms for the mood they resolved to
 *   3. related   — terms borrowed from the nearest neighbouring moods
 *   4. generic   — a broad aesthetic query, still a real search
 *   5. fallback  — Lorem Picsum, which needs no network round-trip and exists
 *                  only so the board is never empty
 *
 * Each step runs its providers in parallel and the walk stops as soon as the
 * board is full, so an exact hit on step 1 never pays for steps 2-5. The
 * deepest tier reached is reported back, which is how the UI can honestly say
 * "closest matches" instead of pretending it found what was asked for.
 */

/** @typedef {import('./providers.js').Photo} Photo */
/** @typedef {import('./moods.js').Mood} Mood */

const [openverse, artic, wikimedia, met] = PROVIDERS

/** Broad queries used when a mood's own vocabulary runs dry. */
const GENERIC_QUERIES = ['abstract texture', 'minimal still life', 'atmospheric landscape']

/** How many images a full board wants, and the least it will render early. */
export const TARGET_COUNT = 15
const PARTIAL_THRESHOLD = 6

/** Bounded in-memory cache, keyed by query + page. */
const cache = new Map()
const CACHE_LIMIT = 60

function cacheGet(key) {
  if (!cache.has(key)) return null
  const value = cache.get(key)
  cache.delete(key) // re-insert to keep LRU ordering
  cache.set(key, value)
  return value
}

function cacheSet(key, value) {
  cache.set(key, value)
  if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value)
}

export function clearImageCache() {
  cache.clear()
}

/**
 * Build the ordered search plan for a resolution.
 * @param {import('./mood-resolver.js').Resolution} resolution
 */
export function buildSearchPlan(resolution) {
  const { mood, query } = resolution
  const steps = []
  const seen = new Set()

  const add = (tier, text, providers) => {
    const trimmed = String(text ?? '').trim()
    if (!trimmed || seen.has(trimmed)) return
    seen.add(trimmed)
    steps.push({ tier, query: trimmed, providers })
  }

  // 1. Exactly what the visitor typed, before any interpretation.
  add('verbatim', query, [openverse, artic])

  // 2. The mood itself, then its curated terms.
  add('mood', mood.id, [openverse, wikimedia])
  mood.terms.forEach((term, index) => {
    const providers =
      index === 0 ? [openverse, artic] : index === 1 ? [openverse, wikimedia] : [openverse, met]
    add('mood', term, providers)
  })

  // 3. Nearest neighbours — the "closest available" rung.
  for (const neighbour of relatedMoods(mood, 4)) {
    add('related', neighbour.terms[0], [openverse, artic])
    add('related', neighbour.id, [openverse, wikimedia])
  }

  // 4. Still a real API search, just a broad one.
  for (const generic of GENERIC_QUERIES) add('generic', generic, [openverse, artic])

  return steps
}

/**
 * Titles that carry no identity. Matching on these would collapse every
 * untitled artwork in a museum collection into a single tile.
 */
const GENERIC_TITLES = new Set([
  'untitled',
  'unknown',
  'no title',
  'photo',
  'photograph',
  'image',
  'random photograph',
])

/** Keys used to spot the same image arriving from two providers. */
function dedupeKeys(photo) {
  const src = photo.src.split('?')[0].toLowerCase()
  const title = photo.title
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b\d{1,4}\b/g, '') // "Sunset 01" and "Sunset 02" are near-duplicates
    .trim()
    .slice(0, 48)

  // Only match on the title when it actually identifies the image.
  const titleIsUsable = title.length > 8 && !GENERIC_TITLES.has(title) && !photo.approximate

  return [photo.id, src, titleIsUsable ? `t:${title}` : null].filter(Boolean)
}

/** Round-robin by provider so one source cannot dominate the top of the grid. */
function interleave(photos) {
  const buckets = new Map()
  for (const photo of photos) {
    if (!buckets.has(photo.provider)) buckets.set(photo.provider, [])
    buckets.get(photo.provider).push(photo)
  }

  const lists = [...buckets.values()]
  const out = []
  for (let index = 0; out.length < photos.length; index += 1) {
    let placed = false
    for (const list of lists) {
      if (index < list.length) {
        out.push(list[index])
        placed = true
      }
    }
    if (!placed) break
  }
  return out
}

/**
 * @param {import('./mood-resolver.js').Resolution} resolution
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 * @param {number} [options.count]
 * @param {number} [options.page]
 * @param {(photos: Photo[], meta: object) => void} [options.onPartial]
 */
export async function collectImages(resolution, options = {}) {
  const { signal, count = TARGET_COUNT, page = 1, onPartial } = options

  const cacheKey = `${resolution.mood.id}|${resolution.query}|${page}|${count}`
  const cached = cacheGet(cacheKey)
  if (cached) return { ...cached, cached: true }

  const plan = buildSearchPlan(resolution)
  const photos = []
  const taken = new Set()
  const sources = new Set()
  const failures = []
  let firstTier = null
  let deepestTier = 'verbatim'
  let emittedPartial = false

  const absorb = (batch) => {
    for (const photo of batch) {
      if (photos.length >= count) return
      const keys = dedupeKeys(photo)
      if (keys.some((key) => taken.has(key))) continue
      keys.forEach((key) => taken.add(key))
      photos.push(photo)
      sources.add(photo.provider)
    }
  }

  for (const step of plan) {
    if (photos.length >= count) break
    if (signal?.aborted) break

    const remaining = count - photos.length
    const perProvider = Math.max(6, Math.ceil(remaining / step.providers.length) + 4)

    const settled = await Promise.allSettled(
      step.providers.map((provider) => provider.search(step.query, { signal, limit: perProvider, page })),
    )

    let gained = 0
    settled.forEach((result, index) => {
      if (result.status !== 'fulfilled') {
        failures.push({ provider: step.providers[index].id, query: step.query })
        return
      }
      const before = photos.length
      absorb(result.value)
      gained += photos.length - before
    })

    if (gained > 0) {
      deepestTier = step.tier
      // The tier that produced the first results is the honest headline: later
      // steps only top the board up and should not downgrade the message.
      firstTier ??= step.tier
    }

    // Paint the first usable batch straight away rather than waiting for the
    // board to fill — the remaining steps top it up behind the visitor's back.
    if (!emittedPartial && onPartial && photos.length >= PARTIAL_THRESHOLD && photos.length < count) {
      emittedPartial = true
      onPartial(interleave([...photos]), { tier: firstTier, partial: true, sources: [...sources] })
    }
  }

  // Every searchable provider came up empty (offline, blocked, or all down).
  let usedFallback = false
  if (photos.length < PARTIAL_THRESHOLD && !signal?.aborted) {
    usedFallback = true
    firstTier = 'fallback'
    deepestTier = 'fallback'
    absorb(await FALLBACK_PROVIDER.search(resolution.mood.id, { limit: count - photos.length, page }))
  }

  const result = {
    photos: interleave(photos).slice(0, count),
    tier: firstTier ?? 'fallback',
    widenedTo: deepestTier,
    sources: [...sources],
    failures,
    usedFallback,
    cached: false,
  }

  if (result.photos.length && !signal?.aborted) cacheSet(cacheKey, result)
  return result
}

/** Human-readable note about how far the search had to widen. */
export function describeTier(tier, resolution) {
  switch (tier) {
    case 'verbatim':
      return `Matched “${resolution.query}” directly`
    case 'mood':
      return `Matched the ${resolution.mood.id} palette`
    case 'related':
      return `No direct matches — showing the closest moods`
    case 'generic':
      return `Few matches for “${resolution.query}” — widened the search`
    case 'fallback':
      return `Image services unreachable — showing placeholders`
    default:
      return ''
  }
}
