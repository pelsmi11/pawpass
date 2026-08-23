import { NextResponse } from "next/server";

import { getDemoConfig } from "@/db/queries";
import { getOrCreateSessionId } from "@/services/session";
import { createRequestId, getDurationMs } from "@/utils/functions/requestContext";
import { log, logError } from "@/utils/functions/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async () => {
  const requestId = createRequestId();
  const sessionId = await getOrCreateSessionId();
  const startedAt = performance.now();
  const route = "/api/demo/status";
  try {
    const config = await getDemoConfig();
    if (!config) {
      const durationMs = getDurationMs(startedAt);
      logError({
        severity: "ERROR",
        message: "Demo config not found",
        service: "pawpass",
        event: "DEMO_STATUS_FAILED",
        route,
        sessionId,
        requestId,
        httpStatus: 500,
        durationMs,
        errorType: "UnexpectedError",
      });
      return NextResponse.json({ ok: false, errorCode: "INTERNAL_ERROR", supportId: requestId }, { status: 500 });
    }
    const durationMs = getDurationMs(startedAt);
    log({
      severity: "INFO",
      message: "Demo status fetched",
      service: "pawpass",
      event: "DEMO_STATUS_FETCHED",
      route,
      sessionId,
      requestId,
      httpStatus: 200,
      durationMs,
    });
    return NextResponse.json(
      {
        ok: true,
        demo: {
          databaseOutage: config.databaseOutage,
          highLatency: config.highLatency,
          latencyMs: config.latencyMs,
          updatedAt: config.updatedAt.toISOString(),
        },
        requestId,
      },
      { status: 200 },
    );
  } catch (e) {
    const durationMs = getDurationMs(startedAt);
    logError({
      severity: "ERROR",
      message: "Demo status failed",
      service: "pawpass",
      event: "DEMO_STATUS_FAILED",
      route,
      sessionId,
      requestId,
      httpStatus: 500,
      durationMs,
      errorType: "UnexpectedError",
    });
    console.error("[GET /api/demo/status] failed", e);
    return NextResponse.json({ ok: false, errorCode: "INTERNAL_ERROR", supportId: requestId }, { status: 500 });
  }
};
