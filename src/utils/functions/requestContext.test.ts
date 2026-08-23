import { describe, expect, it } from "vitest";
import { createRequestId } from "./requestContext";

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
