import { describe, expect, it } from "vitest";
import { validatePetInput } from "./petValidation";

describe("validatePetInput", () => {
  it("accepts valid input", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeCode: "DOG",
      age: 3,
      ownerName: "Ana",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input without age", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeCode: "CAT",
      ownerName: "Ana",
    });
    expect(result.success).toBe(true);
  });

  it("accepts REPTILE as valid laboratory code", () => {
    const result = validatePetInput({
      name: "Kaa",
      petTypeCode: "REPTILE",
      ownerName: "Ana",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name with only spaces", () => {
    const result = validatePetInput({
      name: "   ",
      petTypeCode: "DOG",
      ownerName: "Ana",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.name).toBeDefined();
  });

  it("rejects ownerName with only spaces", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeCode: "DOG",
      ownerName: "   ",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.ownerName).toBeDefined();
  });

  it("accepts name with 100 characters", () => {
    const name100 = "a".repeat(100);
    const result = validatePetInput({
      name: name100,
      petTypeCode: "DOG",
      ownerName: "Ana",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name with 101 characters", () => {
    const name101 = "a".repeat(101);
    const result = validatePetInput({
      name: name101,
      petTypeCode: "DOG",
      ownerName: "Ana",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.name).toBeDefined();
  });

  it("accepts ownerName with 100 characters", () => {
    const owner100 = "b".repeat(100);
    const result = validatePetInput({
      name: "Luna",
      petTypeCode: "DOG",
      ownerName: owner100,
    });
    expect(result.success).toBe(true);
  });

  it("rejects ownerName with 101 characters", () => {
    const owner101 = "b".repeat(101);
    const result = validatePetInput({
      name: "Luna",
      petTypeCode: "DOG",
      ownerName: owner101,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.ownerName).toBeDefined();
  });

  it("rejects age -1", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeCode: "DOG",
      age: -1,
      ownerName: "Ana",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.age).toBeDefined();
  });

  it("rejects age 101", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeCode: "DOG",
      age: 101,
      ownerName: "Ana",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.age).toBeDefined();
  });

  it("rejects age decimal 3.5", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeCode: "DOG",
      age: 3.5,
      ownerName: "Ana",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.age).toBeDefined();
  });

  it("rejects age as non-numeric string", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeCode: "DOG",
      age: "abc" as unknown as number,
      ownerName: "Ana",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.age).toBeDefined();
  });

  it("accepts age 0 and 100 boundaries", () => {
    expect(validatePetInput({ name: "A", petTypeCode: "DOG", age: 0, ownerName: "B" }).success).toBe(true);
    expect(validatePetInput({ name: "A", petTypeCode: "DOG", age: 100, ownerName: "B" }).success).toBe(true);
  });

  it("accepts age as numeric string", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeCode: "DOG",
      age: "3" as unknown as number,
      ownerName: "Ana",
    });
    expect(result.success).toBe(true);
  });

  it("rejects petTypeCode unknown", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeCode: "BIRD" as unknown as string,
      ownerName: "Ana",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.petTypeCode).toBeDefined();
  });

  it("rejects petTypeCode casing", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeCode: "dog" as unknown as string,
      ownerName: "Ana",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.petTypeCode).toBeDefined();
  });

  it("rejects strict petTypeId in body", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeCode: "DOG",
      petTypeId: "11111111-1111-4111-8111-111111111111",
      ownerName: "Ana",
    } as unknown as never);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.sessionId).toBeDefined();
  });

  it("rejects strict sessionId in body", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeCode: "DOG",
      ownerName: "Ana",
      sessionId: "evil",
    } as unknown as never);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.sessionId).toBeDefined();
  });

  it("rejects strict session_id in body", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeCode: "DOG",
      ownerName: "Ana",
      session_id: "evil",
    } as unknown as never);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrorCodes.sessionId).toBeDefined();
  });

  it("ignores other unknown keys", () => {
    const result = validatePetInput({
      name: "Luna",
      petTypeCode: "DOG",
      ownerName: "Ana",
      unknown: "field",
    } as unknown as never);
    // Should succeed (unknown keys are stripped, not rejected, except sessionId)
    expect(result.success).toBe(true);
  });
});
