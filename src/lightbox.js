/**
 * Image detail view.
 *
 * Built on the native <dialog> element, which brings the modal semantics that
 * are tedious to hand-roll: focus trapping, inert background, Escape to close,
 * and focus restored to the tile that opened it. Only arrow-key navigation is
 * added on top.
 */

/** @typedef {import('./providers.js').Photo} Photo */

export function createLightbox(elements) {
  const { dialog, image, title, meta, source, license, prev, next, close } = elements

  /** @type {Photo[]} */
  let photos = []
  let index = 0

  function show(position) {
    if (!photos.length) return
    // Wrap around so the arrows never dead-end.
    index = (position + photos.length) % photos.length
    const photo = photos[index]

    image.src = photo.full || photo.src
    image.alt = photo.alt
    title.textContent = photo.title
    meta.textContent = [photo.creator, photo.provider, photo.license].filter(Boolean).join(' · ')

    source.href = photo.sourceUrl || photo.full || photo.src
    source.textContent = photo.sourceUrl ? `View on ${photo.provider}` : 'Open image'

    if (photo.licenseUrl) {
      license.href = photo.licenseUrl
      license.textContent = `${photo.license || 'Licence'} details`
      license.hidden = false
    } else {
      license.hidden = true
    }

    const single = photos.length < 2
    prev.hidden = single
    next.hidden = single
  }

  /**
   * @param {Photo[]} list
   * @param {number} position
   */
  function open(list, position) {
    photos = list
    show(position)
    if (!dialog.open) dialog.showModal()
  }

  prev.addEventListener('click', () => show(index - 1))
  next.addEventListener('click', () => show(index + 1))
  close.addEventListener('click', () => dialog.close())

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      show(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      show(index + 1)
    }
  })

  // Clicking the backdrop closes: the dialog itself is the click target only
  // when the pointer lands outside its own content box.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close()
  })

  // Drop the image on close so a large file is not held in memory.
  dialog.addEventListener('close', () => {
    image.removeAttribute('src')
  })

  return { open }
}
