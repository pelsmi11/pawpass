import { desc, eq } from "drizzle-orm";

import { db } from "./client";
import { petTypes, pets } from "./schema";

export async function listPetTypes(database: typeof db = db) {
  return database.select().from(petTypes).orderBy(petTypes.code);
}

export async function findPetTypeById(
  id: string,
  database: typeof db = db,
) {
  const rows = await database
    .select()
    .from(petTypes)
    .where(eq(petTypes.id, id));
  return rows[0] ?? null;
}

// Alias for service usage
export const getPetTypeById = findPetTypeById;

export async function createPet(
  values: {
    name: string;
    petTypeId: string;
    age?: number;
    ownerName: string;
    sessionId: string;
  },
  database: typeof db = db,
) {
  const [pet] = await database
    .insert(pets)
    .values({
      name: values.name,
      petTypeId: values.petTypeId,
      age: values.age ?? null,
      ownerName: values.ownerName,
      sessionId: values.sessionId,
    })
    .returning();
  return pet;
}

export async function listRecentPets(database: typeof db = db) {
  const rows = await database
    .select({
      id: pets.id,
      name: pets.name,
      petTypeId: pets.petTypeId,
      age: pets.age,
      ownerName: pets.ownerName,
      createdAt: pets.createdAt,
      petType: {
        id: petTypes.id,
        code: petTypes.code,
        title: petTypes.title,
      },
    })
    .from(pets)
    .innerJoin(petTypes, eq(pets.petTypeId, petTypes.id))
    .orderBy(desc(pets.createdAt))
    .limit(50);

  // Exclude session_id from public projection (FR-015, FR-029)
  return rows;
}
