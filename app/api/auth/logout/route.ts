import { NextResponse } from "next/server";
import { getSession, clearSessionCookie } from "@/lib/auth";
import { logEvent } from "@/lib/logger";

export async function POST() {
  const session = await getSession();
  if (session) logEvent("auth.logout", { userId: session.userId });
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
