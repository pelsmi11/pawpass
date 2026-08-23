import type { FieldErrorCodes } from "./validation";

export type ApiErrorCode =
  | "VALIDATION_FAILED"
  | "PET_TYPES_LOAD_FAILED"
  | "PETS_LOAD_FAILED"
  | "PET_CREATE_FAILED";

export type ErrorResponse = {
  ok: false;
  errorCode: ApiErrorCode;
  fieldErrorCodes?: FieldErrorCodes;
  supportId: string;
};

export type SuccessResponse<T> = {
  ok: true;
  requestId: string;
} & T;

export type PetTypesResponse = {
  ok: boolean;
  petTypes?: import("./pet").PetType[];
};

export type PetsResponse = {
  ok: boolean;
  pets?: import("./pet").Pet[];
  errorCode?: string;
};
