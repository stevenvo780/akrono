import { NextResponse } from "next/server";
import { ADMIN_PASSWORD, setAdminCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body.password === ADMIN_PASSWORD) {
    await setAdminCookie();
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "invalid" }, { status: 401 });
}
