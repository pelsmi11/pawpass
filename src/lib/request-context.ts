/**
 * Generates a unique request identifier for correlation.
 * Each request MUST have a distinct requestId (FR-021, SC-009).
 */
export function createRequestId(): string {
  return crypto.randomUUID();
}
