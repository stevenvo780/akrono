// Registro de tiendas iniciales (semilla de la plataforma).
// Se importan estáticamente para que el bundler las incluya en el build.
// En la primera arranque, la BD se siembra con estas tiendas; a partir de ahí
// la BD es la fuente de verdad y las tiendas nuevas (creadas por API/MCP) viven
// solo en la BD.

import type { StoreConfig } from "@/lib/tenant";

import akronoConfig from "../../tiendas/akrono/config.json";
import akronoCatalog from "../../tiendas/akrono/catalog.json";
import lumbreConfig from "../../tiendas/lumbre/config.json";
import lumbreCatalog from "../../tiendas/lumbre/catalog.json";

export type SeedCategory = {
  slug: string;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
};

export type SeedProduct = {
  slug: string;
  name_es: string;
  name_en: string;
  category: string;
  description_es: string;
  description_en: string;
  story_es: string;
  story_en: string;
  price_cop: number;
  price_usd: number;
  stock: number;
  production_time_days: number;
  materials_es: string[];
  materials_en: string[];
  weight_grams: number;
  featured: boolean;
};

export type SeedCatalog = { categories: SeedCategory[]; products: SeedProduct[] };

export type SeedStore = { config: StoreConfig; catalog: SeedCatalog };

export const SEED_STORES: SeedStore[] = [
  { config: akronoConfig as StoreConfig, catalog: akronoCatalog as SeedCatalog },
  { config: lumbreConfig as StoreConfig, catalog: lumbreCatalog as SeedCatalog },
];
