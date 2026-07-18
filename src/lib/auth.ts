import crypto from "crypto";
import { cookies } from "next/headers";

// Admin único de la plataforma (Isa gestiona todas las tiendas con una clave).
const SECRET = process.env.AKRONO_SECRET || "akrono-dev-secret-change-me";
export const ADMIN_PASSWORD = process.env.AKRONO_ADMIN_PASSWORD || "akrono2026";
const COOKIE = "akrono_admin";

function sign(value: string): string {
  const h = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  return `${value}.${h}`;
}
function verify(token: string | undefined): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return false;
  const value = token.slice(0, idx);
  return sign(value) === token;
}

export function makeToken(): string {
  return sign(`admin:${Date.now()}`);
}

export async function setAdminCookie() {
  const c = await cookies();
  c.set(COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}
export async function clearAdminCookie() {
  const c = await cookies();
  c.delete(COOKIE);
}
export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return verify(c.get(COOKIE)?.value);
}
