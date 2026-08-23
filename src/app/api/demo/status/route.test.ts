import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/db/queries", () => ({
  getDemoConfig: vi.fn(),
}));

vi.mock("@/services/session", () => ({
  getOrCreateSessionId: vi.fn().mockResolvedValue("sess-1"),
}));

vi.mock("@/utils/functions/requestContext", () => ({
  createRequestId: vi.fn().mockReturnValue("req-1"),
  getDurationMs: vi.fn().mockReturnValue(5),
}));

vi.mock("@/utils/functions/logger", () => ({
  log: vi.fn(),
  logError: vi.fn(),
}));

import { GET } from "./route";
import { getDemoConfig } from "@/db/queries";

describe("GET /api/demo/status", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with demo flags", async () => {
    vi.mocked(getDemoConfig).mockResolvedValue({
      id: "global",
      databaseOutage: false,
      highLatency: false,
      latencyMs: 6000,
      updatedAt: new Date("2026-08-23T00:00:00.000Z"),
    } as never);
    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.demo.databaseOutage).toBe(false);
    expect(json.demo.latencyMs).toBe(6000);
    expect(json.requestId).toBe("req-1");
  });

  it("returns 500 if demo_config missing", async () => {
    vi.mocked(getDemoConfig).mockResolvedValue(null as never);
    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.ok).toBe(false);
    expect(json.supportId).toBeDefined();
  });
});
