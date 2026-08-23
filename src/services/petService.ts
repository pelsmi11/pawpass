import { createPet, findPetTypeByCode } from "@/db/queries";
import type { db } from "@/db/client";
import type { FieldErrorCodes } from "@/interface";
import { REPTILE_SENTINEL_UUID } from "@/utils/constant/petCatalog";
import { validatePetInput } from "@/validation/petValidation";

type CreateResult =
  | { success: true; pet: Awaited<ReturnType<typeof createPet>> }
  | {
      success: false;
      fieldErrorCodes: FieldErrorCodes;
    };

/**
 * Orchestrates pet creation:
 * 1. Validate input (including strict sessionId/petTypeId rejection)
 * 2. Resolve petTypeCode to pet_type_id
 *    - DOG/CAT → lookup pet_types.code
 *    - REPTILE → sentinel UUID (will trigger FK 23503)
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

  let petTypeId: string;
  if (validation.data.petTypeCode === "REPTILE") {
    petTypeId = REPTILE_SENTINEL_UUID;
  } else {
    const petType = await findPetTypeByCode(validation.data.petTypeCode, database);
    if (!petType) {
      return {
        success: false,
        fieldErrorCodes: { petTypeCode: "PET_TYPE_INVALID" },
      };
    }
    petTypeId = petType.id;
  }

  const pet = await createPet(
    {
      name: validation.data.name,
      petTypeId,
      age: validation.data.age,
      ownerName: validation.data.ownerName,
      sessionId,
    },
    database,
  );

  return { success: true, pet };
};
