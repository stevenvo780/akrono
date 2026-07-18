import { NextResponse } from "next/server";
import { updateShipment } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import type { Shipment } from "@/lib/types";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const store = new URL(req.url).searchParams.get("store");
  if (!store) return NextResponse.json({ error: "missing store" }, { status: 400 });
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as Partial<Shipment>;
  const sh = updateShipment(store, id, body);
  if (!sh) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(sh);
}
