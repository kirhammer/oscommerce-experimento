import { createRoot } from 'react-dom/client'
import ProductList from './components/ProductList'
import ProductInfo from './components/ProductInfo'
import './App.css'

// Strangler-fig entry: the legacy pages keep their shell (header, breadcrumb,
// side columns, cart) and delegate only the catalog content block to these
// mounts, which consume the modern API cross-origin through the gateway.
// Action links point back to legacy URLs so the cart keeps working.
const DEFAULT_API_BASE = 'http://localhost:8000'

const listingHost = document.getElementById('modern-listing')
if (listingHost) {
  createRoot(listingHost).render(
    <ProductList
      categoryId={listingHost.dataset.categoryId}
      apiBase={listingHost.dataset.apiBase || DEFAULT_API_BASE}
      extraActions={(product) => (
        <p className="embed-actions">
          <a href={`product_info.php?products_id=${product.id}&modern=1`}>Details</a>
          {' · '}
          <a href={`index.php?action=buy_now&products_id=${product.id}`}>Buy now</a>
        </p>
      )}
    />,
  )
}

const productHost = document.getElementById('modern-product-info')
if (productHost) {
  createRoot(productHost).render(
    <ProductInfo
      productId={productHost.dataset.productId}
      apiBase={productHost.dataset.apiBase || DEFAULT_API_BASE}
      extraActions={(product) => (
        <p className="embed-actions">
          <a href={`index.php?action=buy_now&products_id=${product.id}`}>Add to cart (legacy)</a>
        </p>
      )}
    />,
  )
}
