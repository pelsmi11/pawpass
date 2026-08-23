import { cookies } from "next/headers";

const SESSION_COOKIE = "pawpass_session";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Reads pawpass_session cookie or creates a new technical session.
 * - Uses HttpOnly, SameSite=Lax, Secure in production, Max-Age 86400, Path /
 * - Validates existing value is a UUID; otherwise regenerates
 * - Never uses headers for session (FR-013, user input constraint)
 */
export async function getOrCreateSessionId(): Promise<string> {
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
    maxAge: 60 * 60 * 24,
  });

  return sessionId;
}
