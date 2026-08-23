import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/db/queries", () => ({
  findPetTypeByCode: vi.fn(),
  createPet: vi.fn(),
}));

import { findPetTypeByCode, createPet } from "@/db/queries";
import { createPetWithValidation } from "./petService";
import { REPTILE_SENTINEL_UUID } from "@/utils/constant/petCatalog";

describe("petService - createPetWithValidation", () => {
  const dogId = "d0d0d0d0-d0d0-4d0d-8d0d-d0d0d0d0d0d0";
  const sessionId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const mockDb = {} as never;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates pet when data valid and petTypeCode DOG exists", async () => {
    vi.mocked(findPetTypeByCode).mockResolvedValue({ id: dogId, code: "DOG", title: "Perro" } as never);
    vi.mocked(createPet).mockResolvedValue({
      id: "pet-1",
      name: "Luna",
      petTypeId: dogId,
      age: 3,
      ownerName: "Ana",
      sessionId,
      createdAt: new Date(),
    } as never);

    const result = await createPetWithValidation({ name: "Luna", petTypeCode: "DOG", age: 3, ownerName: "Ana" }, sessionId, mockDb);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pet.name).toBe("Luna");
    }
    expect(createPet).toHaveBeenCalledWith(expect.objectContaining({ sessionId, petTypeId: dogId }), mockDb);
    expect(findPetTypeByCode).toHaveBeenCalledWith("DOG", mockDb);
  });

  it("creates REPTILE with sentinel UUID", async () => {
    vi.mocked(createPet).mockResolvedValue({
      id: "pet-reptile",
      name: "Kaa",
      petTypeId: REPTILE_SENTINEL_UUID,
      ownerName: "Ana",
      sessionId,
      createdAt: new Date(),
    } as never);

    const result = await createPetWithValidation({ name: "Kaa", petTypeCode: "REPTILE", ownerName: "Ana" }, sessionId, mockDb);

    expect(result.success).toBe(true);
    expect(createPet).toHaveBeenCalledWith(expect.objectContaining({ petTypeId: REPTILE_SENTINEL_UUID }), mockDb);
    expect(findPetTypeByCode).not.toHaveBeenCalled();
  });

  it("returns fieldErrorCodes when petTypeCode DOG does not exist", async () => {
    vi.mocked(findPetTypeByCode).mockResolvedValue(null as never);

    const result = await createPetWithValidation({ name: "Luna", petTypeCode: "DOG", ownerName: "Ana" }, sessionId, mockDb);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrorCodes.petTypeCode).toBeDefined();
    }
    expect(createPet).not.toHaveBeenCalled();
  });

  it("returns error when validation fails (empty name) and does not insert", async () => {
    const result = await createPetWithValidation({ name: "   ", petTypeCode: "DOG", ownerName: "Ana" }, sessionId, mockDb);

    expect(result.success).toBe(false);
    expect(createPet).not.toHaveBeenCalled();
  });

  it("rejects sessionId in body", async () => {
    const result = await createPetWithValidation(
      { name: "Luna", petTypeCode: "DOG", ownerName: "Ana", sessionId: "evil" } as unknown as never,
      sessionId,
      mockDb,
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrorCodes.sessionId).toBe("SESSION_FIELD_FORBIDDEN");
    }
  });

  it("rejects petTypeId in body", async () => {
    const result = await createPetWithValidation(
      { name: "Luna", petTypeCode: "DOG", petTypeId: dogId, ownerName: "Ana" } as unknown as never,
      sessionId,
      mockDb,
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrorCodes.sessionId).toBeDefined();
    }
  });

  it("same sessionId is reused for multiple pets (caller provides same session)", async () => {
    vi.mocked(findPetTypeByCode).mockResolvedValue({ id: dogId, code: "DOG", title: "Perro" } as never);
    vi.mocked(createPet)
      .mockResolvedValueOnce({ id: "1", sessionId } as never)
      .mockResolvedValueOnce({ id: "2", sessionId } as never);

    const r1 = await createPetWithValidation({ name: "A", petTypeCode: "DOG", ownerName: "X" }, sessionId, mockDb);
    const r2 = await createPetWithValidation({ name: "B", petTypeCode: "DOG", ownerName: "Y" }, sessionId, mockDb);

    expect(r1.success && r2.success).toBe(true);
    expect(createPet).toHaveBeenNthCalledWith(1, expect.objectContaining({ sessionId }), mockDb);
    expect(createPet).toHaveBeenNthCalledWith(2, expect.objectContaining({ sessionId }), mockDb);
  });
});
