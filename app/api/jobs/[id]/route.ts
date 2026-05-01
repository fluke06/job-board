import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jobUpdateSchema, mapJobType, mapJobStatus } from "@/lib/validators";
import { requireAdmin, HttpError } from "@/lib/rbac";
import { serializeJob } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ job: serializeJob(job) });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
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
    if (d.company !== undefined) data.company = d.company;
    if (d.location !== undefined) data.location = d.location;
    if (d.type !== undefined) data.type = mapJobType(d.type);
    if (d.salaryRange !== undefined) data.salaryRange = d.salaryRange;
    if (d.description !== undefined) data.description = d.description;
    if (d.requirements !== undefined) data.requirements = d.requirements;
    if (d.status !== undefined) data.status = mapJobStatus(d.status);

    try {
      const job = await prisma.job.update({ where: { id }, data });
      return NextResponse.json({ job: serializeJob(job) });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
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

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    try {
      await prisma.job.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
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
