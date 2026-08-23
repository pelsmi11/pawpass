"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { createPetSchema, type CreatePetInput } from "@/lib/validation";

type PetType = {
  id: string;
  code: string;
  title: string;
};

type PetTypesResponse = {
  ok: boolean;
  petTypes?: PetType[];
  requestId?: string;
  message?: string;
  supportId?: string;
};

/**
 * Glossary: API petTypeId ↔ DB pet_type_id ↔ Drizzle petTypeId
 * The form sends petTypeId (UUID) which maps to DB column pet_type_id.
 */

export function PetForm() {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<{
    message: string;
    supportId?: string;
    fieldErrors?: Record<string, string>;
  } | null>(null);

  const {
    data: petTypesData,
    isLoading: petTypesLoading,
    isError: petTypesError,
  } = useQuery<PetType[]>({
    queryKey: ["pet-types"],
    queryFn: async () => {
      const res = await fetch("/api/pet-types");
      const json = (await res.json()) as PetTypesResponse;
      if (!json.ok || !json.petTypes) throw new Error("Failed to load pet types");
      return json.petTypes;
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<CreatePetInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createPetSchema) as any,
    defaultValues: {
      name: "",
      petTypeId: "",
      age: undefined,
      ownerName: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: CreatePetInput) => {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw json;
      }
      return json;
    },
    onSuccess: (data) => {
      setSuccessMessage(`¡Mascota registrada! ${data.pet.name} ya aparece en la lista.`);
      setServerError(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["pet-types"] });
    },
    onError: (error: unknown) => {
      const err = error as {
        message?: string;
        supportId?: string;
        fieldErrors?: Record<string, string>;
      };
      setSuccessMessage(null);
      setServerError({
        message: err.message ?? "No pudimos registrar tu mascota.",
        supportId: err.supportId,
        fieldErrors: err.fieldErrors,
      });
      if (err.fieldErrors) {
        for (const [key, msg] of Object.entries(err.fieldErrors)) {
          if (key in createPetSchema.shape) {
            setError(key as keyof CreatePetInput, { message: msg });
          }
        }
      }
    },
  });

  const onSubmit = (values: CreatePetInput) => {
    setSuccessMessage(null);
    setServerError(null);
    mutation.mutate(values);
  };

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-xl">Registrar mascota</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {petTypesLoading && (
          <div className="space-y-2" aria-busy="true" aria-label="Cargando tipos de mascota">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {petTypesError && (
          <Alert role="alert">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>No pudimos cargar los tipos de mascota. Intenta de nuevo.</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="border-success/50 bg-success/10" role="status">
            <AlertTitle>¡Éxito!</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {serverError && (
          <Alert variant="destructive" role="alert">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {serverError.message}
              {serverError.supportId && (
                <span className="mt-1 block text-xs opacity-80">Código de soporte: {serverError.supportId}</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit as never)} noValidate className="space-y-4" data-testid="pet-form">
          <div className="space-y-2">
            <Label htmlFor="pet-name">Nombre de la mascota</Label>
            <Input
              id="pet-name"
              placeholder="Ej. Luna"
              aria-describedby={errors.name ? "pet-name-error" : undefined}
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p id="pet-name-error" role="alert" className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pet-type">Tipo de mascota</Label>
            <Controller
              name="petTypeId"
              control={control}
              render={({ field }) => (
                <select
                  id="pet-type"
                  aria-describedby={errors.petTypeId ? "pet-type-error" : undefined}
                  aria-invalid={!!errors.petTypeId}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={petTypesLoading || petTypesError}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                >
                  <option value="">Selecciona un tipo</option>
                  {petTypesData?.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.title}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.petTypeId && (
              <p id="pet-type-error" role="alert" className="text-sm text-destructive">
                {errors.petTypeId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pet-age">Edad (opcional)</Label>
            <Input
              id="pet-age"
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              placeholder="Ej. 3"
              aria-describedby={errors.age ? "pet-age-error" : undefined}
              aria-invalid={!!errors.age}
              {...register("age", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
            />
            {errors.age && (
              <p id="pet-age-error" role="alert" className="text-sm text-destructive">
                {errors.age.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner-name">Nombre del propietario</Label>
            <Input
              id="owner-name"
              placeholder="Ej. Ana"
              aria-describedby={errors.ownerName ? "owner-name-error" : undefined}
              aria-invalid={!!errors.ownerName}
              {...register("ownerName")}
            />
            {errors.ownerName && (
              <p id="owner-name-error" role="alert" className="text-sm text-destructive">
                {errors.ownerName.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting || mutation.isPending} className="w-full">
            {isSubmitting || mutation.isPending ? "Registrando..." : "Registrar mascota"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
