import { z } from "zod";

import {
  FIELD_ERROR_CODES,
  FORBIDDEN_PET_INPUT_KEYS,
} from "@/utils/constant";
import type {
  CreatePetInput,
  FieldErrorCode,
  FieldErrorCodes,
} from "@/interface";

export const isFieldErrorCode = (value: unknown): value is FieldErrorCode => {
  return typeof value === "string" && FIELD_ERROR_CODES.includes(value as FieldErrorCode);
};

// Age: optional, integer 0-100, accepts number or numeric string, empty → undefined
const ageSchema = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    const num = typeof val === "string" ? Number(val) : val;
    return num;
  })
  .pipe(
    z
      .number({ message: "AGE_NOT_NUMBER" })
      .int("AGE_NOT_INTEGER")
      .min(0, "AGE_OUT_OF_RANGE")
      .max(100, "AGE_OUT_OF_RANGE")
      .optional(),
  );

export const createPetSchema = z.object({
  name: z
    .string({ message: "NAME_REQUIRED" })
    .trim()
    .min(1, "NAME_REQUIRED")
    .max(100, "NAME_TOO_LONG"),
  petTypeCode: z.enum(["DOG", "CAT", "REPTILE"] as const, {
    message: "PET_TYPE_INVALID",
  }),
  age: ageSchema.optional(),
  ownerName: z
    .string({ message: "OWNER_NAME_REQUIRED" })
    .trim()
    .min(1, "OWNER_NAME_REQUIRED")
    .max(100, "OWNER_NAME_TOO_LONG"),
});

/**
 * Validates raw JSON body for POST /api/pets.
 * - Strictly rejects if body contains sessionId/session_id (FR-018, A3) → 400
 * - Otherwise applies createPetSchema (other unknown keys are stripped/ignored)
 */
export const validatePetInput = (body: unknown):
  | { success: true; data: CreatePetInput }
  | { success: false; fieldErrorCodes: FieldErrorCodes } => {
  if (body !== null && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    for (const key of FORBIDDEN_PET_INPUT_KEYS) {
      if (key in obj) {
        return {
          success: false,
          fieldErrorCodes: { sessionId: "SESSION_FIELD_FORBIDDEN" },
        };
      }
    }
  }

  const parsed = createPetSchema.safeParse(body);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  const fieldErrorCodes: FieldErrorCodes = {};
  for (const issue of parsed.error.issues) {
    const path = issue.path[0] as keyof CreatePetInput | undefined;
    if (path && !fieldErrorCodes[path] && isFieldErrorCode(issue.message)) {
      fieldErrorCodes[path] = issue.message;
    }
  }

  // Fallback for root-level errors (e.g., body not an object)
  if (Object.keys(fieldErrorCodes).length === 0) {
    fieldErrorCodes.name = "INVALID_BODY";
  }

  return {
    success: false,
    fieldErrorCodes,
  };
};
