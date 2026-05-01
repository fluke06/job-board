import { createHash } from "crypto";

const REDACT_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "cookie",
  "authorization",
]);

function hashEmail(email: string): string {
  return createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 32);
}

function redact(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const lk = k.toLowerCase();
    if (REDACT_KEYS.has(lk)) {
      out[k] = "[REDACTED]";
      continue;
    }
    if (lk === "email" && typeof v === "string") {
      out.emailHash = hashEmail(v);
      continue;
    }
    out[k] = redact(v);
  }
  return out;
}

export function logEvent(type: string, data: Record<string, unknown> = {}): void {
  const payload = {
    ts: new Date().toISOString(),
    type,
    ...(redact(data) as Record<string, unknown>),
  };
  console.log(JSON.stringify(payload));
}
