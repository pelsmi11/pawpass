import { describe, expect, it } from "vitest";
import { PET_TYPE_CODES, REPTILE_SENTINEL_UUID, VALID_PET_TYPE_CODES } from "./petCatalog";

describe("petCatalog", () => {
  it("contains exactly DOG, CAT, REPTILE", () => {
    expect(PET_TYPE_CODES).toEqual(["DOG", "CAT", "REPTILE"]);
  });

  it("VALID set recognizes only those three", () => {
    expect(VALID_PET_TYPE_CODES.has("DOG")).toBe(true);
    expect(VALID_PET_TYPE_CODES.has("CAT")).toBe(true);
    expect(VALID_PET_TYPE_CODES.has("REPTILE")).toBe(true);
    expect(VALID_PET_TYPE_CODES.has("BIRD")).toBe(false);
    expect(VALID_PET_TYPE_CODES.has("dog")).toBe(false);
    expect(VALID_PET_TYPE_CODES.has(" DOG")).toBe(false);
    expect(VALID_PET_TYPE_CODES.has("REPTILE ")).toBe(false);
  });

  it("sentinel is valid UUID", () => {
    expect(REPTILE_SENTINEL_UUID).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it("sentinel not in pet_types code set", () => {
    expect(VALID_PET_TYPE_CODES.has(REPTILE_SENTINEL_UUID)).toBe(false);
  });
});
