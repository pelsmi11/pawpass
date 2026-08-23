"use client";

import { PawPrint } from "lucide-react";
import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/utils/constant";


/**
 * Site header for PawPass.
 * Sticky, blurred surface; brand mark, primary nav and main CTA.
 */
export const SiteHeader = () => {
  const t = useTranslations("Header");

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href="#main-content"
          aria-label={t("home")}
          className="group flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-80"
        >
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform duration-200 group-hover:-rotate-6"
          >
            <PawPrint className="size-5" />
          </span>
          <span className="font-display text-lg tracking-tight text-foreground">PawPass</span>
        </a>

        <nav aria-label={t("main")} className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((key) => {
            const hrefMap: Record<string, string> = {
              register: "#pet-form",
              pets: "#pet-list",
              lab: "#demo-lab",
            };
            return (
              <a
                key={key}
                href={hrefMap[key] ?? "#main-content"}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo((hrefMap[key] ?? "#main-content").slice(1));
                }}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
              >
                {t(key)}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <Button size="sm" className="shadow-soft" onClick={() => scrollTo("pet-form")}>
            {t("register")}
          </Button>
        </div>
      </div>
    </header>
  );
};
