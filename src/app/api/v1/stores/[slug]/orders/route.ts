import { NextResponse } from "next/server";
import { checkApiKey } from "@/lib/apikey";
import { listOrders, storeExists } from "@/lib/store";

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  if (!checkApiKey(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { slug } = await ctx.params;
  if (!storeExists(slug)) return NextResponse.json({ error: "unknown store" }, { status: 404 });
  return NextResponse.json(listOrders(slug));
}
