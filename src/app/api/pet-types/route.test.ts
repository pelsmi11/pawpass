import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/db/queries", () => ({
  listPetTypes: vi.fn(),
}));
vi.mock("@/services/session", () => ({
  getOrCreateSessionId: vi.fn().mockResolvedValue("11111111-1111-4111-8111-111111111111"),
}));
vi.mock("@/utils/functions/requestContext", () => ({
  createRequestId: vi.fn().mockReturnValue("22222222-2222-4222-8222-222222222222"),
  getDurationMs: vi.fn().mockReturnValue(5),
}));

vi.mock("@/utils/functions/logger", () => ({
  log: vi.fn(),
  logError: vi.fn(),
}));

import { GET } from "./route";
import { listPetTypes } from "@/db/queries";
import { createRequestId } from "@/utils/functions/requestContext";

describe("GET /api/pet-types", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createRequestId).mockReturnValue("22222222-2222-4222-8222-222222222222");
  });  it("returns 200 with petTypes and requestId", async () => {
    const mockTypes = [
      { id: "a1b2c3d4-1111-4111-8111-111111111111", code: "CAT", title: "Gato" },
      { id: "a1b2c3d4-2222-4111-8111-111111111111", code: "DOG", title: "Perro" },
    ];
    vi.mocked(listPetTypes).mockResolvedValue(mockTypes as never);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.petTypes).toEqual(mockTypes);
    expect(json.requestId).toBe("22222222-2222-4222-8222-222222222222");
    expect(JSON.stringify(json)).not.toContain("session_id");
    expect(JSON.stringify(json)).not.toContain("sessionId");
  });

  it("returns 500 with supportId on DB error and no PG leak", async () => {
    vi.mocked(listPetTypes).mockRejectedValue(new Error("23503 foreign key"));

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.ok).toBe(false);
    expect(json.supportId).toBe("22222222-2222-4222-8222-222222222222");
    expect(json.errorCode).toBe("PET_TYPES_LOAD_FAILED");
    expect(json).not.toHaveProperty("message");
  });

  it("generates distinct requestId per call when mocked sequentially", async () => {
    vi.mocked(createRequestId)
      .mockReturnValueOnce("id-1-uuid-4111-8111-111111111111")
      .mockReturnValueOnce("id-2-uuid-4222-8222-222222222222");

    vi.mocked(listPetTypes).mockResolvedValue([] as never);

    const res1 = await GET();
    const json1 = await res1.json();
    const res2 = await GET();
    const json2 = await res2.json();

    expect(json1.requestId).not.toBe(json2.requestId);
  });
});
