/**
 * Grid rendering.
 *
 * Tiles are plain buttons so the board is keyboard-navigable for free, and every
 * tile carries its own attribution — most of these images are CC-licensed and
 * credit is a condition of use, not a nicety.
 */

/** @typedef {import('./providers.js').Photo} Photo */

/** Per-image recovery: try the full-size URL, then a placeholder, then give up. */
function attachFallback(img, photo, tile) {
  const chain = [photo.full, `https://picsum.photos/seed/${encodeURIComponent(photo.id)}/900/1200`].filter(
    (url) => url && url !== photo.src,
  )
  let attempt = 0

  img.addEventListener('error', function onError() {
    if (attempt < chain.length) {
      img.src = chain[attempt]
      attempt += 1
      return
    }
    // Nothing loaded. A missing tile reads better than a broken one.
    img.removeEventListener('error', onError)
    tile.remove()
  })
}

/**
 * @param {Photo} photo
 * @param {number} index
 * @param {(photo: Photo, index: number) => void} onSelect
 */
function createTile(photo, index, onSelect) {
  const tile = document.createElement('article')
  tile.className = 'tile tile--enter'
  tile.style.setProperty('--index', String(Math.min(index, 12)))

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'tile__button'
  button.setAttribute('aria-label', `Open “${photo.title}” by ${photo.creator}`)

  const img = document.createElement('img')
  img.src = photo.src
  img.alt = photo.alt
  img.decoding = 'async'
  // The first row is above the fold on most viewports; the rest can wait.
  img.loading = index < 6 ? 'eager' : 'lazy'
  if (index < 3) img.setAttribute('fetchpriority', 'high')
  if (photo.width) img.width = photo.width
  if (photo.height) img.height = photo.height

  img.addEventListener('load', () => tile.setAttribute('data-loaded', 'true'), { once: true })
  attachFallback(img, photo, tile)
  // A cached image may already be complete before the listener attached.
  if (img.complete && img.naturalWidth > 0) tile.setAttribute('data-loaded', 'true')

  const badge = document.createElement('span')
  badge.className = 'tile__badge'
  badge.textContent = photo.approximate ? 'Placeholder' : photo.provider

  const caption = document.createElement('span')
  caption.className = 'tile__caption'

  const title = document.createElement('span')
  title.className = 'tile__title'
  title.textContent = photo.title

  const credit = document.createElement('span')
  credit.className = 'tile__credit'
  credit.textContent = [photo.creator, photo.license].filter(Boolean).join(' · ')

  caption.append(title, credit)
  button.append(img, badge, caption)
  button.addEventListener('click', () => onSelect(photo, index))
  tile.append(button)

  return tile
}

/**
 * Replace the grid's contents with a new set of photos.
 * @param {HTMLElement} grid
 * @param {Photo[]} photos
 * @param {{ onSelect: (photo: Photo, index: number) => void }} handlers
 */
export function renderPhotos(grid, photos, { onSelect }) {
  const fragment = document.createDocumentFragment()
  photos.forEach((photo, index) => fragment.append(createTile(photo, index, onSelect)))
  grid.replaceChildren(fragment)
}

/**
 * Placeholder tiles shown while the providers are being queried. They reserve
 * the board's height so the page does not jump when the real images land.
 * @param {HTMLElement} grid
 * @param {number} count
 */
export function renderSkeletons(grid, count) {
  const fragment = document.createDocumentFragment()
  for (let index = 0; index < count; index += 1) {
    const tile = document.createElement('div')
    tile.className = 'tile tile--skeleton'
    tile.style.animationDelay = `${index * 90}ms`
    fragment.append(tile)
  }
  grid.replaceChildren(fragment)
  grid.setAttribute('aria-busy', 'true')
}

/** @param {HTMLElement} grid */
export function clearBusy(grid) {
  grid.removeAttribute('aria-busy')
}
