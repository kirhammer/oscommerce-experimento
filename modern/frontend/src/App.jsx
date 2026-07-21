import { useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import ProductList from './components/ProductList'
import ProductInfo from './components/ProductInfo'
import { fetchJson } from './api'
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
  { id: 1, name: 'Hardware (sin productos directos)' },
]

function Home() {
  const navigate = useNavigate()

  return (
    <section>
      <div className="home-hero">
        <p className="eyebrow">REQ-01 · Catálogo · R1 + R2</p>
        <h2>El mismo catálogo, <span className="grad">experiencia de hoy</span>.</h2>
        <p>
          Mismos datos, misma base — servidos por una API REST en capas y
          renderizados por React. Compare con la tienda legada puerto a puerto.
        </p>
      </div>
      <ul className="category-links">
        {SAMPLE_CATEGORIES.map((category) => (
          <li key={category.id}>
            <Link to={`/categories/${category.id}`}>
              <span className="idx">{String(category.id).padStart(2, '0')}</span>
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
      <form
        className="category-form"
        onSubmit={(e) => {
          e.preventDefault()
          const id = new FormData(e.currentTarget).get('categoryId')
          if (id) navigate(`/categories/${id}`)
        }}
      >
        <label htmlFor="categoryId">O consulte una categoría por id:</label>
        <input id="categoryId" name="categoryId" type="number" min="1" required />
        <button type="submit">Ir</button>
      </form>
    </section>
  )
}

function CategoryPage({ currencyCode }) {
  const { id } = useParams()

  return (
    <section>
      <div className="section-head">
        <h2>Categoría {String(id).padStart(2, '0')}</h2>
      </div>
      <ProductList
        categoryId={id}
        currencyCode={currencyCode}
        renderProductLink={(product, card) => (
          <Link className="card-link" to={`/products/${product.id}`}>{card}</Link>
        )}
      />
    </section>
  )
}

function ProductPage({ currencyCode }) {
  const { id } = useParams()

  return (
    <section>
      <ProductInfo productId={id} currencyCode={currencyCode} />
    </section>
  )
}

export default function App() {
  const [currencies, setCurrencies] = useState([])
  const [currencyCode, setCurrencyCode] = useState('USD')

  useEffect(() => {
    fetchJson('/api/currencies')
      .then((json) => setCurrencies(json.data))
      .catch(() => setCurrencies([]))
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1><Link to="/">Catálogo <em>modernizado</em></Link></h1>
        <div className="header-tools">
          {currencies.length > 0 && (
            <select
              className="currency-select"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              aria-label="Moneda"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>{c.code}</option>
              ))}
            </select>
          )}
          <p className="tagline">osCommerce 2.3.4.1 → Laravel 11 + React · Grupo 5</p>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories/:id" element={<CategoryPage currencyCode={currencyCode} />} />
          <Route path="/products/:id" element={<ProductPage currencyCode={currencyCode} />} />
        </Routes>
      </main>
    </div>
  )
}
