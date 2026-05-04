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
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-8">
        <div className="space-y-3">
          <span className="text-caption text-brand-strong">Platform admin</span>
          <h1 className="jb-display !text-[clamp(36px,5vw,56px)]">
            Admin overview.
          </h1>
          <p className="text-body-lg text-muted-foreground">
            Manage jobs and review applications across the platform.
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="space-y-1">
              <CardDescription className="text-caption">
                {c.label}
              </CardDescription>
              <CardTitle className="text-3xl">{c.value}</CardTitle>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </div>
  );
}
