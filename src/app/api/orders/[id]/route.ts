import { NextResponse } from "next/server";
import { getOrder, updateOrderStatus, createShipment, updatePaymentStatus } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

function storeOf(req: Request): string | null {
  return new URL(req.url).searchParams.get("store");
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const store = storeOf(req);
  if (!store) return NextResponse.json({ error: "missing store" }, { status: 400 });
  const { id } = await ctx.params;
  const order = getOrder(store, id);
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const store = storeOf(req);
  if (!store) return NextResponse.json({ error: "missing store" }, { status: 400 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  // actualización de pago (independiente del estado del pedido)
  if (body.payment_status) {
    const upd = updatePaymentStatus(store, id, body.payment_status as PaymentStatus);
    if (!upd) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (!body.status) return NextResponse.json(upd);
  }

  const status = body.status as OrderStatus;
  const order = updateOrderStatus(store, id, status, body.note);
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });

  // al marcar "enviado" creamos un envío automáticamente si no existe
  if (status === "enviado") {
    createShipment(store, {
      order_id: order.id,
      scope: order.scope,
      carrier: order.scope === "internacional" ? "DHL Express" : "Servientrega",
      tracking: `${order.scope === "internacional" ? "DHL" : "SE"}${Date.now().toString().slice(-9)}`,
      destination: `${order.customer.city}, ${order.customer.country}`,
    });
  }
  return NextResponse.json(order);
}
