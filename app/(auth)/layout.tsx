import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SiteShell } from "@/components/site-shell";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  return <SiteShell>{children}</SiteShell>;
}
