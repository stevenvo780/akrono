import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrder, listOrders, storeExists } from "@/lib/store";
import { isAdmin } from "@/lib/auth";

const schema = z.object({
  currency: z.enum(["COP", "USD"]),
  scope: z.enum(["nacional", "internacional"]),
  payment_method: z.enum(["transferencia", "contraentrega", "tarjeta"]),
  items: z
    .array(
      z.object({
        slug: z.string(),
        name: z.string(),
        qty: z.number().int().positive(),
        price_cop: z.number(),
        price_usd: z.number(),
      }),
    )
    .min(1),
  subtotal: z.number(),
  shipping: z.number(),
  total: z.number(),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    country: z.string().min(1),
    city: z.string().min(1),
    address: z.string().min(1),
    notes: z.string().optional().nullable(),
  }),
});

export async function POST(req: Request) {
  const store = new URL(req.url).searchParams.get("store");
  if (!store) return NextResponse.json({ error: "missing store" }, { status: 400 });
  if (!storeExists(store)) return NextResponse.json({ error: "unknown store" }, { status: 404 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;
  const order = createOrder(store, {
    currency: d.currency,
    scope: d.scope,
    payment_method: d.payment_method,
    items: d.items,
    subtotal: d.subtotal,
    shipping: d.shipping,
    total: d.total,
    customer: { ...d.customer, notes: d.customer.notes || undefined },
  });
  return NextResponse.json({ id: order.id, payment_status: order.payment_status });
}

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const store = new URL(req.url).searchParams.get("store");
  if (!store) return NextResponse.json({ error: "missing store" }, { status: 400 });
  return NextResponse.json(listOrders(store));
}
