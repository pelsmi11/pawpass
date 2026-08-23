import { createPet, findPetTypeById } from "@/db/queries";
import type { db } from "@/db/client";
import type { FieldErrorCodes } from "@/interface";
import { validatePetInput } from "@/validation/petValidation";

type CreateResult =
  | { success: true; pet: Awaited<ReturnType<typeof createPet>> }
  | {
      success: false;
      fieldErrorCodes: FieldErrorCodes;
    };

/**
 * Orchestrates pet creation:
 * 1. Validate input (including strict sessionId rejection)
 * 2. Verify petTypeId exists in catalog
 * 3. Insert with sessionId (caller provides sessionId from cookie)
 */
export const createPetWithValidation = async (
  body: unknown,
  sessionId: string,
  database: typeof db,
): Promise<CreateResult> => {
  const validation = validatePetInput(body);
  if (!validation.success) {
    return {
      success: false,
      fieldErrorCodes: validation.fieldErrorCodes,
    };
  }

  const petType = await findPetTypeById(
    validation.data.petTypeId,
    database,
  );
  if (!petType) {
    return {
      success: false,
      fieldErrorCodes: { petTypeId: "PET_TYPE_INVALID" },
    };
  }

  const pet = await createPet(
    {
      name: validation.data.name,
      petTypeId: validation.data.petTypeId,
      age: validation.data.age,
      ownerName: validation.data.ownerName,
      sessionId,
    },
    database,
  );

  return { success: true, pet };
};
