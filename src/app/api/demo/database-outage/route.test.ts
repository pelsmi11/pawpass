import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/db/queries", () => ({
  setDemoOutage: vi.fn(),
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

import { POST } from "./route";
import { setDemoOutage } from "@/db/queries";

describe("POST /api/demo/database-outage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DEMO_LAB_ENABLED = "true";
    process.env.DEMO_CONTROL_TOKEN = "test-token";
  });

  it("returns 403 LAB_DISABLED when lab disabled", async () => {
    process.env.DEMO_LAB_ENABLED = "false";
    const req = new Request("http://localhost/api/demo/database-outage", {
      method: "POST",
      headers: { "x-demo-token": "test-token" },
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(403);
    expect(json.errorCode).toBe("LAB_DISABLED");
  });

  it("returns 403 INVALID_DEMO_TOKEN when token missing", async () => {
    const req = new Request("http://localhost/api/demo/database-outage", { method: "POST" });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(403);
    expect(json.errorCode).toBe("INVALID_DEMO_TOKEN");
  });

  it("returns 403 INVALID_DEMO_TOKEN when token invalid", async () => {
    const req = new Request("http://localhost/api/demo/database-outage", {
      method: "POST",
      headers: { "x-demo-token": "bad" },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("activates outage on success", async () => {
    vi.mocked(setDemoOutage).mockResolvedValue({ databaseOutage: true, highLatency: false, latencyMs: 6000 } as never);
    const req = new Request("http://localhost/api/demo/database-outage", {
      method: "POST",
      headers: { "x-demo-token": "test-token" },
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.demo.databaseOutage).toBe(true);
  });
});
