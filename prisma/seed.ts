import {
  PrismaClient,
  Role,
  JobType,
  JobStatus,
  AppStatus,
  CompanyMemberRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * DAY_MS);
}

async function main() {
  const adminHash = await bcrypt.hash("Admin123!", 12);
  const userHash = await bcrypt.hash("Password123!", 12);
  const employerHash = await bcrypt.hash("Employer123!", 12);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash: adminHash, name: "Admin", role: Role.ADMIN },
    create: {
      email: "admin@example.com",
      name: "Admin",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  const applicantSeeds = [
    { email: "alice@example.com", name: "Alice Tan" },
    { email: "bob@example.com", name: "Bob Reyes" },
    { email: "carla@example.com", name: "Carla Mendoza" },
    { email: "david@example.com", name: "David Kim" },
    { email: "elena@example.com", name: "Elena Rivera" },
    { email: "freya@example.com", name: "Freya Nakamura" },
    { email: "george@example.com", name: "George Patel" },
    { email: "hana@example.com", name: "Hana Suzuki" },
    { email: "isaac@example.com", name: "Isaac Cruz" },
    { email: "jasmine@example.com", name: "Jasmine Wong" },
    { email: "kenji@example.com", name: "Kenji Tanaka" },
    { email: "lila@example.com", name: "Lila Garcia" },
  ];

  const applicants: Record<string, { id: string; name: string }> = {};
  for (const a of applicantSeeds) {
    const u = await prisma.user.upsert({
      where: { email: a.email },
      update: { passwordHash: userHash, name: a.name, role: Role.APPLICANT },
      create: {
        email: a.email,
        name: a.name,
        passwordHash: userHash,
        role: Role.APPLICANT,
      },
    });
    applicants[a.email] = { id: u.id, name: u.name };
  }

  const companySeeds: Array<{
    email: string;
    employerName: string;
    slug: string;
    name: string;
    industry: string;
    size: "1-10" | "11-50" | "51-200" | "201-1000" | "1000+";
    website: string;
    description: string;
  }> = [
    {
      email: "hiring@acme.com",
      employerName: "Hannah Acme",
      slug: "acme",
      name: "Acme",
      industry: "Developer Tools",
      size: "51-200",
      website: "https://acme.example.com",
      description:
        "Acme builds developer tooling for distributed engineering teams. We help thousands of engineers ship faster with less ceremony.",
    },
    {
      email: "recruiter@lumen.com",
      employerName: "Liam Lumen",
      slug: "lumen",
      name: "Lumen",
      industry: "Design Studio",
      size: "11-50",
      website: "https://lumen.example.com",
      description:
        "Lumen is a small studio shipping product surfaces for fast-growing startups. We pair senior designers with engineers from day one.",
    },
    {
      email: "talent@northwind.com",
      employerName: "Nora Northwind",
      slug: "northwind",
      name: "Northwind",
      industry: "Logistics",
      size: "201-1000",
      website: "https://northwind.example.com",
      description:
        "Northwind is a logistics platform connecting carriers and shippers across APAC. We process 4M shipments a year.",
    },
    {
      email: "people@helio.com",
      employerName: "Hugo Helio",
      slug: "helio",
      name: "Helio",
      industry: "Climate Tech",
      size: "11-50",
      website: "https://helio.example.com",
      description:
        "Helio is building software for the renewables grid. Our customers run gigawatts of solar and battery capacity on our platform.",
    },
    {
      email: "talent@orbit.com",
      employerName: "Olivia Orbit",
      slug: "orbit",
      name: "Orbit",
      industry: "Fintech",
      size: "51-200",
      website: "https://orbit.example.com",
      description:
        "Orbit is a modern treasury platform for B2B SaaS. We move $9B a year for finance teams who care about speed and audit trails.",
    },
    {
      email: "hiring@vertex.com",
      employerName: "Victor Vertex",
      slug: "vertex",
      name: "Vertex Labs",
      industry: "Data Infrastructure",
      size: "1-10",
      website: "https://vertex.example.com",
      description:
        "Vertex Labs is a small team shipping a column-oriented database for real-time analytics. We are 9 engineers and a former olympic rower.",
    },
    {
      email: "people@meridian.com",
      employerName: "Maya Meridian",
      slug: "meridian",
      name: "Meridian",
      industry: "Healthcare",
      size: "201-1000",
      website: "https://meridian.example.com",
      description:
        "Meridian builds clinical software used by 600 hospitals across Southeast Asia. HIPAA-style compliance is the boring foundation; the product is the joy.",
    },
    {
      email: "hiring@solstice.com",
      employerName: "Sam Solstice",
      slug: "solstice",
      name: "Solstice",
      industry: "Consumer",
      size: "11-50",
      website: "https://solstice.example.com",
      description:
        "Solstice is a consumer fitness app with 1.2M monthly users. We are obsessed with making movement habit-forming and quietly delightful.",
    },
  ];

  const companies: Record<string, { id: string; ownerId: string }> = {};
  for (const c of companySeeds) {
    const employer = await prisma.user.upsert({
      where: { email: c.email },
      update: {
        passwordHash: employerHash,
        name: c.employerName,
        role: Role.EMPLOYER,
      },
      create: {
        email: c.email,
        name: c.employerName,
        passwordHash: employerHash,
        role: Role.EMPLOYER,
      },
    });
    const company = await prisma.company.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        industry: c.industry,
        size: c.size,
        website: c.website,
        description: c.description,
      },
      create: {
        slug: c.slug,
        name: c.name,
        industry: c.industry,
        size: c.size,
        website: c.website,
        description: c.description,
      },
    });
    await prisma.companyMember.upsert({
      where: {
        userId_companyId: { userId: employer.id, companyId: company.id },
      },
      update: { role: CompanyMemberRole.OWNER },
      create: {
        userId: employer.id,
        companyId: company.id,
        role: CompanyMemberRole.OWNER,
      },
    });
    companies[c.slug] = { id: company.id, ownerId: employer.id };
  }

  type JobSeed = {
    id: string;
    slug: string;
    title: string;
    location: string;
    type: JobType;
    salaryRange: string | null;
    description: string;
    requirements: string;
    status: JobStatus;
    createdDaysAgo: number;
  };

  const jobs: JobSeed[] = [
    {
      id: "seed_job_1",
      slug: "acme",
      title: "Senior Backend Engineer",
      location: "Manila",
      type: JobType.FULL_TIME,
      salaryRange: "$60k–$90k",
      description:
        "You will lead the design of high-throughput API services that sit at the core of our developer tools. Expect to mentor mid-level engineers, drive architectural decisions, and own the on-call rotation for the services you ship.\n\nWe value clarity over cleverness, async writing over meetings, and shipping small over shipping perfect.",
      requirements:
        "5+ years backend experience. Strong TypeScript or Go. Postgres at scale. Experience operating production systems and leading on-call rotations.",
      status: JobStatus.OPEN,
      createdDaysAgo: 1,
    },
    {
      id: "seed_job_2",
      slug: "acme",
      title: "Full-Stack Engineer",
      location: "Singapore",
      type: JobType.FULL_TIME,
      salaryRange: "$55k–$80k",
      description:
        "Build features end-to-end across our React frontend and Node backend. You will pair closely with product and design from the discovery phase through to release. Expect to ship multiple features per quarter.",
      requirements:
        "3+ years full-stack. React, Node, SQL. Strong product sense. Comfortable shipping unfinished work behind feature flags.",
      status: JobStatus.OPEN,
      createdDaysAgo: 3,
    },
    {
      id: "seed_job_3",
      slug: "lumen",
      title: "Senior Frontend Engineer",
      location: "Tokyo",
      type: JobType.FULL_TIME,
      salaryRange: "¥9M–¥13M",
      description:
        "Craft pixel-perfect, accessible UIs in React and Tailwind. You will own the design system and partner with our designers to keep the component library tidy as we ship new product surfaces.",
      requirements:
        "3+ years frontend. React, Tailwind, accessibility. Comfortable owning a design system. Bonus: animation chops with Framer Motion or GSAP.",
      status: JobStatus.OPEN,
      createdDaysAgo: 2,
    },
    {
      id: "seed_job_4",
      slug: "northwind",
      title: "Site Reliability Engineer",
      location: "Manila",
      type: JobType.FULL_TIME,
      salaryRange: "$70k–$100k",
      description:
        "Operate production infrastructure with strict availability targets. You will build out our observability tooling, lead incident response, and quietly remove the toil that creeps into every fast-growing platform.",
      requirements:
        "Linux, Kubernetes, Terraform. Production on-call experience. Bonus: incident command training.",
      status: JobStatus.CLOSED,
      createdDaysAgo: 35,
    },
    {
      id: "seed_job_5",
      slug: "lumen",
      title: "Technical Writer",
      location: "Remote",
      type: JobType.PART_TIME,
      salaryRange: "$40/hr",
      description:
        "Produce developer documentation and tutorials for our APIs. You will work closely with engineers to explain new features in clear, opinionated prose. ~20 hours a week.",
      requirements:
        "Strong writing portfolio. Basic API/SDK literacy. Comfort with Markdown, MDX, and code samples.",
      status: JobStatus.OPEN,
      createdDaysAgo: 5,
    },
    {
      id: "seed_job_6",
      slug: "acme",
      title: "QA Analyst",
      location: "Singapore",
      type: JobType.PART_TIME,
      salaryRange: "$30/hr",
      description:
        "Design and execute test plans across our web and mobile surfaces. Triage regressions, partner with engineers to find the root cause, and own the release-readiness checklist for major releases.",
      requirements:
        "Manual QA experience, basic scripting (Python or JS), an eye for edge cases.",
      status: JobStatus.OPEN,
      createdDaysAgo: 7,
    },
    {
      id: "seed_job_7",
      slug: "lumen",
      title: "UX Researcher",
      location: "Tokyo",
      type: JobType.PART_TIME,
      salaryRange: "¥6M–¥8M",
      description:
        "Run qualitative and quantitative studies that shape product direction. Synthesize findings into actionable insights for product teams.",
      requirements:
        "2+ years UX research. Strong interview and survey methods. Comfortable presenting findings to leadership.",
      status: JobStatus.CLOSED,
      createdDaysAgo: 40,
    },
    {
      id: "seed_job_8",
      slug: "northwind",
      title: "DevOps Engineer",
      location: "Remote",
      type: JobType.REMOTE,
      salaryRange: "$80k–$120k",
      description:
        "Own CI/CD pipelines and developer experience. Drive automation and infrastructure-as-code across the organization, and chase down the sharp edges that slow other engineers down.",
      requirements:
        "GitHub Actions, Docker, AWS or GCP, scripting. Bonus: experience with Bazel or Nx monorepos.",
      status: JobStatus.OPEN,
      createdDaysAgo: 4,
    },
    {
      id: "seed_job_9",
      slug: "lumen",
      title: "Product Designer",
      location: "Remote",
      type: JobType.REMOTE,
      salaryRange: "$70k–$110k",
      description:
        "Design user-centered solutions across web and mobile. Lead product discovery and partner closely with engineering and PM. We ship designs to production almost weekly.",
      requirements:
        "Portfolio with shipped product work. Figma proficiency. Comfortable specifying micro-interactions.",
      status: JobStatus.OPEN,
      createdDaysAgo: 6,
    },
    {
      id: "seed_job_10",
      slug: "northwind",
      title: "Data Engineer",
      location: "Remote",
      type: JobType.REMOTE,
      salaryRange: "$90k–$130k",
      description:
        "Build the data platform powering analytics and ML. Design batch and streaming pipelines and own data quality across the warehouse.",
      requirements:
        "SQL, Python, Spark or dbt. Warehousing experience. Comfortable owning a domain end-to-end.",
      status: JobStatus.OPEN,
      createdDaysAgo: 8,
    },
    {
      id: "seed_job_11",
      slug: "helio",
      title: "Senior Platform Engineer",
      location: "Remote",
      type: JobType.REMOTE,
      salaryRange: "$110k–$150k",
      description:
        "Lead the platform team at Helio. You will own multi-tenant infra that connects to gigawatts of customer hardware. We need someone who has run a real distributed system before.",
      requirements:
        "5+ years platform / infra. Kafka, Postgres, k8s. Strong systems thinking. Bonus: energy industry experience.",
      status: JobStatus.OPEN,
      createdDaysAgo: 2,
    },
    {
      id: "seed_job_12",
      slug: "helio",
      title: "Solutions Engineer (APAC)",
      location: "Singapore",
      type: JobType.FULL_TIME,
      salaryRange: "$90k–$120k",
      description:
        "Own technical pre-sales for our APAC customers. You will pair with account executives to scope deployments, run demos, and write integration code when needed.",
      requirements:
        "3+ years SE / pre-sales. Comfortable in customer-facing settings. Engineering background. Mandarin is a plus.",
      status: JobStatus.OPEN,
      createdDaysAgo: 9,
    },
    {
      id: "seed_job_13",
      slug: "orbit",
      title: "Senior Product Manager — Payments",
      location: "Singapore",
      type: JobType.FULL_TIME,
      salaryRange: "$100k–$140k",
      description:
        "Lead the payments product line. You will own the roadmap from discovery through release, partner with our payments engineering team, and hold the line on quality even when the GTM team is screaming.",
      requirements:
        "4+ years PM, ideally in fintech. Excellent written communication. A track record of shipping on calendar.",
      status: JobStatus.OPEN,
      createdDaysAgo: 3,
    },
    {
      id: "seed_job_14",
      slug: "orbit",
      title: "Compliance Analyst",
      location: "Manila",
      type: JobType.FULL_TIME,
      salaryRange: "$45k–$65k",
      description:
        "Own day-to-day compliance operations. Review onboarding cases, partner with engineering to automate the boring parts, and keep our audit posture tight.",
      requirements:
        "2+ years AML / KYC experience. Detail-oriented. Comfortable with SQL. Excellent written English.",
      status: JobStatus.OPEN,
      createdDaysAgo: 11,
    },
    {
      id: "seed_job_15",
      slug: "orbit",
      title: "Backend Engineer — Risk",
      location: "Remote",
      type: JobType.REMOTE,
      salaryRange: "$95k–$130k",
      description:
        "Build the risk engine that scores every transaction we touch. Strong type system fan? You will love this job.",
      requirements:
        "Strong TypeScript or Rust. Comfortable with distributed tracing. Experience with rules engines is a plus.",
      status: JobStatus.OPEN,
      createdDaysAgo: 5,
    },
    {
      id: "seed_job_16",
      slug: "vertex",
      title: "Founding Database Engineer",
      location: "Remote",
      type: JobType.REMOTE,
      salaryRange: "$140k–$200k + equity",
      description:
        "Help us ship a column-oriented database for real-time analytics. You will be employee number 8 or 9 and own a chunky slice of the storage engine.",
      requirements:
        "Experience contributing to a database, query engine, or distributed system. C++ or Rust. A history of going deep.",
      status: JobStatus.OPEN,
      createdDaysAgo: 14,
    },
    {
      id: "seed_job_17",
      slug: "vertex",
      title: "Developer Advocate",
      location: "Remote",
      type: JobType.REMOTE,
      salaryRange: "$100k–$140k",
      description:
        "Own our story with the developer community. Write essays. Run workshops. Talk to data engineers about their actual day-to-day. We do not need a brand person; we need someone who can ship code on stage.",
      requirements:
        "Engineering background. Public writing or speaking history. Comfortable being the public face of a small team.",
      status: JobStatus.OPEN,
      createdDaysAgo: 18,
    },
    {
      id: "seed_job_18",
      slug: "meridian",
      title: "Senior Mobile Engineer (iOS)",
      location: "Manila",
      type: JobType.FULL_TIME,
      salaryRange: "$70k–$100k",
      description:
        "Build the iOS app used by clinicians at 600 hospitals. We care a lot about offline-first behavior, accessibility, and pixel-precision in clinical workflows.",
      requirements:
        "5+ years iOS / Swift. Strong opinions on architecture. Bonus: experience in clinical or regulated environments.",
      status: JobStatus.OPEN,
      createdDaysAgo: 6,
    },
    {
      id: "seed_job_19",
      slug: "meridian",
      title: "Clinical Product Specialist",
      location: "Singapore",
      type: JobType.FULL_TIME,
      salaryRange: "$60k–$85k",
      description:
        "Sit between our clinical advisory board and product. You will translate clinician feedback into specs, attend customer hospital visits, and pilot new workflows with our partner teams.",
      requirements:
        "Clinical background (RN, allied health, or MD). Comfortable in customer-facing settings. Strong written English.",
      status: JobStatus.OPEN,
      createdDaysAgo: 12,
    },
    {
      id: "seed_job_20",
      slug: "meridian",
      title: "Security Engineer",
      location: "Remote",
      type: JobType.REMOTE,
      salaryRange: "$110k–$150k",
      description:
        "Own application security across our healthcare platform. Build the secure-by-default tooling that lets product teams move fast without rolling their own crypto.",
      requirements:
        "5+ years security engineering. Threat modeling. Comfortable building, not just reviewing.",
      status: JobStatus.OPEN,
      createdDaysAgo: 9,
    },
    {
      id: "seed_job_21",
      slug: "solstice",
      title: "Mobile Engineer (React Native)",
      location: "Remote",
      type: JobType.REMOTE,
      salaryRange: "$90k–$130k",
      description:
        "Build new surfaces inside our consumer fitness app. We ship to TestFlight twice a week and care a lot about performance on mid-range Android devices.",
      requirements:
        "3+ years React Native. Strong product sense. Bonus: native module experience.",
      status: JobStatus.OPEN,
      createdDaysAgo: 4,
    },
    {
      id: "seed_job_22",
      slug: "solstice",
      title: "Growth Engineer",
      location: "Singapore",
      type: JobType.FULL_TIME,
      salaryRange: "$80k–$110k",
      description:
        "Sit at the intersection of product, marketing, and analytics. You will run experiments, ship landing pages, and own the funnel from install through habit formation.",
      requirements:
        "Engineering background. Comfortable with SQL and experimentation tooling. Lots of opinions about retention.",
      status: JobStatus.OPEN,
      createdDaysAgo: 15,
    },
    {
      id: "seed_job_23",
      slug: "solstice",
      title: "Brand Designer",
      location: "Remote",
      type: JobType.PART_TIME,
      salaryRange: "$50/hr",
      description:
        "Sharpen our visual identity across product, marketing, and partnership materials. ~15 hours a week, with flex for big sprints.",
      requirements:
        "Strong portfolio. Comfortable in Figma. Type system enthusiasm a plus.",
      status: JobStatus.OPEN,
      createdDaysAgo: 22,
    },
    {
      id: "seed_job_24",
      slug: "helio",
      title: "Embedded Systems Engineer",
      location: "Tokyo",
      type: JobType.FULL_TIME,
      salaryRange: "¥10M–¥14M",
      description:
        "Write firmware for the gateway hardware that bridges customer assets to our cloud platform. You will be the third hire on our embedded team.",
      requirements:
        "C / C++ on constrained hardware. Familiarity with Linux on ARM. Industrial protocols (Modbus, IEC 61850) a plus.",
      status: JobStatus.OPEN,
      createdDaysAgo: 13,
    },
    {
      id: "seed_job_25",
      slug: "vertex",
      title: "Customer Engineer (US East)",
      location: "Remote",
      type: JobType.REMOTE,
      salaryRange: "$120k–$160k",
      description:
        "Own a portfolio of design partners. You will pair with their data teams to model their workloads on top of our engine, and feed everything you learn back into product.",
      requirements:
        "5+ years in data engineering or analytics. Customer-facing experience. Strong written communication.",
      status: JobStatus.OPEN,
      createdDaysAgo: 19,
    },
    {
      id: "seed_job_26",
      slug: "northwind",
      title: "Frontend Engineer",
      location: "Manila",
      type: JobType.FULL_TIME,
      salaryRange: "$55k–$80k",
      description:
        "Build out our shipper-facing product. You will ship features end-to-end alongside our designers and PMs, with full ownership over the surfaces you touch.",
      requirements:
        "3+ years frontend. Comfortable with React, Tailwind, TypeScript. Bonus: data-viz experience.",
      status: JobStatus.OPEN,
      createdDaysAgo: 7,
    },
  ];

  for (const job of jobs) {
    const c = companies[job.slug];
    if (!c) throw new Error(`Missing company seed for slug ${job.slug}`);
    await prisma.job.upsert({
      where: { id: job.id },
      update: {
        title: job.title,
        companyId: c.id,
        location: job.location,
        type: job.type,
        salaryRange: job.salaryRange,
        description: job.description,
        requirements: job.requirements,
        status: job.status,
        createdById: c.ownerId,
        createdAt: daysAgo(job.createdDaysAgo),
      },
      create: {
        id: job.id,
        title: job.title,
        companyId: c.id,
        location: job.location,
        type: job.type,
        salaryRange: job.salaryRange,
        description: job.description,
        requirements: job.requirements,
        status: job.status,
        createdById: c.ownerId,
        createdAt: daysAgo(job.createdDaysAgo),
      },
    });
  }

  type AppSeed = {
    jobId: string;
    email: string;
    coverLetter: string;
    status: AppStatus;
    daysAgo: number;
  };

  const apps: AppSeed[] = [
    {
      jobId: "seed_job_1",
      email: "alice@example.com",
      coverLetter:
        "I have led backend systems at scale and would love to contribute to Acme. Excited to discuss how my experience aligns with the role.",
      status: AppStatus.PENDING,
      daysAgo: 0,
    },
    {
      jobId: "seed_job_2",
      email: "alice@example.com",
      coverLetter:
        "Full-stack development is exactly where I thrive. The Acme tech stack is a perfect match for my skills and interests.",
      status: AppStatus.ACCEPTED,
      daysAgo: 4,
    },
    {
      jobId: "seed_job_3",
      email: "bob@example.com",
      coverLetter:
        "I care deeply about polished, accessible UIs and have shipped React apps to production teams. I think I would be a strong fit at Lumen.",
      status: AppStatus.REVIEWED,
      daysAgo: 1,
    },
    {
      jobId: "seed_job_8",
      email: "bob@example.com",
      coverLetter:
        "I have built CI/CD pipelines, owned production infra, and love improving developer experience. Looking forward to talking about Northwind.",
      status: AppStatus.REJECTED,
      daysAgo: 8,
    },
    {
      jobId: "seed_job_9",
      email: "carla@example.com",
      coverLetter:
        "Product Designer at Lumen would be a dream. My portfolio is mobile-heavy, and I have shipped a design system at my last role.",
      status: AppStatus.PENDING,
      daysAgo: 0,
    },
    {
      jobId: "seed_job_3",
      email: "carla@example.com",
      coverLetter:
        "I shifted from product design into frontend two years ago. I love the design system focus of this role.",
      status: AppStatus.PENDING,
      daysAgo: 2,
    },
    {
      jobId: "seed_job_5",
      email: "david@example.com",
      coverLetter:
        "I have written developer documentation for two API products in the past three years. Open-source samples in my portfolio.",
      status: AppStatus.REVIEWED,
      daysAgo: 3,
    },
    {
      jobId: "seed_job_17",
      email: "david@example.com",
      coverLetter:
        "Developer advocacy + a database story is my exact lane. I have a recurring conference talk on query optimization and a substack on data plumbing.",
      status: AppStatus.ACCEPTED,
      daysAgo: 7,
    },
    {
      jobId: "seed_job_11",
      email: "elena@example.com",
      coverLetter:
        "Climate tech is where I want my next decade. I have run a multi-tenant Kafka deployment for the past three years and would love to bring that to Helio.",
      status: AppStatus.REVIEWED,
      daysAgo: 1,
    },
    {
      jobId: "seed_job_13",
      email: "elena@example.com",
      coverLetter:
        "Payments PM is a hard role and I have shipped two payments products. I would love to discuss the roadmap.",
      status: AppStatus.PENDING,
      daysAgo: 0,
    },
    {
      jobId: "seed_job_2",
      email: "freya@example.com",
      coverLetter:
        "I have shipped React + Node apps for the past four years and love working closely with design.",
      status: AppStatus.PENDING,
      daysAgo: 1,
    },
    {
      jobId: "seed_job_15",
      email: "freya@example.com",
      coverLetter:
        "Risk engines + strong types is exactly the work I want to be doing. Heavy TypeScript background, dabbled in Rust.",
      status: AppStatus.REVIEWED,
      daysAgo: 4,
    },
    {
      jobId: "seed_job_18",
      email: "george@example.com",
      coverLetter:
        "Five years of iOS, last two in clinical software at a smaller hospital network. I would love to talk about Meridian.",
      status: AppStatus.PENDING,
      daysAgo: 2,
    },
    {
      jobId: "seed_job_21",
      email: "george@example.com",
      coverLetter:
        "Mid-range Android performance is one of my favorite optimization puzzles. I have shipped React Native apps to over 4M users.",
      status: AppStatus.PENDING,
      daysAgo: 3,
    },
    {
      jobId: "seed_job_3",
      email: "hana@example.com",
      coverLetter:
        "Senior frontend in Tokyo is exactly the role I have been looking for. Native Japanese, fluent English, design-system experience.",
      status: AppStatus.REVIEWED,
      daysAgo: 5,
    },
    {
      jobId: "seed_job_24",
      email: "hana@example.com",
      coverLetter:
        "Embedded + Linux on ARM has been my full-time work for six years. Industrial protocols are a fun corner of the world.",
      status: AppStatus.ACCEPTED,
      daysAgo: 9,
    },
    {
      jobId: "seed_job_12",
      email: "isaac@example.com",
      coverLetter:
        "Three years of solutions engineering at a fintech, plus a backend engineering background. I am based in Singapore and would love to talk.",
      status: AppStatus.PENDING,
      daysAgo: 1,
    },
    {
      jobId: "seed_job_14",
      email: "isaac@example.com",
      coverLetter:
        "I have run AML operations for two years and built half my team an SQL onboarding course in my free time.",
      status: AppStatus.REVIEWED,
      daysAgo: 6,
    },
    {
      jobId: "seed_job_22",
      email: "jasmine@example.com",
      coverLetter:
        "Growth engineering with strong opinions on retention is my exact lane. Let me show you the experiment notebook from my last role.",
      status: AppStatus.PENDING,
      daysAgo: 2,
    },
    {
      jobId: "seed_job_9",
      email: "jasmine@example.com",
      coverLetter:
        "Coming back into full-time product design after a break. Portfolio is web-first but the brief reads remote-friendly.",
      status: AppStatus.REJECTED,
      daysAgo: 11,
    },
    {
      jobId: "seed_job_16",
      email: "kenji@example.com",
      coverLetter:
        "C++ database internals have been my full-time work for nine years. I would love to talk about your storage layer.",
      status: AppStatus.REVIEWED,
      daysAgo: 3,
    },
    {
      jobId: "seed_job_25",
      email: "kenji@example.com",
      coverLetter:
        "Customer engineering for a database product would be a fun pivot. Heavy data engineering background plus a soft spot for teaching.",
      status: AppStatus.PENDING,
      daysAgo: 1,
    },
    {
      jobId: "seed_job_19",
      email: "lila@example.com",
      coverLetter:
        "RN background, two years in a clinical product role at another vendor. I would love to bring that to Meridian.",
      status: AppStatus.PENDING,
      daysAgo: 2,
    },
    {
      jobId: "seed_job_20",
      email: "lila@example.com",
      coverLetter:
        "Healthcare security is a deeply specific corner. I have a CISSP and run a small open-source threat-modeling tool in my spare time.",
      status: AppStatus.REVIEWED,
      daysAgo: 5,
    },
    {
      jobId: "seed_job_26",
      email: "alice@example.com",
      coverLetter:
        "I have worked in shipper-facing logistics tooling before and would love to ship features end-to-end again.",
      status: AppStatus.PENDING,
      daysAgo: 0,
    },
    {
      jobId: "seed_job_6",
      email: "carla@example.com",
      coverLetter:
        "I bridged QA and engineering at my last role. Open to part-time, focused work on test infrastructure.",
      status: AppStatus.PENDING,
      daysAgo: 4,
    },
    {
      jobId: "seed_job_23",
      email: "freya@example.com",
      coverLetter:
        "Brand designer with a type-systems obsession. Portfolio includes consumer products with motion-heavy storytelling.",
      status: AppStatus.REVIEWED,
      daysAgo: 6,
    },
    {
      jobId: "seed_job_10",
      email: "kenji@example.com",
      coverLetter:
        "dbt + warehousing is half my last decade. Happy to talk through architecture decisions on a kickoff call.",
      status: AppStatus.PENDING,
      daysAgo: 3,
    },
    {
      jobId: "seed_job_15",
      email: "george@example.com",
      coverLetter:
        "Backend + risk engines is my dream brief. Strong opinions on type safety in long-lived rules code.",
      status: AppStatus.PENDING,
      daysAgo: 0,
    },
    {
      jobId: "seed_job_22",
      email: "isaac@example.com",
      coverLetter:
        "Funnel ownership + experimentation tooling is exactly my background. Two years of growth engineering at a consumer fintech.",
      status: AppStatus.REVIEWED,
      daysAgo: 7,
    },
    {
      jobId: "seed_job_11",
      email: "kenji@example.com",
      coverLetter:
        "Platform engineering for an energy company is a meaningful pivot for me. Distributed systems are home turf.",
      status: AppStatus.ACCEPTED,
      daysAgo: 12,
    },
  ];

  for (const a of apps) {
    const u = applicants[a.email];
    if (!u) throw new Error(`Missing applicant seed for ${a.email}`);
    await prisma.application.upsert({
      where: { jobId_userId: { jobId: a.jobId, userId: u.id } },
      update: {
        coverLetter: a.coverLetter,
        status: a.status,
        createdAt: daysAgo(a.daysAgo),
      },
      create: {
        jobId: a.jobId,
        userId: u.id,
        coverLetter: a.coverLetter,
        status: a.status,
        createdAt: daysAgo(a.daysAgo),
      },
    });
  }

  const counts = {
    users: await prisma.user.count(),
    companies: await prisma.company.count(),
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
