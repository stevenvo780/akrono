import { NextResponse } from "next/server";
import { listShipments, createShipment } from "@/lib/store";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(listShipments());
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const sh = createShipment({
    order_id: b.order_id,
    scope: b.scope,
    carrier: b.carrier,
    tracking: b.tracking,
    destination: b.destination,
    status: b.status,
  });
  return NextResponse.json(sh);
}
