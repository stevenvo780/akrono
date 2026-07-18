import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Configuración desde variables de entorno
const AKRONO_BASE_URL = process.env.AKRONO_BASE_URL || "http://localhost:3000";
const AKRONO_API_KEY = process.env.AKRONO_API_KEY || "";

/**
 * Helper para hacer llamadas a la API REST.
 * Añade headers de autenticación, maneja errores y parsea respuestas.
 *
 * @param {string} method - Método HTTP (GET, POST, PATCH, DELETE)
 * @param {string} path - Ruta relativa (ej: /api/v1/stores)
 * @param {object} body - Cuerpo de la solicitud (opcional)
 * @returns {Promise<object>} Respuesta parseada como JSON
 * @throws {Error} Si la llamada falla
 */
async function api(method, path, body = null) {
  const url = `${AKRONO_BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${AKRONO_API_KEY}`,
  };

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, options);
  } catch (err) {
    throw new Error(`Fallo de conexión a ${url}: ${err.message}`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    const text = await response.text();
    throw new Error(`Respuesta inválida (HTTP ${response.status}): ${text}`);
  }

  if (!response.ok) {
    const errorMsg = data.error || data.message || JSON.stringify(data);
    throw new Error(`HTTP ${response.status}: ${errorMsg}`);
  }

  return data;
}

