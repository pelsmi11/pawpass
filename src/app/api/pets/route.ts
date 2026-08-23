import { NextResponse } from "next/server";

import { getDemoConfig, listRecentPets } from "@/db/queries";
import { db, getBrokenDb } from "@/db/client";
import { getOrCreateSessionId } from "@/services/session";
import { createPetWithValidation } from "@/services/petService";
import { classifyError } from "@/utils/functions/apiErrors";
import { createRequestId, getDurationMs } from "@/utils/functions/requestContext";
import { log, logError } from "@/utils/functions/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async () => {
  const requestId = createRequestId();
  const sessionId = await getOrCreateSessionId();
  const startedAt = performance.now();
  const route = "/api/pets";
  try {
    // Outage also affects reads when requested (change per user request)
    let database: typeof db = db;
    try {
      const config = await getDemoConfig(db);
      if (config?.databaseOutage) {
        database = getBrokenDb() as unknown as typeof db;
      }
    } catch {
      // if demo_config read fails, fall back to normal db and let listRecentPets handle error
    }
    const pets = await listRecentPets(database);
    const sanitized = (pets as unknown as Record<string, unknown>[]).map((pet) => {
      const publicPet = { ...pet };
      delete publicPet.sessionId;
      delete publicPet.session_id;
      return publicPet;
    });
    const durationMs = getDurationMs(startedAt);
    log({
      severity: "INFO",
      message: "Pets listed",
      service: "pawpass",
      event: "PET_REGISTRATION_SUCCEEDED",
      route,
      sessionId,
      requestId,
      httpStatus: 200,
      durationMs,
    });
    return NextResponse.json({ ok: true, pets: sanitized, requestId }, { status: 200 });
  } catch (e) {
    const durationMs = getDurationMs(startedAt);
    // If outage was active, classify as DatabaseUnavailableError → 503
    let errorType: "DatabaseUnavailableError" | "UnexpectedError" = "UnexpectedError";
    let httpStatus = 500;
    let errorCode: "PETS_LOAD_FAILED" | "SERVICE_UNAVAILABLE" = "PETS_LOAD_FAILED";
    try {
      const cfg = await getDemoConfig(db).catch(() => null);
      if (cfg?.databaseOutage) {
        errorType = "DatabaseUnavailableError";
        httpStatus = 503;
        errorCode = "SERVICE_UNAVAILABLE";
      }
    } catch {}
    // Fallback: also check if error looks like outage (brokenDb)
    const classified = classifyError(e, errorType === "DatabaseUnavailableError");
    if (classified.errorType === "DatabaseUnavailableError") {
      errorType = "DatabaseUnavailableError";
      httpStatus = 503;
      errorCode = "SERVICE_UNAVAILABLE";
    }
    logError({
      severity: "ERROR",
      message: "Pets listing failed",
      service: "pawpass",
      event: "PET_REGISTRATION_FAILED",
      route,
      sessionId,
      requestId,
      httpStatus,
      durationMs,
      errorType,
    });
    console.error("[GET /api/pets] failed", e);
    return NextResponse.json({ ok: false, errorCode, supportId: requestId }, { status: httpStatus });
  }
};

