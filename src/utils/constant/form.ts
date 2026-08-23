import type { CreatePetInput } from "@/interface";

export const PET_FORM_DEFAULT_VALUES: CreatePetInput = {
  name: "",
  petTypeId: "",
  age: undefined,
  ownerName: "",
};
