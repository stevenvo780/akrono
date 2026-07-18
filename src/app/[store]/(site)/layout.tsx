import { CartProvider } from "@/lib/cart";
import { LocaleProvider } from "@/lib/locale-context";
import { getLocale } from "@/lib/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <LocaleProvider value={locale}>
      <CartProvider>
        <Header />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </CartProvider>
    </LocaleProvider>
  );
}
