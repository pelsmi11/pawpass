import { describe, expect, it, vi, beforeEach } from "vitest";

describe("db client", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.DATABASE_URL = "postgresql://user:password@127.0.0.1:5432/pawpass?sslmode=disable";
    process.env.BROKEN_DATABASE_URL = "postgresql://user:invalid@127.0.0.1:5432/pawpass?sslmode=disable";
  });

  it("db is defined", async () => {
    const { db } = await import("./client");
    expect(db).toBeDefined();
  });

  it("getBrokenDb returns same instance", async () => {
    const { getBrokenDb } = await import("./client");
    const a = getBrokenDb();
    const b = getBrokenDb();
    expect(a).toBe(b);
  });

  it("getBrokenDb throws if not configured", async () => {
    vi.resetModules();
    delete process.env.BROKEN_DATABASE_URL;
    const { getBrokenDb } = await import("./client");
    expect(() => getBrokenDb()).toThrow();
  });
});
