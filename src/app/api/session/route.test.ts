import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
const mockSet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ get: mockGet, set: mockSet })),
}));

import { GET } from "./route";

describe("GET /api/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue(undefined);
  });

  it("returns 200 with {ok:true} and sets cookie when no cookie", async () => {
    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ name: "pawpass_session" }));
    expect(json.sessionId).toBeUndefined();
    expect(json.session_id).toBeUndefined();
    expect(JSON.stringify(json)).not.toContain("session");
  });

  it("reuses same cookie when valid exists", async () => {
    const existing = "11111111-1111-4111-8111-111111111111";
    mockGet.mockReturnValue({ value: existing });
    const res = await GET();
    const json = await res.json();
    expect(json).toEqual({ ok: true });
    // Should not set new cookie if already valid (or may set same value; we check not called with new uuid)
    // Our implementation only sets when missing/invalid, so not called
    expect(mockSet).not.toHaveBeenCalled();
  });

  it("regenerates when cookie invalid and never exposes sessionId", async () => {
    mockGet.mockReturnValue({ value: "invalid" });
    const res = await GET();
    const json = await res.json();
    expect(json).toEqual({ ok: true });
    expect(mockSet).toHaveBeenCalled();
    expect(json).not.toHaveProperty("sessionId");
  });

  it("never exposes sessionId in response", async () => {
    mockGet.mockReturnValue({ value: "11111111-1111-4111-8111-111111111111" });
    const res = await GET();
    const text = await res.text();
    expect(text).not.toContain("11111111-1111-4111-8111-111111111111");
    expect(text).not.toContain("sessionId");
    expect(text).not.toContain("session_id");
  });
});
