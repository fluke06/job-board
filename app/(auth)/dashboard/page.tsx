import Link from "next/link";
import { AppStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard | JobBoard",
  description: "Your application activity at a glance.",
};

export default async function DashboardPage() {
  const session = await requireUser();
  const [user, grouped] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true },
    }),
    prisma.application.groupBy({
      by: ["status"],
      where: { userId: session.userId },
      _count: { _all: true },
    }),
  ]);

  const counts: Record<AppStatus, number> = {
    PENDING: 0,
    REVIEWED: 0,
    ACCEPTED: 0,
    REJECTED: 0,
  };
  for (const g of grouped) counts[g.status] = g._count._all;

  const cards: Array<{ label: string; value: number; tone: string }> = [
    { label: "Pending", value: counts.PENDING, tone: "text-amber-700" },
    { label: "Reviewed", value: counts.REVIEWED, tone: "text-blue-700" },
    { label: "Accepted", value: counts.ACCEPTED, tone: "text-emerald-700" },
    { label: "Rejected", value: counts.REJECTED, tone: "text-rose-700" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s how your applications are going.
          </p>
        </div>
        <Link
          href="/dashboard/applications"
          className={buttonVariants({ variant: "outline" })}
        >
          View all applications
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader>
              <CardDescription>{c.label}</CardDescription>
              <CardTitle className={`text-3xl ${c.tone}`}>{c.value}</CardTitle>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </div>
  );
}
