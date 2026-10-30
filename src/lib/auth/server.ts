import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set. Add it to .env.local (Neon Console → Settings → Better Auth) and restart the dev server`);
  return v;
}

export const auth = createNeonAuth({
  baseUrl: required("NEON_AUTH_BASE_URL"),
  cookies: { secret: required("NEON_AUTH_COOKIE_SECRET") },
});

export type SessionUser = { id: string; name: string; email: string; image?: string | null };

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const { data } = await auth.getSession();
    return (data?.user as SessionUser | undefined) ?? null;
  } catch (e) {
    console.error("getSession failed", e); // fail closed: treat as signed out
    return null;
  }
}
