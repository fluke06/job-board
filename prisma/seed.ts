import { PrismaClient, Role, JobType, JobStatus, AppStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("Admin123!", 12);
  const userHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash: adminHash, name: "Admin", role: Role.ADMIN },
    create: {
      email: "admin@example.com",
      name: "Admin",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: { passwordHash: userHash, name: "Alice", role: Role.APPLICANT },
    create: {
      email: "alice@example.com",
      name: "Alice",
      passwordHash: userHash,
      role: Role.APPLICANT,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: { passwordHash: userHash, name: "Bob", role: Role.APPLICANT },
    create: {
      email: "bob@example.com",
      name: "Bob",
      passwordHash: userHash,
      role: Role.APPLICANT,
    },
  });

  const jobs: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    type: JobType;
    salaryRange: string | null;
    description: string;
    requirements: string;
    status: JobStatus;
  }> = [
    {
      id: "seed_job_1",
      title: "Senior Backend Engineer",
      company: "Acme Corp",
      location: "Manila",
      type: JobType.FULL_TIME,
      salaryRange: "$60k–$90k",
      description:
        "Design and build scalable backend services in Node.js and TypeScript. Lead architecture decisions and mentor junior engineers.",
      requirements:
        "5+ years backend experience, TypeScript, Postgres, REST/GraphQL.",
      status: JobStatus.OPEN,
    },
    {
      id: "seed_job_2",
      title: "Full-Stack Engineer",
      company: "Globex",
      location: "Singapore",
      type: JobType.FULL_TIME,
      salaryRange: "$55k–$80k",
      description:
        "Build end-to-end product features across React frontend and Node backend. Collaborate closely with product and design.",
      requirements: "3+ years full-stack, React, Node, SQL.",
      status: JobStatus.OPEN,
    },
    {
      id: "seed_job_3",
      title: "Frontend Engineer",
      company: "Initech",
      location: "Tokyo",
      type: JobType.FULL_TIME,
      salaryRange: "¥7M–¥10M",
      description:
        "Craft pixel-perfect, accessible UIs in React and Tailwind. Work on the design system and shared component library.",
      requirements: "2+ years frontend, React, accessibility, CSS.",
      status: JobStatus.OPEN,
    },
    {
      id: "seed_job_4",
      title: "Site Reliability Engineer",
      company: "Hooli",
      location: "Manila",
      type: JobType.FULL_TIME,
      salaryRange: "$70k–$100k",
      description:
        "Operate production infrastructure with high availability targets. Build observability tooling and lead incident response.",
      requirements: "Linux, Kubernetes, Terraform, on-call experience.",
      status: JobStatus.CLOSED,
    },
    {
      id: "seed_job_5",
      title: "Technical Writer",
      company: "Pied Piper",
      location: "Remote",
      type: JobType.PART_TIME,
      salaryRange: "$40/hr",
      description:
        "Produce developer documentation and tutorials for our APIs. Partner with engineers to clarify and structure technical content.",
      requirements: "Strong writing samples, basic API/SDK literacy.",
      status: JobStatus.OPEN,
    },
    {
      id: "seed_job_6",
      title: "QA Analyst",
      company: "Massive Dynamic",
      location: "Singapore",
      type: JobType.PART_TIME,
      salaryRange: "$30/hr",
      description:
        "Design and execute test plans across web and mobile. Triage regressions and partner with engineers on root cause.",
      requirements: "Manual QA experience, basic scripting, attention to detail.",
      status: JobStatus.OPEN,
    },
    {
      id: "seed_job_7",
      title: "UX Researcher",
      company: "Stark Industries",
      location: "Tokyo",
      type: JobType.PART_TIME,
      salaryRange: "¥5M–¥7M",
      description:
        "Run qualitative and quantitative studies that shape product direction. Synthesize findings into actionable insights for product teams.",
      requirements: "2+ years UX research, interview and survey methods.",
      status: JobStatus.CLOSED,
    },
    {
      id: "seed_job_8",
      title: "DevOps Engineer",
      company: "Cyberdyne",
      location: "Remote",
      type: JobType.REMOTE,
      salaryRange: "$80k–$120k",
      description:
        "Own CI/CD pipelines and developer experience. Drive automation and infrastructure-as-code across the organization.",
      requirements: "GitHub Actions, Docker, AWS or GCP, scripting.",
      status: JobStatus.OPEN,
    },
    {
      id: "seed_job_9",
      title: "Product Designer",
      company: "Wayne Enterprises",
      location: "Remote",
      type: JobType.REMOTE,
      salaryRange: "$70k–$110k",
      description:
        "Design user-centered solutions across web and mobile. Lead product discovery and partner closely with engineering and PM.",
      requirements: "Portfolio with shipped product work, Figma proficiency.",
      status: JobStatus.OPEN,
    },
    {
      id: "seed_job_10",
      title: "Data Engineer",
      company: "Soylent",
      location: "Remote",
      type: JobType.REMOTE,
      salaryRange: "$90k–$130k",
      description:
        "Build the data platform powering analytics and ML. Design batch and streaming pipelines and own data quality.",
      requirements: "SQL, Python, Spark or dbt, warehousing experience.",
      status: JobStatus.OPEN,
    },
  ];

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { id: job.id },
      update: { ...job, createdById: admin.id },
      create: { ...job, createdById: admin.id },
    });
  }

  const applications: Array<{
    jobId: string;
    userId: string;
    coverLetter: string;
    status: AppStatus;
  }> = [
    {
      jobId: "seed_job_1",
      userId: alice.id,
      coverLetter:
        "I have led backend systems at scale and would love to contribute to Acme. Excited to discuss how my experience aligns with the role.",
      status: AppStatus.PENDING,
    },
    {
      jobId: "seed_job_2",
      userId: alice.id,
      coverLetter:
        "Full-stack development is exactly where I thrive. The Globex tech stack is a perfect match for my skills and interests.",
      status: AppStatus.ACCEPTED,
    },
    {
      jobId: "seed_job_3",
      userId: bob.id,
      coverLetter:
        "I care deeply about polished, accessible UIs and have shipped React apps to production teams. I think I would be a strong fit at Initech.",
      status: AppStatus.REVIEWED,
    },
    {
      jobId: "seed_job_8",
      userId: bob.id,
      coverLetter:
        "I have built CI/CD pipelines, owned production infra, and love improving developer experience. Looking forward to talking about Cyberdyne.",
      status: AppStatus.REJECTED,
    },
  ];

  for (const app of applications) {
    await prisma.application.upsert({
      where: { jobId_userId: { jobId: app.jobId, userId: app.userId } },
      update: { coverLetter: app.coverLetter, status: app.status },
      create: app,
    });
  }

  const counts = {
    users: await prisma.user.count(),
    jobs: await prisma.job.count(),
    applications: await prisma.application.count(),
  };
  console.log("Seeded:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
