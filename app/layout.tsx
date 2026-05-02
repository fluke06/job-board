import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

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
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
