import { NextRequest, NextResponse } from "next/server";
import { Prisma, JobStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { applySchema } from "@/lib/validators";
import { requireUser, HttpError } from "@/lib/rbac";
import { serializeApplication } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const session = await requireUser();
    if (session.role === Role.ADMIN || session.role === Role.EMPLOYER) {
      return NextResponse.json(
        { error: "Only applicants can apply to jobs" },
        { status: 403 },
      );
    }

    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    const parsed = applySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (job.status === JobStatus.CLOSED) {
      return NextResponse.json({ error: "Job is closed" }, { status: 400 });
    }

    try {
      const application = await prisma.application.create({
        data: {
          jobId: id,
          userId: session.userId,
          coverLetter: parsed.data.coverLetter,
          resumeUrl: parsed.data.resumeUrl ?? null,
        },
        include: {
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
      return NextResponse.json(
        { application: serializeApplication(application) },
        { status: 201 },
      );
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        return NextResponse.json({ error: "Already applied" }, { status: 409 });
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
