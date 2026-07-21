# Arquitectura del pre-experimento — cómo conviven el legado y lo modernizado

Pre-experimento de modernización · osCommerce v2.3.4.1 → Laravel 11 + React

Este documento explica la infraestructura del experimento y **todos los puntos
de contacto** entre la aplicación legada y la modernizada. Complementa al
[README](../README.md) (cómo ejecutar) y a la
[matriz de paridad](parity-matrix.md) (qué se replicó y qué no).

## 1. Vista de contenedores

Ambas aplicaciones corren en el mismo host con Docker Compose y comparten una
única base de datos MySQL. El navegador puede consumir cualquiera de las dos
experiencias — o la híbrida (strangler), donde la página legada incrusta los
componentes modernos.

```mermaid
flowchart LR
    B[Navegador]

    subgraph moderno["Stack moderno (:8000)"]
        GW["gateway<br/>nginx"]
        FE["frontend<br/>React SPA estática"]
        API["api<br/>Laravel 11 · PHP-FPM 8.2"]
    end

    subgraph legado["Stack legado (:8080)"]
        WEB["web<br/>Apache + PHP 7.4<br/>osCommerce 2.3.4.1"]
    end

    DB[("db<br/>MySQL 5.7<br/>esquema oscommerce<br/>(compartido)")]

    B -->|"/ (SPA) · /embed/*"| GW
    B -->|"/api/*"| GW
    B -->|"páginas .php"| WEB
    GW -->|"proxy /"| FE
    GW -->|"fastcgi /api"| API
    API -->|"Eloquent/PDO<br/>solo lectura"| DB
    WEB -->|"mysqli<br/>lectura/escritura"| DB
```

Puertos: legado `:8080`, moderno `:8000` (SPA + API), phpMyAdmin `:8082`,
MySQL expuesto en `:3307`. La base se siembra sola en el primer arranque
(`catalog/install/oscommerce.sql` + `docker/extra-reviews.sql` vía
`docker-entrypoint-initdb.d`, con cliente forzado a utf8).

## 2. Puntos de contacto entre las dos aplicaciones

| # | Punto de contacto | Dirección | Mecanismo |
|---|---|---|---|
| 1 | **Base de datos compartida** | ambas ↔ MySQL | La API moderna mapea las tablas legadas con Eloquent **en solo lectura** (sin migraciones, sin tablas propias: sesión `array`, caché `file`). El legado sigue leyendo/escribiendo con `mysqli`. |
| 2 | **Embed strangler** | legado → moderno | Las páginas `index.php` y `product_info.php`, en modo moderno, emiten un `<div>` de montaje + `<script src=":8000/embed/embed.js">`. React se monta dentro del shell legado y consume la API. |
| 3 | **CORS** | navegador → API | El embed corre en el origen `:8080` y llama a `:8000/api/*`; `config/cors.php` autoriza ese origen (solo GET). |
| 4 | **Modo moderno persistente** | legado (sesión) | `catalog/includes/modern_mode.php` guarda la elección en la **sesión osCommerce** (mismo patrón que `currency`/`language`): `?modern=1` activa, `?modern=0` desactiva, y cada página ofrece el enlace de cambio. |
| 5 | **Moneda de sesión** | legado → embed → API | El gate imprime `data-currency="$currency"` (moneda de la sesión legada); el embed la reenvía como `?currency=` y la API convierte con la tabla `currencies`. |
| 6 | **Carrito legado** | moderno → legado | El CTA del embed envía el mismo `POST action=add_product` (con `id[opción]`) que el formulario legado; osCommerce agrega al carrito y continúa a `shopping_cart.php`. El carrito/checkout siguen siendo 100 % legados. |
| 7 | **Imágenes** | moderno → legado | La API devuelve la ruta relativa almacenada; el cliente la resuelve contra `:8080/images/` (el tier web legado sigue sirviendo los assets). |

## 3. Secuencia — R1 en la SPA (arquitectura destino pura)

