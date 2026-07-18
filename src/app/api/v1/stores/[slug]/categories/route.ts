import { NextResponse } from "next/server";
import { checkApiKey } from "@/lib/apikey";
import { listCategories, upsertCategory, storeExists } from "@/lib/store";
import type { Category } from "@/lib/types";

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  if (!checkApiKey(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { slug } = await ctx.params;
  if (!storeExists(slug)) return NextResponse.json({ error: "unknown store" }, { status: 404 });
  return NextResponse.json(listCategories(slug));
}

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  if (!checkApiKey(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { slug } = await ctx.params;
  if (!storeExists(slug)) return NextResponse.json({ error: "unknown store" }, { status: 404 });
  const b = await req.json().catch(() => null);
  if (!b?.slug || !b?.name_es) return NextResponse.json({ error: "faltan slug y name_es" }, { status: 400 });
  const cat: Category & { sort?: number } = {
    slug: String(b.slug),
    name_es: b.name_es,
    name_en: b.name_en ?? b.name_es,
    description_es: b.description_es ?? "",
    description_en: b.description_en ?? "",
    sort: typeof b.sort === "number" ? b.sort : 0,
  };
  return NextResponse.json(upsertCategory(slug, cat), { status: 201 });
}
