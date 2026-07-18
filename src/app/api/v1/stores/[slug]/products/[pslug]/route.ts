import { NextResponse } from "next/server";
import { checkApiKey } from "@/lib/apikey";
import { deleteProduct, getProduct } from "@/lib/store";

export async function DELETE(req: Request, ctx: { params: Promise<{ slug: string; pslug: string }> }) {
  if (!checkApiKey(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { slug, pslug } = await ctx.params;
  if (!getProduct(slug, pslug)) return NextResponse.json({ error: "not found" }, { status: 404 });
  deleteProduct(slug, pslug);
  return NextResponse.json({ ok: true, deleted: pslug });
}
