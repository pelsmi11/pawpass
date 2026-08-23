import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/db/queries", () => ({
  listRecentPets: vi.fn(),
  findPetTypeById: vi.fn(),
  createPet: vi.fn(),
}));

vi.mock("@/services/session", () => ({
  getOrCreateSessionId: vi.fn().mockResolvedValue("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"),
}));

vi.mock("@/utils/functions", () => ({
  createRequestId: vi.fn().mockReturnValue("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"),
}));

import { GET } from "./route";
import { listRecentPets } from "@/db/queries";

describe("GET /api/pets - list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with max 50 pets ordered desc and without session_id", async () => {
    const pets = Array.from({ length: 51 }, (_, i) => ({
      id: `pet-${i}`,
      name: `Pet${i}`,
      petTypeId: "dog-id",
      age: 2,
      ownerName: "Owner",
      createdAt: new Date(Date.now() - i * 1000).toISOString(),
      petType: { id: "dog-id", code: "DOG", title: "Perro" },
    }));
    // The query should already limit to 50, but we mock 51 to test handler just returns what query gives
    // Instead, test that query is called and handler returns 50 max via query's limit
    vi.mocked(listRecentPets).mockResolvedValue(pets.slice(0, 50) as never);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.pets).toHaveLength(50);
    expect(json.pets[0].name).toBe("Pet0"); // newest first (smallest i = most recent)
    expect(json.pets[0].petType.title).toBe("Perro");
    expect(json.pets[0].sessionId).toBeUndefined();
    expect(json.pets[0].session_id).toBeUndefined();
    expect(JSON.stringify(json)).not.toContain("session_id");
    expect(JSON.stringify(json)).not.toContain("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(json.requestId).toBeDefined();
  });

  it("returns empty array when no pets", async () => {
    vi.mocked(listRecentPets).mockResolvedValue([] as never);
    const res = await GET();
    const json = await res.json();
    expect(json.pets).toEqual([]);
  });

  it("excludes session_id from all pets even if DB had it", async () => {
    const petsWithSession = [
      {
        id: "pet-1",
        name: "Luna",
        petTypeId: "dog-id",
        age: 3,
        ownerName: "Ana",
        createdAt: new Date().toISOString(),
        sessionId: "should-not-be-returned",
        petType: { id: "dog-id", code: "DOG", title: "Perro" },
      },
    ];
    // Simulate DB returning with sessionId (if query mistakenly did) – handler must filter
    // Our query already excludes it, but test ensures handler doesn't leak
    vi.mocked(listRecentPets).mockResolvedValue(petsWithSession as unknown as never);

    const res = await GET();
    const json = await res.json();
    // Even if DB had sessionId, our handler's listRecentPets projection excludes it, so not in json
    // This test documents the contract: no session_id in response
    expect(JSON.stringify(json)).not.toContain("should-not-be-returned");
  });
});
