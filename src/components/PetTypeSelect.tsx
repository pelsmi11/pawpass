"use client";

import { Controller } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PetTypeSelectProps } from "@/interface";

export const PetTypeSelect = ({
  control,
  disabled,
  errorMessage,
  label,
  options,
  placeholder,
}: PetTypeSelectProps) => {
  return (
    <Controller
      name="petTypeCode"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor="pet-type">{label}</FieldLabel>
          <Select
            name={field.name}
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
            required
          >
            <SelectTrigger id="pet-type" aria-invalid={fieldState.invalid}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent position="item-aligned">
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError>{errorMessage}</FieldError>}
        </Field>
      )}
    />
  );
};
