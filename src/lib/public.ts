import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { notes } from "@/db/schema";

export const TOKEN_RE = /^[A-Za-z0-9_-]{20,64}$/;

/** The note behind a public link, or null if the link is unknown, expired or the note is trashed. */
export async function getPublicNote(token: string) {
  if (!TOKEN_RE.test(token)) return null;
  const [n] = await db()
    .select()
    .from(notes)
    .where(and(eq(notes.shareToken, token), isNull(notes.trashedAt)))
    .limit(1);
  if (!n) return null;
  if (n.shareExpiresAt && n.shareExpiresAt.getTime() <= Date.now()) return null;
  return n;
}

// ---- passwords (scrypt) ----

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(password, salt, 32).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// ---- unlock cookie: HMAC(token + current password hash), so changing the password,
// regenerating the link or removing protection invalidates every existing unlock ----

const secret = () => {
  const s = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!s) throw new Error("NEON_AUTH_COOKIE_SECRET is not set");
  return s;
};

export const unlockCookieName = (token: string) => `wn_u_${createHmac("sha256", secret()).update(`n:${token}`).digest("hex").slice(0, 16)}`;
export const unlockCookieValue = (token: string, passwordHash: string) =>
  createHmac("sha256", secret()).update(`${token}:${passwordHash}`).digest("hex");

export async function isUnlocked(token: string, passwordHash: string | null) {
  if (!passwordHash) return true;
  const got = (await cookies()).get(unlockCookieName(token))?.value;
  if (!got) return false;
  const want = unlockCookieValue(token, passwordHash);
  return got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want));
}
