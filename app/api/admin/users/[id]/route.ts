import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin, HttpError } from "@/lib/rbac";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const session = await requireAdmin();
    const { id } = await ctx.params;
    if (id === session.userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 },
      );
    }
    try {
      await prisma.user.delete({ where: { id } });
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
