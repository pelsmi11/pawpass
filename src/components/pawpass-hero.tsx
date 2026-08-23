import { BellRing, HeartHandshake, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "Verified vet records" },
  { icon: BellRing, label: "Care reminders" },
  { icon: HeartHandshake, label: "Trusted by sitters" },
] as const;

const STATS = [
  { term: "Visits", value: "14" },
  { term: "Weight", value: "28 kg" },
  { term: "Vaccines", value: "Up to date" },
] as const;

/**
 * Hero section for PawPass.
 * Two-column layout: message + CTAs beside a sample pet profile card.
 */
export function PawpassHero() {
  return (
    <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
      <div className="space-y-6">
        <div>
          <Badge variant="secondary" className="shadow-soft">
            New · Digital pet passport
          </Badge>
          <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            Caring close to your pets
          </h1>
        </div>

        <p className="max-w-prose text-lg leading-relaxed text-muted-foreground">
          A friendly and trustworthy registry for your companions. Keep
          records, reminders and health status together — warm and calm,
          never childish.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" className="shadow-soft">
            Register a pet
          </Button>
          <Button size="lg" variant="outline">
            View pets
          </Button>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          {TRUST_POINTS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <Card className="border-border/60 shadow-lifted transition-shadow duration-200">
        <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-11 items-center justify-center rounded-full bg-accent/50 font-display text-lg text-accent-foreground"
            >
              L
            </span>
            <div>
              <p className="font-semibold leading-none">Luna</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Golden retriever · 4 yrs
              </p>
            </div>
          </div>
          <Badge className="bg-success text-success-foreground">Healthy</Badge>
        </CardHeader>
        <CardContent className="pt-6">
          <dl className="grid grid-cols-3 gap-4 rounded-lg bg-secondary/60 p-4 text-sm">
            {STATS.map(({ term, value }) => (
              <div key={term}>
                <dt className="text-muted-foreground">{term}</dt>
                <dd className="mt-1 font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 flex items-center justify-between rounded-lg border border-border/60 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Next checkup</span>
            <span className="font-medium text-foreground">Sep 12</span>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
