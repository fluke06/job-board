import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { hashPassword } from "@/lib/password";
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
  const rl = checkRateLimit(`register:${ip}`, AUTH_RATE_LIMIT.limit, AUTH_RATE_LIMIT.windowMs);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);

  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
      },
      select: { id: true, name: true, email: true, role: true },
    });
    const token = await signToken({ sub: user.id, role: user.role });
    logEvent("auth.register", { userId: user.id, email: user.email, ip });
    const res = NextResponse.json(
      {
        user: { id: user.id, name: user.name, email: user.email, role: user.role.toLowerCase() },
      },
      { status: 201 },
    );
    setSessionCookie(res, token);
    return res;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    throw e;
  }
}
