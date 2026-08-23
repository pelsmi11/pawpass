import { describe, expect, it, vi, beforeEach } from "vitest";
import { log, logError } from "./logger";

describe("logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("logs JSON single line with required fields", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    log({
      severity: "INFO",
      message: "Pet registration started",
      service: "pawpass",
      event: "PET_REGISTRATION_STARTED",
      route: "/api/pets",
      sessionId: "sess-1",
      requestId: "req-1",
    });
    expect(spy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.service).toBe("pawpass");
    expect(parsed.event).toBe("PET_REGISTRATION_STARTED");
    expect(parsed.sessionId).toBe("sess-1");
    expect(parsed.requestId).toBe("req-1");
    expect(parsed).not.toHaveProperty("ownerName");
    expect(parsed).not.toHaveProperty("DATABASE_URL");
  });

  it("does not include PII or secrets", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logError({
      severity: "ERROR",
      message: "Pet registration failed",
      service: "pawpass",
      event: "PET_REGISTRATION_FAILED",
      route: "/api/pets",
      sessionId: "sess-1",
      requestId: "req-1",
      httpStatus: 500,
      errorType: "ForeignKeyViolation",
      databaseCode: "23503",
      petTypeCode: "REPTILE",
    });
    const raw = spy.mock.calls[0][0] as string;
    expect(raw).not.toContain("ownerName");
    expect(raw).not.toContain("DATABASE_URL");
    expect(raw).not.toContain("BROKEN");
    const parsed = JSON.parse(raw);
    expect(parsed.databaseCode).toBe("23503");
  });

  it("logs error via console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logError({
      severity: "ERROR",
      message: "Demo status failed",
      service: "pawpass",
      event: "DEMO_STATUS_FAILED",
      route: "/api/demo/status",
      sessionId: "s",
      requestId: "r",
      httpStatus: 500,
      errorType: "UnexpectedError",
    });
    expect(spy).toHaveBeenCalled();
  });
});
