export type ErrorResponse = {
  ok: false;
  message: string;
  fieldErrors?: Record<string, string>;
  supportId: string;
};

export type SuccessResponse<T> = {
  ok: true;
  requestId: string;
} & T;

/**
 * Builds a safe error response without leaking PG/infra details.
 * Logs are not included here; callers must not include ownerName etc.
 */
export function buildErrorResponse(
  message: string,
  supportId: string,
  fieldErrors?: Record<string, string>,
): ErrorResponse {
  const base: ErrorResponse = {
    ok: false,
    message,
    supportId,
  };
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    base.fieldErrors = fieldErrors;
  }
  return base;
}

export function buildSuccessResponse<T extends object>(
  data: T,
  requestId: string,
): SuccessResponse<T> {
  return {
    ok: true,
    requestId,
    ...data,
  };
}
