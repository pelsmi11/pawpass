import { describe, expect, it, vi } from "vitest";
import { createPet, findPetTypeByCode, findPetTypeById, getDemoConfig, listPetTypes, listRecentPets, resetDemoConfig, setDemoOutage } from "./queries";

const mockDb = {
  select: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
} as unknown as never;

describe("db queries", () => {
  it("getDemoConfig returns row", async () => {
    const row = { id: "global", databaseOutage: false } as never;
    const where = vi.fn().mockReturnValue(Promise.resolve([row]));
    const from = vi.fn().mockReturnValue({ where });
    (mockDb as unknown as { select: ReturnType<typeof vi.fn> }).select = vi.fn().mockReturnValue({ from } as never);
    const result = await getDemoConfig(mockDb as never);
    expect(result).toEqual(row);
  });

  it("getDemoConfig returns null if empty", async () => {
    const where = vi.fn().mockReturnValue(Promise.resolve([]));
    const from = vi.fn().mockReturnValue({ where });
    (mockDb as unknown as { select: ReturnType<typeof vi.fn> }).select = vi.fn().mockReturnValue({ from } as never);
    const result = await getDemoConfig(mockDb as never);
    expect(result).toBeNull();
  });

  it("findPetTypeByCode returns row", async () => {
    const row = { id: "id1", code: "DOG" } as never;
    const where = vi.fn().mockReturnValue(Promise.resolve([row]));
    const from = vi.fn().mockReturnValue({ where });
    (mockDb as unknown as { select: ReturnType<typeof vi.fn> }).select = vi.fn().mockReturnValue({ from } as never);
    const result = await findPetTypeByCode("DOG", mockDb as never);
    expect(result).toEqual(row);
  });

  it("findPetTypeById returns row", async () => {
    const row = { id: "id1", code: "DOG" } as never;
    const where = vi.fn().mockReturnValue(Promise.resolve([row]));
    const from = vi.fn().mockReturnValue({ where });
    (mockDb as unknown as { select: ReturnType<typeof vi.fn> }).select = vi.fn().mockReturnValue({ from } as never);
    const result = await findPetTypeById("id1", mockDb as never);
    expect(result).toEqual(row);
  });

  it("listPetTypes returns ordered", async () => {
    const orderBy = vi.fn().mockReturnValue(Promise.resolve([{ code: "CAT" }, { code: "DOG" }]));
    const from = vi.fn().mockReturnValue({ orderBy });
    (mockDb as unknown as { select: ReturnType<typeof vi.fn> }).select = vi.fn().mockReturnValue({ from } as never);
    const result = await listPetTypes(mockDb as never);
    expect(result).toHaveLength(2);
  });

  it("createPet inserts", async () => {
    const returning = vi.fn().mockReturnValue(Promise.resolve([{ id: "pet-1" }]));
    const values = vi.fn().mockReturnValue({ returning });
    const insert = vi.fn().mockReturnValue({ values });
    (mockDb as unknown as { insert: ReturnType<typeof vi.fn> }).insert = insert as never;
    const result = await createPet({ name: "Luna", petTypeId: "id1", ownerName: "Ana", sessionId: "sess" }, mockDb as never);
    expect(result).toEqual({ id: "pet-1" });
  });

  it("listRecentPets returns 50", async () => {
    const limit = vi.fn().mockReturnValue(Promise.resolve([{ id: "1" }]));
    const orderBy = vi.fn().mockReturnValue({ limit });
    const innerJoin = vi.fn().mockReturnValue({ orderBy });
    const from = vi.fn().mockReturnValue({ innerJoin });
    const select = vi.fn().mockReturnValue({ from });
    (mockDb as unknown as { select: ReturnType<typeof vi.fn> }).select = select as never;
    const result = await listRecentPets(mockDb as never);
    expect(result).toHaveLength(1);
  });

  it("setDemoOutage updates", async () => {
    const row = { databaseOutage: true } as never;
    const returning = vi.fn().mockReturnValue(Promise.resolve([row]));
    const where = vi.fn().mockReturnValue({ returning });
    const set = vi.fn().mockReturnValue({ where });
    (mockDb as unknown as { update: ReturnType<typeof vi.fn> }).update = vi.fn().mockReturnValue({ set } as never);
    const result = await setDemoOutage(true, mockDb as never);
    expect(result).toEqual(row);
  });

  it("resetDemoConfig updates", async () => {
    const row = { databaseOutage: false } as never;
    const returning = vi.fn().mockReturnValue(Promise.resolve([row]));
    const where = vi.fn().mockReturnValue({ returning });
    const set = vi.fn().mockReturnValue({ where });
    (mockDb as unknown as { update: ReturnType<typeof vi.fn> }).update = vi.fn().mockReturnValue({ set } as never);
    const result = await resetDemoConfig(mockDb as never);
    expect(result).toEqual(row);
  });
});
