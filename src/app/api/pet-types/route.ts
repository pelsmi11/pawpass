import { NextResponse } from "next/server";

import { listPetTypes } from "@/db/queries";
import { getOrCreateSessionId } from "@/services/session";
import { createRequestId, getDurationMs } from "@/utils/functions/requestContext";
import { log, logError } from "@/utils/functions/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async () => {
  const requestId = createRequestId();
  const sessionId = await getOrCreateSessionId();
  const startedAt = performance.now();
  const route = "/api/pet-types";
  try {
    const petTypes = await listPetTypes();
    const durationMs = getDurationMs(startedAt);
    log({
      severity: "INFO",
      message: "Pet types listed",
      service: "pawpass",
      event: "PET_TYPES_LISTED",
      route,
      sessionId,
      requestId,
      httpStatus: 200,
      durationMs,
    });
    return NextResponse.json({ ok: true, petTypes, requestId }, { status: 200 });
  } catch (e) {
    const durationMs = getDurationMs(startedAt);
    logError({
      severity: "ERROR",
      message: "Pet types listing failed",
      service: "pawpass",
      event: "PET_TYPES_LOAD_FAILED",
      route,
      sessionId,
      requestId,
      httpStatus: 500,
      durationMs,
      errorType: "UnexpectedError",
    });
    console.error("[GET /api/pet-types] failed", e);
    return NextResponse.json(
      { ok: false, errorCode: "PET_TYPES_LOAD_FAILED", supportId: requestId },
      { status: 500 },
    );
  }
};
