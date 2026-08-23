"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type {
  ApiErrorCode,
  CreatePetInput,
  CreatePetResponse,
  FieldErrorCodes,
  PetType,
  PetTypesResponse,
} from "@/interface";
import { isApiErrorCode } from "@/utils/functions";
import { PET_FORM_DEFAULT_VALUES } from "@/utils/constant";
import { createPetSchema, isFieldErrorCode } from "@/validation/petValidation";

export const parseOptionalAge = (value: unknown) => {
  return value === "" ? undefined : Number(value);
};

export const usePetForm = () => {
  const t = useTranslations("PetForm");
  const tApiError = useTranslations("Errors.api");
  const tFieldError = useTranslations("Errors.field");
  const tPetType = useTranslations("PetTypes");
  const queryClient = useQueryClient();

  const petTypesQuery = useQuery<PetType[]>({
    queryKey: ["pet-types"],
    queryFn: async () => {
      const response = await fetch("/api/pet-types");
      const result = (await response.json()) as PetTypesResponse;
      if (!result.ok || !result.petTypes) throw result;
      return result.petTypes;
    },
  });

  const form = useForm<CreatePetInput>({
    // Zod's input/output generics do not align with react-hook-form's resolver type.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createPetSchema) as any,
    defaultValues: PET_FORM_DEFAULT_VALUES,
  });
  useEffect(() => {
    if (!petTypesQuery.isError) return;

    toast.error(t("loadErrorTitle"), {
      id: "pet-types-load-error",
      description: t("loadErrorDescription"),
    });
  }, [petTypesQuery.isError, t]);

  const mutation = useMutation({
    mutationFn: async (values: CreatePetInput): Promise<CreatePetResponse> => {
      const response = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw result;
      return result;
    },
    onSuccess: (result) => {
      toast.success(t("successTitle"), {
        description: t("successMessage", { name: result.pet.name }),
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["pet-types"] });
    },
    onError: (error: unknown) => {
      const result = error as {
        errorCode?: unknown;
        supportId?: string;
        fieldErrorCodes?: FieldErrorCodes;
      };

      const errorCode: ApiErrorCode | "UNKNOWN" = isApiErrorCode(result.errorCode)
        ? result.errorCode
        : "UNKNOWN";
      const message = tApiError(errorCode);
      toast.error(t("errorTitle"), {
        description: result.supportId
          ? `${message} ${t("supportCode", { code: result.supportId })}`
          : message,
      });

      if (!result.fieldErrorCodes) return;

      for (const [field, code] of Object.entries(result.fieldErrorCodes)) {
        if (field in createPetSchema.shape) {
          form.setError(field as keyof CreatePetInput, { message: code });
        }
      }
    },
  });

  const translateFieldError = (value: unknown) =>
    isFieldErrorCode(value) ? tFieldError(value) : tApiError("UNKNOWN");
  const translatePetType = (petType: PetType) =>
    petType.code === "DOG" || petType.code === "CAT"
      ? tPetType(petType.code)
      : petType.title;
  const submitValues = (values: CreatePetInput) => {
    mutation.mutate(values);
  };

  return {
    copy: {
      title: t("title"),
      loadingTypes: t("loadingTypes"),
      nameLabel: t("nameLabel"),
      namePlaceholder: t("namePlaceholder"),
      typeLabel: t("typeLabel"),
      typePlaceholder: t("typePlaceholder"),
      ageLabel: t("ageLabel"),
      agePlaceholder: t("agePlaceholder"),
      ownerLabel: t("ownerLabel"),
      ownerPlaceholder: t("ownerPlaceholder"),
      submit: mutation.isPending || form.formState.isSubmitting ? t("submitting") : t("submit"),
    },
    control: form.control,
    fieldErrors: {
      name: form.formState.errors.name
        ? translateFieldError(form.formState.errors.name.message)
        : null,
      petTypeId: form.formState.errors.petTypeId
        ? translateFieldError(form.formState.errors.petTypeId.message)
        : null,
      age: form.formState.errors.age
        ? translateFieldError(form.formState.errors.age.message)
        : null,
      ownerName: form.formState.errors.ownerName
        ? translateFieldError(form.formState.errors.ownerName.message)
        : null,
    },
    petTypeOptions:
      petTypesQuery.data?.map((petType) => ({
        id: petType.id,
        label: translatePetType(petType),
      })) ?? [],
    isPetTypesLoading: petTypesQuery.isLoading,
    isPetTypesError: petTypesQuery.isError,
    isSubmitDisabled: mutation.isPending || form.formState.isSubmitting,
    onSubmit: form.handleSubmit(submitValues as never),
  };
};
