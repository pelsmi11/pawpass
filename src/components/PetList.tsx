"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePetList } from "@/hooks/usePetList";

export const PetList = () => {
  const { copy, items, isLoading, isError, retry } = usePetList();

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2" aria-busy="true">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            onClick={retry}
            variant="outline"
          >
            {copy.retry}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{copy.empty}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3" aria-label={copy.listLabel}>
          {items.map((pet) => (
            <li
              key={pet.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{pet.name}</p>
                <p className="text-sm text-muted-foreground">
                  {pet.details}
                </p>
              </div>
              <Badge variant="secondary">{pet.typeLabel}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
