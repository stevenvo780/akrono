import { NextResponse } from "next/server";
import { checkApiKey } from "@/lib/apikey";
import { listStores, createStore, storeExists } from "@/lib/store";
import { defaultStoreConfig } from "@/lib/tenant";

export async function GET(req: Request) {
  if (!checkApiKey(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(listStores());
}

export async function POST(req: Request) {
  if (!checkApiKey(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.slug || !body?.name) {
    return NextResponse.json({ error: "slug y name son obligatorios" }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(body.slug)) {
    return NextResponse.json({ error: "slug inválido (usa minúsculas, números y guiones)" }, { status: 400 });
  }
  if (storeExists(body.slug)) {
    return NextResponse.json({ error: `la tienda "${body.slug}" ya existe` }, { status: 409 });
  }
  const config = defaultStoreConfig(body);
  const created = createStore(config);
  return NextResponse.json(created, { status: 201 });
}
