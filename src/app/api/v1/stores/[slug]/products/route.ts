import { NextResponse } from "next/server";
import { checkApiKey } from "@/lib/apikey";
import { listProducts, upsertProduct, storeExists } from "@/lib/store";
import type { Product } from "@/lib/types";

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  if (!checkApiKey(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { slug } = await ctx.params;
  if (!storeExists(slug)) return NextResponse.json({ error: "unknown store" }, { status: 404 });
  return NextResponse.json(listProducts(slug));
}

const REQUIRED: (keyof Product)[] = ["slug", "name_es", "name_en", "category", "price_cop", "price_usd", "stock"];

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  if (!checkApiKey(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { slug } = await ctx.params;
  if (!storeExists(slug)) return NextResponse.json({ error: "unknown store" }, { status: 404 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "body inválido" }, { status: 400 });
  const missing = REQUIRED.filter((k) => body[k] === undefined || body[k] === null);
  if (missing.length) return NextResponse.json({ error: `faltan campos: ${missing.join(", ")}` }, { status: 400 });
  const product: Product = {
    slug: String(body.slug),
    name_es: body.name_es,
    name_en: body.name_en,
    category: body.category,
    description_es: body.description_es ?? "",
    description_en: body.description_en ?? "",
    story_es: body.story_es ?? "",
    story_en: body.story_en ?? "",
    price_cop: Number(body.price_cop),
    price_usd: Number(body.price_usd),
    stock: Number(body.stock),
    production_time_days: Number(body.production_time_days ?? 3),
    materials_es: Array.isArray(body.materials_es) ? body.materials_es : [],
    materials_en: Array.isArray(body.materials_en) ? body.materials_en : [],
    weight_grams: Number(body.weight_grams ?? 300),
    featured: Boolean(body.featured ?? false),
  };
  return NextResponse.json(upsertProduct(slug, product), { status: 201 });
}
