"use client";

import { useMemo } from "react";
import type { Order, OrderStatus } from "@/lib/types";
import { formatCOP } from "@/lib/format";
import { brand } from "@/lib/brand";

type SalesChartProps = {
  orders: Order[];
};

export default function SalesChart({ orders }: SalesChartProps) {
  const data = useMemo(() => {
    if (!orders.length) {
      return {
        dailyRevenue: [],
        statusCounts: {} as Record<OrderStatus, number>,
        topProducts: [],
        maxQty: 0,
        hasData: false,
      };
    }

    // 1. Ingresos por día (últimos 14 días)
    const dailyMap = new Map<string, number>();
    const now = new Date();

    // Inicializar últimos 14 días con 0
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split("T")[0];
      dailyMap.set(dayStr, 0);
    }

    // Sumar ingresos normalizados a COP
    orders.forEach((order) => {
      const dayStr = order.created_at.split("T")[0];
      const normalizedTotal = order.currency === "USD" ? order.total * 4000 : order.total;

      if (dailyMap.has(dayStr)) {
        dailyMap.set(dayStr, (dailyMap.get(dayStr) ?? 0) + normalizedTotal);
      }
    });

    const dailyRevenue = Array.from(dailyMap.entries()).map(([date, revenue]) => ({
      date,
      day: new Date(date + "T00:00:00").toLocaleDateString("es-CO", { weekday: "short", day: "2-digit" }),
      revenue,
    }));

    // 2. Conteo por estado
    const statusCounts: Record<OrderStatus, number> = {
      nuevo: 0,
      pagado: 0,
      en_produccion: 0,
      empacado: 0,
      enviado: 0,
      entregado: 0,
      cancelado: 0,
    };

    orders.forEach((order) => {
      statusCounts[order.status]++;
    });

    // 3. Top 5 productos por cantidad
    const productMap = new Map<string, { name: string; qty: number }>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productMap.get(item.slug) || { name: item.name, qty: 0 };
        productMap.set(item.slug, {
          name: item.name,
          qty: existing.qty + item.qty,
        });
      });
    });

    const topProducts = Array.from(productMap.entries())
      .map(([slug, data]) => ({ slug, ...data }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const maxQty = topProducts.length > 0 ? Math.max(...topProducts.map((p) => p.qty)) : 1;

    return {
      dailyRevenue,
      statusCounts,
      topProducts,
      maxQty,
      hasData: true,
    };
  }, [orders]);

  if (!data.hasData) {
    return (
      <div className="card p-6 text-center text-neutral-400">
        <p className="text-sm">Sin datos aún. Realiza tu primer pedido para ver análisis.</p>
      </div>
    );
  }

  const statusLabels: Record<OrderStatus, string> = {
    nuevo: "Nuevo",
    pagado: "Pagado",
    en_produccion: "En producción",
    empacado: "Empacado",
    enviado: "Enviado",
    entregado: "Entregado",
    cancelado: "Cancelado",
  };

  const statusColors: Record<OrderStatus, string> = {
    nuevo: brand.navy,
    pagado: "#2496B0",
    en_produccion: brand.ochre,
    empacado: brand.violet,
    enviado: brand.cyan,
    entregado: "#22c55e",
    cancelado: "#ef4444",
  };

  return (
    <div className="space-y-6">
      {/* Ingresos por día */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg mb-4">Ingresos últimos 14 días</h2>
        <div className="overflow-x-auto">
          <svg viewBox="0 0 900 300" className="w-full min-h-[200px]" preserveAspectRatio="xMidYMid meet">
            {/* Eje base */}
            <line x1="50" y1="250" x2="880" y2="250" stroke="var(--line)" strokeWidth="1" />

            {/* Eje Y (invisible, solo escala) */}
            <line x1="50" y1="20" x2="50" y2="250" stroke="var(--line)" strokeWidth="1" />

            {/* Barra de escala Y */}
            <text x="35" y="255" fontSize="12" fill="currentColor" textAnchor="end" className="text-neutral-400">
              0
            </text>

            {/* Barras */}
            {data.dailyRevenue.map((item, idx) => {
              const maxRevenue = Math.max(...data.dailyRevenue.map((r) => r.revenue), 1);
              const barHeight = (item.revenue / maxRevenue) * 220;
              const x = 60 + idx * 60;
              const y = 250 - barHeight;
              const colorStart = brand.navy;
              const colorEnd = brand.magenta;

              return (
                <g key={item.date}>
                  {/* Barra con gradiente */}
                  <defs>
                    <linearGradient id={`grad-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={colorStart} />
                      <stop offset="100%" stopColor={colorEnd} />
                    </linearGradient>
                  </defs>
                  <rect
                    x={x}
                    y={y}
                    width="40"
                    height={barHeight}
                    fill={`url(#grad-${idx})`}
                    rx="2"
                  >
                    <title>{formatCOP(item.revenue)}</title>
                  </rect>

                  {/* Etiqueta de día */}
                  <text x={x + 20} y="270" fontSize="11" fill="currentColor" textAnchor="middle" className="text-neutral-500">
                    {item.day}
                  </text>
                </g>
              );
            })}

            {/* Etiqueta eje Y */}
            <text x="20" y="40" fontSize="12" fill="currentColor" className="text-neutral-400">
              COP
            </text>
          </svg>
        </div>
      </div>

      {/* Pedidos por estado */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg mb-4">Distribución por estado</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(Object.entries(data.statusCounts) as [OrderStatus, number][]).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: statusColors[status] }}
              />
              <div className="min-w-0">
                <div className="text-xs text-neutral-500">{statusLabels[status]}</div>
                <div className="font-semibold text-lg">{count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 productos */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg mb-4">Top 5 productos por unidades</h2>
        <div className="space-y-4">
          {data.topProducts.map((product) => {
            const percentage = data.maxQty > 0 ? (product.qty / data.maxQty) * 100 : 0;
            return (
              <div key={product.slug}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{product.name}</span>
                  <span className="text-sm font-semibold text-neutral-600">{product.qty} un.</span>
                </div>
                <svg viewBox="0 0 100 8" className="w-full h-2 rounded-full overflow-hidden bg-neutral-100">
                  <defs>
                    <linearGradient id={`bar-${product.slug}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={brand.navy} />
                      <stop offset="100%" stopColor={brand.magenta} />
                    </linearGradient>
                  </defs>
                  <rect
                    x="0"
                    y="0"
                    width={percentage}
                    height="8"
                    fill={`url(#bar-${product.slug})`}
                    rx="1"
                  />
                </svg>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
