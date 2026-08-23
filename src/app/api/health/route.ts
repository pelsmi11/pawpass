import { NextResponse } from "next/server";

import { createRequestId, getDurationMs } from "@/utils/functions/requestContext";
import { log } from "@/utils/functions/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async () => {
  const requestId = createRequestId();
  const startedAt = performance.now();
  const route = "/api/health";
  const durationMs = getDurationMs(startedAt);
  log({
    severity: "INFO",
    message: "Health check succeeded",
    service: "pawpass",
    event: "HEALTH_CHECK",
    route,
    requestId,
    httpStatus: 200,
    durationMs,
  });
  return NextResponse.json({ status: "ok", service: "pawpass", requestId }, { status: 200 });
};
