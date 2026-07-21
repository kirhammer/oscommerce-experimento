import { useEffect, useMemo, useState } from 'react'
import { fetchJson, formatPrice, imageUrl } from '../api'

// Legacy scope: the listing sorts only by its visible columns (name, price).
// Field and direction merge into one control, the modern listing pattern.
const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Nombre (A–Z)' },
  { value: 'name-desc', label: 'Nombre (Z–A)' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
]

/**
 * Category product listing fed by GET /api/categories/{id}/products.
 * Reusable by the SPA route and by the strangler embed inside the legacy
 * page: `apiBase` targets the gateway cross-origin, `currencyCode` follows
 * the caller's selected currency and `renderProductLink` decides whether
 * product links go to the SPA or to legacy URLs.
 */
export default function ProductList({ categoryId, apiBase = '', currencyCode, renderProductLink, extraActions }) {
  const [sorting, setSorting] = useState('name-asc')
  const [manufacturer, setManufacturer] = useState('')
  const [page, setPage] = useState(1)
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPage(1)
  }, [categoryId, sorting, manufacturer])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const [sort, order] = sorting.split('-')
    const params = new URLSearchParams({ sort, order, page: String(page) })
    if (manufacturer) params.set('manufacturer', manufacturer)
    if (currencyCode) params.set('currency', currencyCode)

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
  }, [categoryId, apiBase, sorting, manufacturer, page, currencyCode])

  const manufacturers = useMemo(() => {
    const seen = new Map()
    for (const product of payload?.data ?? []) {
      if (product.manufacturer) seen.set(product.manufacturer.id, product.manufacturer.name)
    }
    return [...seen.entries()]
  }, [payload])

  if (error) return <p className="state state-error">No se pudieron cargar los productos: {error}</p>

  const products = payload?.data ?? []
  const meta = payload?.meta
  const currency = payload?.currency

  return (
    <div className="product-list">
      <div className="list-controls">
        <label>
          Ordenar por
          <select value={sorting} onChange={(e) => setSorting(e.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        {/* Like the legacy filter dropdown, only shown with >1 manufacturer. */}
        {(manufacturers.length > 1 || manufacturer) && (
          <label>
            Fabricante
            <select value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}>
              <option value="">Todos</option>
              {manufacturers.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </label>
        )}
        {meta && meta.total > 0 && (
          <span className="result-count">
            Mostrando {meta.from}–{meta.to} de {meta.total} producto{meta.total === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {loading && <p className="state">Cargando productos…</p>}

      {!loading && products.length === 0 && (
        <p className="state">No hay productos para listar en esta categoría.</p>
      )}

      {!loading && products.length > 0 && (
        <ul className="product-grid">
          {products.map((product, index) => {
            const card = (
              <article className="product-card">
                {imageUrl(product.image) && (
                  <div className="figure">
                    <img src={imageUrl(product.image)} alt={product.name ?? ''} loading="lazy" />
                  </div>
                )}
                <h3>{product.name}</h3>
                <p className="price">
                  {product.special_price != null && (
                    <>
                      <span className="sale-chip">Oferta</span>
                      <s>{formatPrice(product.price, currency)}</s>
                    </>
                  )}
                  <strong>{formatPrice(product.final_price, currency)}</strong>
                </p>
                {extraActions?.(product)}
              </article>
            )
            return (
              <li key={product.id} style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}>
                {renderProductLink ? renderProductLink(product, card) : card}
              </li>
            )
          })}
        </ul>
      )}

      {meta && meta.last_page > 1 && (
        <nav className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Anterior</button>
          <span>Pág. {meta.current_page} / {meta.last_page}</span>
          <button disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>Siguiente ›</button>
        </nav>
      )}
    </div>
  )
}
