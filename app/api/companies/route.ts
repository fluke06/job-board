import { NextRequest, NextResponse } from "next/server";
import { Prisma, CompanyMemberRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { companyCreateSchema } from "@/lib/validators";
import { requireUser, HttpError } from "@/lib/rbac";
import { serializeCompany } from "@/lib/serialize";

export async function GET() {
  const items = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { jobs: true } } },
  });
  return NextResponse.json({ items: items.map(serializeCompany) });
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = companyCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const data = parsed.data;
    try {
      const company = await prisma.$transaction(async (tx) => {
        const created = await tx.company.create({
          data: {
            slug: data.slug,
            name: data.name,
            description: data.description ?? null,
            logoUrl: data.logoUrl ? data.logoUrl : null,
            website: data.website ? data.website : null,
            size: data.size ?? null,
            industry: data.industry ?? null,
          },
        });
        await tx.companyMember.create({
          data: {
            userId: session.userId,
            companyId: created.id,
            role: CompanyMemberRole.OWNER,
          },
        });
        await tx.user.update({
          where: { id: session.userId },
          data: { role: "EMPLOYER" },
        });
        return created;
      });
      return NextResponse.json(
        { company: serializeCompany(company) },
        { status: 201 },
      );
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Slug already taken" },
          { status: 409 },
        );
      }
      throw e;
    }
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}
