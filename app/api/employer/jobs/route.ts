import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jobCreateSchema, mapJobType, mapJobStatus } from "@/lib/validators";
import { requireEmployer, requireCompanyMember, HttpError } from "@/lib/rbac";
import { serializeJob } from "@/lib/serialize";

export async function GET() {
  try {
    const ctx = await requireEmployer();
    const where = ctx.companyIds.length
      ? { companyId: { in: ctx.companyIds } }
      : { id: "__never__" };
    const items = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { id: true, slug: true, name: true, logoUrl: true } },
        _count: { select: { applications: true } },
      },
    });
    return NextResponse.json({
      items: items.map((j) => ({
        ...serializeJob(j),
        applicationCount: j._count.applications,
      })),
    });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = jobCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const data = parsed.data;
    if (!data.companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 },
      );
    }
    const ctx = await requireCompanyMember(data.companyId);
    const job = await prisma.job.create({
      data: {
        title: data.title,
        companyId: data.companyId,
        location: data.location,
        type: mapJobType(data.type),
        salaryRange: data.salaryRange ?? null,
        description: data.description,
        requirements: data.requirements,
        status: mapJobStatus(data.status),
        createdById: ctx.session.userId,
      },
      include: {
        company: { select: { id: true, slug: true, name: true, logoUrl: true } },
      },
    });
    return NextResponse.json({ job: serializeJob(job) }, { status: 201 });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}
