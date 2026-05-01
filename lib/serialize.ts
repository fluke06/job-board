import type { Job, Application, User, Company } from "@prisma/client";
import {
  mapJobTypeOut,
  mapJobStatusOut,
  mapAppStatusOut,
} from "@/lib/validators";

type JobWithCompany = Job & {
  company?: Pick<Company, "id" | "slug" | "name" | "logoUrl"> | null;
};

export function serializeJob(job: JobWithCompany) {
  return {
    id: job.id,
    title: job.title,
    company: job.company
      ? {
          id: job.company.id,
          slug: job.company.slug,
          name: job.company.name,
          logoUrl: job.company.logoUrl,
        }
      : undefined,
    companyId: job.companyId,
    location: job.location,
    type: mapJobTypeOut(job.type),
    salaryRange: job.salaryRange,
    description: job.description,
    requirements: job.requirements,
    status: mapJobStatusOut(job.status),
    createdById: job.createdById,
    createdAt: job.createdAt.toISOString(),
  };
}

type AppWithRefs = Application & {
  job?:
    | (Pick<Job, "id" | "title" | "location"> & {
        company?: Pick<Company, "id" | "slug" | "name"> | null;
      })
    | null;
  user?: Pick<User, "id" | "name" | "email"> | null;
};

export function serializeApplication(a: AppWithRefs) {
  return {
    id: a.id,
    jobId: a.jobId,
    userId: a.userId,
    coverLetter: a.coverLetter,
    resumeUrl: a.resumeUrl,
    status: mapAppStatusOut(a.status),
    createdAt: a.createdAt.toISOString(),
    job: a.job
      ? {
          id: a.job.id,
          title: a.job.title,
          location: a.job.location,
          company: a.job.company
            ? {
                id: a.job.company.id,
                slug: a.job.company.slug,
                name: a.job.company.name,
              }
            : null,
        }
      : undefined,
    user: a.user
      ? { id: a.user.id, name: a.user.name, email: a.user.email }
      : undefined,
  };
}

export function serializeCompany(c: Company & { _count?: { jobs?: number } }) {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    logoUrl: c.logoUrl,
    website: c.website,
    size: c.size,
    industry: c.industry,
    createdAt: c.createdAt.toISOString(),
    jobCount: c._count?.jobs,
  };
}