// Crear instancia del servidor MCP
const server = new Server(
  { name: "akrono-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

/**
 * Herramienta: Listar todas las tiendas
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "listar_tiendas":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await api("GET", "/api/v1/stores"), null, 2),
            },
          ],
        };

      case "crear_tienda": {
        const { slug, name, ...rest } = args;
        if (!slug || !name) {
          throw new Error("slug y name son requeridos");
        }
        const body = { slug, name, ...rest };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await api("POST", "/api/v1/stores", body),
                null,
                2
              ),
            },
          ],
        };
      }

      case "obtener_tienda": {
        const { slug } = args;
        if (!slug) throw new Error("slug es requerido");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await api("GET", `/api/v1/stores/${slug}`),
                null,
                2
              ),
            },
          ],
        };
      }

      case "actualizar_tienda": {
        const { slug, patch } = args;
        if (!slug || !patch) {
          throw new Error("slug y patch son requeridos");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await api("PATCH", `/api/v1/stores/${slug}`, patch),
                null,
                2
              ),
            },
          ],
        };
      }

      case "listar_productos": {
        const { store } = args;
        if (!store) throw new Error("store es requerido");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await api("GET", `/api/v1/stores/${store}/products`),
                null,
                2
              ),
            },
          ],
        };
      }

      case "subir_producto": {
        const { store, producto } = args;
        if (!store || !producto) {
          throw new Error("store y producto son requeridos");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await api("POST", `/api/v1/stores/${store}/products`, producto),
                null,
                2
              ),
            },
          ],
        };
      }

      case "eliminar_producto": {
        const { store, slug } = args;
        if (!store || !slug) {
          throw new Error("store y slug son requeridos");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await api("DELETE", `/api/v1/stores/${store}/products/${slug}`),
                null,
                2
              ),
            },
          ],
        };
      }

      case "subir_categoria": {
        const { store, categoria } = args;
        if (!store || !categoria) {
          throw new Error("store y categoria son requeridos");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await api(
                  "POST",
                  `/api/v1/stores/${store}/categories`,
                  categoria
                ),
                null,
                2
              ),
            },
          ],
        };
      }

      case "listar_pedidos": {
        const { store } = args;
        if (!store) throw new Error("store es requerido");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await api("GET", `/api/v1/stores/${store}/orders`),
                null,
                2
              ),
            },
          ],
        };
      }

      case "actualizar_pedido": {
        const { store, id, status, payment_status } = args;
        if (!store || !id) {
          throw new Error("store e id son requeridos");
        }
        const body = {};
        if (status !== undefined) body.status = status;
        if (payment_status !== undefined) body.payment_status = payment_status;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await api("PATCH", `/api/v1/stores/${store}/orders/${id}`, body),
                null,
                2
              ),
            },
          ],
        };
      }

      case "estadisticas": {
        const { store } = args;
        if (!store) throw new Error("store es requerido");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await api("GET", `/api/v1/stores/${store}/stats`),
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${err.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Registrar las herramientas disponibles
 */
server.setRequestHandler(ListToolsRequestSchema, () => {
  return {
    tools: [
      {
        name: "listar_tiendas",
        description: "Obtiene la lista de todas las tiendas configuradas",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "crear_tienda",
        description: "Crea una nueva tienda o actualiza una existente",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "Identificador único de la tienda" },
            name: { type: "string", description: "Nombre de la tienda" },
            url: { type: "string", description: "URL de la tienda (opcional)" },
            locale_default: {
              type: "string",
              enum: ["es", "en"],
              description: "Idioma por defecto (opcional)",
            },
            tagline_es: { type: "string", description: "Lema en español (opcional)" },
            tagline_en: { type: "string", description: "Lema en inglés (opcional)" },
            description_es: { type: "string", description: "Descripción en español (opcional)" },
            description_en: { type: "string", description: "Descripción en inglés (opcional)" },
            keywords: {
              type: "array",
              items: { type: "string" },
              description: "Palabras clave SEO (opcional)",
            },
            logo: {
              type: "object",
              description: "Configuración del logo (opcional)",
            },
            colors: {
              type: "object",
              description: "Configuración de colores (opcional)",
            },
            fonts: {
              type: "object",
              description: "Configuración de tipografías (opcional)",
            },
            currencies: {
              type: "array",
              items: { type: "string" },
              description: "Monedas soportadas (opcional)",
            },
            contact: {
              type: "object",
              description: "Información de contacto (opcional)",
            },
            shipping: {
              type: "object",
              description: "Configuración de envío (opcional)",
            },
          },
          required: ["slug", "name"],
        },
      },
      {
        name: "obtener_tienda",
        description: "Obtiene la configuración completa de una tienda específica",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "Identificador de la tienda" },
          },
          required: ["slug"],
        },
      },
      {
        name: "actualizar_tienda",
        description: "Actualiza parcialmente la configuración de una tienda",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "Identificador de la tienda" },
            patch: {
              type: "object",
              description: "Objeto con los campos a actualizar",
            },
          },
          required: ["slug", "patch"],
        },
      },
      {
        name: "listar_productos",
        description: "Obtiene la lista de productos de una tienda",
        inputSchema: {
          type: "object",
          properties: {
            store: { type: "string", description: "Slug de la tienda" },
          },
          required: ["store"],
        },
      },
      {
        name: "subir_producto",
        description: "Crea o actualiza un producto (upsert por slug)",
        inputSchema: {
          type: "object",
          properties: {
            store: { type: "string", description: "Slug de la tienda" },
            producto: {
              type: "object",
              description: "Objeto con datos del producto",
              properties: {
                slug: { type: "string" },
                name_es: { type: "string" },
                name_en: { type: "string" },
                category: { type: "string" },
                description_es: { type: "string" },
                description_en: { type: "string" },
                story_es: { type: "string" },
                story_en: { type: "string" },
                price_cop: { type: "integer" },
                price_usd: { type: "integer" },
                stock: { type: "integer" },
                production_time_days: { type: "integer" },
                materials_es: { type: "array", items: { type: "string" } },
                materials_en: { type: "array", items: { type: "string" } },
                weight_grams: { type: "integer" },
                featured: { type: "boolean" },
              },
            },
          },
          required: ["store", "producto"],
        },
      },
      {
        name: "eliminar_producto",
        description: "Elimina un producto de una tienda",
        inputSchema: {
          type: "object",
          properties: {
            store: { type: "string", description: "Slug de la tienda" },
            slug: { type: "string", description: "Slug del producto" },
          },
          required: ["store", "slug"],
        },
      },
      {
        name: "subir_categoria",
        description: "Crea o actualiza una categoría (upsert por slug)",
        inputSchema: {
          type: "object",
          properties: {
            store: { type: "string", description: "Slug de la tienda" },
            categoria: {
              type: "object",
              description: "Objeto con datos de la categoría",
              properties: {
                slug: { type: "string" },
                name_es: { type: "string" },
                name_en: { type: "string" },
                description_es: { type: "string" },
                description_en: { type: "string" },
              },
            },
          },
          required: ["store", "categoria"],
        },
      },
      {
        name: "listar_pedidos",
        description: "Obtiene la lista de pedidos de una tienda",
        inputSchema: {
          type: "object",
          properties: {
            store: { type: "string", description: "Slug de la tienda" },
          },
          required: ["store"],
        },
      },
      {
        name: "actualizar_pedido",
        description: "Actualiza el estado de un pedido",
        inputSchema: {
          type: "object",
          properties: {
            store: { type: "string", description: "Slug de la tienda" },
            id: { type: "string", description: "ID del pedido" },
            status: { type: "string", description: "Nuevo estado del pedido (opcional)" },
            payment_status: {
              type: "string",
              description: "Nuevo estado de pago (opcional)",
            },
          },
          required: ["store", "id"],
        },
      },
      {
        name: "estadisticas",
        description: "Obtiene métricas y estadísticas de una tienda",
        inputSchema: {
          type: "object",
          properties: {
            store: { type: "string", description: "Slug de la tienda" },
          },
          required: ["store"],
        },
      },
    ],
  };
});

// Iniciar el servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Servidor MCP akrono iniciado (stdio)");
}

main().catch((err) => {
  console.error("Error iniciando servidor:", err);
  process.exit(1);
});
