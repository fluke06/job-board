import { Suspense } from "react";
import { RegisterForm } from "@/components/register-form";

export const metadata = {
  title: "Create an account",
  description: "Join JobBoard to apply for roles or post jobs in seconds.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16 md:py-24">
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="mb-6 text-center">
          <h1 className="text-h3 font-semibold">Create an account</h1>
          <p className="mt-2 text-small text-muted-foreground">
            Join JobBoard to apply for roles or post jobs in seconds.
          </p>
        </div>
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
