import { desc, eq } from "drizzle-orm";

import { db } from "./client";
import { demoConfig, petTypes, pets } from "./schema";

export const listPetTypes = async (database: typeof db = db) => {
  return database.select().from(petTypes).orderBy(petTypes.code);
};

export const getDemoConfig = async (database: typeof db = db) => {
  const rows = await database.select().from(demoConfig).where(eq(demoConfig.id, "global"));
  return rows[0] ?? null;
};

export const setDemoOutage = async (value: boolean, database: typeof db = db) => {
  const [row] = await database
    .update(demoConfig)
    .set({ databaseOutage: value, updatedAt: new Date() })
    .where(eq(demoConfig.id, "global"))
    .returning();
  return row ?? null;
};

export const resetDemoConfig = async (database: typeof db = db) => {
  const [row] = await database
    .update(demoConfig)
    .set({ databaseOutage: false, highLatency: false, latencyMs: 6000, updatedAt: new Date() })
    .where(eq(demoConfig.id, "global"))
    .returning();
  return row ?? null;
};

export const findPetTypeByCode = async (code: string, database: typeof db = db) => {
  const rows = await database.select().from(petTypes).where(eq(petTypes.code, code));
  return rows[0] ?? null;
};

export const findPetTypeById = async (
  id: string,
  database: typeof db = db,
) => {
  const rows = await database
    .select()
    .from(petTypes)
    .where(eq(petTypes.id, id));
  return rows[0] ?? null;
};

// Alias for service usage
export const getPetTypeById = findPetTypeById;

export const createPet = async (
  values: {
    name: string;
    petTypeId: string;
    age?: number;
    ownerName: string;
    sessionId: string;
  },
  database: typeof db = db,
) => {
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
};

export const listRecentPets = async (database: typeof db = db) => {
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
};
