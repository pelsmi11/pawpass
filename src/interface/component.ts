import type { Control } from "react-hook-form";

import type { CreatePetInput, PetTypeOption } from "./pet";

export type PetTypeSelectProps = {
  control: Control<CreatePetInput>;
  disabled: boolean;
  errorMessage: string | null;
  label: string;
  options: PetTypeOption[];
  placeholder: string;
};
