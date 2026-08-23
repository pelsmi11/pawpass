import { NextResponse } from "next/server";

import { createPet, findPetTypeById, listRecentPets } from "@/db/queries";
import { getOrCreateSessionId } from "@/services/session";
import { createRequestId } from "@/utils/functions";
import { validatePetInput } from "@/validation/petValidation";

export const runtime = "nodejs";

export const GET = async () => {
  const requestId = createRequestId();
  await getOrCreateSessionId();

  try {
    const pets = await listRecentPets();
    // Ensure session_id never leaks (defense in depth)
    const sanitized = (pets as unknown as Record<string, unknown>[]).map((pet) => {
      const publicPet = { ...pet };
      delete publicPet.sessionId;
      delete publicPet.session_id;
      return publicPet;
    });
    return NextResponse.json({ ok: true, pets: sanitized, requestId }, { status: 200 });
  } catch (e) {
    console.error("[GET /api/pets] failed", e);
    return NextResponse.json(
      {
        ok: false,
        errorCode: "PETS_LOAD_FAILED",
        supportId: requestId,
      },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  const requestId = createRequestId();
  const sessionId = await getOrCreateSessionId();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_FAILED",
        fieldErrorCodes: { name: "INVALID_BODY" },
        supportId: requestId,
      },
      { status: 400 },
    );
  }

  // Strict rejection if body contains forbidden session keys (FR-018, Clarification A3)
  if (
    body !== null &&
    typeof body === "object" &&
    (("sessionId" in (body as Record<string, unknown>)) ||
      ("session_id" in (body as Record<string, unknown>)))
  ) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_FAILED",
        fieldErrorCodes: { sessionId: "SESSION_FIELD_FORBIDDEN" },
        supportId: requestId,
      },
      { status: 400 },
    );
  }

  const validation = validatePetInput(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_FAILED",
        fieldErrorCodes: validation.fieldErrorCodes,
        supportId: requestId,
      },
      { status: 400 },
    );
  }

  const petType = await findPetTypeById(validation.data.petTypeId);
  if (!petType) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_FAILED",
        fieldErrorCodes: { petTypeId: "PET_TYPE_INVALID" },
        supportId: requestId,
      },
      { status: 400 },
    );
  }

  try {
    const pet = await createPet(
      {
        name: validation.data.name,
        petTypeId: validation.data.petTypeId,
        age: validation.data.age,
        ownerName: validation.data.ownerName,
        sessionId,
      },
    );

    // Exclude sessionId from public response (FR-015, FR-029)
    const petPublic = { ...(pet as unknown as Record<string, unknown>) };
    delete petPublic.sessionId;
    delete petPublic.session_id;

    return NextResponse.json(
      {
        ok: true,
        pet: {
          ...petPublic,
          petType,
        },
        requestId,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("[POST /api/pets] failed", e);
    return NextResponse.json(
      {
        ok: false,
        errorCode: "PET_CREATE_FAILED",
        supportId: requestId,
      },
      { status: 500 },
    );
  }
};
