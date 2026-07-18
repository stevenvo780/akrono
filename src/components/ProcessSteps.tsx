"use client";

import { useLocale } from "@/lib/locale-context";
import { useStore } from "@/lib/store-context";

interface Step {
  id: number;
  iconColor: string;
  titleEs: string;
  titleEn: string;
  descEs: string;
  descEn: string;
  icon: (color: string) => React.ReactNode;
}

export default function ProcessSteps() {
  const locale = useLocale();
  const store = useStore();

  const steps: Step[] = [
    {
      id: 1,
      iconColor: "var(--ink)",
      titleEs: "El artesano crea",
      titleEn: "Artisan creates",
      descEs: "La pieza se diseña y elabora a mano con maestría",
      descEn: "The piece is designed and crafted by hand",
      icon: (color: string) => (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 36L16 20M36 36L32 20M24 36V20M14 20H34L32 12H16L14 20Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="8" r="3" fill={color} />
        </svg>
      ),
    },
    {
      id: 2,
      iconColor: "var(--clay)",
      titleEs: `${store.name} gestiona`,
      titleEn: `${store.name} manages`,
      descEs: "Producción, control de calidad y empaque",
      descEn: "Production, quality control and packaging",
      icon: (color: string) => (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="12" width="28" height="24" stroke={color} strokeWidth="2" rx="2" />
          <path d="M14 12V8C14 6.9 14.9 6 16 6H32C33.1 6 34 6.9 34 8V12" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <rect x="16" y="26" width="16" height="6" fill={color} opacity="0.3" />
          <circle cx="24" cy="19" r="2" fill={color} />
        </svg>
      ),
    },
    {
      id: 3,
      iconColor: "var(--sage)",
      titleEs: "Llega a tu casa",
      titleEn: "Arrives at home",
      descEs: "Entrega nacional o internacional segura",
      descEn: "Safe domestic or international delivery",
      icon: (color: string) => (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 8L10 18V36H38V18L24 8Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
          <path d="M18 36V26H30V36" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="29" r="2" fill={color} />
          <path d="M8 40H40" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  const sectionTitle = locale === "es" ? "Cómo funciona" : "How it works";

  return (
    <section className="py-16 md:py-24 px-4 bg-white">
      <div className="mx-auto max-w-6xl">
        {/* Título de la sección */}
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-center text-[var(--ink)] mb-16">
          {sectionTitle}
        </h2>

        {/* Pasos conectados */}
        <div className="relative">
          {/* Línea conectora (hidden en mobile) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[var(--ink)] via-[var(--clay)] to-[var(--sage)] transform -translate-y-1/2" />

          {/* Pasos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                {/* Numeración circular */}
                <div className="relative mb-6 md:mb-8 z-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border-4 border-[var(--cream)] flex items-center justify-center shadow-sm">
                    {step.icon(step.iconColor)}
                  </div>
                  <div
                    className="absolute -bottom-3 -right-2 w-8 h-8 rounded-full font-display font-bold text-sm flex items-center justify-center text-white"
                    style={{ backgroundColor: step.iconColor }}
                  >
                    {step.id}
                  </div>
                </div>

                {/* Texto */}
                <div className="text-center">
                  <h3 className="font-display font-semibold text-lg md:text-xl text-[var(--ink)] mb-2">
                    {locale === "es" ? step.titleEs : step.titleEn}
                  </h3>
                  <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
                    {locale === "es" ? step.descEs : step.descEn}
                  </p>
                </div>

                {/* Conector vertical en mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden w-1 h-8 bg-gradient-to-b from-[var(--ink)] to-[var(--clay)] mt-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
