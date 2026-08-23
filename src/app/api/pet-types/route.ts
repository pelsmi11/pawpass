import { NextResponse } from "next/server";

import { listPetTypes } from "@/db/queries";
import { getOrCreateSessionId } from "@/services/session";
import { createRequestId } from "@/utils/functions";

export const runtime = "nodejs";

export const GET = async () => {
  const requestId = createRequestId();
  await getOrCreateSessionId();
  try {
    const petTypes = await listPetTypes();
    return NextResponse.json(
      { ok: true, petTypes, requestId },
      { status: 200 },
    );
  } catch (e) {
    console.error("[GET /api/pet-types] failed", e);
    return NextResponse.json(
      {
        ok: false,
        errorCode: "PET_TYPES_LOAD_FAILED",
        supportId: requestId,
      },
      { status: 500 },
    );
  }
};
