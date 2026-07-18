// Acceso al catálogo por tienda (server-only). Lee de la BD multi-tienda.
// El catálogo es editable en vivo vía API/MCP; estas funciones reflejan la BD.

import { listProducts, listCategories, getProduct as dbGetProduct } from "./store";
import type { Category, Product } from "./types";

export function getProducts(storeSlug: string): Product[] {
  return listProducts(storeSlug);
}

export function getCategories(storeSlug: string): Category[] {
  return listCategories(storeSlug);
}

export function getProduct(storeSlug: string, slug: string): Product | undefined {
  return dbGetProduct(storeSlug, slug);
}

export function getCategory(storeSlug: string, slug: string): Category | undefined {
  return listCategories(storeSlug).find((c) => c.slug === slug);
}

export function productsByCategory(storeSlug: string, categorySlug: string): Product[] {
  return listProducts(storeSlug).filter((p) => p.category === categorySlug);
}

export function featuredProducts(storeSlug: string): Product[] {
  return listProducts(storeSlug).filter((p) => p.featured);
}

export function searchProducts(storeSlug: string, q: string): Product[] {
  const term = q.trim().toLowerCase();
  const all = listProducts(storeSlug);
  if (!term) return all;
  return all.filter((p) =>
    [p.name_es, p.name_en, p.description_es, p.description_en, p.category]
      .join(" ")
      .toLowerCase()
      .includes(term),
  );
}
