import { z } from "zod";
import { JobType, JobStatus, AppStatus } from "@prisma/client";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/\d/, "Password must contain at least one number");

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email().max(254),
  password,
  role: z.enum(["applicant", "employer"]).default("applicant"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(72),
});

const apiJobType = z.enum(["full-time", "part-time", "remote"]);
const apiJobStatus = z.enum(["open", "closed"]);
const apiAppStatus = z.enum(["pending", "reviewed", "accepted", "rejected"]);

export const jobCreateSchema = z.object({
  title: z.string().trim().min(3).max(120),
  companyId: z.string().trim().min(1).optional(),
  location: z.string().trim().min(2).max(80),
  type: apiJobType,
  salaryRange: z.string().trim().max(60).nullable().optional(),
  description: z.string().trim().min(20).max(5000),
  requirements: z.string().trim().min(10).max(3000),
  status: apiJobStatus.default("open"),
});

export const companyCreateSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "Use lowercase letters, numbers, and dashes"),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).nullable().optional(),
  logoUrl: z.string().trim().url().max(2048).nullable().optional().or(z.literal("")),
  website: z.string().trim().url().max(2048).nullable().optional().or(z.literal("")),
  size: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).nullable().optional(),
  industry: z.string().trim().max(60).nullable().optional(),
});

export const companyUpdateSchema = companyCreateSchema.partial();

export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;

export const jobUpdateSchema = jobCreateSchema.partial();

export const applySchema = z.object({
  coverLetter: z.string().trim().min(30).max(3000),
  resumeUrl: z.string().trim().url().max(2048).nullable().optional(),
});

export const statusUpdateSchema = z.object({
  status: apiAppStatus,
});

export const listJobsQuery = z.object({
  q: z.string().trim().max(100).optional(),
  type: apiJobType.optional(),
  location: z.string().trim().max(80).optional(),
  status: z.enum(["open", "closed", "all"]).optional(),
  companySlug: z.string().trim().max(60).optional(),
  posted: z.enum(["24h", "7d", "30d"]).optional(),
  sort: z.enum(["newest", "oldest", "popular"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const adminAppsQuery = z.object({
  status: apiAppStatus.optional(),
  jobId: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type JobCreateInput = z.infer<typeof jobCreateSchema>;
export type JobUpdateInput = z.infer<typeof jobUpdateSchema>;
export type ApplyInput = z.infer<typeof applySchema>;
export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;
export type ListJobsQuery = z.infer<typeof listJobsQuery>;
export type AdminAppsQuery = z.infer<typeof adminAppsQuery>;

export type ApiJobType = z.infer<typeof apiJobType>;
export type ApiJobStatus = z.infer<typeof apiJobStatus>;
export type ApiAppStatus = z.infer<typeof apiAppStatus>;

export function mapJobType(t: ApiJobType): JobType {
  switch (t) {
    case "full-time":
      return JobType.FULL_TIME;
    case "part-time":
      return JobType.PART_TIME;
    case "remote":
      return JobType.REMOTE;
  }
}

export function mapJobTypeOut(t: JobType): ApiJobType {
  switch (t) {
    case JobType.FULL_TIME:
      return "full-time";
    case JobType.PART_TIME:
      return "part-time";
    case JobType.REMOTE:
      return "remote";
  }
}

export function mapJobStatus(s: ApiJobStatus): JobStatus {
  return s === "open" ? JobStatus.OPEN : JobStatus.CLOSED;
}

export function mapJobStatusOut(s: JobStatus): ApiJobStatus {
  return s === JobStatus.OPEN ? "open" : "closed";
}

export function mapAppStatus(s: ApiAppStatus): AppStatus {
  switch (s) {
    case "pending":
      return AppStatus.PENDING;
    case "reviewed":
      return AppStatus.REVIEWED;
    case "accepted":
      return AppStatus.ACCEPTED;
    case "rejected":
      return AppStatus.REJECTED;
  }
}

export function mapAppStatusOut(s: AppStatus): ApiAppStatus {
  switch (s) {
    case AppStatus.PENDING:
      return "pending";
    case AppStatus.REVIEWED:
      return "reviewed";
    case AppStatus.ACCEPTED:
      return "accepted";
    case AppStatus.REJECTED:
      return "rejected";
  }
}
