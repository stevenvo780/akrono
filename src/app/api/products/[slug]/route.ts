import { NextResponse } from "next/server";
import { updateProductStock, setProductionStatus, getProductState } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import type { ProductionStatus } from "@/lib/types";

export async function PATCH(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const store = new URL(req.url).searchParams.get("store");
  if (!store) return NextResponse.json({ error: "missing store" }, { status: 400 });
  const { slug } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  if (typeof body.stock === "number") updateProductStock(store, slug, body.stock);
  if (body.production_status) {
    setProductionStatus(
      store,
      slug,
      body.production_status as ProductionStatus,
      typeof body.in_production === "number" ? body.in_production : undefined,
    );
  }
  const st = getProductState(store, slug);
  if (!st) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(st);
}
