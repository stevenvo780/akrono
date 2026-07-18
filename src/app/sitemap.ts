import type { MetadataRoute } from "next";
import { listStores, listProducts, listCategories } from "@/lib/store";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://akrono.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
  ];
  for (const s of listStores()) {
    const root = `${base}/${s.slug}`;
    for (const p of ["", "/tienda", "/seguimiento"]) {
      entries.push({ url: `${root}${p}`, lastModified: now, changeFrequency: "weekly", priority: p === "" ? 0.9 : 0.6 });
    }
    for (const c of listCategories(s.slug)) {
      entries.push({ url: `${root}/tienda?cat=${c.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.5 });
    }
    for (const pr of listProducts(s.slug)) {
      entries.push({ url: `${root}/producto/${pr.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
    }
  }
  return entries;
}
