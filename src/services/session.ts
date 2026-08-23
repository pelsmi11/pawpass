import { cookies } from "next/headers";

import { SESSION_COOKIE, SESSION_MAX_AGE, UUID_RE } from "@/utils/constant";

/**
 * Reads pawpass_session cookie or creates a new technical session.
 * - Uses HttpOnly, SameSite=Lax, Secure in production, Max-Age 86400, Path /
 * - Validates existing value is a UUID; otherwise regenerates
 * - Never uses headers for session (FR-013, user input constraint)
 */
export const getOrCreateSessionId = async (): Promise<string> => {
  const cookieStore = await cookies();
  const current = cookieStore.get(SESSION_COOKIE)?.value;

  if (current && UUID_RE.test(current)) {
    return current;
  }

  const sessionId = crypto.randomUUID();

  cookieStore.set({
    name: SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return sessionId;
};
