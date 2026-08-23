import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

vi.mock("@/db/queries", () => ({
  listRecentPets: vi.fn(),
  findPetTypeByCode: vi.fn(),
  findPetTypeById: vi.fn(),
  createPet: vi.fn(),
  getDemoConfig: vi.fn(),
}));

vi.mock("@/db/client", async () => {
  const actual = await vi.importActual<typeof import("@/db/client")>("@/db/client");
  return {
    ...actual,
    getBrokenDb: vi.fn(),
    db: {},
  };
});

vi.mock("@/services/session", () => ({
  getOrCreateSessionId: vi.fn().mockResolvedValue("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"),
}));

vi.mock("@/utils/functions", async () => {
  const actual = await vi.importActual<typeof import("@/utils/functions")>("@/utils/functions");
  return {
    ...actual,
    createRequestId: vi.fn().mockReturnValue("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"),
    getDurationMs: vi.fn().mockReturnValue(5),
  };
});

vi.mock("@/utils/functions/requestContext", () => ({
  createRequestId: vi.fn().mockReturnValue("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"),
  getDurationMs: vi.fn().mockReturnValue(5),
}));

vi.mock("@/utils/functions/logger", () => ({
  log: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("@/utils/functions/apiErrors", () => ({
  classifyError: vi.fn().mockImplementation((error: unknown, isOutage: boolean) => {
    // Outage takes precedence over FK violation (matches real implementation)
    if (isOutage) return { errorType: "DatabaseUnavailableError" };
    if (error !== null && typeof error === "object" && "code" in error) {
      const code = (error as { code?: string }).code;
      if (code === "23503") return { errorType: "ForeignKeyViolation", databaseCode: "23503" };
    }
    return { errorType: "UnexpectedError" };
  }),
}));

import { GET, POST } from "./route";
import { createPet, findPetTypeByCode, getDemoConfig, listRecentPets } from "@/db/queries";
import { getBrokenDb } from "@/db/client";
import { NeonDbError } from "@neondatabase/serverless";

describe("POST /api/pets - valid creation", () => {
  const dogId = "d0d0d0d0-d0d0-4d0d-8d0d-d0d0d0d0d0d0";
  const reptileError = Object.assign(new Error("fk"), { code: "23503" }) as NeonDbError;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDemoConfig).mockResolvedValue({
      id: "global",
      databaseOutage: false,
      highLatency: false,
      latencyMs: 6000,
      updatedAt: new Date(),
    } as never);
  });

  it("returns 201 with pet and requestId for valid payload", async () => {
    vi.mocked(findPetTypeByCode).mockResolvedValue({ id: dogId, code: "DOG", title: "Perro" } as never);
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
      body: JSON.stringify({ name: "Luna", petTypeCode: "DOG", age: 3, ownerName: "Ana" }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.ok).toBe(true);
    expect(json.pet.name).toBe("Luna");
    expect(json.requestId).toBe("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb");
    expect(json.pet.sessionId).toBeUndefined();
    expect(json.pet.session_id).toBeUndefined();
    expect(JSON.stringify(json)).not.toContain("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(createPet).toHaveBeenCalledWith(expect.objectContaining({ sessionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }), expect.anything());
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
      body: JSON.stringify({ name: "Luna", petTypeCode: "DOG", ownerName: "Ana", sessionId: "evil" }),
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
      body: JSON.stringify({ name: "Luna", petTypeCode: "DOG", ownerName: "Ana", session_id: "evil" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(createPet).not.toHaveBeenCalled();
  });

  it("returns 400 when body contains petTypeId (forbidden)", async () => {
    const req = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Luna", petTypeId: dogId, ownerName: "Ana" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.fieldErrorCodes.sessionId).toBeDefined();
    expect(createPet).not.toHaveBeenCalled();
  });
});

describe("POST /api/pets - outage uses brokenDb → 503", () => {
  const dogId = "d0d0d0d0-d0d0-4d0d-8d0d-d0d0d0d0d0d0";
  const brokenErr = Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" }) as NeonDbError;
  const fkError = Object.assign(new Error("fk violation"), { code: "23503" }) as NeonDbError;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDemoConfig).mockResolvedValue({
      id: "global",
      databaseOutage: true,
      highLatency: false,
      latencyMs: 6000,
      updatedAt: new Date(),
    } as never);
    // createPet is what petService actually calls; make it throw broken error
    vi.mocked(createPet).mockRejectedValue(brokenErr);
  });

  it("returns 503 when outage active and createPet throws", async () => {
    const req = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Luna", petTypeCode: "DOG", age: 3, ownerName: "Ana" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(503);
    expect(json.ok).toBe(false);
    expect(json.errorCode).toBe("SERVICE_UNAVAILABLE");
    expect(json.supportId).toBeDefined();
  });

  it("REPTILE with outage → 503 (outage precedence over 23503)", async () => {
    vi.mocked(createPet).mockRejectedValue(fkError);
    const req = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Kaa", petTypeCode: "REPTILE", ownerName: "Ana" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(503);
    expect(json.errorCode).toBe("SERVICE_UNAVAILABLE");
  });

  it("REPTILE without outage → 500 with 23503", async () => {
    vi.mocked(getDemoConfig).mockResolvedValue({
      id: "global",
      databaseOutage: false,
      highLatency: false,
      latencyMs: 6000,
      updatedAt: new Date(),
    } as never);
    vi.mocked(createPet).mockRejectedValue(fkError);
    const req = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Kaa", petTypeCode: "REPTILE", ownerName: "Ana" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.errorCode).toBe("INTERNAL_ERROR");
    expect(json.supportId).toBeDefined();
  });

  it("reset during outage → 503 then 201 after reset", async () => {
    // First: outage active → brokenDb → createPet rejects → 503
    vi.mocked(getDemoConfig).mockResolvedValueOnce({
      id: "global",
      databaseOutage: true,
      highLatency: false,
      latencyMs: 6000,
      updatedAt: new Date(),
    } as never);
    vi.mocked(createPet).mockRejectedValueOnce(brokenErr);
    const req1 = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Luna", petTypeCode: "DOG", age: 3, ownerName: "Ana" }),
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(503);

    // After reset: outage false → db → 201
    vi.mocked(getDemoConfig).mockResolvedValueOnce({
      id: "global",
      databaseOutage: false,
      highLatency: false,
      latencyMs: 6000,
      updatedAt: new Date(),
    } as never);
    vi.mocked(findPetTypeByCode).mockResolvedValue({ id: dogId, code: "DOG", title: "Perro" } as never);
    vi.mocked(createPet).mockResolvedValueOnce({
      id: "pet-1", name: "Luna", petTypeId: dogId, age:3, ownerName:"Ana",
      sessionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", createdAt: new Date(),
    } as never);
    const req2 = new Request("http://localhost/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Luna", petTypeCode: "DOG", age:3, ownerName:"Ana" }),
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(201);
  });
});
