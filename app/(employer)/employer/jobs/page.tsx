import Link from "next/link";
import { JobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/rbac";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { JobStatusBadge } from "@/components/status-badge";
import { mapJobTypeOut } from "@/lib/validators";

export const metadata = {
  title: "Manage jobs",
};

const TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  remote: "Remote",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function EmployerJobsPage() {
  const ctx = await requireEmployer();
  const jobs = await prisma.job.findMany({
    where: { companyId: { in: ctx.companyIds } },
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { name: true } },
      _count: { select: { applications: true } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-8">
        <div className="space-y-3">
          <span className="text-caption text-brand-strong">Your roles</span>
          <h1 className="jb-display !text-[clamp(36px,5vw,56px)]">
            Manage jobs.
          </h1>
          <p className="text-body-lg text-muted-foreground">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"} across your
            companies.
          </p>
        </div>
        <Link
          href="/employer/jobs/new"
          className={`${buttonVariants()} shadow-[3px_3px_0_var(--foreground)] transition-transform hover:-translate-x-px hover:-translate-y-px`}
        >
          Post a job
        </Link>
      </header>

      {jobs.length === 0 ? (
        <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
          <p className="text-h4 font-semibold text-foreground">No jobs yet</p>
          <p className="mt-2 text-small">
            Post your first role to start receiving applications.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/employer/jobs/${j.id}/candidates`}
                      className="hover:underline"
                    >
                      {j.title}
                    </Link>
                  </TableCell>
                  <TableCell>{j.location}</TableCell>
                  <TableCell>{TYPE_LABEL[mapJobTypeOut(j.type)]}</TableCell>
                  <TableCell>
                    <JobStatusBadge
                      status={j.status === JobStatus.OPEN ? "open" : "closed"}
                    />
                  </TableCell>
                  <TableCell>{j._count.applications}</TableCell>
                  <TableCell className="text-small text-muted-foreground">
                    {dateFmt.format(j.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/employer/jobs/${j.id}/candidates`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        Candidates
                      </Link>
                      <Link
                        href={`/employer/jobs/${j.id}/edit`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "sm",
                        })}
                      >
                        Edit
                      </Link>
                    </div>
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
