import { prisma } from "@/lib/prisma";
import { JobForm } from "@/components/job-form";

export const metadata = {
  title: "New Job | Admin | JobBoard",
  description: "Create a new job posting.",
};

export default async function NewJobPage() {
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">New job</h1>
      <JobForm mode="create" companies={companies} />
    </div>
  );
}
