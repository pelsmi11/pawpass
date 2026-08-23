import type { CreatePetInput } from "./pet";

export type FieldErrorCode =
  | "INVALID_BODY"
  | "SESSION_FIELD_FORBIDDEN"
  | "NAME_REQUIRED"
  | "NAME_TOO_LONG"
  | "PET_TYPE_INVALID"
  | "AGE_NOT_NUMBER"
  | "AGE_NOT_INTEGER"
  | "AGE_OUT_OF_RANGE"
  | "OWNER_NAME_REQUIRED"
  | "OWNER_NAME_TOO_LONG";

export type FieldErrorCodes = Partial<
  Record<keyof CreatePetInput | "sessionId", FieldErrorCode>
>;
