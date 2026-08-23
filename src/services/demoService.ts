import { getDemoConfig, resetDemoConfig, setDemoOutage } from "@/db/queries";
import type { db } from "@/db/client";

export type DemoStatus = {
  databaseOutage: boolean;
  highLatency: boolean;
  latencyMs: number;
  updatedAt: string;
};

export const getDemoStatus = async (database: typeof db): Promise<DemoStatus | null> => {
  const config = await getDemoConfig(database);
  if (!config) return null;
  return {
    databaseOutage: config.databaseOutage,
    highLatency: config.highLatency,
    latencyMs: config.latencyMs,
    updatedAt: config.updatedAt.toISOString(),
  };
};

const isDemoLabEnabled = (): boolean => process.env.DEMO_LAB_ENABLED === "true";

export const isTokenValidSync = (provided: string | null): boolean => {
  const expected = process.env.DEMO_CONTROL_TOKEN;
  if (!expected || !provided) return false;
  if (provided.length !== expected.length) return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { timingSafeEqual } = require("node:crypto");
    return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  } catch {
    return provided === expected;
  }
};

export const checkDemoLabEnabled = (): { ok: boolean; errorCode?: "LAB_DISABLED" } => {
  if (!isDemoLabEnabled()) {
    return { ok: false, errorCode: "LAB_DISABLED" };
  }
  return { ok: true };
};

export const checkDemoAuth = (
  token: string | null,
): { ok: boolean; errorCode?: "INVALID_DEMO_TOKEN" } => {
  if (!isTokenValidSync(token)) {
    return { ok: false, errorCode: "INVALID_DEMO_TOKEN" };
  }
  return { ok: true };
};

export const activateOutage = async (token: string | null, database: typeof db) => {
  const enabled = checkDemoLabEnabled();
  if (!enabled.ok) return { success: false as const, errorCode: enabled.errorCode! };
  const auth = checkDemoAuth(token);
  if (!auth.ok) return { success: false as const, errorCode: auth.errorCode! };
  const row = await setDemoOutage(true, database);
  if (!row) return { success: false as const, errorCode: "INTERNAL_ERROR" as const };
  return { success: true as const, demo: row };
};

export const resetLab = async (token: string | null, database: typeof db) => {
  const enabled = checkDemoLabEnabled();
  if (!enabled.ok) return { success: false as const, errorCode: enabled.errorCode! };
  const auth = checkDemoAuth(token);
  if (!auth.ok) return { success: false as const, errorCode: auth.errorCode! };
  const row = await resetDemoConfig(database);
  if (!row) return { success: false as const, errorCode: "INTERNAL_ERROR" as const };
  return { success: true as const, demo: row };
};