```mermaid
sequenceDiagram
    actor U as Navegador (SPA React)
    participant G as gateway (nginx)
    participant C as CatalogController
    participant S as ProductService
    participant R as EloquentProductRepository
    participant M as MySQL (tablas legadas)

    U->>G: GET /api/categories/4/products?sort=price&order=desc&currency=EUR
    G->>C: fastcgi → public/index.php (ruta api)
    C->>C: valida sort/order/manufacturer/page/currency
    C->>S: listByCategory(4, ListOptions)
    S->>R: findActiveByCategory(4, opts)
    R->>M: SELECT parametrizado (status=1, p2c, specials, description lang=1)
    M-->>R: filas
    R-->>S: Paginator<Product>
    S-->>C: Paginator<Product>
    C-->>U: JSON {data: ProductResource[], meta, links, currency}
```

La separación Controlador → Servicio → Repositorio (interfaz) → Modelos es la
táctica de modificabilidad del diseño destino: la implementación de acceso a
datos puede sustituirse y el servicio se prueba sin base de datos.

## 4. Secuencia — modo strangler (híbrido dentro del legado)

```mermaid
sequenceDiagram
    actor U as Navegador
    participant L as Legado :8080 (product_info.php)
    participant G as gateway :8000
    participant A as API Laravel
    participant M as MySQL compartido

    U->>L: GET product_info.php?products_id=1&modern=1
    L->>L: modern_mode.php registra el modo en la sesión
    L-->>U: shell legado + div montaje (data-currency) + embed.js
    U->>G: GET /embed/embed.js · embed.css
    U->>G: GET /api/products/1?currency=USD (CORS desde :8080)
    G->>A: fastcgi
    A->>M: consultas parametrizadas
    A-->>U: JSON (ficha + opciones + reseñas)
    Note over U: React renderiza la ficha moderna dentro del shell legado
    U->>L: POST action=add_product (products_id, id[opción])
    L->>M: $cart->add_cart(...)
    L-->>U: 302 → shopping_cart.php (carrito legado)
```

La navegación posterior ya no necesita `?modern=1`: el flag vive en la sesión
osCommerce hasta que el usuario vuelve a la versión clásica.

## 5. Clases — componente Catálogo (API)

```mermaid
classDiagram
    class CatalogController {
        +categoryProducts(Request, id)
        +show(Request, id)
        +reviews(id)
        +currencies()
    }
    class ProductService {
        +listByCategory(id, ListOptions)
        +getById(id)
        +reviewsFor(id)
    }
    class CurrencyService {
        +resolve(code)
        +list()
    }
    class ProductRepositoryInterface {
        <<interface>>
        +findActiveByCategory(id, opts)
        +findActiveById(id)
        +findApprovedReviews(id)
    }
    class EloquentProductRepository
    class CurrencyRepositoryInterface {
        <<interface>>
        +all()
        +findByCode(code)
    }
    class EloquentCurrencyRepository
    class Product
    class ProductDescription
    class Category
    class Special
    class ProductImage
    class ProductAttribute
    class Review
    class Manufacturer

    CatalogController --> ProductService
    CatalogController --> CurrencyService
    ProductService --> ProductRepositoryInterface
    CurrencyService --> CurrencyRepositoryInterface
    ProductRepositoryInterface <|.. EloquentProductRepository
    CurrencyRepositoryInterface <|.. EloquentCurrencyRepository
    EloquentProductRepository --> Product
    Product --> ProductDescription : description (lang)
    Product --> Category : products_to_categories
    Product --> Special : status=1
    Product --> ProductImage
    Product --> ProductAttribute : opción/valor (lang)
    Product --> Review
    Product --> Manufacturer
```

## 6. Decisiones que mantienen a salvo al legado

- **La API nunca escribe**: todos los modelos son de solo lectura y el
  contador `products_viewed` se descarta deliberadamente (GET sin efectos).
- **Cero tablas nuevas** en el esquema compartido: Laravel usa sesión `array`
  y caché en archivo; no se ejecutan migraciones.
- **Gates reversibles**: sin el modo moderno en sesión, las páginas legadas
  son idénticas al original (verificado en la compuerta de paridad
  `scripts/parity-check.sh`, que compara SQL legado vs API sobre la misma
  base).
- **Rollout real**: en producción esta segmentación se movería al borde
  (cookie + routing en el gateway) para habilitar cohortes y rollback
  instantáneo; la sesión osCommerce es su equivalente dentro del alcance del
  pre-experimento.
