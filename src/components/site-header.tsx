import { PawPrint } from "lucide-react";

import { Button } from "@/components/ui/button";

const NAV_LINKS = ["Pets", "Health", "Reminders"] as const;

/**
 * Site header for PawPass.
 * Sticky, blurred surface; brand mark, primary nav and main CTA.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href="#main-content"
          aria-label="PawPass home"
          className="group flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-80"
        >
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform duration-200 group-hover:-rotate-6"
          >
            <PawPrint className="size-5" />
          </span>
          <span className="font-display text-lg tracking-tight text-foreground">
            PawPass
          </span>
        </a>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((label) => (
            <a
              key={label}
              href="#main-content"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
            >
              {label}
            </a>
          ))}
        </nav>

        <Button size="sm" className="shadow-soft">
          Register a pet
        </Button>
      </div>
    </header>
  );
}
