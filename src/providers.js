/**
 * Image providers.
 *
 * Every provider here is a free, keyless, CORS-enabled public API, so the board
 * runs as a static site with no server and no secrets to leak. Each one
 * normalises its response into the same `Photo` shape and is contractually
 * forbidden from throwing: a provider that is down, rate-limited or has changed
 * its response shape returns an empty array and the cascade moves on.
 *
 * Order matters. `openverse` is first because it has the broadest catalogue and
 * the best relevance for abstract words like "melancholy"; the museum APIs add
 * texture and rarely overlap; `picsum` needs no network round-trip at all and
 * exists so the board is never empty.
 */

/**
 * @typedef {object} Photo
 * @property {string}  id
 * @property {string}  provider
 * @property {string}  src        grid-sized image
 * @property {string}  full       full-resolution image for the lightbox
 * @property {string}  alt
 * @property {string}  title
 * @property {string}  creator
 * @property {string}  sourceUrl  landing page for attribution
 * @property {string}  license
 * @property {string}  licenseUrl
 * @property {number}  width
 * @property {number}  height
 * @property {boolean} [approximate] true when the image is not a real match
 */

const REQUEST_TIMEOUT_MS = 8000

/** File types that do not belong in a photographic grid. */
const REJECTED_EXTENSIONS = /\.(svg|tiff?|pdf|ogv|webm|mp4|xcf|djvu)(\?|$)/i

/** Combine a caller's abort signal with a per-request timeout. */
function withTimeout(signal, ms = REQUEST_TIMEOUT_MS) {
  const timeout = AbortSignal.timeout(ms)
  if (!signal) return timeout
  if (typeof AbortSignal.any === 'function') return AbortSignal.any([signal, timeout])

  // Older engines: mirror whichever signal fires first onto a fresh controller.
  const controller = new AbortController()
  const abort = (event) => controller.abort(event.target.reason)
  signal.addEventListener('abort', abort, { once: true })
  timeout.addEventListener('abort', abort, { once: true })
  return controller.signal
}

