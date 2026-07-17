import type { Locale, Product, Category } from "./types";

export const locales: Locale[] = ["es", "en"];
export const defaultLocale: Locale = "es";

export function isLocale(v: string | undefined): v is Locale {
  return v === "es" || v === "en";
}

// Nombre / descripción localizados
export function pName(p: Product, l: Locale) {
  return l === "en" ? p.name_en : p.name_es;
}
export function pDesc(p: Product, l: Locale) {
  return l === "en" ? p.description_en : p.description_es;
}
export function pStory(p: Product, l: Locale) {
  return l === "en" ? p.story_en : p.story_es;
}
export function pMaterials(p: Product, l: Locale) {
  return l === "en" ? p.materials_en : p.materials_es;
}
export function cName(c: Category, l: Locale) {
  return l === "en" ? c.name_en : c.name_es;
}
export function cDesc(c: Category, l: Locale) {
  return l === "en" ? c.description_en : c.description_es;
}

type Dict = Record<string, { es: string; en: string }>;

const T: Dict = {
  tagline: { es: "Hecho a mano en la Universidad de Antioquia", en: "Handmade at the University of Antioquia" },
  hero_title: { es: "Artesanía colombiana, al mundo", en: "Colombian craft, to the world" },
  hero_sub: {
    es: "Piezas únicas hechas a mano por artesanos de la Universidad de Antioquia. Producción, venta y envío nacional e internacional.",
    en: "Unique handmade pieces by artisans of the University of Antioquia. Production, sales and shipping — nationwide and worldwide.",
  },
  shop_now: { es: "Ver la tienda", en: "Shop now" },
  featured: { es: "Destacados", en: "Featured" },
  categories: { es: "Categorías", en: "Categories" },
  all_products: { es: "Todos los productos", en: "All products" },
  our_story: { es: "Nuestra historia", en: "Our story" },
  story_body: {
    es: "akrono nace en los talleres de la Universidad de Antioquia, donde cada pieza se teje, moldea, talla y borda a mano. Conectamos ese trabajo artesanal con personas de todo el mundo mediante un ecosistema que automatiza la producción, la venta y el envío.",
    en: "akrono is born in the workshops of the University of Antioquia, where every piece is woven, molded, carved and embroidered by hand. We connect that craft with people worldwide through an ecosystem that automates production, sales and shipping.",
  },
  add_to_cart: { es: "Agregar al carrito", en: "Add to cart" },
  added: { es: "Agregado ✓", en: "Added ✓" },
  out_of_stock: { es: "Agotado", en: "Out of stock" },
  in_stock: { es: "En stock", en: "In stock" },
  units: { es: "unidades", en: "units" },
  materials: { es: "Materiales", en: "Materials" },
  production_time: { es: "Tiempo de elaboración", en: "Production time" },
  days: { es: "días", en: "days" },
  cart: { es: "Carrito", en: "Cart" },
  cart_empty: { es: "Tu carrito está vacío", en: "Your cart is empty" },
  subtotal: { es: "Subtotal", en: "Subtotal" },
  shipping: { es: "Envío", en: "Shipping" },
  total: { es: "Total", en: "Total" },
  checkout: { es: "Finalizar compra", en: "Checkout" },
  continue_shopping: { es: "Seguir comprando", en: "Continue shopping" },
  remove: { es: "Quitar", en: "Remove" },
  qty: { es: "Cantidad", en: "Qty" },
  your_data: { es: "Tus datos", en: "Your details" },
  full_name: { es: "Nombre completo", en: "Full name" },
  email: { es: "Correo", en: "Email" },
  phone: { es: "Teléfono", en: "Phone" },
  country: { es: "País", en: "Country" },
  city: { es: "Ciudad", en: "City" },
  address: { es: "Dirección", en: "Address" },
  notes: { es: "Notas (opcional)", en: "Notes (optional)" },
  place_order: { es: "Confirmar pedido", en: "Place order" },
  order_confirmed: { es: "¡Pedido confirmado!", en: "Order confirmed!" },
  order_number: { es: "Número de pedido", en: "Order number" },
  order_thanks: {
    es: "Gracias por apoyar la artesanía colombiana. Te contactaremos con los detalles de producción y envío.",
    en: "Thank you for supporting Colombian craft. We will contact you with production and shipping details.",
  },
  national: { es: "Nacional (Colombia)", en: "National (Colombia)" },
  international: { es: "Internacional", en: "International" },
  free: { es: "Gratis", en: "Free" },
  search: { es: "Buscar…", en: "Search…" },
  filter_all: { es: "Todas", en: "All" },
  handmade: { es: "Hecho a mano", en: "Handmade" },
  processing: { es: "Procesando…", en: "Processing…" },
  back_home: { es: "Volver al inicio", en: "Back to home" },
  view_details: { es: "Ver detalle", en: "View details" },
  status: { es: "Estado", en: "Status" },
};

export function t(key: keyof typeof T | string, l: Locale): string {
  const e = T[key];
  if (!e) return key;
  return l === "en" ? e.en : e.es;
}
