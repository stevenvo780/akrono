#!/usr/bin/env bash
# Levanta un server Next de prueba y corre el test de integración del MCP contra él.
set -e
cd "$(dirname "$0")/.."
PORT=3997
DB=/tmp/akrono-mcp-test.db
KEY=test-key-123

rm -f "$DB"*
fuser -k ${PORT}/tcp 2>/dev/null || true
sleep 1
echo "→ levantando server Next en :${PORT}"
AKRONO_DB="$DB" AKRONO_API_KEY="$KEY" NODE_ENV=production ./node_modules/.bin/next start -p ${PORT} >/tmp/akrono-mcp-server.log 2>&1 &
SRV=$!
trap "kill $SRV 2>/dev/null || true; fuser -k ${PORT}/tcp 2>/dev/null || true" EXIT

# esperar a que responda
for i in $(seq 1 30); do
  curl -sf -o /dev/null "http://localhost:${PORT}/api/v1/stores" -H "Authorization: Bearer ${KEY}" && break
  sleep 1
done

echo "→ corriendo test del MCP"
cd mcp
AKRONO_BASE_URL="http://localhost:${PORT}" AKRONO_API_KEY="${KEY}" node test-mcp.mjs
