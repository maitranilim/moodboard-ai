/**
 * Derives a full theme from a mood's three colour inputs.
 *
 * Hand-writing hex ramps for 180+ moods would drift out of tune, so every mood
 * declares only `hue`, `chroma` and `lift` and this module expands them into
 * OKLCH tokens. OKLCH is perceptually uniform in lightness, which means a fixed
 * L value holds the same contrast whether the hue is yellow or violet — the
 * text stays legible across the whole lexicon without per-mood tuning.
 *
 * The page itself stays close to neutral (chroma is scaled right down for
 * backgrounds); the mood is carried by the accent, the swatch strip and the
 * tile glow. That keeps 180 different moods from turning the UI garish.
 */

/** @typedef {import('./moods.js').Mood} Mood */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/** Peak chroma per token role, multiplied by the mood's own 0-1 chroma. */
const MAX_CHROMA = {
  bg: 0.016,
  surface: 0.012,
  border: 0.03,
  text: 0.028,
  muted: 0.035,
  accent: 0.17,
  glow: 0.2,
}

const oklch = (l, c, h, alpha) =>
  alpha === undefined
    ? `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)})`
    : `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)} / ${alpha})`

/**
 * @param {Mood} mood
 * @param {'light'|'dark'} scheme
 * @returns {Record<string, string>} CSS custom properties
 */
export function buildPalette(mood, scheme = 'light') {
  const hue = ((mood.hue % 360) + 360) % 360
  const chroma = clamp(mood.chroma ?? 0.5, 0, 1)
  const lift = clamp(mood.lift ?? 0.65, 0, 1)
  const dark = scheme === 'dark'

  // `lift` nudges the background within the scheme's safe range rather than
  // overriding it, so a dark mood never blows out a light theme (or vice versa).
  const bgL = dark ? 0.155 + lift * 0.055 : 0.955 + (lift - 0.5) * 0.05
  const surfaceL = dark ? bgL + 0.055 : Math.min(0.995, bgL + 0.035)
  const raisedL = dark ? bgL + 0.09 : Math.min(1, bgL + 0.055)

  const textL = dark ? 0.955 : 0.215
  const mutedL = dark ? 0.72 : 0.475
  const borderL = dark ? bgL + 0.12 : bgL - 0.085

  // The accent sits at a fixed lightness per scheme so its contrast against the
  // page is predictable; only hue and chroma move with the mood.
  const accentL = dark ? 0.775 : 0.545
  const accentC = MAX_CHROMA.accent * (0.35 + chroma * 0.65)
  const accentHoverL = dark ? accentL + 0.05 : accentL - 0.055

  // Text needs more separation from the background than a fill does.
  const accentTextL = dark ? 0.83 : 0.44

  // Text drawn on top of the accent: pick whichever end has more headroom.
  const onAccentL = accentL > 0.65 ? 0.18 : 0.99

  const swatches = Array.from({ length: 5 }, (_, i) => {
    const spread = (i - 2) / 2
    const l = dark ? clamp(0.42 + spread * 0.22, 0.2, 0.9) : clamp(0.58 + spread * 0.24, 0.24, 0.94)
    const c = MAX_CHROMA.glow * (0.3 + chroma * 0.7) * (1 - Math.abs(spread) * 0.35)
    return oklch(l, c, hue + spread * 22)
  })

  return {
    '--hue': hue.toFixed(2),
    '--bg': oklch(bgL, MAX_CHROMA.bg * chroma, hue),
    '--surface': oklch(surfaceL, MAX_CHROMA.surface * chroma, hue),
    '--surface-raised': oklch(raisedL, MAX_CHROMA.surface * chroma, hue),
    '--border': oklch(borderL, MAX_CHROMA.border * chroma, hue),
    '--border-strong': oklch(dark ? borderL + 0.09 : borderL - 0.07, MAX_CHROMA.border * chroma, hue),
    '--text': oklch(textL, MAX_CHROMA.text * chroma, hue),
    '--text-muted': oklch(mutedL, MAX_CHROMA.muted * chroma, hue),
    '--accent': oklch(accentL, accentC, hue),
    '--accent-hover': oklch(accentHoverL, accentC, hue),
    '--accent-text': oklch(accentTextL, accentC * 0.9, hue),
    '--accent-text-hover': oklch(dark ? accentTextL + 0.06 : accentTextL - 0.07, accentC * 0.9, hue),
    '--accent-soft': oklch(dark ? 0.3 : 0.93, accentC * 0.35, hue),
    '--on-accent': oklch(onAccentL, 0.008, hue),
    '--ring': oklch(accentL, accentC, hue, 0.45),
    '--glow': oklch(accentL, accentC, hue, dark ? 0.28 : 0.18),
    '--shadow-color': dark ? oklch(0.02, 0.01, hue, 0.55) : oklch(0.35, 0.03, hue, 0.13),
    '--swatch-1': swatches[0],
    '--swatch-2': swatches[1],
    '--swatch-3': swatches[2],
    '--swatch-4': swatches[3],
    '--swatch-5': swatches[4],
  }
}

