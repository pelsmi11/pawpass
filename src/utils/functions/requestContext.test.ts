import { describe, expect, it } from "vitest";
import { createRequestContext, createRequestId, getDurationMs } from "./requestContext";

describe("createRequestId", () => {
  it("generates distinct UUIDs", () => {
    const ids = new Set(Array.from({ length: 10 }, () => createRequestId()));
    expect(ids.size).toBe(10);
  });

  it("generates valid UUID v4 format", () => {
    const id = createRequestId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("is keyboard accessible concept - each call is unique", () => {
    const a = createRequestId();
    const b = createRequestId();
    expect(a).not.toBe(b);
  });
});

describe("createRequestContext", () => {
  it("creates context with UUID and supportId equal", () => {
    const ctx = createRequestContext("/api/pets", "session-123");
    expect(ctx.requestId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(ctx.supportId).toBe(ctx.requestId);
    expect(ctx.route).toBe("/api/pets");
    expect(ctx.sessionId).toBe("session-123");
    expect(typeof ctx.startedAt).toBe("number");
  });

  it("generates distinct requestIds", () => {
    const a = createRequestContext("/api/pets");
    const b = createRequestContext("/api/pets");
    expect(a.requestId).not.toBe(b.requestId);
  });
});

describe("getDurationMs", () => {
  it("returns rounded duration", async () => {
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 5));
    const d = getDurationMs(start);
    expect(d).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(d)).toBe(true);
  });
});