export const POST = async (request: Request) => {
  const requestId = createRequestId();
  const sessionId = await getOrCreateSessionId();
  const startedAt = performance.now();
  const route = "/api/pets";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const durationMs = getDurationMs(startedAt);
    logError({
      severity: "ERROR",
      message: "Pet registration failed",
      service: "pawpass",
      event: "PET_REGISTRATION_FAILED",
      route,
      sessionId,
      requestId,
      httpStatus: 400,
      durationMs,
      errorType: "ValidationError",
    });
    return NextResponse.json(
      { ok: false, errorCode: "VALIDATION_FAILED", fieldErrorCodes: { name: "INVALID_BODY" }, supportId: requestId },
      { status: 400 },
    );
  }

  const petTypeCodeFromBody =
    body !== null && typeof body === "object" && "petTypeCode" in (body as Record<string, unknown>)
      ? String((body as Record<string, unknown>).petTypeCode)
      : undefined;

  log({
    severity: "INFO",
    message: "Pet registration started",
    service: "pawpass",
    event: "PET_REGISTRATION_STARTED",
    route,
    sessionId,
    requestId,
    petTypeCode: petTypeCodeFromBody,
  });

  // Validate input (including forbidden keys)
  const { validatePetInput } = await import("@/validation/petValidation");
  const validation = validatePetInput(body);
  if (!validation.success) {
    const durationMs = getDurationMs(startedAt);
    const petTypeCode = (body as Record<string, unknown>)?.petTypeCode as string | undefined;
    logError({
      severity: "ERROR",
      message: "Pet registration failed",
      service: "pawpass",
      event: "PET_REGISTRATION_FAILED",
      route,
      sessionId,
      requestId,
      httpStatus: 400,
      durationMs,
      petTypeCode,
      errorType: "ValidationError",
    });
    return NextResponse.json(
      { ok: false, errorCode: "VALIDATION_FAILED", fieldErrorCodes: validation.fieldErrorCodes, supportId: requestId },
      { status: 400 },
    );
  }

  // Read demo_config with normal db
  let demoConfig: Awaited<ReturnType<typeof getDemoConfig>> | null = null;
  try {
    demoConfig = await getDemoConfig(db);
  } catch (e) {
    const durationMs = getDurationMs(startedAt);
    logError({
      severity: "ERROR",
      message: "Pet registration failed",
      service: "pawpass",
      event: "PET_REGISTRATION_FAILED",
      route,
      sessionId,
      requestId,
      httpStatus: 500,
      durationMs,
      petTypeCode: validation.data.petTypeCode,
      errorType: "UnexpectedError",
    });
    console.error("[POST /api/pets] getDemoConfig failed", e);
    return NextResponse.json({ ok: false, errorCode: "INTERNAL_ERROR", supportId: requestId }, { status: 500 });
  }

  if (!demoConfig) {
    const durationMs = getDurationMs(startedAt);
    logError({
      severity: "ERROR",
      message: "Pet registration failed",
      service: "pawpass",
      event: "PET_REGISTRATION_FAILED",
      route,
      sessionId,
      requestId,
      httpStatus: 500,
      durationMs,
      petTypeCode: validation.data.petTypeCode,
      errorType: "UnexpectedError",
    });
    return NextResponse.json({ ok: false, errorCode: "INTERNAL_ERROR", supportId: requestId }, { status: 500 });
  }

  const isOutage = demoConfig.databaseOutage;
  let database: typeof db = db;
  try {
    database = isOutage ? getBrokenDb() : db;
  } catch (e) {
    // BROKEN_DATABASE_URL missing or construction failed — classify as outage
    const durationMs = getDurationMs(startedAt);
    logError({
      severity: "ERROR",
      message: "Pet registration failed",
      service: "pawpass",
      event: "PET_REGISTRATION_FAILED",
      route,
      sessionId,
      requestId,
      httpStatus: 503,
      durationMs,
      petTypeCode: validation.data.petTypeCode,
      errorType: "DatabaseUnavailableError",
      incident: "database_outage",
    });
    return NextResponse.json({ ok: false, errorCode: "SERVICE_UNAVAILABLE", supportId: requestId }, { status: 503 });
  }

  try {
    const result = await createPetWithValidation(body, sessionId, database);
    if (!result.success) {
      const durationMs = getDurationMs(startedAt);
      logError({
        severity: "ERROR",
        message: "Pet registration failed",
        service: "pawpass",
        event: "PET_REGISTRATION_FAILED",
        route,
        sessionId,
        requestId,
        httpStatus: 400,
        durationMs,
        petTypeCode: validation.data.petTypeCode,
        errorType: "ValidationError",
      });
      return NextResponse.json(
        { ok: false, errorCode: "VALIDATION_FAILED", fieldErrorCodes: result.fieldErrorCodes, supportId: requestId },
        { status: 400 },
      );
    }

    const petPublic = { ...(result.pet as unknown as Record<string, unknown>) };
    delete petPublic.sessionId;
    delete petPublic.session_id;

    const durationMs = getDurationMs(startedAt);
    log({
      severity: "INFO",
      message: "Pet registration succeeded",
      service: "pawpass",
      event: "PET_REGISTRATION_SUCCEEDED",
      route,
      sessionId,
      requestId,
      httpStatus: 201,
      durationMs,
      petTypeCode: validation.data.petTypeCode,
    });

    // Fetch petType for response (for DOG/CAT, petTypeId is real; for REPTILE this branch not reached because REPTILE throws)
    const { findPetTypeByCode } = await import("@/db/queries");
    const petType = await findPetTypeByCode(validation.data.petTypeCode, db).catch(() => null);

    return NextResponse.json({ ok: true, pet: { ...petPublic, petType }, requestId }, { status: 201 });
  } catch (e) {
    const { errorType, databaseCode } = classifyError(e, isOutage);
    const httpStatus = errorType === "DatabaseUnavailableError" ? 503 : errorType === "ForeignKeyViolation" ? 500 : 500;
    const durationMs = getDurationMs(startedAt);
    const errorCode = errorType === "DatabaseUnavailableError" ? "SERVICE_UNAVAILABLE" : errorType === "ForeignKeyViolation" ? "INTERNAL_ERROR" : "INTERNAL_ERROR";
    logError({
      severity: "ERROR",
      message: "Pet registration failed",
      service: "pawpass",
      event: "PET_REGISTRATION_FAILED",
      route,
      sessionId,
      requestId,
      httpStatus,
      durationMs,
      petTypeCode: validation.data.petTypeCode,
      errorType,
      databaseCode,
      incident: isOutage ? "database_outage" : undefined,
    });
    console.error("[POST /api/pets] failed", e);
    return NextResponse.json({ ok: false, errorCode, supportId: requestId }, { status: httpStatus });
  }
};
