import Link from "next/link";
import { JobStatus, AppStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Admin | JobBoard",
  description: "Internal admin overview.",
};

export default async function AdminOverviewPage() {
  const [totalJobs, openJobs, totalApps, pendingApps] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { status: JobStatus.OPEN } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: AppStatus.PENDING } }),
  ]);

  const cards = [
    { label: "Total jobs", value: totalJobs },
    { label: "Open jobs", value: openJobs },
    { label: "Total applications", value: totalApps },
    { label: "Pending applications", value: pendingApps },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin overview</h1>
          <p className="text-sm text-muted-foreground">
            Manage jobs and review applications.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/jobs"
            className={buttonVariants({ variant: "outline" })}
          >
            Manage jobs
          </Link>
          <Link
            href="/admin/applications"
            className={buttonVariants({ variant: "outline" })}
          >
            Applications
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader>
              <CardDescription>{c.label}</CardDescription>
              <CardTitle className="text-3xl">{c.value}</CardTitle>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </div>
  );
}