/** Fetch JSON, or null on any transport, status or parse failure. */
async function getJson(url, signal) {
  try {
    const response = await fetch(url, {
      signal: withTimeout(signal),
      headers: { Accept: 'application/json' },
      referrerPolicy: 'no-referrer',
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

const text = (value) => (typeof value === 'string' ? value.trim() : '')
const isUsable = (url) =>
  typeof url === 'string' && /^https?:\/\//i.test(url) && !REJECTED_EXTENSIONS.test(url)

/** Strip the HTML Wikimedia embeds in its metadata fields. */
function stripTags(value) {
  return text(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Openverse — 700M+ openly licensed images. Broadest relevance, tried first. */
const openverse = {
  id: 'openverse',
  label: 'Openverse',
  homepage: 'https://openverse.org',
  async search(query, { signal, limit = 20, page = 1 } = {}) {
    const url = new URL('https://api.openverse.org/v1/images/')
    url.searchParams.set('q', query)
    url.searchParams.set('page_size', String(Math.min(limit, 20)))
    url.searchParams.set('page', String(page))

    const data = await getJson(url, signal)
    const results = Array.isArray(data?.results) ? data.results : []

    return results.reduce((photos, item) => {
      // The proxied thumbnail is far more reliable than the origin host, which
      // is often a slow or hotlink-blocking third party.
      const src = isUsable(item?.thumbnail) ? item.thumbnail : item?.url
      if (!isUsable(src)) return photos

      photos.push({
        id: `openverse:${item.id}`,
        provider: 'Openverse',
        src,
        full: isUsable(item?.url) ? item.url : src,
        alt: text(item?.title) || query,
        title: text(item?.title) || 'Untitled',
        creator: text(item?.creator) || text(item?.source) || 'Unknown',
        sourceUrl: text(item?.foreign_landing_url) || text(item?.url),
        license: [text(item?.license).toUpperCase(), text(item?.license_version)].filter(Boolean).join(' '),
        licenseUrl: text(item?.license_url),
        width: Number(item?.width) || 0,
        height: Number(item?.height) || 0,
      })
      return photos
    }, [])
  },
}

/** Art Institute of Chicago — public-domain artworks via IIIF. */
const artic = {
  id: 'artic',
  label: 'Art Institute of Chicago',
  homepage: 'https://www.artic.edu',
  async search(query, { signal, limit = 12, page = 1 } = {}) {
    const url = new URL('https://api.artic.edu/api/v1/artworks/search')
    url.searchParams.set('q', query)
    url.searchParams.set('limit', String(Math.min(limit, 40)))
    url.searchParams.set('page', String(page))
    url.searchParams.set('fields', 'id,title,image_id,artist_title,date_display,is_public_domain')

    const data = await getJson(url, signal)
    const results = Array.isArray(data?.data) ? data.data : []
    const iiif = text(data?.config?.iiif_url) || 'https://www.artic.edu/iiif/2'

    return results.reduce((photos, item) => {
      // Plenty of catalogue records carry no image at all.
      if (!text(item?.image_id)) return photos

      const base = `${iiif}/${item.image_id}/full`
      photos.push({
        id: `artic:${item.id}`,
        provider: 'Art Institute of Chicago',
        src: `${base}/843,/0/default.jpg`,
        full: `${base}/1686,/0/default.jpg`,
        alt: [text(item?.title), text(item?.artist_title)].filter(Boolean).join(' by ') || query,
        title: text(item?.title) || 'Untitled',
        creator: text(item?.artist_title) || 'Unknown artist',
        sourceUrl: `https://www.artic.edu/artworks/${item.id}`,
        license: item?.is_public_domain ? 'Public domain' : 'Courtesy of the Art Institute of Chicago',
        licenseUrl: 'https://www.artic.edu/terms',
        width: 843,
        height: 0,
      })
      return photos
    }, [])
  },
}

/** Wikimedia Commons — deep, and strong on concrete nouns and places. */
const wikimedia = {
  id: 'wikimedia',
  label: 'Wikimedia Commons',
  homepage: 'https://commons.wikimedia.org',
  async search(query, { signal, limit = 16, page = 1 } = {}) {
    const url = new URL('https://commons.wikimedia.org/w/api.php')
    const params = {
      action: 'query',
      format: 'json',
      formatversion: '2',
      origin: '*', // anonymous CORS
      generator: 'search',
      gsrsearch: `${query} filetype:bitmap`,
      gsrnamespace: '6', // File:
      gsrlimit: String(Math.min(limit, 40)),
      gsroffset: String((page - 1) * limit),
      prop: 'imageinfo',
      iiprop: 'url|extmetadata|size',
      iiurlwidth: '900',
      iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl|ObjectName',
    }
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)

    const data = await getJson(url, signal)
    const pages = Array.isArray(data?.query?.pages) ? data.query.pages : []

    return pages.reduce((photos, item) => {
      const info = item?.imageinfo?.[0]
      const src = isUsable(info?.thumburl) ? info.thumburl : info?.url
      if (!isUsable(src)) return photos

      const meta = info?.extmetadata ?? {}
      const title = text(item?.title)
        .replace(/^File:/, '')
        .replace(/\.[a-z0-9]+$/i, '')

      photos.push({
        id: `wikimedia:${item.pageid}`,
        provider: 'Wikimedia Commons',
        src,
        full: isUsable(info?.url) ? info.url : src,
        alt: title || query,
        title: title || 'Untitled',
        creator: stripTags(meta?.Artist?.value) || 'Unknown',
        sourceUrl: text(info?.descriptionurl),
        license: stripTags(meta?.LicenseShortName?.value) || 'See Commons',
        licenseUrl: text(meta?.LicenseUrl?.value),
        width: Number(info?.thumbwidth) || 0,
        height: Number(info?.thumbheight) || 0,
      })
      return photos
    }, [])
  },
}

/** The Met — search returns bare ids, so each object costs a second request. */
const met = {
  id: 'met',
  label: 'The Metropolitan Museum of Art',
  homepage: 'https://www.metmuseum.org',
  async search(query, { signal, limit = 8, page = 1 } = {}) {
    const searchUrl = new URL('https://collectionapi.metmuseum.org/public/collection/v1/search')
    searchUrl.searchParams.set('q', query)
    searchUrl.searchParams.set('hasImages', 'true')

    const found = await getJson(searchUrl, signal)
    const ids = Array.isArray(found?.objectIDs) ? found.objectIDs : []
    if (!ids.length) return []

    // Cap the fan-out hard: this endpoint is one request per artwork.
    const capped = Math.min(limit, 8)
    const slice = ids.slice((page - 1) * capped, page * capped)

    const objects = await Promise.all(
      slice.map((id) =>
        getJson(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`, signal),
      ),
    )

    return objects.reduce((photos, item) => {
      const src = text(item?.primaryImageSmall) || text(item?.primaryImage)
      if (!isUsable(src)) return photos

      photos.push({
        id: `met:${item.objectID}`,
        provider: 'The Met',
        src,
        full: isUsable(item?.primaryImage) ? item.primaryImage : src,
        alt: [text(item?.title), text(item?.artistDisplayName)].filter(Boolean).join(' by ') || query,
        title: text(item?.title) || 'Untitled',
        creator: text(item?.artistDisplayName) || text(item?.culture) || 'Unknown artist',
        sourceUrl: text(item?.objectURL),
        license: item?.isPublicDomain ? 'Public domain' : 'Courtesy of The Met',
        licenseUrl: 'https://www.metmuseum.org/information/terms-and-conditions',
        width: 0,
        height: 0,
      })
      return photos
    }, [])
  },
}

/**
 * Lorem Picsum — the floor. It cannot search, so these images are honestly
 * labelled as approximate; their only job is to keep the board from being empty
 * when every searchable provider is unreachable.
 */
const picsum = {
  id: 'picsum',
  label: 'Lorem Picsum',
  homepage: 'https://picsum.photos',
  searchable: false,
  async search(query, { limit = 12, page = 1 } = {}) {
    return Array.from({ length: limit }, (_, index) => {
      const seed = encodeURIComponent(`${query}-${page}-${index}`)
      return {
        id: `picsum:${seed}`,
        provider: 'Lorem Picsum',
        src: `https://picsum.photos/seed/${seed}/900/1200`,
        full: `https://picsum.photos/seed/${seed}/1600/2000`,
        alt: `Placeholder photograph for ${query}`,
        title: 'Random photograph',
        creator: 'Lorem Picsum',
        sourceUrl: 'https://picsum.photos',
        license: 'Unsplash licence',
        licenseUrl: 'https://unsplash.com/license',
        width: 900,
        height: 1200,
        approximate: true,
      }
    })
  },
}

/** Searchable providers, in cascade order. */
export const PROVIDERS = [openverse, artic, wikimedia, met]

/** The no-network floor, used only once everything above has been exhausted. */
export const FALLBACK_PROVIDER = picsum

export const ALL_PROVIDERS = [...PROVIDERS, picsum]
