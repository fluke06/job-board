import Link from "next/link";
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

export const metadata = {
  title: "My Applications | JobBoard",
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
      job: { select: { id: true, title: true, company: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">My applications</h1>
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "application" : "applications"}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-lg border p-12 text-center text-muted-foreground">
          You haven&apos;t applied to any jobs yet.{" "}
          <Link href="/jobs" className="font-medium hover:underline">
            Browse jobs →
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/jobs/${a.job.id}`}
                      className="hover:underline"
                    >
                      {a.job.title}
                    </Link>
                  </TableCell>
                  <TableCell>{a.job.company}</TableCell>
                  <TableCell>{dateFmt.format(a.createdAt)}</TableCell>
                  <TableCell>
                    <StatusBadge status={mapAppStatusOut(a.status)} />
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
