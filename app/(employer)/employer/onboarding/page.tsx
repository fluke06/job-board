import { EmployerOnboardingForm } from "@/components/employer-onboarding-form";

export const metadata = {
  title: "Set up your company",
};

export default function OnboardingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 md:py-16">
      <div className="rounded-xl border border-border bg-card p-8">
        <header className="mb-8">
          <span className="text-caption text-muted-foreground">Step 1 of 1</span>
          <h1 className="mt-2 text-h3 font-semibold">Set up your company</h1>
          <p className="mt-2 text-small text-muted-foreground">
            Create a company profile so candidates know who they&apos;re applying
            to. You can edit any of this later.
          </p>
        </header>
        <EmployerOnboardingForm />
      </div>
    </div>
  );
}
