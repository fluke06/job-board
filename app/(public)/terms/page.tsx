import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "JobBoard's Terms of Service.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "May 2, 2026";

const SECTIONS: Array<{ title: string; body: string[] }> = [
  {
    title: "1. Acceptance of terms",
    body: [
      "By accessing or using JobBoard you agree to these Terms of Service. If you do not agree, do not use the service. These terms apply to applicants, employers, and visitors browsing the site.",
    ],
  },
  {
    title: "2. Account eligibility",
    body: [
      "You must be at least 18 years old to create an account. You agree to provide accurate information at registration and to keep your account details up to date.",
      "You are responsible for maintaining the confidentiality of your password and for all activity under your account.",
    ],
  },
  {
    title: "3. Acceptable use",
    body: [
      "You will not use JobBoard to post discriminatory, fraudulent, or misleading job listings; submit applications to roles you have no genuine interest in pursuing; or attempt to scrape, mirror, or otherwise extract listings or applicant data outside of normal product use.",
      "Employers must post only roles they have authority to fill on behalf of the company they represent.",
    ],
  },
  {
    title: "4. Content and ownership",
    body: [
      "Job postings, company profiles, cover letters, and other content you submit remain your property. You grant JobBoard a non-exclusive license to display this content as needed to operate the service.",
      "You are solely responsible for the content you submit and for ensuring it does not infringe on the rights of any third party.",
    ],
  },
  {
    title: "5. Termination",
    body: [
      "We may suspend or terminate accounts that violate these terms, with or without notice. You may close your account at any time by contacting support.",
    ],
  },
  {
    title: "6. Disclaimer",
    body: [
      "JobBoard is provided on an 'as-is' basis. We make no guarantees about the accuracy of listings, the responsiveness of employers, or the suitability of any role for any applicant. Use of the service is at your own risk.",
    ],
  },
  {
    title: "7. Limitation of liability",
    body: [
      "To the fullest extent permitted by law, JobBoard is not liable for any indirect, incidental, or consequential damages arising from use of the service.",
    ],
  },
  {
    title: "8. Changes to these terms",
    body: [
      "We may update these terms from time to time. Material changes will be announced on the site at least 14 days before they take effect. Continued use of JobBoard after the effective date constitutes acceptance of the updated terms.",
    ],
  },
  {
    title: "9. Contact",
    body: [
      "Questions about these terms? Email legal@jobboard.example.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16 space-y-10">
      <header className="space-y-3 border-b border-border pb-8">
        <span className="text-caption text-muted-foreground">Legal</span>
        <h1>Terms of Service</h1>
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
