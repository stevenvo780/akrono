"use client";

import { createContext, useContext } from "react";
import type { StoreConfig } from "./tenant";

// Contexto de la tienda activa para componentes cliente.
// Lo provee src/app/[store]/layout.tsx con la config resuelta desde la BD.
const Ctx = createContext<StoreConfig | null>(null);

export function StoreProvider({ config, children }: { config: StoreConfig; children: React.ReactNode }) {
  return <Ctx.Provider value={config}>{children}</Ctx.Provider>;
}

export function useStore(): StoreConfig {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore debe usarse dentro de <StoreProvider>");
  return c;
}

export function useStoreSlug(): string {
  return useStore().slug;
}
