import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jobUpdateSchema, mapJobType, mapJobStatus } from "@/lib/validators";
import { requireCompanyMember, HttpError } from "@/lib/rbac";
import { serializeJob } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

async function loadJobOrError(id: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    select: { companyId: true },
  });
  if (!job)
    return {
      job: null,
      response: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  return { job, response: null };
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { job, response } = await loadJobOrError(id);
    if (!job) return response!;
    await requireCompanyMember(job.companyId);

    const body = await req.json().catch(() => null);
    const parsed = jobUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const d = parsed.data;
    const data: Prisma.JobUpdateInput = {};
    if (d.title !== undefined) data.title = d.title;
    if (d.location !== undefined) data.location = d.location;
    if (d.type !== undefined) data.type = mapJobType(d.type);
    if (d.salaryRange !== undefined) data.salaryRange = d.salaryRange;
    if (d.description !== undefined) data.description = d.description;
    if (d.requirements !== undefined) data.requirements = d.requirements;
    if (d.status !== undefined) data.status = mapJobStatus(d.status);

    const updated = await prisma.job.update({
      where: { id },
      data,
      include: {
        company: { select: { id: true, slug: true, name: true, logoUrl: true } },
      },
    });
    return NextResponse.json({ job: serializeJob(updated) });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { job, response } = await loadJobOrError(id);
    if (!job) return response!;
    await requireCompanyMember(job.companyId);

    await prisma.job.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}
