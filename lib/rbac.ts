import { Role } from "@prisma/client";
import { getSession, type Session } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export async function requireUser(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new HttpError(401, "Unauthorized");
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  if (!user || user.role !== Role.ADMIN) {
    throw new HttpError(403, "Forbidden");
  }
  return session;
}
