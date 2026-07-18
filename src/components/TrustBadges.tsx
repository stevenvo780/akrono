"use client";

import { useLocale } from "@/lib/locale-context";

interface Badge {
  id: string;
  icon: (color: string) => React.ReactNode;
  titleEs: string;
  titleEn: string;
  color: string;
}

export default function TrustBadges() {
  const locale = useLocale();

  const badges: Badge[] = [
    {
      id: "handmade",
      titleEs: "Hecho a mano",
      titleEn: "Handmade",
      color: "var(--ink)",
      icon: (color: string) => (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M24 8L28 16H20L24 8Z"
            fill={color}
          />
          <rect x="16" y="16" width="16" height="20" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />
          <circle cx="22" cy="24" r="2" fill={color} />
          <circle cx="26" cy="24" r="2" fill={color} />
          <path d="M18 36H30M16 40H32" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "shipping",
      titleEs: "Envío mundial",
      titleEn: "Worldwide shipping",
      color: "var(--clay)",
      icon: (color: string) => (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8 18L10 12H38L40 18V28H8V18Z"
            stroke={color}
            strokeWidth="1.5"
            fill={color}
            opacity="0.2"
          />
          <circle cx="16" cy="32" r="3" stroke={color} strokeWidth="1.5" fill="none" />
          <circle cx="32" cy="32" r="3" stroke={color} strokeWidth="1.5" fill="none" />
          <path d="M38 18L42 22M8 18L4 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "payment",
      titleEs: "Pago seguro",
      titleEn: "Secure payment",
      color: "var(--sage)",
      icon: (color: string) => (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8 16L24 10L40 16V24C40 32 24 38 24 38C24 38 8 32 8 24V16Z"
            stroke={color}
            strokeWidth="1.5"
            fill={color}
            opacity="0.2"
          />
          <path d="M18 24L22 28L30 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "unique",
      titleEs: "Piezas únicas",
      titleEn: "Unique pieces",
      color: "var(--ochre)",
      icon: (color: string) => (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="20" r="8" stroke={color} strokeWidth="1.5" fill={color} opacity="0.2" />
          <path
            d="M24 4L28 12H36L30 16L32 24L24 20L16 24L18 16L12 12H20L24 4Z"
            fill={color}
            opacity="0.4"
          />
          <circle cx="20" cy="32" r="2" fill={color} />
          <circle cx="28" cy="34" r="2" fill={color} />
          <circle cx="24" cy="40" r="2" fill={color} />
        </svg>
      ),
    },
  ];

  const title = locale === "es" ? "Hecho a mano" : "Handmade";

  return (
    <section className="py-12 px-4 bg-white">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center text-center p-4 md:p-6 rounded-lg transition-all hover:shadow-sm"
            >
              <div className="mb-3 md:mb-4 flex items-center justify-center h-12 md:h-14 w-12 md:w-14">
                {badge.icon(badge.color)}
              </div>
              <p className="text-xs md:text-sm font-semibold text-[var(--ink)] leading-tight">
                {locale === "es" ? badge.titleEs : badge.titleEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
