import Link from "next/link";
import { AppStatus } from "@prisma/client";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  FileText,
  XCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { AnimatedCounter } from "@/components/animated-counter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { mapAppStatusOut } from "@/lib/validators";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard",
  description: "Your application activity at a glance.",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function DashboardPage() {
  const session = await requireUser();
  const [user, grouped, recent] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true },
    }),
    prisma.application.groupBy({
      by: ["status"],
      where: { userId: session.userId },
      _count: { _all: true },
    }),
    prisma.application.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: { select: { id: true, slug: true, name: true } },
          },
        },
      },
    }),
  ]);

  const counts: Record<AppStatus, number> = {
    PENDING: 0,
    REVIEWED: 0,
    ACCEPTED: 0,
    REJECTED: 0,
  };
  for (const g of grouped) counts[g.status] = g._count._all;
  const total =
    counts.PENDING + counts.REVIEWED + counts.ACCEPTED + counts.REJECTED;

  const stats: Array<{
    label: string;
    value: number;
    Icon: typeof FileText;
    iconClass: string;
  }> = [
    {
      label: "Total applied",
      value: total,
      Icon: FileText,
      iconClass: "text-muted-foreground",
    },
    {
      label: "In review",
      value: counts.PENDING + counts.REVIEWED,
      Icon: Eye,
      iconClass: "text-status-reviewed-text",
    },
    {
      label: "Accepted",
      value: counts.ACCEPTED,
      Icon: CheckCircle2,
      iconClass: "text-status-accepted-text",
    },
    {
      label: "Rejected",
      value: counts.REJECTED,
      Icon: XCircle,
      iconClass: "text-status-rejected-text",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16 space-y-12">
      <header className="space-y-2">
        <h1>
          Your applications
          {user?.name ? (
            <span className="text-muted-foreground">
              {" "}
              · {user.name.split(" ")[0]}
            </span>
          ) : null}
        </h1>
        <p className="text-body-lg text-muted-foreground">
          Track and manage your recent job applications.
        </p>
      </header>

      <section
        aria-labelledby="stats"
        className="grid gap-4 grid-cols-2 lg:grid-cols-4"
      >
        <h2 id="stats" className="sr-only">
          Application stats
        </h2>
        {stats.map((s) => (
          <article
            key={s.label}
            className="jb-card-hover flex flex-col gap-4 rounded-lg border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-small font-medium text-muted-foreground">
                {s.label}
              </span>
              <s.Icon
                className={`size-5 ${s.iconClass}`}
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </div>
            <span className="text-h1 font-bold leading-none">
              <AnimatedCounter value={s.value} />
            </span>
          </article>
        ))}
      </section>

      <section className="space-y-4" aria-labelledby="recent-apps">
        <header className="flex items-end justify-between">
          <h2 id="recent-apps" className="text-h3 font-semibold">
            Recent applications
          </h2>
          <Link
            href="/dashboard/applications"
            className="inline-flex items-center gap-1 text-small font-medium text-foreground hover:underline"
          >
            View all
            <ArrowRight
              className="size-4"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </Link>
        </header>

        {recent.length === 0 ? (
          <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
            <p className="text-h4 font-semibold text-foreground">
              You haven&apos;t applied yet
            </p>
            <p className="mt-2 text-small">
              Browse open roles and apply with one click.
            </p>
            <div className="mt-6">
              <Link href="/jobs" className={buttonVariants()}>
                Browse jobs
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-caption text-muted-foreground">
                    Company
                  </TableHead>
                  <TableHead className="text-caption text-muted-foreground">
                    Role
                  </TableHead>
                  <TableHead className="text-caption text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-right text-caption text-muted-foreground">
                    Date applied
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/companies/${a.job.company.slug}`}
                        className="hover:underline"
                      >
                        {a.job.company.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <Link
                        href={`/jobs/${a.job.id}`}
                        className="hover:text-foreground hover:underline"
                      >
                        {a.job.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={mapAppStatusOut(a.status)} />
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {dateFmt.format(a.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
