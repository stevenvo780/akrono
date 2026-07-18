"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useStoreSlug } from "@/lib/store-context";

// Link que prefija automáticamente las rutas internas con la tienda activa.
// Así los componentes usan href="/tienda" y se resuelve a "/<store>/tienda"
// sin reescribir cada enlace. No toca rutas de API ni externas.
export default function StoreLink({ href, ...props }: ComponentProps<typeof NextLink>) {
  const slug = useStoreSlug();
  let h = href;
  if (typeof href === "string" && href.startsWith("/") && !href.startsWith("/api")) {
    h = href === "/" ? `/${slug}` : href.startsWith(`/${slug}/`) || href === `/${slug}` ? href : `/${slug}${href}`;
  }
  return <NextLink href={h} {...props} />;
}

// Helper para prefijar rutas en código imperativo (router.push, etc.)
export function storePath(slug: string, path: string): string {
  if (!path.startsWith("/") || path.startsWith("/api")) return path;
  if (path === "/") return `/${slug}`;
  return path.startsWith(`/${slug}/`) || path === `/${slug}` ? path : `/${slug}${path}`;
}
