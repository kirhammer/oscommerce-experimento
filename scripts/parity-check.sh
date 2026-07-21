#!/usr/bin/env bash
# Compuerta de paridad legado ↔ modernizado.
#
# Ejecuta, sobre la MISMA base de datos, el SQL que usan las páginas legadas
# (index.php / product_info.php) y los endpoints modernos, y compara los
# resultados producto a producto:
#   R1: para TODAS las categorías, ids + nombres + precio final (con oferta)
#   R2: para TODOS los productos activos, campos de la ficha
#   Bordes: categoría sin productos → lista vacía; id inexistente → 404;
#           producto inactivo → 404 (se desactiva y restaura temporalmente)
#
# Sale con código ≠ 0 ante cualquier discrepancia. Requiere el stack de
# docker compose arriba (db + gateway/api).
set -uo pipefail
cd "$(dirname "$0")/.."

API_BASE="${API_BASE:-http://localhost:8000}"
LANGUAGE_ID="${LANGUAGE_ID:-1}"
failures=0

sql() {
  docker compose exec -T db mysql -uoscommerce -poscommerce oscommerce \
    --batch --skip-column-names -e "$1" 2>/dev/null
}

fail() {
  failures=$((failures + 1))
  echo "  ✗ $1"
}

ok() {
  echo "  ✓ $1"
}

# Descarga todas las páginas del listado moderno como líneas "id|nombre|precio_final".
api_listing() {
  python3 - "$API_BASE" "$1" <<'PY'
import json, sys, urllib.request

base, cat = sys.argv[1], sys.argv[2]
page, rows = 1, []
while True:
    with urllib.request.urlopen(f"{base}/api/categories/{cat}/products?page={page}") as res:
        payload = json.load(res)
    for p in payload["data"]:
        rows.append(f"{p['id']}|{p['name']}|{p['final_price']:.2f}")
    if page >= payload["meta"]["last_page"]:
        break
    page += 1
print("\n".join(rows))
PY
}

api_detail() {
  curl -s "$API_BASE/api/products/$1" | python3 -c "
import json, sys
d = json.load(sys.stdin)['data']
print(f\"{d['id']}|{d['name']}|{d['model'] or ''}|{d['price']:.2f}|{d['final_price']:.2f}|{d['quantity']}\")
"
}

http_code() {
  curl -s -o /dev/null -w "%{http_code}" "$1"
}

echo "== R1: listado por categoría — SQL legado vs GET /api/categories/{id}/products =="
for cat in $(sql "SELECT DISTINCT categories_id FROM products_to_categories ORDER BY 1"); do
  legacy=$(sql "
    SELECT CONCAT(p.products_id, '|', pd.products_name, '|',
                  ROUND(IF(s.status = 1, s.specials_new_products_price, p.products_price), 2))
    FROM products p
    JOIN products_to_categories p2c ON p2c.products_id = p.products_id
    JOIN products_description pd ON pd.products_id = p.products_id
      AND pd.language_id = $LANGUAGE_ID
    LEFT JOIN specials s ON s.products_id = p.products_id AND s.status = 1
    WHERE p.products_status = 1 AND p2c.categories_id = $cat
    ORDER BY p.products_id")
  modern=$(api_listing "$cat" | sort -t'|' -k1,1n)
  legacy_sorted=$(echo "$legacy" | sort -t'|' -k1,1n)
  if [ "$legacy_sorted" = "$modern" ]; then
    ok "categoría $cat: $(echo "$legacy" | grep -c '|') productos idénticos"
  else
    fail "categoría $cat difiere:"
    diff <(echo "$legacy_sorted") <(echo "$modern") | sed 's/^/    /'
  fi
done

echo "== R2: detalle — SQL legado vs GET /api/products/{id} =="
detail_fail=0
for pid in $(sql "SELECT products_id FROM products WHERE products_status = 1 ORDER BY 1"); do
  legacy=$(sql "
    SELECT CONCAT(p.products_id, '|', pd.products_name, '|', IFNULL(p.products_model, ''), '|',
                  ROUND(p.products_price, 2), '|',
                  ROUND(IF(s.status = 1, s.specials_new_products_price, p.products_price), 2), '|',
                  p.products_quantity)
    FROM products p
    JOIN products_description pd ON pd.products_id = p.products_id
      AND pd.language_id = $LANGUAGE_ID
    LEFT JOIN specials s ON s.products_id = p.products_id AND s.status = 1
    WHERE p.products_status = 1 AND p.products_id = $pid")
  modern=$(api_detail "$pid")
  if [ "$legacy" != "$modern" ]; then
    detail_fail=1
    fail "producto $pid difiere: legado[$legacy] moderno[$modern]"
  fi
done
[ "$detail_fail" -eq 0 ] && ok "todos los productos activos coinciden campo a campo"

echo "== Casos borde =="
empty_cat=$(sql "
  SELECT c.categories_id FROM categories c
  LEFT JOIN products_to_categories p2c ON p2c.categories_id = c.categories_id
  WHERE p2c.products_id IS NULL LIMIT 1")
if [ -n "$empty_cat" ]; then
  if [ -z "$(api_listing "$empty_cat")" ]; then
    ok "categoría $empty_cat sin productos → lista vacía"
  else
    fail "categoría $empty_cat sin productos devolvió elementos"
  fi
fi

if [ "$(api_listing 999999)" = "" ]; then
  ok "categoría inexistente → lista vacía"
else
  fail "categoría inexistente devolvió elementos"
fi

code=$(http_code "$API_BASE/api/products/999999")
[ "$code" = "404" ] && ok "producto inexistente → 404" || fail "producto inexistente devolvió $code"

probe=$(sql "SELECT products_id FROM products WHERE products_status = 1 LIMIT 1")
sql "UPDATE products SET products_status = 0 WHERE products_id = $probe" >/dev/null
code=$(http_code "$API_BASE/api/products/$probe")
sql "UPDATE products SET products_status = 1 WHERE products_id = $probe" >/dev/null
[ "$code" = "404" ] && ok "producto inactivo → 404 (probado con id $probe, restaurado)" \
  || fail "producto inactivo devolvió $code"

echo
if [ "$failures" -eq 0 ]; then
  echo "PARIDAD OK — legado y modernizado devuelven la misma información."
  exit 0
else
  echo "PARIDAD FALLIDA — $failures discrepancia(s)."
  exit 1
fi
