import { describe, expect, it } from "vitest";
import { validatePetInput } from "./petValidation";

const validPetTypeId = "11111111-1111-4111-8111-111111111111";

describe("validatePetInput", () => {
  it("accepts valid input", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeId: validPetTypeId,
      age: 3,
      ownerName: "Ana",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input without age", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeId: validPetTypeId,
      ownerName: "Ana",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name with only spaces", () => {
    const result = validatePetInput({
      name: "   ",
      petTypeId: validPetTypeId,
      ownerName: "Ana",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.name).toBeDefined();
  });

  it("rejects ownerName with only spaces", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeId: validPetTypeId,
      ownerName: "   ",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.ownerName).toBeDefined();
  });

  it("accepts name with 100 characters", () => {
    const name100 = "a".repeat(100);
    const result = validatePetInput({
      name: name100,
      petTypeId: validPetTypeId,
      ownerName: "Ana",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name with 101 characters", () => {
    const name101 = "a".repeat(101);
    const result = validatePetInput({
      name: name101,
      petTypeId: validPetTypeId,
      ownerName: "Ana",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.name).toBeDefined();
  });

  it("accepts ownerName with 100 characters", () => {
    const owner100 = "b".repeat(100);
    const result = validatePetInput({
      name: "Luna",
      petTypeId: validPetTypeId,
      ownerName: owner100,
    });
    expect(result.success).toBe(true);
  });

  it("rejects ownerName with 101 characters", () => {
    const owner101 = "b".repeat(101);
    const result = validatePetInput({
      name: "Luna",
      petTypeId: validPetTypeId,
      ownerName: owner101,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.ownerName).toBeDefined();
  });

  it("rejects age -1", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeId: validPetTypeId,
      age: -1,
      ownerName: "Ana",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.age).toBeDefined();
  });

  it("rejects age 101", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeId: validPetTypeId,
      age: 101,
      ownerName: "Ana",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.age).toBeDefined();
  });

  it("rejects age decimal 3.5", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeId: validPetTypeId,
      age: 3.5,
      ownerName: "Ana",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.age).toBeDefined();
  });

  it("rejects age as non-numeric string", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeId: validPetTypeId,
      age: "abc" as unknown as number,
      ownerName: "Ana",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.age).toBeDefined();
  });

  it("accepts age 0 and 100 boundaries", () => {
    expect(validatePetInput({ name: "A", petTypeId: validPetTypeId, age: 0, ownerName: "B" }).success).toBe(true);
    expect(validatePetInput({ name: "A", petTypeId: validPetTypeId, age: 100, ownerName: "B" }).success).toBe(true);
  });

  it("accepts age as numeric string", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeId: validPetTypeId,
      age: "3" as unknown as number,
      ownerName: "Ana",
    });
    expect(result.success).toBe(true);
  });

  it("rejects petTypeId non-uuid", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeId: "not-a-uuid",
      ownerName: "Ana",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.petTypeId).toBeDefined();
  });

  it("rejects strict sessionId in body", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeId: validPetTypeId,
      ownerName: "Ana",
      sessionId: "evil",
    } as unknown as never);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.sessionId).toBeDefined();
  });

  it("rejects strict session_id in body", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeId: validPetTypeId,
      ownerName: "Ana",
      session_id: "evil",
    } as unknown as never);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.sessionId).toBeDefined();
  });

  it("ignores other unknown keys", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeId: validPetTypeId,
      ownerName: "Ana",
      unknown: "field",
    } as unknown as never);
    // Should succeed (unknown keys are stripped, not rejected, except sessionId)
    expect(result.success).toBe(true);
  });
});
