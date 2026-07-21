# Pre-experimento de modernización — osCommerce v2.3.4.1

Curso: Modernización de Software · Grupo 5

Este repositorio contiene el **pre-experimento** de modernización: el legado
osCommerce v2.3.4.1 (PHP 7.4 procedimental) conviviendo **lado a lado** con la
modernización de dos requisitos del catálogo (REQ-01) sobre la arquitectura
destino — API REST en **Laravel 11** (PHP 8.2, arquitectura en capas) y
frontend **React** desacoplado — compartiendo la misma base de datos MySQL.

- **R1** · `GET /api/categories/{id}/products` — productos activos de una
  categoría (JSON; lista vacía si no hay; soporta `?sort=`, `?order=`,
  `?manufacturer=`, `?page=`)
- **R2** · `GET /api/products/{id}` — detalle de producto (JSON; **404** si no
  existe o está inactivo)

## Arquitectura del experimento

```
:8080  web       Apache + PHP 7.4      → legado intacto (catalog/)
:8000  gateway   nginx                 → /api  → api (PHP-FPM 8.2 · Laravel 11)
                                       → /     → frontend (React SPA estática)
:3307  db        MySQL 5.7             → base compartida `oscommerce` (auto-seed)
:8082  phpmyadmin
```

Capas de la API (`modern/api/`): Ruta → `CatalogController` →
`ProductService` → `ProductRepositoryInterface` / `EloquentProductRepository`
→ Modelos Eloquent mapeados a las tablas legadas → `ProductResource` /
`ProductDetailResource`. Consultas 100 % parametrizadas (Eloquent/PDO), sin
SQL concatenado; configuración por `.env` en lugar de `define()`.

## Puesta en marcha

Requisitos: Docker Desktop (con emulación amd64 para MySQL 5.7 en Apple
Silicon).

```bash
# 1. Dependencias de la API (una sola vez; usa el contenedor de composer)
docker run --rm -v "$PWD/modern/api":/app -w /app composer:2 sh -c \
  "composer install --no-interaction && cp -n .env.example .env && php artisan key:generate"
chmod -R 777 modern/api/storage modern/api/bootstrap/cache

# 2. Levantar todo (la base se auto-siembra con los datos de ejemplo en el primer arranque)
docker compose up -d --build
```

| URL | Qué es |
|---|---|
| http://localhost:8080 | Tienda **legada** (sin cambios de comportamiento) |
| http://localhost:8000 | **SPA moderna** (listado + detalle) |
| http://localhost:8000/api/categories/4/products | R1 (categoría 4 = Graphics Cards) |
| http://localhost:8000/api/products/1 | R2 |
| http://localhost:8082 | phpMyAdmin (root/root) |

## Demo strangler (embed en el legado)

Las dos páginas legadas aceptan el flag `?modern=1`: conservan su shell
(header, breadcrumb, columnas, carrito) pero el bloque de contenido del
catálogo lo renderiza el componente React moderno consumiendo la API (CORS
habilitado). Sin el flag, el comportamiento legado es idéntico al original.

- http://localhost:8080/index.php?cPath=1_4&modern=1
- http://localhost:8080/product_info.php?products_id=1&modern=1

## Paridad funcional

- **Matriz de paridad**: [`docs/parity-matrix.md`](docs/parity-matrix.md) —
  inventario completo de comportamientos de `index.php` y `product_info.php`
  con veredicto explícito (API / SPA / embed / fuera de alcance justificado).
- **Compuerta empírica**: `./scripts/parity-check.sh` ejecuta el SQL legado y
  los endpoints modernos sobre la misma base y compara producto a producto
  (todas las categorías, todos los productos, casos borde). Sale ≠ 0 ante
  cualquier discrepancia.

## Alcance

El alcance de datos es un **superconjunto** de lo que muestran las vistas
legadas (precio de oferta, atributos con ajuste de precio, galería, fecha de
disponibilidad, conteo de reseñas). Quedan fuera, documentados en la matriz,
los subsistemas transversales que pertenecen a otros requisitos (carrito,
clientes, órdenes, impuestos/multimoneda) y el contador `products_viewed`
(un GET moderno no tiene efectos secundarios). Este alcance excede la
estimación original de 13 puntos del documento del pre-experimento
(parámetros de listado, atributos, galería, reseñas y embed son adiciones).

---

Documentación original de osCommerce: http://www.oscommerce.com
