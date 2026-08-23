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

import { GET, POST } from "./route";
import { createPet, findPetTypeById, listRecentPets } from "@/db/queries";

describe("POST /api/pets - valid creation", () => {
  const dogId = "d0d0d0d0-d0d0-4d0d-8d0d-d0d0d0d0d0d0";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 201 with pet and requestId for valid payload", async () => {
    vi.mocked(findPetTypeById).mockResolvedValue({ id: dogId, code: "DOG", title: "Perro" } as never);
    const createdPet = {
      id: "pet-uuid-1",
      name: "Luna",
      petTypeId: dogId,
      age: 3,
      ownerName: "Ana",
      sessionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      createdAt: new Date().toISOString(),
    };
    vi.mocked(createPet).mockResolvedValue(createdPet as never);

    const req = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Luna", petTypeId: dogId, age: 3, ownerName: "Ana" }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.ok).toBe(true);
    expect(json.pet.name).toBe("Luna");
    expect(json.pet.petType.title).toBe("Perro");
    expect(json.requestId).toBe("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb");
    expect(json.pet.sessionId).toBeUndefined();
    expect(json.pet.session_id).toBeUndefined();
    expect(JSON.stringify(json)).not.toContain("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(createPet).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }),
    );
  });

  it("GET after POST would show pet in list (via listRecentPets)", async () => {
    const pet = {
      id: "pet-uuid-2",
      name: "Luna",
      petTypeId: dogId,
      age: 3,
      ownerName: "Ana",
      createdAt: new Date().toISOString(),
      petType: { id: dogId, code: "DOG", title: "Perro" },
    };
    vi.mocked(listRecentPets).mockResolvedValue([pet] as never);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.pets[0].name).toBe("Luna");
    expect(json.pets[0].petType.title).toBe("Perro");
    expect(json.pets[0].sessionId).toBeUndefined();
    expect(json.requestId).toBeDefined();
  });

  it("returns 400 when body contains sessionId and does not call createPet", async () => {
    const req = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Luna", petTypeId: dogId, ownerName: "Ana", sessionId: "evil" }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(json.errorCode).toBe("VALIDATION_FAILED");
    expect(json.fieldErrorCodes.sessionId).toBe("SESSION_FIELD_FORBIDDEN");
    expect(json.supportId).toBeDefined();
    expect(createPet).not.toHaveBeenCalled();
  });

  it("returns 400 when body contains session_id", async () => {
    const req = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Luna", petTypeId: dogId, ownerName: "Ana", session_id: "evil" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(createPet).not.toHaveBeenCalled();
  });
});
