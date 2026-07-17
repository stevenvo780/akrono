import catalogData from "../../data/catalog.json";
import type { Category, Product } from "./types";

const data = catalogData as { categories: Category[]; products: Product[] };

export const categories: Category[] = data.categories;
export const products: Product[] = data.products;

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function productsByCategory(slug: string): Product[] {
  return products.filter((p) => p.category === slug);
}

export function featuredProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function searchProducts(q: string): Product[] {
  const term = q.trim().toLowerCase();
  if (!term) return products;
  return products.filter((p) =>
    [p.name_es, p.name_en, p.description_es, p.description_en, p.category]
      .join(" ")
      .toLowerCase()
      .includes(term),
  );
}
