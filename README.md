# Moodboard AI

Type a feeling — get a moodboard. Images are fetched live from open image
archives, and the page's entire colour scheme is derived from the mood you
searched for.

No build step, no API keys, no backend. Open `index.html` and it runs.

## How a search resolves

Two independent systems run on every search.

### 1. Words → mood

A 183-adjective lexicon backed by ~760 synonyms and phrases. The resolver walks
a ladder and stops at the first hit:

| Step   | Input                        | Result                                     |
| ------ | ---------------------------- | ------------------------------------------ |
| phrase | `golden hour`                | `golden`                                   |
| exact  | `melancholy`                 | `melancholy`                               |
| alias  | `gloomy`                     | `melancholy`                               |
| token  | `feeling a bit gloomy today` | `melancholy`                               |
| stem   | `dreaminess`                 | `dreamy`                                   |
| fuzzy  | `melancoly`                  | `melancholy`                               |
| novel  | `blorptastic`                | a palette synthesised from the word itself |

An unrecognised word is not an error. It gets a deterministic palette derived
from its own characters, and its literal text is still sent to the image APIs.

### 2. Mood → images (API-first)

The board widens only as far as it has to, and reports how far it went:

1. **verbatim** — the visitor's own words, sent to the APIs untouched
2. **mood** — the curated search terms for the resolved mood
3. **related** — terms borrowed from the nearest neighbouring moods
4. **generic** — a broad aesthetic query, still a real search
5. **fallback** — placeholders, so the board is never empty

Each step queries two providers in parallel and stops as soon as the board is
full, so an exact hit on step 1 never pays for steps 2–5. The first usable batch
paints immediately while later steps top it up.

### Providers

All keyless, CORS-enabled, and free:

| Provider                                                     | Role                                                            |
| ------------------------------------------------------------ | --------------------------------------------------------------- |
| [Openverse](https://openverse.org)                           | Primary — broadest catalogue, best relevance for abstract words |
| [Art Institute of Chicago](https://api.artic.edu/docs/)      | Artworks via IIIF                                               |
| [Wikimedia Commons](https://commons.wikimedia.org/w/api.php) | Deep on concrete nouns and places                               |
| [The Met](https://metmuseum.github.io/)                      | Collection artworks                                             |
| [Lorem Picsum](https://picsum.photos)                        | Last resort only, labelled as approximate                       |

No provider can break the board: each one swallows its own failures and returns
an empty array, so an outage, a rate limit, or a changed response shape just
moves the cascade along. Every tile credits its creator and licence, which is a
condition of use for the CC-licensed sources, not a nicety.

## Colour

Moods declare three numbers — `hue`, `chroma`, `lift` — and `palette.js` expands
them into a full OKLCH ramp. OKLCH is perceptually uniform in lightness, so a
fixed L value holds its contrast whether the hue is yellow or violet; that is
what makes 183 palettes possible without hand-tuning each one.

Verified: every text/background pair clears WCAG AA (4.5:1) across all 183 moods
in both light and dark schemes.

## Running it

```bash
npm install     # dev tooling only — the site itself has no dependencies
npm run dev     # serve at http://localhost:4173
npm run check   # eslint + prettier
```

Deploy by copying the repository to any static host.

## Layout

```
index.html
styles/     tokens.css · base.css · components.css
src/
  main.js            wiring: search flow, combobox, theme, URL sync
  moods.js           the 183-adjective lexicon
  aliases.js         synonyms, phrases, stop words
  mood-resolver.js   the resolution ladder
  image-service.js   the widening cascade
  providers.js       one adapter per API
  palette.js         OKLCH palette derivation
  board.js           grid + tile rendering
  lightbox.js        native <dialog> detail view
  storage.js         guarded localStorage
```

## Interaction

`/` focuses the search field · typeahead with arrow-key selection · click any
tile for a full-size view with `←`/`→`/`Esc` · click a swatch to copy its hex ·
shuffle for a fresh page of results · light/dark/system toggle · boards are
deep-linkable (`#hygge`) and work with browser back/forward.
