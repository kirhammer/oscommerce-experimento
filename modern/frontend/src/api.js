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

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// Formats an amount with the store currency's rules (symbol position,
// separators, decimals), as the legacy currencies class does. Falls back to
// USD while the currency payload has not loaded yet.
export function formatPrice(value, currency) {
  if (!currency) return usd.format(value)
  const [int, dec] = Number(value).toFixed(currency.decimal_places).split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousands_point || ',')
  const number = dec != null ? `${grouped}${currency.decimal_point || '.'}${dec}` : grouped
  return `${currency.symbol_left || ''}${number}${currency.symbol_right || ''}`
}
