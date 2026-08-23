import { NextResponse } from "next/server";

import { setDemoOutage } from "@/db/queries";
import { getOrCreateSessionId } from "@/services/session";
import { createRequestId, getDurationMs } from "@/utils/functions/requestContext";
import { log, logError } from "@/utils/functions/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isLabEnabled = () => process.env.DEMO_LAB_ENABLED === "true";

const isTokenValid = (token: string | null): boolean => {
  const expected = process.env.DEMO_CONTROL_TOKEN;
  if (!expected || !token) return false;
  if (token.length !== expected.length) return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { timingSafeEqual } = require("node:crypto");
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return token === expected;
  }
};

export const POST = async (request: Request) => {
  const requestId = createRequestId();
  const sessionId = await getOrCreateSessionId();
  const startedAt = performance.now();
  const route = "/api/demo/database-outage";

  if (!isLabEnabled()) {
    log({
      severity: "WARN",
      message: "Lab disabled",
      service: "pawpass",
      event: "DEMO_DATABASE_OUTAGE_FAILED",
      route,
      sessionId,
      requestId,
      httpStatus: 403,
      durationMs: getDurationMs(startedAt),
      errorType: "ValidationError",
    });
    return NextResponse.json({ ok: false, errorCode: "LAB_DISABLED", supportId: requestId }, { status: 403 });
  }

  const token = request.headers.get("x-demo-token");
  if (!isTokenValid(token)) {
    const durationMs = getDurationMs(startedAt);
    log({
      severity: "WARN",
      message: "Invalid demo token",
      service: "pawpass",
      event: "DEMO_DATABASE_OUTAGE_FAILED",
      route,
      sessionId,
      requestId,
      httpStatus: 403,
      durationMs,
      errorType: "ValidationError",
    });
    return NextResponse.json({ ok: false, errorCode: "INVALID_DEMO_TOKEN", supportId: requestId }, { status: 403 });
  }

  try {
    const row = await setDemoOutage(true);
    if (!row) {
      throw new Error("demo_config not found");
    }
    const durationMs = getDurationMs(startedAt);
    log({
      severity: "INFO",
      message: "Demo database outage activated",
      service: "pawpass",
      event: "DEMO_DATABASE_OUTAGE_ACTIVATED",
      route,
      sessionId,
      requestId,
      httpStatus: 200,
      durationMs,
      incident: "database_outage",
    });
    return NextResponse.json(
      {
        ok: true,
        demo: { databaseOutage: row.databaseOutage, highLatency: row.highLatency, latencyMs: row.latencyMs },
        requestId,
      },
      { status: 200 },
    );
  } catch (e) {
    const durationMs = getDurationMs(startedAt);
    logError({
      severity: "ERROR",
      message: "Demo database outage failed",
      service: "pawpass",
      event: "DEMO_DATABASE_OUTAGE_FAILED",
      route,
      sessionId,
      requestId,
      httpStatus: 500,
      durationMs,
      errorType: "UnexpectedError",
    });
    console.error("[POST /api/demo/database-outage] failed", e);
    return NextResponse.json({ ok: false, errorCode: "INTERNAL_ERROR", supportId: requestId }, { status: 500 });
  }
};
