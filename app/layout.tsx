import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "JobBoard — Find your next role",
    template: "%s | JobBoard",
  },
  description:
    "Browse curated full-time, part-time, and remote job openings and apply in minutes on JobBoard.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "JobBoard",
    url: "/",
    title: "JobBoard — Find your next role",
    description:
      "Browse curated full-time, part-time, and remote job openings and apply in minutes on JobBoard.",
  },
  twitter: {
    card: "summary",
    title: "JobBoard — Find your next role",
    description:
      "Browse curated full-time, part-time, and remote job openings and apply in minutes on JobBoard.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-background"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1 w-full">
          {children}
        </main>
        <footer className="mt-16 border-t border-border">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 md:flex-row md:px-8">
            <p className="text-small text-muted-foreground">
              © {new Date().getFullYear()} JobBoard. Built for the future of work.
            </p>
            <nav className="flex flex-wrap items-center gap-6 text-small text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Cookie policy
              </a>
            </nav>
          </div>
        </footer>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
