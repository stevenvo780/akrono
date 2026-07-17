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

export const metadata: Metadata = {
  title: "akrono · Artesanía colombiana hecha a mano",
  description:
    "akrono — piezas artesanales hechas a mano en la Universidad de Antioquia. Venta nacional e internacional.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
