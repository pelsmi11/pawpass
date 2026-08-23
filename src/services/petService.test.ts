import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/db/queries", () => ({
  findPetTypeById: vi.fn(),
  createPet: vi.fn(),
}));

import { findPetTypeById, createPet } from "@/db/queries";
import { createPetWithValidation } from "./petService";

describe("petService - createPetWithValidation", () => {
  const dogId = "d0d0d0d0-d0d0-4d0d-8d0d-d0d0d0d0d0d0";
  const sessionId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const mockDb = {} as never;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates pet when data valid and petType exists", async () => {
    vi.mocked(findPetTypeById).mockResolvedValue({ id: dogId, code: "DOG", title: "Perro" } as never);
    vi.mocked(createPet).mockResolvedValue({
      id: "pet-1",
      name: "Luna",
      petTypeId: dogId,
      age: 3,
      ownerName: "Ana",
      sessionId,
      createdAt: new Date(),
    } as never);

    const result = await createPetWithValidation(
      { name: "Luna", petTypeId: dogId, age: 3, ownerName: "Ana" },
      sessionId,
      mockDb,
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pet.name).toBe("Luna");
    }
    expect(createPet).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId }),
      mockDb,
    );
  });

  it("returns fieldErrorCodes when petTypeId does not exist", async () => {
    vi.mocked(findPetTypeById).mockResolvedValue(null as never);

    const result = await createPetWithValidation(
      { name: "Luna", petTypeId: dogId, ownerName: "Ana" },
      sessionId,
      mockDb,
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrorCodes.petTypeId).toBeDefined();
    }
    expect(createPet).not.toHaveBeenCalled();
  });

  it("returns error when validation fails (empty name) and does not insert", async () => {
    const result = await createPetWithValidation(
      { name: "   ", petTypeId: dogId, ownerName: "Ana" },
      sessionId,
      mockDb,
    );

    expect(result.success).toBe(false);
    expect(createPet).not.toHaveBeenCalled();
  });

  it("rejects sessionId in body", async () => {
    const result = await createPetWithValidation(
      { name: "Luna", petTypeId: dogId, ownerName: "Ana", sessionId: "evil" } as unknown as never,
      sessionId,
      mockDb,
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrorCodes.sessionId).toBe("SESSION_FIELD_FORBIDDEN");
    }
  });

  it("same sessionId is reused for multiple pets (caller provides same session)", async () => {
    vi.mocked(findPetTypeById).mockResolvedValue({ id: dogId, code: "DOG", title: "Perro" } as never);
    vi.mocked(createPet)
      .mockResolvedValueOnce({ id: "1", sessionId } as never)
      .mockResolvedValueOnce({ id: "2", sessionId } as never);

    const r1 = await createPetWithValidation(
      { name: "A", petTypeId: dogId, ownerName: "X" },
      sessionId,
      mockDb,
    );
    const r2 = await createPetWithValidation(
      { name: "B", petTypeId: dogId, ownerName: "Y" },
      sessionId,
      mockDb,
    );

    expect(r1.success && r2.success).toBe(true);
    expect(createPet).toHaveBeenNthCalledWith(1, expect.objectContaining({ sessionId }), mockDb);
    expect(createPet).toHaveBeenNthCalledWith(2, expect.objectContaining({ sessionId }), mockDb);
  });
});
