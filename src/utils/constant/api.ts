import type { ApiErrorCode, FieldErrorCode } from "@/interface";

export const API_ERROR_CODES = [
  "VALIDATION_FAILED",
  "PET_TYPES_LOAD_FAILED",
  "PETS_LOAD_FAILED",
  "PET_CREATE_FAILED",
] as const satisfies readonly ApiErrorCode[];

export const FIELD_ERROR_CODES = [
  "INVALID_BODY",
  "SESSION_FIELD_FORBIDDEN",
  "NAME_REQUIRED",
  "NAME_TOO_LONG",
  "PET_TYPE_INVALID",
  "AGE_NOT_NUMBER",
  "AGE_NOT_INTEGER",
  "AGE_OUT_OF_RANGE",
  "OWNER_NAME_REQUIRED",
  "OWNER_NAME_TOO_LONG",
] as const satisfies readonly FieldErrorCode[];

export const FORBIDDEN_PET_INPUT_KEYS = ["sessionId", "session_id"] as const;
