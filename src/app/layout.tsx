import type { Metadata } from "next";
import { MuseoModerno, Poppins, Fraunces, Playfair_Display, Sora, Inter, Work_Sans } from "next/font/google";
import "./globals.css";
import { store, tenantCss } from "@/lib/tenant";

// Paleta de tipografías soportadas por el sistema multi-tienda.
const museo = MuseoModerno({ subsets: ["latin"], variable: "--f-museo", weight: ["400", "500", "600", "700"], display: "swap" });
const poppins = Poppins({ subsets: ["latin"], variable: "--f-poppins", weight: ["300", "400", "500", "600", "700"], display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--f-fraunces", weight: ["400", "500", "600", "700"], display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--f-playfair", weight: ["400", "500", "600", "700"], display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--f-sora", weight: ["400", "500", "600", "700"], display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--f-inter", weight: ["300", "400", "500", "600", "700"], display: "swap" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--f-worksans", weight: ["300", "400", "500", "600", "700"], display: "swap" });

const fontVars = [museo, poppins, fraunces, playfair, sora, inter, workSans].map((f) => f.variable).join(" ");

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || store.url;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "akrono · Plataforma de tiendas artesanales",
    template: "%s",
  },
  description: "akrono — plataforma para crear y gestionar tiendas de artesanía y diseño, con venta nacional e internacional.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fontVars}>
      <head>
        {/* Identidad por defecto (plataforma); cada tienda la sobreescribe en su layout */}
        <style dangerouslySetInnerHTML={{ __html: tenantCss() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
