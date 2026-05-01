import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JobForm } from "@/components/job-form";
import { mapJobStatusOut, mapJobTypeOut } from "@/lib/validators";

export const metadata = {
  title: "Edit Job | Admin | JobBoard",
  description: "Edit an existing job posting.",
};

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [job, companies] = await Promise.all([
    prisma.job.findUnique({ where: { id } }),
    prisma.company.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Edit job</h1>
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
      />
    </div>
  );
}
