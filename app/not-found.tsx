import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-caption text-muted-foreground">404</p>
      <h1 className="mt-2">Page not found</h1>
      <p className="mt-4 max-w-md text-body-lg text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className={buttonVariants()}>
          Back to home
        </Link>
        <Link
          href="/jobs"
          className={buttonVariants({ variant: "outline" })}
        >
          Browse jobs
        </Link>
      </div>
    </div>
  );
}
