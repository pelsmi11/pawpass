import { TriangleAlert } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PETS = [
  {
    initials: "L",
    name: "Luna",
    detail: "Golden retriever · Last visit today",
    status: "Healthy",
    badgeClass: "bg-success text-success-foreground",
  },
  {
    initials: "M",
    name: "Milo",
    detail: "Domestic shorthair · Last visit May 3",
    status: "Due soon",
    badgeClass: "bg-warning text-warning-foreground",
  },
] as const;

/**
 * Recent pets section for PawPass.
 * Search field and pet rows with semantic status badges.
 */
export function StatusCard() {
  return (
    <Card className="border-border/60 shadow-lifted">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="recent-pets"
              className="text-lg font-semibold leading-none tracking-tight"
            >
              Recent pets
            </h2>
            <CardDescription className="mt-1.5">
              Latest activity across your companions.
            </CardDescription>
          </div>
          <Badge variant="secondary">{PETS.length} registered</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="pet-search">Search pets</Label>
          <Input
            id="pet-search"
            type="search"
            placeholder="Search by name or microchip"
          />
        </div>

        <section aria-labelledby="recent-pets">
          <h3 className="sr-only">Pet list</h3>
          <ul className="divide-y divide-border/60">
            {PETS.map(({ initials, name, detail, status, badgeClass }) => (
              <li
                key={name}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-sm text-secondary-foreground"
                >
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {detail}
                  </p>
                </div>
                <Badge className={badgeClass}>{status}</Badge>
              </li>
            ))}
          </ul>
        </section>

        <Alert className="border-warning/50 bg-warning/10 [&>svg]:text-warning">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>Vaccine reminder</AlertTitle>
          <AlertDescription>
            Milo&rsquo;s rabies booster is due August 30. Book a vet visit to
            stay up to date.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
