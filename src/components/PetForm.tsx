"use client";

import { Controller } from "react-hook-form";

import { PetTypeSelect } from "@/components/PetTypeSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { parseOptionalAge, usePetForm } from "@/hooks/usePetForm";

/**
 * Glossary: API petTypeCode (DOG/CAT/REPTILE) → DB pet_type_id UUID via pet_types.code
 * REPTILE uses sentinel UUID to trigger FK 23503.
 */
export const PetForm = () => {
  const {
    copy,
    control,
    fieldErrors,
    petTypeOptions,
    isPetTypesLoading,
    isPetTypesError,
    isSubmitDisabled,
    onSubmit,
  } = usePetForm();

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-xl">{copy.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPetTypesLoading && (
          <div className="space-y-2" aria-busy="true" aria-label={copy.loadingTypes}>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4" data-testid="pet-form">
          <FieldGroup>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="pet-name">{copy.nameLabel}</FieldLabel>
                  <Input
                    {...field}
                    id="pet-name"
                    required
                    maxLength={100}
                    autoComplete="off"
                    placeholder={copy.namePlaceholder}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError>{fieldErrors.name}</FieldError>}
                </Field>
              )}
            />

            <PetTypeSelect
              control={control}
              disabled={isPetTypesLoading || isPetTypesError}
              errorMessage={fieldErrors.petTypeCode}
              label={copy.typeLabel}
              options={petTypeOptions}
              placeholder={copy.typePlaceholder}
            />

            <Controller
              name="age"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="pet-age">{copy.ageLabel}</FieldLabel>
                  <Input
                    {...field}
                    id="pet-age"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={100}
                    step={1}
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(parseOptionalAge(event.target.value))}
                    placeholder={copy.agePlaceholder}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError>{fieldErrors.age}</FieldError>}
                </Field>
              )}
            />

            <Controller
              name="ownerName"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="owner-name">{copy.ownerLabel}</FieldLabel>
                  <Input
                    {...field}
                    id="owner-name"
                    required
                    maxLength={100}
                    autoComplete="name"
                    placeholder={copy.ownerPlaceholder}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError>{fieldErrors.ownerName}</FieldError>}
                </Field>
              )}
            />
          </FieldGroup>

          <Button type="submit" disabled={isSubmitDisabled} className="w-full">
            {copy.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
