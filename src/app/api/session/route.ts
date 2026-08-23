import { NextResponse } from "next/server";

import { getOrCreateSessionId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  await getOrCreateSessionId();
  return NextResponse.json({ ok: true }, { status: 200 });
}
