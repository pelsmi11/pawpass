import { NextResponse } from "next/server";

import { getOrCreateSessionId } from "@/services/session";
import { createRequestId, getDurationMs } from "@/utils/functions/requestContext";
import { log } from "@/utils/functions/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async () => {
  const requestId = createRequestId();
  const startedAt = performance.now();
  const route = "/api/session";
  await getOrCreateSessionId();
  const durationMs = getDurationMs(startedAt);
  log({
    severity: "INFO",
    message: "Session ensured",
    service: "pawpass",
    event: "SESSION_ENSURED",
    route,
    requestId,
    httpStatus: 200,
    durationMs,
  });
  return NextResponse.json({ ok: true }, { status: 200 });
};
