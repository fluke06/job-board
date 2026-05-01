import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { statusUpdateSchema, mapAppStatus } from "@/lib/validators";
import { requireAdmin, HttpError } from "@/lib/rbac";
import { serializeApplication } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    const parsed = statusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    try {
      const application = await prisma.application.update({
        where: { id },
        data: { status: mapAppStatus(parsed.data.status) },
        include: {
          user: { select: { id: true, name: true, email: true } },
          job: { select: { id: true, title: true, company: true, location: true } },
        },
      });
      return NextResponse.json({
        application: serializeApplication(application),
      });
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
