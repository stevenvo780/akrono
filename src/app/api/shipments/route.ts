import { NextResponse } from "next/server";
import { listShipments, createShipment } from "@/lib/store";
import { isAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const store = new URL(req.url).searchParams.get("store");
  if (!store) return NextResponse.json({ error: "missing store" }, { status: 400 });
  return NextResponse.json(listShipments(store));
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const store = new URL(req.url).searchParams.get("store");
  if (!store) return NextResponse.json({ error: "missing store" }, { status: 400 });
  const b = await req.json().catch(() => ({}));
  const sh = createShipment(store, {
    order_id: b.order_id,
    scope: b.scope,
    carrier: b.carrier,
    tracking: b.tracking,
    destination: b.destination,
    status: b.status,
  });
  return NextResponse.json(sh);
}
