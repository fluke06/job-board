import Link from "next/link";
import type { Metadata } from "next";
import {
  Briefcase,
  Users,
  Zap,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "For employers",
  description:
    "Post roles, review candidates, and hire faster. JobBoard for employers — simple, fast, and fair.",
  alternates: { canonical: "/for-employers" },
};

const FEATURES = [
  {
    Icon: Briefcase,
    title: "Post in minutes",
    body: "Spin up a job posting with title, description, and requirements. No bloat, no friction.",
  },
  {
    Icon: Users,
    title: "Review candidates in one place",
    body: "Track applications by stage. Move from pending to accepted with one click.",
  },
  {
    Icon: Zap,
    title: "Reach focused candidates",
    body: "Curated audience. Quality over quantity — applicants who actually read the brief.",
  },
  {
    Icon: ShieldCheck,
    title: "Built-in privacy",
    body: "Applicant data stays inside your company workspace. No cross-company leakage.",
  },
];

const TIERS = [
  {
    name: "Free",
    price: "$0",
    cadence: "/month",
    blurb: "For early-stage teams hiring 1–2 roles.",
    features: ["Up to 3 active jobs", "Unlimited candidates", "Email support"],
    cta: "Start hiring",
    href: "/register?role=employer",
  },
  {
    name: "Growth",
    price: "$99",
    cadence: "/month",
    blurb: "For scaling teams with multiple open roles.",
    features: [
      "Unlimited active jobs",
      "Pipeline analytics",
      "Priority support",
    ],
    cta: "Get Growth",
    href: "/register?role=employer",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    blurb: "For larger organizations with custom needs.",
    features: ["SSO + audit logs", "Custom integrations", "Dedicated CSM"],
    cta: "Talk to sales",
    href: "/register?role=employer",
  },
];

export default function ForEmployersPage() {
  return (
    <div className="w-full">
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-24 pb-16 text-center md:pt-32">
        <span className="text-caption text-muted-foreground">For employers</span>
        <h1 className="mt-4">Hire focused candidates, faster.</h1>
        <p className="mt-4 max-w-xl text-body-lg text-muted-foreground">
          JobBoard gives small and growing teams a clean, fast way to post
          roles and review applicants — without the noise.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/register?role=employer"
            className={buttonVariants({ size: "default" })}
          >
            Start hiring
          </Link>
          <Link
            href="/companies"
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            See companies hiring
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                <f.Icon
                  className="size-5"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-4 text-h4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-small text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="pricing"
        className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-8"
      >
        <div className="text-center">
          <h2 id="pricing">Simple, transparent pricing</h2>
          <p className="mt-2 text-body-lg text-muted-foreground">
            Pay for what you need. Cancel anytime.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`flex flex-col rounded-lg border bg-card p-6 ${
                t.highlighted
                  ? "border-foreground shadow-sm"
                  : "border-border"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-h4 font-semibold">{t.name}</h3>
                {t.highlighted ? (
                  <span className="rounded-full bg-primary px-2 py-1 text-caption text-primary-foreground">
                    Most popular
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-small text-muted-foreground">{t.blurb}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-h2 font-bold">{t.price}</span>
                <span className="text-small text-muted-foreground">
                  {t.cadence}
                </span>
              </p>
              <ul className="mt-6 space-y-3 text-small">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-foreground"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={t.href}
                className={`mt-8 ${buttonVariants({
                  variant: t.highlighted ? "default" : "outline",
                  size: "default",
                })}`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
