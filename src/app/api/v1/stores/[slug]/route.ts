import { NextResponse } from "next/server";
import { checkApiKey } from "@/lib/apikey";
import { getStore, updateStore } from "@/lib/store";

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  if (!checkApiKey(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { slug } = await ctx.params;
  const s = getStore(slug);
  if (!s) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(s);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  if (!checkApiKey(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { slug } = await ctx.params;
  const patch = await req.json().catch(() => ({}));
  const updated = updateStore(slug, patch);
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
}
