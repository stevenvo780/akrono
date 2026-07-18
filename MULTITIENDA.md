# akrono · Plataforma multi-tienda (multi-tenant)

akrono no es "una tienda": es una **plataforma** que sirve muchas tiendas desde
un solo despliegue. Cada tienda tiene su marca, su catálogo, su carrito, su panel
y sus datos — todo aislado por tienda en una única base de datos.

## Cómo funciona

- **Una BD, muchas tiendas.** Tablas `stores`, `categories`, `products`,
  `orders`, `shipments`, todo con `store_slug`. Aislamiento total por tienda
  (los pedidos de una no se ven en otra; cada tienda numera sus pedidos con su
  propio prefijo: `AKR-1001`, `LUM-1001`, …). Ver `src/lib/store.ts`.
- **Ruteo por tienda.** Las URLs viven bajo `/[store]/…`:
  - `/` → landing de la plataforma (lista las tiendas).
  - `/<tienda>` → home de esa tienda; `/<tienda>/tienda`, `/producto/…`,
    `/carrito`, `/checkout`, `/pedido/…`, `/seguimiento`.
  - `/<tienda>/admin` → panel de gestión de esa tienda.
  - (Con dominio propio, se puede mapear `tienda.dominio.com` → `/tienda` por
    middleware sin tocar los datos.)
- **Identidad por tienda.** `src/app/[store]/layout.tsx` resuelve la tienda desde
  la BD e inyecta su paleta (7 colores) y tipografías como variables CSS. La marca
  (logo/isotipo, colores, fuentes, textos) sale de la config de cada tienda.
- **Catálogo editable en vivo.** Productos y categorías viven en la BD; se crean y
  editan por API/MCP **sin re-desplegar**.

## Subir cosas por API (REST v1)

Autenticación: header `Authorization: Bearer $AKRONO_API_KEY`. Base: `/api/v1`.

| Método | Ruta | Acción |
|---|---|---|
| GET  | `/api/v1/stores` | listar tiendas |
| POST | `/api/v1/stores` | crear tienda (`{slug, name, ...}`) |
| GET/PATCH | `/api/v1/stores/:slug` | ver / editar config |
| GET/POST | `/api/v1/stores/:slug/products` | listar / subir producto (upsert) |
| DELETE | `/api/v1/stores/:slug/products/:pslug` | eliminar producto |
| GET/POST | `/api/v1/stores/:slug/categories` | listar / subir categoría |
| GET | `/api/v1/stores/:slug/orders` | listar pedidos |
| PATCH | `/api/v1/stores/:slug/orders/:id` | cambiar estado / pago |
| GET | `/api/v1/stores/:slug/stats` | métricas |

Ejemplo — crear tienda y subir un producto (queda LIVE al instante):
```bash
curl -X POST $URL/api/v1/stores -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"slug":"mi-tienda","name":"Mi Tienda","colors":{"primary":"#0EA5E9"}}'

curl -X POST $URL/api/v1/stores/mi-tienda/products -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"slug":"p1","name_es":"Producto","name_en":"Product","category":"cat","price_cop":50000,"price_usd":13,"stock":8}'
# → /mi-tienda ya responde con el producto, sin re-deploy
```

## Subir cosas por MCP

`mcp/` es un servidor MCP (Model Context Protocol) que envuelve la API v1. Se
configura con `AKRONO_BASE_URL` y `AKRONO_API_KEY` y expone herramientas:
`crear_tienda`, `actualizar_tienda`, `listar_tiendas`, `obtener_tienda`,
`subir_producto`, `listar_productos`, `eliminar_producto`, `subir_categoria`,
`listar_pedidos`, `actualizar_pedido`, `estadisticas`. Ver `mcp/README.md`.

Con esto se puede administrar toda la plataforma conversacionalmente: "creá una
tienda para tal cliente con estos colores y subí estos productos".

## Config de una tienda (StoreConfig)

`name`, `tagline_es/en`, `description_es/en` (SEO), `keywords`,
`logo` (`type: wordmark|svg`, `text`, `isotype: crescent|monogram|dot`, `svg`),
`colors` (`primary, primaryDark, ink, accent, success, cream, line`),
`fonts` (display: `MuseoModerno|Fraunces|Playfair Display|Sora`; sans:
`Poppins|Inter|Work Sans`), `currencies`, `contact`, `shipping`.

## Semilla y variables de entorno

- Tiendas iniciales sembradas desde `src/tienda/registry.ts` (akrono + Lumbre de
  ejemplo). Cada una en `tiendas/<slug>/{config,catalog}.json`.
- Env: `AKRONO_API_KEY` (API/MCP), `AKRONO_ADMIN_PASSWORD` (panel), `AKRONO_SECRET`
  (sesiones admin), `AKRONO_DB` (ruta SQLite; en Vercel serverless `/tmp` es
  efímero → para producción migrar `src/lib/store.ts` a Vercel Postgres o Turso).

## Panel

Panel de gestión por tienda en `/<tienda>/admin` (clave `AKRONO_ADMIN_PASSWORD`):
pedidos, pagos, producción, inventario, distribución/envíos y analítica.
