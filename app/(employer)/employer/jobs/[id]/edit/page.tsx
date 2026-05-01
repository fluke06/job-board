import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCompanyMember } from "@/lib/rbac";
import { JobForm } from "@/components/job-form";
import { mapJobStatusOut, mapJobTypeOut } from "@/lib/validators";

export const metadata = {
  title: "Edit job",
};

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) notFound();
  const ctx = await requireCompanyMember(job.companyId);

  const companies = await prisma.company.findMany({
    where: { id: { in: ctx.companyIds } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16 space-y-6">
      <header>
        <h1>Edit job</h1>
        <p className="mt-2 text-body-lg text-muted-foreground">
          Update the role details. Changes go live immediately.
        </p>
      </header>
      <JobForm
        mode="edit"
        jobId={job.id}
        companies={companies}
        defaultValues={{
          title: job.title,
          companyId: job.companyId,
          location: job.location,
          type: mapJobTypeOut(job.type),
          salaryRange: job.salaryRange ?? "",
          description: job.description,
          requirements: job.requirements,
          status: mapJobStatusOut(job.status),
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
