import { NextResponse } from "next/server";
import { getOrder, updateOrderStatus, createShipment } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import type { OrderStatus } from "@/lib/types";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const order = getOrder(id);
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const status = body.status as OrderStatus;
  const order = updateOrderStatus(id, status, body.note);
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });

  // al marcar "enviado" creamos un envío automáticamente si no existe
  if (status === "enviado") {
    createShipment({
      order_id: order.id,
      scope: order.scope,
      carrier: order.scope === "internacional" ? "DHL Express" : "Servientrega",
      tracking: `${order.scope === "internacional" ? "DHL" : "SE"}${Date.now().toString().slice(-9)}`,
      destination: `${order.customer.city}, ${order.customer.country}`,
    });
  }
  return NextResponse.json(order);
}
