import { useEffect, useState } from 'react'
import { fetchJson, formatPrice, imageUrl } from '../api'

/**
 * Product detail fed by GET /api/products/{id}. Reusable by the SPA route
 * and by the strangler embed inside the legacy product page.
 *
 * Layout follows the standard e-commerce PDP: gallery left, "buy box"
 * right (brand → title → reviews → price → options → stock → CTA, with
 * secondary links subordinated), long description below the fold.
 */
export default function ProductInfo({ productId, apiBase = '', currencyCode, extraActions }) {
  const [product, setProduct] = useState(null)
  const [currency, setCurrency] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)

    const params = new URLSearchParams()
    if (currencyCode) params.set('currency', currencyCode)

    fetchJson(`${apiBase}/api/products/${productId}?${params}`)
      .then((json) => {
        if (!cancelled) {
          setProduct(json.data)
          setCurrency(json.currency)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.notFound) setNotFound(true)
          else setError(err.message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [productId, apiBase, currencyCode])

  if (loading) return <p className="state">Cargando producto…</p>
  if (notFound) return <p className="state state-error">Producto no encontrado (no existe o está inactivo).</p>
  if (error) return <p className="state state-error">No se pudo cargar el producto: {error}</p>

  const availableAt = product.date_available ? new Date(product.date_available) : null
  const upcoming = availableAt && availableAt.getTime() > Date.now()
  const inStock = product.quantity > 0

  return (
    <div className="product-info">
      <div className="pdp-grid">
        <div className="pdp-gallery">
          {imageUrl(product.image) && (
            <div className="pdp-main-image">
              <img src={imageUrl(product.image)} alt={product.name ?? ''} />
            </div>
          )}
          {product.images?.length > 0 && (
            <div className="pdp-thumbs">
              {product.images.map((img) => (
                <img key={img.image} src={imageUrl(img.image)} alt="" loading="lazy" />
              ))}
            </div>
          )}
        </div>

        <div className="pdp-buybox">
          {product.manufacturer && <p className="brand">{product.manufacturer.name}</p>}
          <h2>{product.name}</h2>
          <p className="rating">
            ★ {product.reviews_count} reseña{product.reviews_count === 1 ? '' : 's'}
          </p>

          <p className="price">
            {product.special_price != null && (
              <>
                <span className="sale-chip">Oferta</span>
                <s>{formatPrice(product.price, currency)}</s>
              </>
            )}
            <strong>{formatPrice(product.final_price, currency)}</strong>
          </p>

          {product.options?.length > 0 && (
            <div className="options">
              {product.options.map((option) => (
                <label key={option.id}>
                  <span>{option.name}</span>
                  <select>
                    {option.values.map((value) => (
                      <option key={value.id}>
                        {value.name}
                        {value.price_adjustment > 0 &&
                          ` (${value.price_prefix}${formatPrice(value.price_adjustment, currency)})`}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}

          <p className={`stock ${inStock ? 'in' : 'out'}`}>
            <span className="dot" />
            {inStock ? `En stock · ${product.quantity} disponibles` : 'Agotado'}
          </p>

          {upcoming && (
            <p className="availability">Disponible el {availableAt.toLocaleDateString()}</p>
          )}

          {extraActions?.(product)}

          {product.url && (
            <a className="link-out" href={`http://${product.url}`} target="_blank" rel="noreferrer">
              Más información del fabricante ↗
            </a>
          )}

          {product.model && <p className="sku">Modelo: {product.model}</p>}
        </div>
      </div>

      {/* Legacy descriptions are stored as HTML fragments. */}
      {product.description && (
        <section className="pdp-description">
          <h3>Descripción</h3>
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        </section>
      )}
    </div>
  )
}
