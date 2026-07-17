"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

export default function AddToCart({ slug, disabled }: { slug: string; disabled?: boolean }) {
  const { add } = useCart();
  const l = useLocale();
  const [done, setDone] = useState(false);
  if (disabled) {
    return <button className="btn-primary" disabled>{t("out_of_stock", l)}</button>;
  }
  return (
    <button
      className="btn-primary"
      onClick={() => {
        add(slug, 1);
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
    >
      {done ? t("added", l) : t("add_to_cart", l)}
    </button>
  );
}
