"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePawpassHero } from "@/hooks/usePawpassHero";

export const PawpassHero = () => {
  const { copy } = usePawpassHero();

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
  };

  return (
    <section className="space-y-6 py-8">
      <div>
        <Badge variant="secondary" className="shadow-soft">
          {copy.badge}
        </Badge>
        <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
          {copy.title}
        </h1>
      </div>

      <p className="max-w-prose text-lg leading-relaxed text-muted-foreground">{copy.description}</p>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" className="shadow-soft" onClick={() => handleScroll("pet-form")}>
          {copy.register}
        </Button>
        <Button size="lg" variant="outline" onClick={() => handleScroll("pet-list")}>
          {copy.viewPets}
        </Button>
      </div>
    </section>
  );
};
