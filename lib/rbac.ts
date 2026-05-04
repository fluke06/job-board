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

export type EmployerContext = {
  session: Session;
  companyIds: string[];
  ownCompanyIds: string[];
};

export async function requireEmployer(): Promise<EmployerContext> {
  const session = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      role: true,
      companies: { select: { companyId: true } },
    },
  });
  if (!user) throw new HttpError(401, "Unauthorized");
  if (user.role !== Role.EMPLOYER && user.role !== Role.ADMIN) {
    throw new HttpError(403, "Forbidden");
  }

  const ownCompanyIds = user.companies.map((c) => c.companyId);

  if (user.role === Role.ADMIN) {
    const all = await prisma.company.findMany({ select: { id: true } });
    return {
      session,
      companyIds: all.map((c) => c.id),
      ownCompanyIds,
    };
  }

  return {
    session,
    companyIds: ownCompanyIds,
    ownCompanyIds,
  };
}

export async function requireCompanyMember(companyId: string): Promise<EmployerContext> {
  const ctx = await requireEmployer();
  if (ctx.session.role === Role.ADMIN) return ctx;
  if (!ctx.companyIds.includes(companyId)) {
    throw new HttpError(403, "Not a member of this company");
  }
  return ctx;
}
