import { NextRequest, NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { userRoleUpdateSchema } from "@/lib/validators";
import { requireAdmin, HttpError } from "@/lib/rbac";

type Ctx = { params: Promise<{ id: string }> };

const ROLE_TO_PRISMA: Record<string, Role> = {
  applicant: Role.APPLICANT,
  employer: Role.EMPLOYER,
  admin: Role.ADMIN,
};

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const session = await requireAdmin();
    const { id } = await ctx.params;
    if (id === session.userId) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 },
      );
    }
    const body = await req.json().catch(() => null);
    const parsed = userRoleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    try {
      const updated = await prisma.user.update({
        where: { id },
        data: { role: ROLE_TO_PRISMA[parsed.data.role] },
        select: { id: true, role: true },
      });
      return NextResponse.json({
        user: { id: updated.id, role: parsed.data.role },
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
