import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
const mockSet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ get: mockGet, set: mockSet })),
}));

import { getOrCreateSessionId } from "./session";

describe("getOrCreateSessionId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue(undefined);
  });

  it("creates new UUID and sets cookie when no cookie", async () => {
    const id = await getOrCreateSessionId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "pawpass_session",
        value: id,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 86400,
      }),
    );
  });

  it("reuses existing valid UUID", async () => {
    const existing = "11111111-1111-4111-8111-111111111111";
    mockGet.mockReturnValue({ value: existing });
    const id = await getOrCreateSessionId();
    expect(id).toBe(existing);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it("regenerates when cookie is invalid", async () => {
    mockGet.mockReturnValue({ value: "not-a-uuid" });
    const id = await getOrCreateSessionId();
    expect(id).not.toBe("not-a-uuid");
    expect(mockSet).toHaveBeenCalled();
  });

  it("sets Secure in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mockGet.mockReturnValue(undefined);
    await getOrCreateSessionId();
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ secure: true }));
    vi.unstubAllEnvs();
  });

  it("does not set Secure in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    mockGet.mockReturnValue(undefined);
    await getOrCreateSessionId();
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ secure: false }));
    vi.unstubAllEnvs();
  });
});
