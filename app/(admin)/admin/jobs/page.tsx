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
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Jobs</h1>
          <p className="text-sm text-muted-foreground">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
          </p>
        </div>
        <Link href="/admin/jobs/new" className={buttonVariants()}>
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
                <TableCell>{j.company}</TableCell>
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
