# Matriz de paridad funcional — legado vs. modernizado

Pre-experimento de modernización · osCommerce v2.3.4.1 → Laravel 11 + React

Esta matriz inventaría **todos** los comportamientos de las dos vistas legadas
alcanzadas por los requisitos R1 (listado por categoría) y R2 (detalle de
producto), y asigna a cada uno un veredicto explícito. Nada se descarta en
silencio: cada comportamiento está **replicado** (en la API, en la SPA o en el
embed strangler) o **fuera de alcance** con su justificación, alineada con los
límites de los requisitos de la Semana 2 (REQ-01 Catálogo; carrito, clientes,
órdenes y reseñas son requisitos aparte).

Tipos: **DATO** = afecta la información devuelta sobre productos ·
**PRESENTACIÓN** = render HTML, navegación, sesión o carrito.

## Veredictos posibles

| Veredicto | Significado |
|---|---|
| **API** | Replicado por los endpoints REST (`/api/categories/{id}/products`, `/api/products/{id}`) |
| **SPA** | Replicado por el frontend React (consumiendo la API) |
| **Embed** | Disponible en el demo strangler (`?modern=1`) dentro de la página legada |
| **Fuera de alcance** | No replicado deliberadamente; se indica el porqué |

## 1. `catalog/index.php` — listado de productos por categoría

| Comportamiento legado | Ref. | Tipo | Veredicto | Cómo / por qué |
|---|---|---|---|---|
| Filtrado por categoría vía `products_to_categories` | index.php:138-156 | DATO | **API** | `whereHas('categories', ...)` en `EloquentProductRepository::findActiveByCategory` |
| Solo productos activos (`products_status = 1`) | index.php:140-155 | DATO | **API** | scope `Product::active()` |
| Nombre por idioma (`products_description.language_id`) | index.php:140-155 | DATO | **API** | relación `description()` restringida a `catalog.language_id` |
| Precio final con oferta (`IF(s.status, specials_new_products_price, products_price)`) | index.php:140-155 | DATO | **API** | relación `special()` + campos `price`, `special_price`, `final_price` del recurso |
| Clase de impuesto (`products_tax_class_id`) | index.php:140-155 | DATO | **API** | campo `tax_class_id` del recurso |
| Columnas modelo / nombre / fabricante / cantidad / peso / imagen | index.php:96-136 | DATO | **API** | todos presentes en `ProductResource` (superconjunto: no depende de los flags `PRODUCT_LIST_*`) |
| Orden por nombre (default) y por modelo/precio/cantidad/peso/fabricante, asc/desc | index.php:158-190 | PRESENTACIÓN | **API + SPA** | parámetros `?sort=` y `?order=` (whitelist) con precio ordenando por `final_price` como el legado; controles en la SPA |
| Paginación (`MAX_DISPLAY_SEARCH_RESULTS`, splitPageResults) | product_listing.php:13-26 | PRESENTACIÓN | **API + SPA** | `paginate(catalog.page_size=20)` con `meta`/`links`; además el endpoint expone la colección completa página a página (sin pérdida de información) |
| Filtro por fabricante dentro de la categoría (`filter_id`) | index.php:213-236 | PRESENTACIÓN | **API + SPA** | parámetro `?manufacturer=` + dropdown en la SPA |
| Lista vacía → mensaje "no hay productos" | product_listing.php:151 | PRESENTACIÓN | **API + SPA** | `data: []` + estado vacío en la SPA |
| Precio de oferta con tachado del precio base | product_listing.php:114-119 | PRESENTACIÓN | **SPA / Embed** | render `<s>precio</s> precio_oferta` a partir de `special_price`/`final_price` |
| Nombre/imagen como enlace a la ficha | product_listing.php:104-132 | PRESENTACIÓN | **SPA / Embed** | tarjeta enlazada a `/products/{id}` (SPA) o `product_info.php?...&modern=1` (embed) |
| Botón "Buy Now" | product_listing.php:134-135 | PRESENTACIÓN | **Embed** / Fuera de alcance en SPA | el embed enlaza a `index.php?action=buy_now...` (el carrito es legado); el carrito pertenece a otro requisito (REQ carrito/checkout) |
| Visualización de precio con impuestos y moneda (`currencies->display_price`, `tep_get_tax_rate`) | product_listing.php:116-119 | PRESENTACIÓN | Fuera de alcance | motor de impuestos/multimoneda es transversal a la tienda (otro requisito); la API entrega el precio base y `tax_class_id` para calcularlo |
| Rama por fabricante (`manufacturers_id` como página propia) | index.php:138-156 | DATO | Fuera de alcance | R1 se define por categoría; el parámetro `?manufacturer=` cubre el filtrado equivalente dentro de la categoría |
| Grid de subcategorías cuando la categoría tiene hijas | index.php:37-84 | PRESENTACIÓN | Fuera de alcance | navegación del árbol de categorías, no información de productos (R1); la SPA navega por id |
| Breadcrumb / encabezado con nombre de categoría | application_top.php:460-492, index.php:195-204 | PRESENTACIÓN | Fuera de alcance (shell) | el shell de navegación permanece legado en el embed y es responsabilidad del router en la SPA |
| Módulos `new_products` / `upcoming_products` (página default sin categoría) | index.php:244-266 | DATO/PRESENTACIÓN | Fuera de alcance | pertenecen a la página de inicio, no al listado por categoría (R1) |
| Saludo al cliente (`tep_customer_greeting`) | index.php:244-251 | PRESENTACIÓN | Fuera de alcance | requiere sesión/clientes (otro requisito) |

