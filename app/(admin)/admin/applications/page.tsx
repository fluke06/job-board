import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApplicationStatusSelect } from "@/components/application-row";
import { mapAppStatusOut } from "@/lib/validators";

export const metadata = {
  title: "Applications | Admin | JobBoard",
  description: "Review and update applicant status.",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function AdminApplicationsPage() {
  const items = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
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
      <header className="border-b-2 border-foreground pb-8 space-y-3">
        <span className="text-caption text-brand-strong">Platform admin</span>
        <h1 className="jb-display !text-[clamp(36px,5vw,56px)]">
          Applications.
        </h1>
        <p className="text-body-lg text-muted-foreground">
          {items.length} {items.length === 1 ? "application" : "applications"}{" "}
          across every company.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-lg border p-12 text-center text-muted-foreground">
          No applications yet.
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="font-medium">{a.user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/jobs/${a.job.id}`}
                      className="hover:underline"
                    >
                      {a.job.title}
                    </Link>
                  </TableCell>
                  <TableCell>{a.job.company.name}</TableCell>
                  <TableCell>{dateFmt.format(a.createdAt)}</TableCell>
                  <TableCell>
                    <ApplicationStatusSelect
                      applicationId={a.id}
                      value={mapAppStatusOut(a.status)}
                    />
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
