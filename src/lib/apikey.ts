// Autenticación por API key para la API de gestión (/api/v1).
// La clave se configura con AKRONO_API_KEY. Se envía como `Authorization: Bearer <key>`.

const API_KEY = process.env.AKRONO_API_KEY || "akrono-dev-api-key-change-me";

export function checkApiKey(req: Request): boolean {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return token.length > 0 && token === API_KEY;
}
