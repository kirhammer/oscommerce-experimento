// Legacy product images stay served by the legacy web tier; the API returns
// the stored relative path and the client resolves it against this base.
export const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE || 'http://localhost:8080/images/'

export function imageUrl(path) {
  return path ? `${IMAGE_BASE}${path}` : null
}

export async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (res.status === 404) {
    const error = new Error('Not found')
    error.notFound = true
    throw error
  }
  if (!res.ok) {
    throw new Error(`Request failed with HTTP ${res.status}`)
  }
  return res.json()
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function formatPrice(value) {
  return currency.format(value)
}