## 2. `catalog/product_info.php` — detalle de producto

| Comportamiento legado | Ref. | Tipo | Veredicto | Cómo / por qué |
|---|---|---|---|---|
| Verificación de existencia con `products_status = 1` | product_info.php:21-22 | DATO | **API** | `findActiveById` devuelve null → **404** (criterio R2: inexistente o inactivo) |
| Ficha: id, nombre, descripción, modelo, cantidad, imagen, url, precio, tax_class, fechas, fabricante | product_info.php:41 | DATO | **API** | todos los campos en `ProductDetailResource` |
| Precio de oferta (`tep_get_products_special_price`) con tachado | product_info.php:46-50 | DATO | **API + SPA/Embed** | `special_price`/`final_price` + render con `<s>` |
| Atributos/opciones con ajuste de precio (`products_options`, `products_attributes`, `products_options_values`) | product_info.php:159-192 | DATO | **API + SPA/Embed** | `options[] { name, values[] { name, price_adjustment, price_prefix } }` agrupados por opción como los dropdowns legados |
| Galería de imágenes (`products_images`, sort_order, htmlcontent) | product_info.php:70-122 | DATO | **API + SPA/Embed** | `images[] { image, html_content, sort_order }` |
| Mensaje de disponibilidad futura (`products_date_available`) | product_info.php:198-204 | DATO | **API + SPA/Embed** | campo `date_available` + aviso "Expected availability" |
| Conteo de reseñas aprobadas (`reviews_status = 1`) | product_info.php:210-217 | DATO | **API + SPA/Embed** | `reviews_count` vía `withCount` filtrado |
| Enlace "más información" (`products_url`) | product_info.php (ficha) | DATO | **API + SPA/Embed** | campo `url` |
| Contador de vistas (`products_viewed = products_viewed+1`) | product_info.php:44 | DATO | Fuera de alcance (deliberado) | mejora REST documentada: un GET no debe tener efectos secundarios; el dato no es visible en la página |
| Redirect a home si falta `products_id` | product_info.php:15-17 | PRESENTACIÓN | Fuera de alcance | la ruta REST exige `{id}` numérico (`whereNumber`); sin id no hay ruta |
| Mensaje "producto no encontrado" + botón continuar | product_info.php:26-37 | PRESENTACIÓN | **API + SPA** | 404 JSON + estado de error en la SPA/embed |
| Formulario añadir al carrito / botón "In Cart" | product_info.php:59, 215 | PRESENTACIÓN | **Embed** / Fuera de alcance en SPA | el embed enlaza al carrito legado (`action=buy_now`); carrito = otro requisito |
| Lightbox/photoset (colorbox, photosetGrid) | product_info.php:124-154 | PRESENTACIÓN | Fuera de alcance | efecto visual del tema legado; la galería (datos) sí está replicada |
| Módulo "también compraron" (`also_purchased`, join con órdenes) | product_info.php:221-225 | DATO | Fuera de alcance | depende del dominio de órdenes (otro requisito) |
| Caja de info del fabricante (box lateral) | bm_manufacturer_info.php | PRESENTACIÓN | Parcial (**API**) | `manufacturer {id, name}` está en la API; la caja lateral es shell legado |
| Notificaciones de producto (suscripción del cliente) | bm_product_notifications.php | DATO | Fuera de alcance | requiere sesión de cliente (otro requisito) |
| Tell-a-friend / social bookmarks | sb_email.php | PRESENTACIÓN | Fuera de alcance | funcionalidad social ajena al catálogo |
| Breadcrumb (categoría → producto) | application_top.php:460-492 | PRESENTACIÓN | Fuera de alcance (shell) | permanece legado en el embed; navegación del router en la SPA |

## 3. Verificación empírica

La equivalencia de los comportamientos **DATO** no se afirma: se comprueba.
`scripts/parity-check.sh` ejecuta, sobre la **misma base de datos**, el SQL
legado y los endpoints modernos, y compara los resultados producto a producto
(ids, nombres, precio final) para **todas** las categorías y **todos** los
productos, además de los casos borde (categoría sin productos → `data: []`,
id inexistente o inactivo → 404). El script termina con código ≠ 0 ante
cualquier discrepancia y se usa como compuerta de aceptación.
