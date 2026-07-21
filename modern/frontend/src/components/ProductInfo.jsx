import { useEffect, useState } from 'react'
import { fetchJson, formatPrice, imageUrl } from '../api'

function Stars({ rating }) {
  return (
    <span className="stars" aria-label={`${rating} de 5`}>
      {'★'.repeat(rating)}
      <span className="stars-off">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

/**
 * Inline review list (GET /api/products/{id}/reviews) — the legacy store
 * sends customers to a separate product_reviews.php page; modern PDPs list
 * reviews on the product page itself.
 */
function ReviewsSection({ productId, apiBase, count }) {
  const [reviews, setReviews] = useState([])
  const [lastPage, setLastPage] = useState(1)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    fetchJson(`${apiBase}/api/products/${productId}/reviews?page=${page}`)
      .then((json) => {
        if (!cancelled) {
          setReviews((prev) => (page === 1 ? json.data : [...prev, ...json.data]))
          setLastPage(json.meta.last_page)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [productId, apiBase, page])

  return (
    <section className="pdp-reviews" id="reviews">
      <h3>Reseñas ({count})</h3>
      <ul>
        {reviews.map((review) => (
          <li key={review.id}>
            <div className="review-head">
              <Stars rating={review.rating} />
              <strong>{review.author}</strong>
              <time>{new Date(review.date_added).toLocaleDateString()}</time>
            </div>
            <p>{review.text}</p>
          </li>
        ))}
      </ul>
      {page < lastPage && (
        <button className="load-more" onClick={() => setPage(page + 1)}>
          Cargar más reseñas
        </button>
      )}
    </section>
  )
}

/**
 * Product detail fed by GET /api/products/{id}. Reusable by the SPA route
 * and by the strangler embed inside the legacy product page.
 *
 * Layout follows the standard e-commerce PDP: gallery left, "buy box"
 * right (brand → title → reviews → price → options → stock → CTA, with
 * secondary links subordinated), long description below the fold.
 *
 * When `cartFormAction` is set (embed), the option selectors and the CTA
 * become a real form that POSTs action=add_product to the legacy page —
 * the same request its native cart form sends — so attribute selections
 * reach the legacy cart and the flow continues to shopping_cart.php.
 */
export default function ProductInfo({ productId, apiBase = '', currencyCode, cartFormAction }) {
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
          {product.reviews_count > 0 ? (
            <a className="rating" href="#reviews">
              <Stars rating={Math.round(product.reviews_avg_rating ?? 0)} />
              {product.reviews_avg_rating} · {product.reviews_count} reseña{product.reviews_count === 1 ? '' : 's'}
            </a>
          ) : (
            <p className="rating">Sin reseñas todavía</p>
          )}

          <p className="price">
            {product.special_price != null && (
              <>
                <span className="sale-chip">Oferta</span>
                <s>{formatPrice(product.price, currency)}</s>
              </>
            )}
            <strong>{formatPrice(product.final_price, currency)}</strong>
          </p>

          <p className={`stock ${inStock ? 'in' : 'out'}`}>
            <span className="dot" />
            {inStock ? `En stock · ${product.quantity} disponibles` : 'Agotado'}
          </p>

          {upcoming && (
            <p className="availability">Disponible el {availableAt.toLocaleDateString()}</p>
          )}

          {(() => {
            const optionsBlock = product.options?.length > 0 && (
              <div className="options">
                {product.options.map((option) => (
                  <label key={option.id}>
                    <span>{option.name}</span>
                    <select name={`id[${option.id}]`}>
                      {option.values.map((value) => (
                        <option key={value.id} value={value.id}>
                          {value.name}
                          {value.price_adjustment > 0 &&
                            ` (${value.price_prefix}${formatPrice(value.price_adjustment, currency)})`}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            )

            if (!cartFormAction) return optionsBlock

            return (
              <form className="buy-form" method="post" action={cartFormAction}>
                <input type="hidden" name="products_id" value={product.id} />
                {optionsBlock}
                <button type="submit" className="cta" disabled={!inStock}>
                  Añadir al carrito
                </button>
              </form>
            )
          })()}

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

      {product.reviews_count > 0 && (
        <ReviewsSection productId={product.id} apiBase={apiBase} count={product.reviews_count} />
      )}
    </div>
  )
}
