import type { Job, Application, User } from "@prisma/client";
import {
  mapJobTypeOut,
  mapJobStatusOut,
  mapAppStatusOut,
} from "@/lib/validators";

export function serializeJob(job: Job) {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
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
  job?: Pick<Job, "id" | "title" | "company" | "location"> | null;
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
          company: a.job.company,
          location: a.job.location,
        }
      : undefined,
    user: a.user
      ? { id: a.user.id, name: a.user.name, email: a.user.email }
      : undefined,
  };
}
