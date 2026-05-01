import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { verifyPassword } from "@/lib/password";
import { signToken, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, AUTH_RATE_LIMIT } from "@/lib/rate-limit";
import { logEvent } from "@/lib/logger";

function getIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return "local";
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const rl = checkRateLimit(`login:${ip}`, AUTH_RATE_LIMIT.limit, AUTH_RATE_LIMIT.windowMs);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const generic = () =>
    NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user) {
    logEvent("auth.login.failure", { email: parsed.data.email, ip, reason: "no_user" });
    return generic();
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    logEvent("auth.login.failure", { email: parsed.data.email, ip, reason: "bad_password" });
    return generic();
  }

  const token = await signToken({ sub: user.id, role: user.role });
  logEvent("auth.login.success", { userId: user.id, email: user.email, ip });
  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role.toLowerCase() },
  });
  setSessionCookie(res, token);
  return res;
}
