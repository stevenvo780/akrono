import { NextResponse } from "next/server";
import { checkApiKey } from "@/lib/apikey";
import { getOrder, updateOrderStatus, updatePaymentStatus } from "@/lib/store";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

export async function PATCH(req: Request, ctx: { params: Promise<{ slug: string; id: string }> }) {
  if (!checkApiKey(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { slug, id } = await ctx.params;
  if (!getOrder(slug, id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  let result = getOrder(slug, id);
  if (body.payment_status) result = updatePaymentStatus(slug, id, body.payment_status as PaymentStatus);
  if (body.status) result = updateOrderStatus(slug, id, body.status as OrderStatus, body.note);
  return NextResponse.json(result);
}
