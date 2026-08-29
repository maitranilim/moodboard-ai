import { MOODS, MOOD_BY_ID, MOOD_IDS } from './moods.js'
import { ALIASES, PHRASE_ALIASES, STOP_WORDS } from './aliases.js'

/**
 * Turns whatever a visitor types into the closest mood the board can render.
 *
 * The ladder runs cheapest-first and stops at the first hit:
 *
 *   1. phrase alias   "golden hour"          → golden
 *   2. exact id       "melancholy"           → melancholy
 *   3. alias          "gloomy"               → melancholy
 *   4. token scan     "feeling gloomy today" → melancholy
 *   5. stemmed token  "dreaminess"           → dreamy
 *   6. fuzzy match    "melancoly"            → melancholy
 *   7. novel mood     "blorptastic"          → a synthesised palette, and the
 *                                              raw words still go to the APIs
 *
 * Step 7 matters: an unknown word is not an error. The image layer searches the
 * visitor's literal text first and only then widens to the nearest lexicon
 * neighbours, so a word we have never seen still produces a real board.
 */

/** @typedef {import('./moods.js').Mood} Mood */
/** @typedef {'phrase'|'exact'|'alias'|'token'|'stem'|'fuzzy'|'novel'} MatchType */

/**
 * @typedef {object} Resolution
 * @property {string}   query       normalised text the visitor typed
 * @property {string}   label       display-cased version of the query
 * @property {Mood}     mood        the mood to render (synthesised when novel)
 * @property {MatchType} matchType  how we got there
 * @property {number}   confidence  0-1, drives how loudly the UI explains itself
 * @property {boolean}  exact       true when the query itself is a lexicon entry
 * @property {string[]} suggestions nearest other moods, for "did you mean" chips
 */

/** Every string we can match against, built once. */
const ALIAS_KEYS = Object.keys(ALIASES)
const SEARCHABLE = [...MOOD_IDS, ...ALIAS_KEYS]

/** Suffixes stripped, longest first, when a token misses on its own. */
const SUFFIXES = ['iness', 'ness', 'fully', 'ful', 'ingly', 'ing', 'edly', 'ed', 'ly', 'ish', 'es', 's']

/** Strip accents, punctuation and repeated whitespace. */
export function normalise(input) {
  return String(input ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/[\s-]+/g, ' ')
    .trim()
}

/** Title-case for display, preserving the visitor's own word order. */
export function toLabel(query) {
  return query.replace(/\b[a-z]/g, (char) => char.toUpperCase())
}

/**
 * Levenshtein distance, abandoned early once every cell exceeds `max`.
 * Bounding it keeps the fuzzy pass linear enough to run against ~900 strings
 * on every keystroke without a worker.
 */
export function editDistance(a, b, max = Infinity) {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > max) return max + 1
  if (!a.length) return b.length
  if (!b.length) return a.length

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  let current = new Array(b.length + 1)

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i
    let rowBest = current[0]

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost)
      if (current[j] < rowBest) rowBest = current[j]
    }

    if (rowBest > max) return max + 1
    ;[previous, current] = [current, previous]
  }

  return previous[b.length]
}

/** 0-1 similarity derived from edit distance, normalised by the longer string. */
export function similarity(a, b) {
  const longest = Math.max(a.length, b.length)
  if (!longest) return 1
  return 1 - editDistance(a, b, longest) / longest
}

/** Resolve a token straight through the id and alias tables. */
function directHit(token) {
  if (MOOD_BY_ID.has(token)) return { id: token, type: /** @type {MatchType} */ ('exact') }
  if (ALIASES[token]) return { id: ALIASES[token], type: /** @type {MatchType} */ ('alias') }
  return null
}

/** Retry a token with common English suffixes removed. */
function stemHit(token) {
  for (const suffix of SUFFIXES) {
    if (token.length <= suffix.length + 2 || !token.endsWith(suffix)) continue

    const base = token.slice(0, -suffix.length)
    const candidates = [base, `${base}e`, `${base}y`]
    // "sunny" → "sunn" → "sun"; undo the doubled consonant too.
    if (/([a-z])\1$/.test(base)) candidates.push(base.slice(0, -1))

    for (const candidate of candidates) {
      const hit = directHit(candidate)
      if (hit) return hit
    }
  }
  return null
}

/**
 * Closest lexicon entries by string similarity.
 * Used both for typo recovery and for the "did you mean" chips.
 */
export function nearestMoods(token, { limit = 4, floor = 0 } = {}) {
  const scored = []

  for (const candidate of SEARCHABLE) {
    const score = similarity(token, candidate)
    if (score > floor) scored.push({ id: MOOD_BY_ID.has(candidate) ? candidate : ALIASES[candidate], score })
  }

  scored.sort((a, b) => b.score - a.score)

  const seen = new Set()
  const out = []
  for (const { id, score } of scored) {
    if (seen.has(id)) continue
    seen.add(id)
    out.push({ id, score })
    if (out.length >= limit) break
  }
  return out
}

