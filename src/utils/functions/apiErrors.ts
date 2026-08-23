import type { ApiErrorCode, ErrorResponse, FieldErrorCodes, SuccessResponse } from "@/interface";
import { API_ERROR_CODES } from "@/utils/constant";

export const isApiErrorCode = (value: unknown): value is ApiErrorCode => {
  return typeof value === "string" && API_ERROR_CODES.includes(value as ApiErrorCode);
};

/**
 * Builds a safe error response without leaking PG/infra details.
 * Logs are not included here; callers must not include ownerName etc.
 */
export const buildErrorResponse = (
  errorCode: ApiErrorCode,
  supportId: string,
  fieldErrorCodes?: FieldErrorCodes,
): ErrorResponse => {
  const base: ErrorResponse = {
    ok: false,
    errorCode,
    supportId,
  };
  if (fieldErrorCodes && Object.keys(fieldErrorCodes).length > 0) {
    base.fieldErrorCodes = fieldErrorCodes;
  }
  return base;
};

export const buildSuccessResponse = <T extends object>(
  data: T,
  requestId: string,
): SuccessResponse<T> => {
  return {
    ok: true,
    requestId,
    ...data,
  };
};
