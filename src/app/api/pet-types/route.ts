import { NextResponse } from "next/server";

import { listPetTypes } from "@/db/queries";
import { createRequestId } from "@/lib/request-context";
import { getOrCreateSessionId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
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
        message: "No pudimos cargar los tipos de mascota.",
        supportId: requestId,
      },
      { status: 500 },
    );
  }
}
