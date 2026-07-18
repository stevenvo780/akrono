import type { MetadataRoute } from "next";
import { products, categories } from "@/lib/catalog";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://akrono.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/tienda", "/carrito", "/seguimiento"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const cats = categories.map((c) => ({
    url: `${base}/tienda?cat=${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  const prods = products.map((p) => ({
    url: `${base}/producto/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  return [...staticRoutes, ...cats, ...prods];
}
