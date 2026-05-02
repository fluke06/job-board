import { Navbar } from "@/components/navbar";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
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
    </>
  );
}
