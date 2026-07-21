import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import ProductList from './components/ProductList'
import ProductInfo from './components/ProductInfo'
import './App.css'

// Top-level categories from the osCommerce sample catalog. The catalog API
// modernizes product reads (R1/R2); category navigation stays a client
// concern, so the SPA offers the known tree plus a free id input.
const SAMPLE_CATEGORIES = [
  { id: 4, name: 'Graphics Cards' },
  { id: 5, name: 'Printers' },
  { id: 8, name: 'Keyboards' },
  { id: 9, name: 'Mice' },
  { id: 10, name: 'DVD · Action' },
  { id: 20, name: 'Software · Strategy' },
  { id: 1, name: 'Hardware (parent — no direct products)' },
]

function Home() {
  const navigate = useNavigate()

  return (
    <section>
      <h2>Catalog categories</h2>
      <ul className="category-links">
        {SAMPLE_CATEGORIES.map((category) => (
          <li key={category.id}>
            <Link to={`/categories/${category.id}`}>{category.name}</Link>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const id = new FormData(e.currentTarget).get('categoryId')
          if (id) navigate(`/categories/${id}`)
        }}
      >
        <label>
          Or browse a category by id:{' '}
          <input name="categoryId" type="number" min="1" required />
        </label>{' '}
        <button type="submit">Go</button>
      </form>
    </section>
  )
}

function CategoryPage() {
  const { id } = useParams()

  return (
    <section>
      <h2>Category #{id}</h2>
      <ProductList
        categoryId={id}
        renderProductLink={(product, card) => (
          <Link className="card-link" to={`/products/${product.id}`}>{card}</Link>
        )}
      />
    </section>
  )
}

function ProductPage() {
  const { id } = useParams()

  return (
    <section>
      <ProductInfo productId={id} />
    </section>
  )
}

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1><Link to="/">osCommerce · Modern Catalog</Link></h1>
        <p>Laravel 11 REST API + React SPA — pre-experimento de modernización</p>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories/:id" element={<CategoryPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
        </Routes>
      </main>
    </div>
  )
}
