import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { usePawpassHero } from "@/hooks/usePawpassHero";

/**
 * Hero section for PawPass.
 * Two-column layout: message + CTAs beside a sample pet profile card.
 */
export const PawpassHero = () => {
  const { copy, trustPoints, stats } = usePawpassHero();

  return (
    <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
      <div className="space-y-6">
        <div>
          <Badge variant="secondary" className="shadow-soft">
            {copy.badge}
          </Badge>
          <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            {copy.title}
          </h1>
        </div>

        <p className="max-w-prose text-lg leading-relaxed text-muted-foreground">
          {copy.description}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" className="shadow-soft">
            {copy.register}
          </Button>
          <Button size="lg" variant="outline">
            {copy.viewPets}
          </Button>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          {trustPoints.map(({ icon: Icon, label }) => (
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
                {copy.goldenRetriever} · {copy.profileAge}
              </p>
            </div>
          </div>
          <Badge className="bg-success text-success-foreground">{copy.healthy}</Badge>
        </CardHeader>
        <CardContent className="pt-6">
          <dl className="grid grid-cols-3 gap-4 rounded-lg bg-secondary/60 p-4 text-sm">
            {stats.map(({ term, value }) => (
              <div key={term}>
                <dt className="text-muted-foreground">{term}</dt>
                <dd className="mt-1 font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 flex items-center justify-between rounded-lg border border-border/60 px-4 py-3 text-sm">
            <span className="text-muted-foreground">{copy.nextCheckup}</span>
            <time dateTime="2026-09-12" className="font-medium text-foreground">
              {copy.checkupDate}
            </time>
          </p>
        </CardContent>
      </Card>
    </section>
  );
};
