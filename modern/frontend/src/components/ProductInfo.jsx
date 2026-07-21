import { useEffect, useState } from 'react'
import { fetchJson, formatPrice, imageUrl } from '../api'

/**
 * Product detail fed by GET /api/products/{id}. Reusable by the SPA route
 * and by the strangler embed inside the legacy product page.
 */
export default function ProductInfo({ productId, apiBase = '', extraActions }) {
  const [product, setProduct] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)

    fetchJson(`${apiBase}/api/products/${productId}`)
      .then((json) => {
        if (!cancelled) {
          setProduct(json.data)
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
  }, [productId, apiBase])

  if (loading) return <p className="state">Loading product…</p>
  if (notFound) return <p className="state state-error">Product not found (it may not exist or is inactive).</p>
  if (error) return <p className="state state-error">Could not load product: {error}</p>

  const availableAt = product.date_available ? new Date(product.date_available) : null
  const upcoming = availableAt && availableAt.getTime() > Date.now()

  return (
    <div className="product-info">
      <header>
        <h2>{product.name}</h2>
        {product.model && <span className="model">[{product.model}]</span>}
      </header>

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

      <div className="gallery">
        {imageUrl(product.image) && (
          <img src={imageUrl(product.image)} alt={product.name ?? ''} />
        )}
        {product.images?.map((img) => (
          <img key={img.image} src={imageUrl(img.image)} alt="" loading="lazy" />
        ))}
      </div>

      {/* Legacy descriptions are stored as HTML fragments. */}
      {product.description && (
        <div className="description" dangerouslySetInnerHTML={{ __html: product.description }} />
      )}

      {product.options?.length > 0 && (
        <section className="options">
          <h3>Available options</h3>
          {product.options.map((option) => (
            <label key={option.id}>
              {option.name}{' '}
              <select>
                {option.values.map((value) => (
                  <option key={value.id}>
                    {value.name}
                    {value.price_adjustment > 0 &&
                      ` (${value.price_prefix}${formatPrice(value.price_adjustment)})`}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </section>
      )}

      <ul className="facts">
        {product.manufacturer && <li>Manufacturer: {product.manufacturer.name}</li>}
        <li>In stock: {product.quantity}</li>
        {upcoming && <li>Expected availability: {availableAt.toLocaleDateString()}</li>}
        <li>{product.reviews_count} review{product.reviews_count === 1 ? '' : 's'}</li>
        {product.url && (
          <li>
            <a href={`http://${product.url}`} target="_blank" rel="noreferrer">
              More information
            </a>
          </li>
        )}
      </ul>

      {extraActions?.(product)}
    </div>
  )
}
