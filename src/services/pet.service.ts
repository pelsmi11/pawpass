import { findPetTypeById, createPet } from "@/db/queries";
import type { db } from "@/db/client";
import { validatePetInput } from "@/lib/validation";

type CreateResult =
  | { success: true; pet: Awaited<ReturnType<typeof createPet>> }
  | {
      success: false;
      fieldErrors: Record<string, string>;
      message: string;
    };

/**
 * Orchestrates pet creation:
 * 1. Validate input (including strict sessionId rejection)
 * 2. Verify petTypeId exists in catalog
 * 3. Insert with sessionId (caller provides sessionId from cookie)
 */
export async function createPetWithValidation(
  body: unknown,
  sessionId: string,
  database: typeof db,
): Promise<CreateResult> {
  const validation = validatePetInput(body);
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.fieldErrors,
      message: validation.message,
    };
  }

  const petType = await findPetTypeById(
    validation.data.petTypeId,
    database,
  );
  if (!petType) {
    return {
      success: false,
      fieldErrors: { petTypeId: "Selecciona un tipo válido." },
      message: "Revisa los datos ingresados.",
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
}
