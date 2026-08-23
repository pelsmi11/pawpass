import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/db/queries", () => ({
  getDemoConfig: vi.fn(),
  setDemoOutage: vi.fn(),
  resetDemoConfig: vi.fn(),
}));

import { getDemoConfig, resetDemoConfig, setDemoOutage } from "@/db/queries";
import { activateOutage, checkDemoAuth, checkDemoLabEnabled, getDemoStatus, resetLab } from "./demoService";

describe("demoService", () => {
  const mockDb = {} as never;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DEMO_LAB_ENABLED = "true";
    process.env.DEMO_CONTROL_TOKEN = "test-token";
  });

  it("checkDemoLabEnabled detects LAB_DISABLED", () => {
    process.env.DEMO_LAB_ENABLED = "false";
    expect(checkDemoLabEnabled().ok).toBe(false);
    expect(checkDemoLabEnabled().errorCode).toBe("LAB_DISABLED");
    process.env.DEMO_LAB_ENABLED = "true";
    expect(checkDemoLabEnabled().ok).toBe(true);
  });

  it("checkDemoAuth validates token timingSafe", () => {
    expect(checkDemoAuth("test-token").ok).toBe(true);
    expect(checkDemoAuth("wrong").ok).toBe(false);
    expect(checkDemoAuth(null).ok).toBe(false);
    expect(checkDemoAuth("").ok).toBe(false);
  });

  it("getDemoStatus returns mapped status", async () => {
    vi.mocked(getDemoConfig).mockResolvedValue({
      id: "global",
      databaseOutage: false,
      highLatency: false,
      latencyMs: 6000,
      updatedAt: new Date("2026-08-23T00:00:00.000Z"),
    } as never);
    const status = await getDemoStatus(mockDb);
    expect(status?.databaseOutage).toBe(false);
    expect(status?.latencyMs).toBe(6000);
  });

  it("getDemoStatus returns null if no row", async () => {
    vi.mocked(getDemoConfig).mockResolvedValue(null as never);
    const status = await getDemoStatus(mockDb);
    expect(status).toBeNull();
  });

  it("activateOutage requires LAB_ENABLED", async () => {
    process.env.DEMO_LAB_ENABLED = "false";
    const res = await activateOutage("test-token", mockDb);
    expect(res.success).toBe(false);
    if (!res.success) expect(res.errorCode).toBe("LAB_DISABLED");
    expect(setDemoOutage).not.toHaveBeenCalled();
  });

  it("activateOutage requires valid token", async () => {
    const res = await activateOutage("bad", mockDb);
    expect(res.success).toBe(false);
    if (!res.success) expect(res.errorCode).toBe("INVALID_DEMO_TOKEN");
  });

  it("activateOutage success", async () => {
    vi.mocked(setDemoOutage).mockResolvedValue({ databaseOutage: true } as never);
    const res = await activateOutage("test-token", mockDb);
    expect(res.success).toBe(true);
    expect(setDemoOutage).toHaveBeenCalledWith(true, mockDb);
  });

  it("resetLab success", async () => {
    vi.mocked(resetDemoConfig).mockResolvedValue({ databaseOutage: false } as never);
    const res = await resetLab("test-token", mockDb);
    expect(res.success).toBe(true);
  });

  it("resetLab fails with LAB_DISABLED", async () => {
    process.env.DEMO_LAB_ENABLED = "false";
    const res = await resetLab("test-token", mockDb);
    expect(res.success).toBe(false);
  });
});
