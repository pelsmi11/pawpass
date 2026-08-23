export const PET_TYPE_CODES = ["DOG", "CAT", "REPTILE"] as const;

export type PetTypeCode = (typeof PET_TYPE_CODES)[number];

export const REPTILE_SENTINEL_UUID = "00000000-0000-4000-a000-000000000000" as const;

export const VALID_PET_TYPE_CODES = new Set<string>(PET_TYPE_CODES);
