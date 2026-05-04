import { NextRequest, NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { adminUsersQuery } from "@/lib/validators";
import { requireAdmin, HttpError } from "@/lib/rbac";

const ROLE_TO_PRISMA: Record<string, Role> = {
  applicant: Role.APPLICANT,
  employer: Role.EMPLOYER,
  admin: Role.ADMIN,
};

const ROLE_TO_API: Record<Role, "applicant" | "employer" | "admin"> = {
  APPLICANT: "applicant",
  EMPLOYER: "employer",
  ADMIN: "admin",
};

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const parsed = adminUsersQuery.safeParse(
      Object.fromEntries(url.searchParams),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const { q, role, page, pageSize } = parsed.data;
    const where: Prisma.UserWhereInput = {};
    if (role) where.role = ROLE_TO_PRISMA[role];
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { applications: true, companies: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      items: items.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: ROLE_TO_API[u.role],
        createdAt: u.createdAt.toISOString(),
        applicationCount: u._count.applications,
        companyCount: u._count.companies,
      })),
      page,
      pageSize,
      total,
    });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}
