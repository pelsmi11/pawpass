/**
 * Generates a unique request identifier for correlation.
 * Each request MUST have a distinct requestId (FR-021, SC-009).
 * requestId is UUID pure, supportId is same value.
 */
export const createRequestId = (): string => crypto.randomUUID();

export type RequestContext = {
  requestId: string;
  supportId: string;
  route: string;
  sessionId?: string;
  startedAt: number;
};

export const createRequestContext = (route: string, sessionId?: string): RequestContext => {
  const requestId = createRequestId();
  return {
    requestId,
    supportId: requestId,
    route,
    sessionId,
    startedAt: performance.now(),
  };
};

export const getDurationMs = (startedAt: number): number => Math.round(performance.now() - startedAt);
