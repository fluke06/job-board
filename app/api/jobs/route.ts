import { NextRequest, NextResponse } from "next/server";
import { Prisma, JobStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  jobCreateSchema,
  listJobsQuery,
  mapJobType,
  mapJobStatus,
} from "@/lib/validators";
import { getSession } from "@/lib/auth";
import { requireAdmin, HttpError } from "@/lib/rbac";
import { serializeJob } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parsed = listJobsQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { q, type, location, companySlug, posted, sort, page, pageSize } =
    parsed.data;
  let { status } = parsed.data;

  const session = await getSession();
  if (status && status !== "open" && session?.role !== Role.ADMIN) {
    status = "open";
  }
  if (!status) status = "open";

  const where: Prisma.JobWhereInput = {};
  if (status === "open") where.status = JobStatus.OPEN;
  else if (status === "closed") where.status = JobStatus.CLOSED;
  if (type) where.type = mapJobType(type);
  if (location) where.location = { contains: location };
  if (companySlug) where.company = { slug: companySlug };
  if (posted) {
    const days = posted === "24h" ? 1 : posted === "7d" ? 7 : 30;
    where.createdAt = {
      gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
    };
  }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { company: { name: { contains: q } } },
      { description: { contains: q } },
    ];
  }

  const orderBy: Prisma.JobOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "popular"
        ? { applications: { _count: "desc" } }
        : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        company: { select: { id: true, slug: true, name: true, logoUrl: true } },
      },
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map(serializeJob),
    page,
    pageSize,
    total,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
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
        createdById: session.userId,
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
