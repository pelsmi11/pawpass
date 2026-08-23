import { TriangleAlert } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStatusCard } from "@/hooks/useStatusCard";

/**
 * Recent pets section for PawPass.
 * Search field and pet rows with semantic status badges.
 */
export const StatusCard = () => {
  const { copy, pets } = useStatusCard();

  return (
    <Card className="border-border/60 shadow-lifted">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="recent-pets"
              className="text-lg font-semibold leading-none tracking-tight"
            >
              {copy.recentPets}
            </h2>
            <CardDescription className="mt-1.5">
              {copy.description}
            </CardDescription>
          </div>
          <Badge variant="secondary">{copy.registered}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="pet-search">{copy.searchLabel}</Label>
          <Input
            id="pet-search"
            type="search"
            placeholder={copy.searchPlaceholder}
          />
        </div>

        <section aria-labelledby="recent-pets">
          <h3 className="sr-only">{copy.petList}</h3>
          <ul className="divide-y divide-border/60">
            {pets.map(({ initials, name, detail, status, badgeClass }) => (
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

        <aside className="grid grid-cols-[auto_1fr] gap-x-3 rounded-lg border border-warning/50 bg-warning/10 p-4 text-sm">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 text-warning" />
          <div>
            <h3 className="font-medium leading-none">{copy.vaccineReminder}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{copy.reminder}</p>
          </div>
        </aside>
      </CardContent>
    </Card>
  );
};
