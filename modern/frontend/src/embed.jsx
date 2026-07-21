import { createRoot } from 'react-dom/client'
import ProductList from './components/ProductList'
import ProductInfo from './components/ProductInfo'
import './App.css'

// Strangler-fig entry: the legacy pages keep their shell (header, breadcrumb,
// side columns, cart) and delegate only the catalog content block to these
// mounts, which consume the modern API cross-origin through the gateway.
// The legacy session currency arrives via data-currency, so prices follow
// the currency selector of the legacy layout. Action links point back to
// legacy URLs so the cart keeps working.
const DEFAULT_API_BASE = 'http://localhost:8000'

// Builds a legacy URL that keeps the current page's params (cPath, modern,
// products_id, ...) so cart actions return to the same modernized view.
function legacyHref(page, extra) {
  const params = new URLSearchParams(window.location.search)
  for (const [key, value] of Object.entries(extra)) params.set(key, value)
  return `${page}?${params}`
}

const listingHost = document.getElementById('modern-listing')
if (listingHost) {
  listingHost.classList.add('modern-embed')
  createRoot(listingHost).render(
    <ProductList
      categoryId={listingHost.dataset.categoryId}
      apiBase={listingHost.dataset.apiBase || DEFAULT_API_BASE}
      currencyCode={listingHost.dataset.currency}
      renderProductLink={(product, card) => {
        // A real <a> cannot wrap the card here because the card contains the
        // "Comprar" link and anchors do not nest; the div acts as the link.
        const href = `product_info.php?products_id=${product.id}&modern=1`
        const go = () => { window.location.href = href }
        return (
          <div
            className="card-link"
            role="link"
            tabIndex={0}
            onClick={go}
            onKeyDown={(e) => { if (e.key === 'Enter') go() }}
          >
            {card}
          </div>
        )
      }}
      extraActions={(product) => (
        <p className="embed-actions">
          <a
            href={legacyHref('index.php', { action: 'buy_now', products_id: product.id })}
            onClick={(e) => e.stopPropagation()}
          >
            Comprar
          </a>
        </p>
      )}
    />,
  )
}

const productHost = document.getElementById('modern-product-info')
if (productHost) {
  productHost.classList.add('modern-embed')
  createRoot(productHost).render(
    <ProductInfo
      productId={productHost.dataset.productId}
      apiBase={productHost.dataset.apiBase || DEFAULT_API_BASE}
      currencyCode={productHost.dataset.currency}
      extraActions={(product) => (
        <p className="embed-actions">
          <a href={legacyHref('product_info.php', { action: 'buy_now', products_id: product.id })}>
            Añadir al carrito
          </a>
        </p>
      )}
    />,
  )
}
