"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Pet = {
  id: string;
  name: string;
  petTypeId: string;
  age: number | null;
  ownerName: string;
  createdAt: string;
  petType: { id: string; code: string; title: string };
};

export function PetList() {
  const { data, isLoading, isError, refetch } = useQuery<{ pets: Pet[] }>({
    queryKey: ["pets"],
    queryFn: async () => {
      const res = await fetch("/api/pets");
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      return json;
    },
  });

  const pets = data?.pets ?? [];

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Mascotas registradas</CardTitle>
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
          <CardTitle>Mascotas registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <p role="alert" className="text-sm text-destructive">
            No pudimos cargar las mascotas. Intenta de nuevo.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 text-sm underline"
          >
            Reintentar
          </button>
        </CardContent>
      </Card>
    );
  }

  if (pets.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Mascotas registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay mascotas registradas aún. ¡Sé el primero en registrar una!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Mascotas registradas</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3" aria-label="Lista de mascotas">
          {pets.map((pet) => (
            <li
              key={pet.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{pet.name}</p>
                <p className="text-sm text-muted-foreground">
                  {pet.petType.title}
                  {pet.age !== null && pet.age !== undefined ? ` · ${pet.age} años` : ""}
                  {` · ${pet.ownerName}`}
                </p>
              </div>
              <Badge variant="secondary">{pet.petType.title}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
