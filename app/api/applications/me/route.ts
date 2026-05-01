import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, HttpError } from "@/lib/rbac";
import { serializeApplication } from "@/lib/serialize";

export async function GET() {
  try {
    const session = await requireUser();
    const items = await prisma.application.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
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
    return NextResponse.json({ items: items.map(serializeApplication) });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}
