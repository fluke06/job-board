import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { adminAppsQuery, mapAppStatus } from "@/lib/validators";
import { requireAdmin, HttpError } from "@/lib/rbac";
import { serializeApplication } from "@/lib/serialize";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const parsed = adminAppsQuery.safeParse(
      Object.fromEntries(url.searchParams),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const { status, jobId, page, pageSize } = parsed.data;
    const where: Prisma.ApplicationWhereInput = {};
    if (status) where.status = mapAppStatus(status);
    if (jobId) where.jobId = jobId;

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, email: true } },
          job: { select: { id: true, title: true, company: true, location: true } },
        },
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      items: items.map(serializeApplication),
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
