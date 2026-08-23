import type { ApiErrorCode, ErrorResponse, FieldErrorCodes, SuccessResponse } from "@/interface";
import { API_ERROR_CODES } from "@/utils/constant";

export type ErrorType = "ValidationError" | "DatabaseUnavailableError" | "ForeignKeyViolation" | "UnexpectedError";

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

/**
 * Classifies PostgreSQL/driver errors by structured property `code`.
 * Never uses message substring.
 */
export const classifyError = (error: unknown, isOutageContext: boolean): { errorType: ErrorType; databaseCode?: string } => {
  if (isOutageContext) {
    return { errorType: "DatabaseUnavailableError" };
  }
  if (error !== null && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (code === "23503") {
      return { errorType: "ForeignKeyViolation", databaseCode: "23503" };
    }
  }
  return { errorType: "UnexpectedError" };
};
