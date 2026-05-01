import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
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
  title: "My applications",
  description: "Track the status of every job you've applied to.",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function ApplicationsPage() {
  const session = await requireUser();
  const items = await prisma.application.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          company: { select: { id: true, slug: true, name: true } },
        },
      },
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16 space-y-8">
      <div className="space-y-4">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-small text-muted-foreground"
        >
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
          <span className="text-foreground">Applications</span>
        </nav>
        <header>
          <h1>My applications</h1>
          <p className="mt-2 text-body-lg text-muted-foreground">
            All roles you&apos;ve applied to.
          </p>
        </header>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
          <p className="text-h4 font-semibold text-foreground">
            You haven&apos;t applied to any jobs yet
          </p>
          <p className="mt-2 text-small">
            Browse open roles to get started.
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
                  Job
                </TableHead>
                <TableHead className="text-caption text-muted-foreground">
                  Company
                </TableHead>
                <TableHead className="text-caption text-muted-foreground">
                  Applied
                </TableHead>
                <TableHead className="text-caption text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-right text-caption text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.job.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <Link
                      href={`/companies/${a.job.company.slug}`}
                      className="hover:text-foreground hover:underline"
                    >
                      {a.job.company.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dateFmt.format(a.createdAt)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={mapAppStatusOut(a.status)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/jobs/${a.job.id}`}
                      className="text-small font-medium text-foreground hover:underline"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
