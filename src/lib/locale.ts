import { cookies } from "next/headers";
import type { Locale } from "./types";
import { defaultLocale, isLocale } from "./i18n";

export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const v = c.get("akrono_locale")?.value;
  return isLocale(v) ? v : defaultLocale;
}