/**
 * Convert OKLCH to a `#rrggbb` string.
 *
 * The obvious approach — set the colour on an element and read it back — no
 * longer works: `getComputedStyle().color` preserves the authored colour space,
 * so an `oklch()` value reads back as `oklch()` and its three numbers get
 * misread as RGB. Doing the conversion here is engine-independent and exact.
 *
 * Follows Björn Ottosson's OKLab → linear sRGB matrices.
 */
function oklabToLinearRgb(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

const inGamut = ([r, g, b]) => [r, g, b].every((v) => v >= -0.0001 && v <= 1.0001)

/** sRGB transfer function. */
const encode = (v) => {
  const clamped = clamp(v, 0, 1)
  return clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055
}

/**
 * @param {number} l 0-1 lightness
 * @param {number} c chroma
 * @param {number} h hue in degrees
 * @returns {string} `#rrggbb`
 */
export function oklchToHex(l, c, h) {
  const radians = (h * Math.PI) / 180
  const toRgb = (chroma) => oklabToLinearRgb(l, chroma * Math.cos(radians), chroma * Math.sin(radians))

  // Highly saturated hues can fall outside sRGB. Browsers gamut-map rather than
  // clip, so binary-search the largest chroma that still fits: the hex we hand
  // the visitor then matches what they see on screen.
  let chroma = c
  if (!inGamut(toRgb(chroma))) {
    let low = 0
    let high = c
    for (let i = 0; i < 18; i += 1) {
      chroma = (low + high) / 2
      if (inGamut(toRgb(chroma))) low = chroma
      else high = chroma
    }
    chroma = low
  }

  return `#${toRgb(chroma)
    .map((v) =>
      Math.round(encode(v) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

/**
 * The five strip colours for a mood, as both a CSS value and a copyable hex.
 * @param {Mood} mood
 * @param {'light'|'dark'} scheme
 * @returns {{ css: string, hex: string }[]}
 */
export function swatchColors(mood, scheme = 'light') {
  const hue = ((mood.hue % 360) + 360) % 360
  const chroma = clamp(mood.chroma ?? 0.5, 0, 1)
  const dark = scheme === 'dark'

  return Array.from({ length: 5 }, (_, i) => {
    const spread = (i - 2) / 2
    const l = dark ? clamp(0.42 + spread * 0.22, 0.2, 0.9) : clamp(0.58 + spread * 0.24, 0.24, 0.94)
    const c = MAX_CHROMA.glow * (0.3 + chroma * 0.7) * (1 - Math.abs(spread) * 0.35)
    const h = hue + spread * 22
    return { css: oklch(l, c, h), hex: oklchToHex(l, c, h) }
  })
}

/**
 * Write a palette onto the document root.
 * @param {Mood} mood
 * @param {'light'|'dark'} scheme
 */
export function applyPalette(mood, scheme) {
  const root = document.documentElement
  const tokens = buildPalette(mood, scheme)
  for (const [name, value] of Object.entries(tokens)) root.style.setProperty(name, value)

  // Keep the browser chrome (address bar, form controls) in step with the page.
  root.style.colorScheme = scheme
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    const bgL = dark(scheme)
      ? 0.155 + clamp(mood.lift ?? 0.65, 0, 1) * 0.055
      : 0.955 + ((mood.lift ?? 0.65) - 0.5) * 0.05
    meta.setAttribute('content', oklchToHex(bgL, MAX_CHROMA.bg * clamp(mood.chroma ?? 0.5, 0, 1), mood.hue))
  }
  return tokens
}

const dark = (scheme) => scheme === 'dark'
