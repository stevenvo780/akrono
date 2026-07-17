# akrono — Manual de uso

**akrono** es el sistema de ventas de artesanías de la Universidad de Antioquia: una tienda online bilingüe (español/inglés) para vender nacional e internacionalmente, con un panel de administración que gestiona **producción, ventas y distribución** de punta a punta.

Esta es una **versión provisional** para evaluar. La marca (nombre, logo, colores) es preliminar y se puede cambiar.

---

## 1. Las dos partes del sistema

| Parte | Para quién | Dirección |
|------|------------|-----------|
| **Tienda** | Clientes (Colombia y el mundo) | `/` (la página principal) |
| **Panel de administración** | Tú / el equipo akrono | `/admin` |

---

## 2. La tienda (lo que ve el cliente)

- **Inicio**: presentación de la marca, productos destacados, categorías e historia.
- **Idioma**: arriba a la derecha, botón **ES / EN**. Cambia todo el sitio y la moneda:
  - **ES → precios en pesos colombianos (COP)**
  - **EN → precios en dólares (USD)**
- **Tienda** (`/tienda`): todos los productos, con **filtro por categoría** y **buscador**.
- **Producto**: foto, descripción, la historia artesanal, materiales, tiempo de elaboración y **stock disponible**. Botón **Agregar al carrito**.
- **Carrito**: ajustar cantidades, quitar productos, ver subtotal.
- **Checkout**: el cliente elige **envío nacional (Colombia)** o **internacional**, llena sus datos y confirma. Al confirmar recibe un **número de pedido** (ej. `AKR-1042`).

> El cliente NO paga en línea en esta versión: el pedido queda registrado y el equipo lo gestiona desde el panel (se puede conectar una pasarela de pago más adelante).

---

## 3. El panel de administración (`/admin`)

**Contraseña por defecto: `akrono2026`**
(Se puede — y se debe — cambiar; ver la sección 6.)

El panel tiene 5 secciones en el menú izquierdo:

### Panel
Resumen del negocio: total de pedidos, ingresos aproximados, pedidos pendientes, unidades en producción, stock bajo y envíos. Además, los últimos pedidos.

### Pedidos
La lista de todos los pedidos. Cada pedido muestra cliente, si es nacional 🇨🇴 o internacional 🌎, y el total.
- **Cambiar el estado** con el menú desplegable: `Nuevo → Pagado → En producción → Empacado → Enviado → Entregado` (o `Cancelado`).
- **Clic en el número de pedido** para ver el detalle (productos y dirección de envío).
- Al marcar un pedido como **Enviado**, el sistema **crea automáticamente un envío** con su guía (número de tracking) en la sección Distribución.

### Producción
La **cola del taller**: qué piezas están pendientes o en proceso, cuántas unidades se están produciendo y cuánto stock hay.
- Botón **Iniciar**: marca una pieza como "en proceso".
- Botón **Terminar → stock**: las unidades que estaban en producción **pasan al stock disponible** para la venta.

> Cuando un cliente compra más unidades de las que hay en stock, el sistema **dispara producción automáticamente** por la diferencia.

### Productos
Inventario completo. Por cada pieza puedes ajustar:
- **Stock** (escribe el número y pulsa OK).
- **Unidades en producción**.
- **Estado** de producción.
Las piezas con **stock ≤ 5** se marcan como "bajo" para que las repongas.

### Distribución
Todos los **envíos**, nacionales e internacionales, con su transportadora y número de guía.
- Cambia el estado del envío: `Preparando → En tránsito → En aduana → En reparto → Entregado`.
- Los envíos nacionales usan **Servientrega**, los internacionales **DHL Express** (configurable).

---

## 4. El flujo completo (ejemplo)

1. Una clienta en México entra, pone el sitio en **EN**, ve precios en USD y compra una mochila de cuero → pedido `AKR-1050`.
2. En **Pedidos**, ves el pedido nuevo (🌎 Internacional). Lo marcas **Pagado** cuando confirmes el pago.
3. Si no había stock, la mochila aparece en **Producción**. El taller la hace y pulsas **Terminar → stock**.
4. Marcas el pedido **Enviado** → se genera el envío con guía DHL en **Distribución**.
5. Actualizas el envío hasta **Entregado**. El **Panel** refleja los ingresos.

---

## 5. Datos y catálogo

- El catálogo trae **30 productos artesanales** en **8 categorías** (tejidos, cerámica, joyería, papelería, textiles, decoración, cuero, madera), todos con textos en español e inglés.
- Las imágenes de producto son **gráficos de marca generados** (no fotos). Cuando tengas fotos reales de las piezas, se reemplazan fácil.

---

## 6. Ajustes importantes (para quien administre el servidor)

Estos valores se configuran como **variables de entorno** en Vercel (o donde se aloje):

| Variable | Para qué | Valor por defecto |
|----------|----------|-------------------|
| `AKRONO_ADMIN_PASSWORD` | Contraseña del panel `/admin` | `akrono2026` |
| `AKRONO_SECRET` | Clave para firmar la sesión de admin | (poner una cadena larga y secreta) |

> **Recomendado antes de usar en serio:** cambiar la contraseña del admin y poner un `AKRONO_SECRET` propio.

---

## 7. Nota sobre esta versión provisional

- **Persistencia:** los pedidos, inventario y envíos se guardan mientras el servidor está activo. Para una operación permanente (que nunca se borre nada), se conecta una base de datos gestionada — es un cambio de configuración pequeño, ya está preparado el código para ello.
- **Pagos:** se puede integrar una pasarela (Wompi, Mercado Pago, Stripe) para cobrar en línea.
- **Marca:** akrono, su logo y colores son provisionales para que los evalúes y decidas qué cambiar.

---

**Repositorio del código:** https://github.com/stevenvo780/akrono
**Panel de administración:** `/admin` · contraseña `akrono2026`

Hecho con cariño para las artesanías de la Universidad de Antioquia 🧶🏺
