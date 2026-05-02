import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Role } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/logger";
import { EmployerSidebar } from "@/components/employer-sidebar";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      role: true,
      companies: {
        select: {
          companyId: true,
          company: { select: { name: true } },
        },
      },
    },
  });
  if (!user) redirect("/login");
  if (user.role !== Role.EMPLOYER && user.role !== Role.ADMIN) {
    logEvent("rbac.denied", {
      scope: "employer-layout",
      userId: session.userId,
    });
    redirect("/");
  }

  const path = (await headers()).get("x-pathname") ?? "";
  const onOnboarding = path.startsWith("/employer/onboarding");
  if (
    user.role === Role.EMPLOYER &&
    user.companies.length === 0 &&
    !onOnboarding
  ) {
    redirect("/employer/onboarding");
  }

  if (onOnboarding) {
    return (
      <main id="main" className="flex-1 w-full">
        {children}
      </main>
    );
  }

  const companyName = user.companies[0]?.company.name ?? "Your company";

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <EmployerSidebar companyName={companyName} userName={user.name} />
      <div className="flex-1 md:ml-60">
        <main id="main" className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
