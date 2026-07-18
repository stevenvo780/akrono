import type { Metadata } from "next";
import { MuseoModerno, Poppins } from "next/font/google";
import "./globals.css";

// Tipografías de marca akrono: MuseoModerno (títulos/logo) + Poppins (cuerpo)
const display = MuseoModerno({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});
const sans = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://akrono.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "akrono · Artesanía colombiana hecha a mano",
    template: "%s · akrono",
  },
  description:
    "akrono — piezas artesanales hechas a mano en la Universidad de Antioquia. Venta nacional e internacional.",
  keywords: ["artesanía", "Colombia", "hecho a mano", "Universidad de Antioquia", "handmade", "akrono"],
  openGraph: {
    title: "akrono · Artesanía colombiana, al mundo",
    description: "Piezas únicas hechas a mano. Venta nacional e internacional.",
    type: "website",
    locale: "es_CO",
    siteName: "akrono",
  },
  twitter: { card: "summary_large_image", title: "akrono", description: "Artesanía colombiana, al mundo." },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
