"use client";

import { createContext, useContext } from "react";
import type { Locale } from "./types";

const Ctx = createContext<Locale>("es");

export function LocaleProvider({ value, children }: { value: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale(): Locale {
  return useContext(Ctx);
}

export function LocaleSwitcher() {
  const current = useLocale();
  function set(l: Locale) {
    document.cookie = `akrono_locale=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  }
  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        onClick={() => set("es")}
        className={current === "es" ? "text-[var(--clay)]" : "text-neutral-400 hover:text-[var(--ink)]"}
        aria-pressed={current === "es"}
      >
        ES
      </button>
      <span className="text-neutral-300">/</span>
      <button
        onClick={() => set("en")}
        className={current === "en" ? "text-[var(--clay)]" : "text-neutral-400 hover:text-[var(--ink)]"}
        aria-pressed={current === "en"}
      >
        EN
      </button>
    </div>
  );
}
