import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/db/queries", () => ({
  resetDemoConfig: vi.fn(),
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
import { resetDemoConfig } from "@/db/queries";

describe("POST /api/demo/reset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DEMO_LAB_ENABLED = "true";
    process.env.DEMO_CONTROL_TOKEN = "test-token";
  });

  it("returns 403 LAB_DISABLED when disabled", async () => {
    process.env.DEMO_LAB_ENABLED = "false";
    const req = new Request("http://localhost/api/demo/reset", { method: "POST", headers: { "x-demo-token": "test-token" } });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("resets on valid token", async () => {
    vi.mocked(resetDemoConfig).mockResolvedValue({ databaseOutage: false, highLatency: false, latencyMs: 6000 } as never);
    const req = new Request("http://localhost/api/demo/reset", { method: "POST", headers: { "x-demo-token": "test-token" } });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.demo.databaseOutage).toBe(false);
  });
});
