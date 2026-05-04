import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/rbac";
import { CompanySettingsForm } from "@/components/company-settings-form";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Company settings",
};

type CompanySize = "1-10" | "11-50" | "51-200" | "201-1000" | "1000+";

const VALID_SIZES: ReadonlyArray<CompanySize> = [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1000+",
];

function asSize(s: string | null | undefined): CompanySize | undefined {
  return s && (VALID_SIZES as ReadonlyArray<string>).includes(s)
    ? (s as CompanySize)
    : undefined;
}

export default async function CompanySettingsPage() {
  const ctx = await requireEmployer();
  if (ctx.companyIds.length === 0) redirect("/employer/onboarding");

  const company = await prisma.company.findFirst({
    where: { id: { in: ctx.companyIds } },
    orderBy: { createdAt: "asc" },
  });
  if (!company) redirect("/employer/onboarding");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-8">
        <div className="space-y-3">
          <span className="text-caption text-brand-strong">Settings</span>
          <h1 className="jb-display !text-[clamp(36px,5vw,56px)]">
            Company settings.
          </h1>
          <p className="text-body-lg text-muted-foreground">
            How your company shows up to candidates.
          </p>
        </div>
        <Link
          href={`/companies/${company.slug}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          View public page →
        </Link>
      </header>
      <CompanySettingsForm
        initialSlug={company.slug}
        defaultValues={{
          name: company.name,
          slug: company.slug,
          industry: company.industry ?? "",
          size: asSize(company.size),
          website: company.website ?? "",
          description: company.description ?? "",
        }}
      />
    </div>
  );
}
