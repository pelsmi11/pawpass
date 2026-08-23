import { NextResponse } from "next/server";

import { getOrCreateSessionId } from "@/services/session";

export const runtime = "nodejs";

export const GET = async () => {
  await getOrCreateSessionId();
  return NextResponse.json({ ok: true }, { status: 200 });
};
