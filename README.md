# akrono 🧶🏺

Sistema de ventas de artesanías de la **Universidad de Antioquia**: tienda online bilingüe (ES/EN) para venta **nacional e internacional**, con panel de administración de **producción, ventas y distribución**.

> Versión provisional para evaluar. Marca (nombre, logo, colores) preliminar.

## Deploy en 1 clic

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fstevenvo780%2Fakrono&env=AKRONO_ADMIN_PASSWORD,AKRONO_SECRET&project-name=akrono&repository-name=akrono)

Al importar, define:
- `AKRONO_ADMIN_PASSWORD` — contraseña del panel `/admin` (por defecto `akrono2026`).
- `AKRONO_SECRET` — una cadena larga y secreta para firmar la sesión.

## Qué incluye

**Tienda** (`/`)
- Catálogo de 30 artesanías en 8 categorías, bilingüe (ES→COP, EN→USD).
- Filtro por categoría, buscador, ficha de producto con historia y materiales.
- Carrito y checkout con envío nacional (Colombia) e internacional.

**Panel de administración** (`/admin`, contraseña `akrono2026`)
- **Panel**: métricas de negocio.
- **Pedidos**: ciclo completo (nuevo → pagado → producción → enviado → entregado).
- **Producción**: cola del taller; al terminar, las unidades pasan a stock.
- **Productos**: inventario y estado de cada pieza.
- **Distribución**: envíos con guía automática (Servientrega / DHL).

Ver **[MANUAL-DE-USO.md](./MANUAL-DE-USO.md)** para la guía completa.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4. Capa de datos en memoria autosembrada desde `data/catalog.json` (sin dependencias nativas; lista para conectar una base gestionada).

## Desarrollo local

```bash
npm install --legacy-peer-deps
npm run dev      # http://localhost:3000
```

Build de producción: `npm run build && npm start`.

---
Hecho para las artesanías de la Universidad de Antioquia · Colombia → mundo.