/** FNV-1a — small, fast, and stable across reloads. */
function hash(text) {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

/**
 * Build a mood for a word the lexicon has never seen. The palette is derived
 * from the word itself, so "blorptastic" always renders the same colours, and
 * the visitor's own text becomes the search terms.
 */
export function synthesiseMood(query) {
  const seed = hash(query)
  return {
    id: query,
    terms: [query, `${query} aesthetic`, `${query} texture`],
    hue: seed % 360,
    chroma: 0.42 + ((seed >>> 9) % 32) / 100,
    lift: 0.56 + ((seed >>> 17) % 22) / 100,
    traits: { valence: 0.2, energy: 0.4, warmth: 0.1, light: 0.6 },
    kin: nearestMoods(query, { limit: 3 }).map((entry) => entry.id),
    synthesised: true,
  }
}

/**
 * @param {string} input raw text from the search field
 * @returns {Resolution}
 */
export function resolveMood(input) {
  const query = normalise(input)
  const label = toLabel(query)

  if (!query) {
    return {
      query: '',
      label: '',
      mood: MOOD_BY_ID.get('calm'),
      matchType: 'exact',
      confidence: 1,
      exact: true,
      suggestions: [],
    }
  }

  const finish = (id, matchType, confidence) => ({
    query,
    label,
    mood: MOOD_BY_ID.get(id),
    matchType,
    confidence,
    exact: id === query,
    suggestions: nearestMoods(query, { limit: 5 })
      .map((entry) => entry.id)
      .filter((entry) => entry !== id)
      .slice(0, 4),
  })

  // 1-3: whole-query matches.
  if (PHRASE_ALIASES[query]) return finish(PHRASE_ALIASES[query], 'phrase', 1)
  const whole = directHit(query) ?? directHit(query.replace(/ /g, ''))
  if (whole) return finish(whole.id, whole.type, 1)

  // 4-5: scan the meaningful tokens, longest first — a longer word is more
  // likely to be the mood than a short qualifier.
  const tokens = query.split(' ').filter((token) => token && !STOP_WORDS.has(token))
  const ranked = [...tokens].sort((a, b) => b.length - a.length)

  for (const token of ranked) {
    const hit = directHit(token)
    if (hit) return finish(hit.id, tokens.length === 1 ? hit.type : 'token', tokens.length === 1 ? 1 : 0.9)
  }

  for (const token of ranked) {
    const hit = stemHit(token)
    if (hit) return finish(hit.id, 'stem', 0.8)
  }

  // 6: typo recovery. The threshold tightens on short words, where a single
  // edit is a much larger proportional change.
  for (const token of ranked) {
    if (token.length < 4) continue
    const [best] = nearestMoods(token, { limit: 1 })
    const threshold = token.length <= 5 ? 0.75 : 0.68
    if (best && best.score >= threshold) return finish(best.id, 'fuzzy', best.score)
  }

  // 7: unknown word — keep it, colour it, and let the APIs search it verbatim.
  return {
    query,
    label,
    mood: synthesiseMood(query),
    matchType: 'novel',
    confidence: 0.3,
    exact: false,
    suggestions: nearestMoods(query, { limit: 4 }).map((entry) => entry.id),
  }
}

/**
 * Ordered list of moods to borrow image search terms from when the visitor's
 * own words return too little. Hand-picked `kin` first, then the closest
 * unused neighbours by trait distance — this is the "closest available" rung.
 */
export function relatedMoods(mood, limit = 4) {
  const seen = new Set([mood.id])
  const out = []

  for (const id of mood.kin ?? []) {
    if (seen.has(id) || !MOOD_BY_ID.has(id)) continue
    seen.add(id)
    out.push(MOOD_BY_ID.get(id))
    if (out.length >= limit) return out
  }

  const weights = { valence: 1.2, energy: 1, warmth: 0.8, light: 0.6 }
  const byDistance = MOODS.filter((candidate) => !seen.has(candidate.id))
    .map((candidate) => {
      let sum = 0
      for (const [axis, weight] of Object.entries(weights)) {
        const delta = (candidate.traits[axis] ?? 0) - (mood.traits[axis] ?? 0)
        sum += weight * delta * delta
      }
      return { candidate, distance: Math.sqrt(sum) }
    })
    .sort((a, b) => a.distance - b.distance)

  for (const { candidate } of byDistance) {
    out.push(candidate)
    if (out.length >= limit) break
  }

  return out
}
