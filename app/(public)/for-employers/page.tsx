import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Briefcase,
  Users,
  Zap,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Squiggle } from "@/components/squiggle";

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
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 jb-mesh-bg [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_85%)]"
        />
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pt-24 pb-20 text-center md:pt-32">
          <span className="jb-anim-fade-up jb-sticker">
            <Briefcase className="size-3" strokeWidth={2.5} />
            For employers
          </span>
          <h1 className="mt-6 jb-display jb-anim-fade-up-delay-1">
            Hire the people who{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-brand-strong via-brand to-fuchsia-500 bg-clip-text text-transparent">
                actually
              </span>
              <Squiggle className="absolute left-0 right-0 -bottom-2 h-2 w-full text-brand" />
            </span>{" "}
            read the brief.
          </h1>
          <p className="mt-6 max-w-xl text-body-lg text-muted-foreground jb-anim-fade-up-delay-2">
            JobBoard gives small and growing teams a clean, fast way to post
            roles and review applicants — without the noise.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 jb-anim-fade-up-delay-3">
            <Link
              href="/register?role=employer"
              className={`${buttonVariants({ size: "lg" })} shadow-[3px_3px_0_var(--foreground)] transition-transform hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--foreground)]`}
            >
              Start hiring
              <ArrowRight
                className="size-4 jb-arrow-nudge"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/companies"
              className={`${buttonVariants({ variant: "outline", size: "lg" })} border-2 border-foreground shadow-[3px_3px_0_var(--foreground)] transition-transform hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--foreground)]`}
            >
              See companies hiring
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`jb-card-hover rounded-2xl border-2 border-foreground bg-card p-6 ${
                i % 2 === 0
                  ? "shadow-[3px_3px_0_var(--foreground)]"
                  : "shadow-[3px_3px_0_var(--brand)]"
              }`}
            >
              <div className="flex size-10 items-center justify-center rounded-md bg-gradient-to-br from-brand to-brand-strong text-brand-foreground">
                <f.Icon
                  className="size-5"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-4 text-h4 font-bold">{f.title}</h3>
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
          <span className="text-caption text-brand-strong">Pricing</span>
          <h2 id="pricing" className="mt-2 jb-display !text-[clamp(36px,5vw,56px)]">
            Pay for what you{" "}
            <span className="relative inline-block">
              need
              <Squiggle className="absolute left-0 right-0 -bottom-1 h-2 w-full text-brand" />
            </span>
            .
          </h2>
          <p className="mt-3 text-body-lg text-muted-foreground">
            Cancel anytime. No annual lock-in.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`jb-card-hover relative flex flex-col rounded-2xl border-2 bg-card p-6 ${
                t.highlighted
                  ? "border-foreground shadow-[6px_6px_0_var(--foreground)]"
                  : "border-foreground shadow-[3px_3px_0_var(--foreground)]"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-h4 font-bold">{t.name}</h3>
                {t.highlighted ? (
                  <span className="jb-sticker jb-sticker-hot">
                    Most popular
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-small text-muted-foreground">{t.blurb}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="jb-display !text-[clamp(36px,4vw,56px)]">
                  {t.price}
                </span>
                <span className="text-small text-muted-foreground">
                  {t.cadence}
                </span>
              </p>
              <ul className="mt-6 space-y-3 text-small">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-brand-strong"
                      strokeWidth={2.5}
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
                })} ${
                  t.highlighted
                    ? "shadow-[2px_2px_0_var(--foreground)] hover:-translate-x-px hover:-translate-y-px"
                    : "border-2 border-foreground"
                }`}
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
