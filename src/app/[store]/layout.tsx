import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/store";
import { tenantCss } from "@/lib/tenant";
import { StoreProvider } from "@/lib/store-context";

export async function generateMetadata({ params }: { params: Promise<{ store: string }> }): Promise<Metadata> {
  const { store: slug } = await params;
  const s = getStore(slug);
  if (!s) return { title: "Tienda no encontrada" };
  return {
    title: { default: `${s.name} · ${s.tagline_es}`, template: `%s · ${s.name}` },
    description: s.description_es,
    keywords: s.keywords,
    openGraph: {
      title: `${s.name} · ${s.tagline_es}`,
      description: s.description_es,
      type: "website",
      locale: s.locale_default === "en" ? "en_US" : "es_CO",
      siteName: s.name,
    },
  };
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}) {
  const { store: slug } = await params;
  const config = getStore(slug);
  if (!config) notFound();
  return (
    <StoreProvider config={config}>
      {/* Identidad de la tienda: sobreescribe los valores por defecto */}
      <style dangerouslySetInnerHTML={{ __html: tenantCss(config) }} />
      {children}
    </StoreProvider>
  );
}
