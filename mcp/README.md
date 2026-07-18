# Servidor MCP para akrono

Servidor Model Context Protocol (MCP) autocontenido para la plataforma e-commerce multi-tienda **akrono**.

Expone herramientas para crear/editar tiendas y productos, y consultar/gestionar pedidos, llamando a una API REST HTTP.

## Requisitos

- Node.js >= 18
- Acceso a la API REST de akrono (variables de entorno con credenciales)

## Instalación

```bash
cd /workspace/akrono/mcp
npm install
# O con pnpm desde la raíz:
pnpm install --filter akrono-mcp
```

## Configuración

El servidor se configura mediante **variables de entorno**:

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `AKRONO_BASE_URL` | `http://localhost:3000` | URL base del sitio akrono |
| `AKRONO_API_KEY` | _(requerido)_ | Token Bearer para autenticación en todas las llamadas |

### Ejemplo de inicio

```bash
export AKRONO_BASE_URL=https://akrono.example.com
export AKRONO_API_KEY=tu_token_secreto_aqui
npm start
```

El servidor inicia usando **stdio** (entrada/salida estándar), típico para integraciones MCP.

## Integración con Claude

Para añadir este servidor a un cliente MCP (como Claude Desktop o similar), añade un bloque `mcpServers` a tu configuración:

```json
{
  "mcpServers": {
    "akrono": {
      "command": "node",
      "args": ["/workspace/akrono/mcp/server.mjs"],
      "env": {
        "AKRONO_BASE_URL": "https://akrono.example.com",
        "AKRONO_API_KEY": "tu_token_secreto_aqui"
      }
    }
  }
}
```

## Herramientas disponibles

El servidor expone 11 herramientas:

### Tiendas

- **`listar_tiendas`** — Obtiene la lista de todas las tiendas.
- **`crear_tienda`** — Crea una nueva tienda (requiere `slug` y `name`).
- **`obtener_tienda`** — Obtiene la configuración de una tienda específica.
- **`actualizar_tienda`** — Actualiza parcialmente la configuración de una tienda.

### Productos

- **`listar_productos`** — Obtiene la lista de productos de una tienda.
- **`subir_producto`** — Crea o actualiza un producto (upsert por slug).
- **`eliminar_producto`** — Elimina un producto.

### Categorías

- **`subir_categoria`** — Crea o actualiza una categoría (upsert por slug).

### Pedidos

- **`listar_pedidos`** — Obtiene la lista de pedidos de una tienda.
- **`actualizar_pedido`** — Actualiza el estado o estado de pago de un pedido.

### Estadísticas

- **`estadisticas`** — Obtiene métricas de una tienda.

## Estructura de datos

### Producto

```json
{
  "slug": "string",
  "name_es": "string",
  "name_en": "string",
  "category": "string",
  "description_es": "string",
  "description_en": "string",
  "story_es": "string",
  "story_en": "string",
  "price_cop": 0,
  "price_usd": 0,
  "stock": 0,
  "production_time_days": 0,
  "materials_es": ["string"],
  "materials_en": ["string"],
  "weight_grams": 0,
  "featured": false
}
```

### Categoría

```json
{
  "slug": "string",
  "name_es": "string",
  "name_en": "string",
  "description_es": "string",
  "description_en": "string"
}
```

### Configuración de tienda

```json
{
  "slug": "string",
  "name": "string",
  "url": "string",
  "locale_default": "es|en",
  "tagline_es": "string",
  "tagline_en": "string",
  "description_es": "string",
  "description_en": "string",
  "keywords": ["string"],
  "logo": { "type": "...", "text": "...", "orbit_dot": true, "isotype": true },
  "colors": { "primary": "...", "primaryDark": "...", "ink": "...", "accent": "...", "success": "...", "cream": "...", "line": "..." },
  "fonts": { "display": "...", "sans": "..." },
  "currencies": ["string"],
  "contact": { "email": "string", "phone": "string", "instagram": "string", "city": "string" },
  "shipping": { "free_national_over_cop": 0, "flat_national_cop": 0, "international_usd": 0 }
}
```

## Flujo de error

Todos los errores se devuelven como mensajes de texto plano con formato:
- **Errores de conexión**: `Error: Fallo de conexión a {url}: {mensaje}`
- **Errores HTTP**: `HTTP {código}: {mensaje_de_error}`
- **Errores de validación**: `Error: {descripción}`

## Desarrollo

Verificar sintaxis:

```bash
node --check server.mjs
```

## Licencia

Privado — Parte del proyecto akrono (Isa).
