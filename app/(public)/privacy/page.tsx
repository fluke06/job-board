import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "JobBoard's Privacy Policy.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "May 2, 2026";

const SECTIONS: Array<{ title: string; body: string[] }> = [
  {
    title: "1. What we collect",
    body: [
      "When you create an account we collect your name, email, and password (stored as a one-way hash). When you apply to a role we collect your cover letter and any resume URL you provide.",
      "Employers' company profiles include the information they enter about themselves: name, slug, logo URL, website, industry, and size.",
      "We log standard request metadata (IP address, user agent, timestamps) to operate the service and detect abuse. Sensitive fields — passwords, cookies, tokens, raw email addresses — are never written to logs.",
    ],
  },
  {
    title: "2. How we use it",
    body: [
      "We use your information to operate the service: authenticate sessions, surface relevant roles, route applications to the right employer, and send transactional notifications.",
      "We do not sell your personal data. We do not share applicant information with employers other than the one whose role you applied to.",
    ],
  },
  {
    title: "3. Cookies and sessions",
    body: [
      "JobBoard uses a single first-party session cookie to keep you signed in. The cookie is HttpOnly, Secure (in production), SameSite=Lax, and expires after 7 days.",
      "We do not use third-party analytics or advertising cookies. We do not embed third-party trackers.",
    ],
  },
  {
    title: "4. Data sharing",
    body: [
      "Application data is shared only with the employer who owns the role you applied to. Employer dashboards scope candidates to that employer's company; cross-company access is blocked at the API layer.",
      "We may disclose data when required by law, to enforce our Terms of Service, or to protect our users from imminent harm.",
    ],
  },
  {
    title: "5. Data retention",
    body: [
      "Account data is retained while your account is active. If you delete your account, we remove your profile, applications, and any company memberships within 30 days. Aggregate, anonymized analytics may be retained indefinitely.",
    ],
  },
  {
    title: "6. Your rights",
    body: [
      "You can request a copy of your data, correct inaccuracies, or delete your account at any time by emailing privacy@jobboard.example. We respond within 14 days.",
      "If you are in a jurisdiction with specific privacy laws (such as the EU's GDPR or California's CCPA), you have the rights granted under those laws.",
    ],
  },
  {
    title: "7. Security",
    body: [
      "Passwords are hashed with bcrypt. Sessions use signed JWTs. The API enforces role-based access control on every mutating request and re-reads sensitive role information from the database rather than trusting the session token alone.",
      "If we discover a security incident affecting your data, we will notify you within 72 hours.",
    ],
  },
  {
    title: "8. Children",
    body: [
      "JobBoard is not intended for users under 18. We do not knowingly collect data from children under 18.",
    ],
  },
  {
    title: "9. Changes to this policy",
    body: [
      "Material changes will be announced on the site at least 14 days before they take effect.",
    ],
  },
  {
    title: "10. Contact",
    body: [
      "Privacy questions or data requests: privacy@jobboard.example.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16 space-y-10">
      <header className="space-y-3 border-b border-border pb-8">
        <span className="text-caption text-muted-foreground">Legal</span>
        <h1>Privacy Policy</h1>
        <p className="text-small text-muted-foreground">
          Last updated {LAST_UPDATED}.
        </p>
      </header>

      <div className="space-y-10">
        {SECTIONS.map((s) => (
          <section key={s.title} className="space-y-3">
            <h2 className="text-h4 font-semibold">{s.title}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="text-body text-foreground/80">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
