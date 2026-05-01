import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompanyMember, HttpError } from "@/lib/rbac";
import { serializeApplication } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const job = await prisma.job.findUnique({
      where: { id },
      select: {
        companyId: true,
        title: true,
        company: { select: { id: true, slug: true, name: true } },
      },
    });
    if (!job)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    await requireCompanyMember(job.companyId);

    const items = await prisma.application.findMany({
      where: { jobId: id },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            company: { select: { id: true, slug: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({
      job: { id, title: job.title, company: job.company },
      items: items.map(serializeApplication),
    });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}
