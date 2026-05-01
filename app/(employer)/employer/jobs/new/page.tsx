import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/rbac";
import { JobForm } from "@/components/job-form";

export const metadata = {
  title: "Post a job",
};

export default async function NewJobPage() {
  const ctx = await requireEmployer();
  if (ctx.companyIds.length === 0) redirect("/employer/onboarding");

  const companies = await prisma.company.findMany({
    where: { id: { in: ctx.companyIds } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16 space-y-6">
      <header>
        <h1>Post a job</h1>
        <p className="mt-2 text-body-lg text-muted-foreground">
          Roles you post here are visible publicly on /jobs.
        </p>
      </header>
      <JobForm
        mode="create"
        companies={companies}
        defaultValues={{
          companyId: companies[0]?.id ?? "",
        }}
        endpoint={{
          create: "/api/employer/jobs",
          update: (id) => `/api/employer/jobs/${id}`,
        }}
        cancelHref="/employer/jobs"
        successHref="/employer/jobs"
        hideCompany={companies.length <= 1}
      />
    </div>
  );
}
