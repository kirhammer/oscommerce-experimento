import { useEffect, useMemo, useState } from 'react'
import { fetchJson, formatPrice, imageUrl } from '../api'

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'model', label: 'Model' },
  { value: 'price', label: 'Price' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'weight', label: 'Weight' },
  { value: 'manufacturer', label: 'Manufacturer' },
]

/**
 * Category product listing fed by GET /api/categories/{id}/products.
 * Reusable by the SPA route and by the strangler embed inside the legacy
 * page: `apiBase` targets the gateway cross-origin and `renderProductLink`
 * decides whether product links go to the SPA or to legacy URLs.
 */
export default function ProductList({ categoryId, apiBase = '', renderProductLink, extraActions }) {
  const [sort, setSort] = useState('name')
  const [order, setOrder] = useState('asc')
  const [manufacturer, setManufacturer] = useState('')
  const [page, setPage] = useState(1)
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPage(1)
  }, [categoryId, sort, order, manufacturer])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams({ sort, order, page: String(page) })
    if (manufacturer) params.set('manufacturer', manufacturer)

    fetchJson(`${apiBase}/api/categories/${categoryId}/products?${params}`)
      .then((json) => {
        if (!cancelled) {
          setPayload(json)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [categoryId, apiBase, sort, order, manufacturer, page])

  const manufacturers = useMemo(() => {
    const seen = new Map()
    for (const product of payload?.data ?? []) {
      if (product.manufacturer) seen.set(product.manufacturer.id, product.manufacturer.name)
    }
    return [...seen.entries()]
  }, [payload])

  if (error) return <p className="state state-error">Could not load products: {error}</p>

  const products = payload?.data ?? []
  const meta = payload?.meta

  return (
    <div className="product-list">
      <div className="list-controls">
        <label>
          Sort by{' '}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          Order{' '}
          <select value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
        <label>
          Manufacturer{' '}
          <select value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}>
            <option value="">All</option>
            {manufacturers.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p className="state">Loading products…</p>}

      {!loading && products.length === 0 && (
        <p className="state">There are no products to list in this category.</p>
      )}

      {!loading && products.length > 0 && (
        <ul className="product-grid">
          {products.map((product) => {
            const card = (
              <article className="product-card">
                {imageUrl(product.image) && (
                  <img src={imageUrl(product.image)} alt={product.name ?? ''} loading="lazy" />
                )}
                <h3>{product.name}</h3>
                <dl>
                  {product.model && (
                    <div><dt>Model</dt><dd>{product.model}</dd></div>
                  )}
                  {product.manufacturer && (
                    <div><dt>Brand</dt><dd>{product.manufacturer.name}</dd></div>
                  )}
                  <div><dt>In stock</dt><dd>{product.quantity}</dd></div>
                </dl>
                <p className="price">
                  {product.special_price != null ? (
                    <>
                      <s>{formatPrice(product.price)}</s>{' '}
                      <strong>{formatPrice(product.final_price)}</strong>
                    </>
                  ) : (
                    <strong>{formatPrice(product.final_price)}</strong>
                  )}
                </p>
                {extraActions?.(product)}
              </article>
            )
            return (
              <li key={product.id}>
                {renderProductLink ? renderProductLink(product, card) : card}
              </li>
            )
          })}
        </ul>
      )}

      {meta && meta.last_page > 1 && (
        <nav className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button>
          <span>Page {meta.current_page} of {meta.last_page} · {meta.total} products</span>
          <button disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>Next ›</button>
        </nav>
      )}
    </div>
  )
}
