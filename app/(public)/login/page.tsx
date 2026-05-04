import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your JobBoard account to apply for jobs and track applications.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16 md:py-24">
      <div className="rounded-2xl border-2 border-foreground bg-card p-8 shadow-[4px_4px_0_var(--foreground)]">
        <div className="mb-6 text-center">
          <h1 className="text-h2 font-bold">Sign in.</h1>
          <p className="mt-2 text-small text-muted-foreground">
            Welcome back. Sign in to continue.
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
