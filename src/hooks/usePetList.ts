"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

import type { Pet, PetsResponse } from "@/interface";

export const usePetList = () => {
  const t = useTranslations("PetList");
  const tPetType = useTranslations("PetTypes");
  const query = useQuery<{ pets: Pet[] }>({
    queryKey: ["pets"],
    queryFn: async () => {
      const response = await fetch("/api/pets");
      const result = (await response.json()) as PetsResponse;
      if (!result.ok || !result.pets) {
        throw new Error(result.errorCode ?? "PETS_LOAD_FAILED");
      }
      return { pets: result.pets };
    },
  });
  const refetch = query.refetch;
  const retry = useCallback(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (!query.isError) return;

    toast.error(t("errorTitle"), {
      id: "pets-load-error",
      description: t("loadError"),
      action: { label: t("retry"), onClick: retry },
    });
  }, [query.isError, retry, t]);

  const translatePetType = (pet: Pet) =>
    pet.petType.code === "DOG" || pet.petType.code === "CAT"
      ? tPetType(pet.petType.code)
      : pet.petType.title;
  const items = (query.data?.pets ?? []).map((pet) => {
    const typeLabel = translatePetType(pet);
    const details = [
      typeLabel,
      pet.age === null || pet.age === undefined ? null : t("age", { age: pet.age }),
      pet.ownerName,
    ].filter((value): value is string => value !== null);

    return {
      id: pet.id,
      name: pet.name,
      typeLabel,
      details: details.join(" · "),
    };
  });
  return {
    copy: {
      title: t("title"),
      retry: t("retry"),
      empty: t("empty"),
      listLabel: t("listLabel"),
    },
    items,
    isLoading: query.isLoading,
    isError: query.isError,
    retry,
  };
};
