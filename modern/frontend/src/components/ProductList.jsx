import { useEffect, useMemo, useState } from 'react'
import { fetchJson, formatPrice, imageUrl } from '../api'

const SORT_OPTIONS = [
  { value: 'name', label: 'Nombre' },
  { value: 'model', label: 'Modelo' },
  { value: 'price', label: 'Precio' },
  { value: 'quantity', label: 'Existencias' },
  { value: 'weight', label: 'Peso' },
  { value: 'manufacturer', label: 'Fabricante' },
]

/**
 * Category product listing fed by GET /api/categories/{id}/products.
 * Reusable by the SPA route and by the strangler embed inside the legacy
 * page: `apiBase` targets the gateway cross-origin, `currencyCode` follows
 * the caller's selected currency and `renderProductLink` decides whether
 * product links go to the SPA or to legacy URLs.
 */
export default function ProductList({ categoryId, apiBase = '', currencyCode, renderProductLink, extraActions }) {
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
  }, [categoryId, apiBase, sort, order, manufacturer, page, currencyCode])

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
          Ordenar
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          Dirección
          <select value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </label>
        <label>
          Fabricante
          <select value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}>
            <option value="">Todos</option>
            {manufacturers.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </label>
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
                <dl className="specs">
                  {product.manufacturer && (
                    <div><dt>Fabricante</dt><dd>{product.manufacturer.name}</dd></div>
                  )}
                  <div><dt>Existencias</dt><dd>{product.quantity}</dd></div>
                </dl>
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
          <span>Pág. {meta.current_page} / {meta.last_page} · {meta.total} productos</span>
          <button disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>Siguiente ›</button>
        </nav>
      )}
    </div>
  )
}
