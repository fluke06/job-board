import Link from "next/link";
import { JobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { JobRowActions } from "@/components/job-row-actions";
import { mapJobTypeOut } from "@/lib/validators";

export const metadata = {
  title: "Manage Jobs | Admin | JobBoard",
  description: "Create, edit, and remove job postings.",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  remote: "Remote",
};

export default async function AdminJobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { id: true, slug: true, name: true } },
      _count: { select: { applications: true } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-8">
        <div className="space-y-3">
          <span className="text-caption text-brand-strong">Platform jobs</span>
          <h1 className="jb-display !text-[clamp(36px,5vw,56px)]">All jobs.</h1>
          <p className="text-body-lg text-muted-foreground">
            {jobs.length} {jobs.length === 1 ? "posting" : "postings"} across
            every company.
          </p>
        </div>
        <Link
          href="/admin/jobs/new"
          className={`${buttonVariants()} shadow-[3px_3px_0_var(--foreground)] transition-transform hover:-translate-x-px hover:-translate-y-px`}
        >
          New job
        </Link>
      </header>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Apps</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((j) => (
              <TableRow key={j.id}>
                <TableCell className="font-medium">
                  <Link href={`/jobs/${j.id}`} className="hover:underline">
                    {j.title}
                  </Link>
                </TableCell>
                <TableCell>{j.company.name}</TableCell>
                <TableCell>{j.location}</TableCell>
                <TableCell>{TYPE_LABEL[mapJobTypeOut(j.type)]}</TableCell>
                <TableCell>
                  {j.status === JobStatus.OPEN ? (
                    <Badge variant="secondary">Open</Badge>
                  ) : (
                    <Badge variant="outline">Closed</Badge>
                  )}
                </TableCell>
                <TableCell>{j._count.applications}</TableCell>
                <TableCell>{dateFmt.format(j.createdAt)}</TableCell>
                <TableCell>
                  <JobRowActions jobId={j.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
