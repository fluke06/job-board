import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { companyUpdateSchema } from "@/lib/validators";
import { requireCompanyMember, HttpError } from "@/lib/rbac";
import { serializeCompany } from "@/lib/serialize";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  const company = await prisma.company.findUnique({
    where: { slug },
    include: { _count: { select: { jobs: true } } },
  });
  if (!company) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ company: serializeCompany(company) });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const { slug } = await ctx.params;
    const company = await prisma.company.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!company)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    await requireCompanyMember(company.id);

    const body = await req.json().catch(() => null);
    const parsed = companyUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const d = parsed.data;
    const data: Prisma.CompanyUpdateInput = {};
    if (d.slug !== undefined) data.slug = d.slug;
    if (d.name !== undefined) data.name = d.name;
    if (d.description !== undefined) data.description = d.description;
    if (d.logoUrl !== undefined)
      data.logoUrl = d.logoUrl ? d.logoUrl : null;
    if (d.website !== undefined)
      data.website = d.website ? d.website : null;
    if (d.size !== undefined) data.size = d.size;
    if (d.industry !== undefined) data.industry = d.industry;

    try {
      const updated = await prisma.company.update({
        where: { id: company.id },
        data,
        include: { _count: { select: { jobs: true } } },
      });
      return NextResponse.json({ company: serializeCompany(updated) });
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
