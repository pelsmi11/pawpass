import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/db/queries", () => ({
  findPetTypeById: vi.fn(),
  createPet: vi.fn(),
  listRecentPets: vi.fn(),
}));

vi.mock("@/services/session", () => ({
  getOrCreateSessionId: vi.fn().mockResolvedValue("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"),
}));

vi.mock("@/utils/functions", () => ({
  createRequestId: vi.fn().mockReturnValue("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"),
}));

import { POST } from "./route";
import { createPet, findPetTypeById } from "@/db/queries";

describe("POST /api/pets - validation errors", () => {
  const dogId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(findPetTypeById).mockResolvedValue({ id: dogId, code: "DOG", title: "Perro" } as never);
  });

  it("returns 400 for empty name and does not insert", async () => {
    const req = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", petTypeId: dogId, ownerName: "Ana" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(json.fieldErrorCodes.name).toBeDefined();
    expect(json.supportId).toBeDefined();
    expect(JSON.stringify(json)).not.toContain("23503");
    expect(createPet).not.toHaveBeenCalled();
  });

  it("returns 400 for whitespace-only ownerName", async () => {
    const req = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Luna", petTypeId: dogId, ownerName: "   " }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.fieldErrorCodes.ownerName).toBeDefined();
    expect(createPet).not.toHaveBeenCalled();
  });

  it("returns 400 for age -1 and 101", async () => {
    for (const age of [-1, 101]) {
      const req = new Request("http://localhost/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Luna", petTypeId: dogId, age, ownerName: "Ana" }),
      });
      const res = await POST(req);
      const json = await res.json();
      expect(res.status).toBe(400);
      expect(json.fieldErrorCodes.age).toBeDefined();
    }
    expect(createPet).not.toHaveBeenCalled();
  });

  it("returns 400 for decimal age", async () => {
    const req = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Luna", petTypeId: dogId, age: 3.5, ownerName: "Ana" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.fieldErrorCodes.age).toBeDefined();
  });

  it("returns 400 for unknown petTypeId", async () => {
    vi.mocked(findPetTypeById).mockResolvedValue(null as never);
    const req = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Luna", petTypeId: "00000000-0000-4000-a000-000000000000", ownerName: "Ana" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.fieldErrorCodes.petTypeId).toBeDefined();
    expect(JSON.stringify(json)).not.toContain("FOREIGN");
    expect(createPet).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const req = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ invalid json",
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(json.supportId).toBeDefined();
    expect(createPet).not.toHaveBeenCalled();
  });

  it("returns 400 for name 101 chars", async () => {
    const req = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "a".repeat(101), petTypeId: dogId, ownerName: "Ana" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.fieldErrorCodes.name).toBeDefined();
  });

  it("accepts name 100 chars", async () => {
    vi.mocked(createPet).mockResolvedValue({
      id: "pet-1",
      name: "a".repeat(100),
      petTypeId: dogId,
      age: null,
      ownerName: "Ana",
      sessionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      createdAt: new Date().toISOString(),
    } as never);
    const req = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "a".repeat(100), petTypeId: dogId, ownerName: "Ana" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("returns 400 for sessionId in body and does not insert", async () => {
    const req = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Luna", petTypeId: dogId, ownerName: "Ana", sessionId: "evil" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.fieldErrorCodes.sessionId).toBeDefined();
    expect(createPet).not.toHaveBeenCalled();
  });

  it("returns stable codes and no PG leak", async () => {
    const req = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", petTypeId: "not-uuid", ownerName: "" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(json.errorCode).toBe("VALIDATION_FAILED");
    expect(json).not.toHaveProperty("message");
    expect(JSON.stringify(json)).not.toMatch(/23503|FOREIGN|pg|postgres/i);
  });
});
