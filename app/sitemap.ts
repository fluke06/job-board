import type { MetadataRoute } from "next";
import { JobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const openJobs = await prisma.job.findMany({
    where: { status: JobStatus.OPEN },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/jobs`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  const jobEntries: MetadataRoute.Sitemap = openJobs.map((j) => ({
    url: `${SITE_URL}/jobs/${j.id}`,
    lastModified: j.createdAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...jobEntries];
}
