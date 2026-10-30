"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { notes, userProfiles } from "@/db/schema";
import { getSessionUser, auth } from "@/lib/auth/server";
import { rateLimit } from "@/lib/rate-limit";
import { deleteNoteFiles } from "@/lib/storage";

type Result = { ok: false; error: string };

/**
 * Permanently deletes the signed-in user: every note and uploaded image, the profile row and
 * the Neon Auth login itself. Accounts are passwordless, so the guard is a recent sign-in plus
 * typing the account email. Redirects home on success.
 */
export async function deleteAccount(confirmEmail: string): Promise<Result> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You're not signed in." };
  if (!rateLimit(`delete-account:${user.id}`, 5, 10 * 60_000)) return { ok: false, error: "Too many attempts. Try again in a few minutes." };
  const typed = z.string().trim().toLowerCase().max(254).safeParse(confirmEmail);
  if (!typed.success || typed.data !== user.email.toLowerCase()) return { ok: false, error: "Type your account email exactly to confirm." };

  // 1. Require a recent sign-in, so a stale or stolen session cookie can't wipe an account.
  const { data } = await auth.getSession();
  const created = new Date((data?.session as { createdAt?: string | Date } | undefined)?.createdAt ?? 0).getTime();
  if (!created || Date.now() - created > 24 * 60 * 60 * 1000)
    return { ok: false, error: "For your safety, sign out and sign in again with an email link, then try again." };

  // 2. Notes and images. Data goes first, so a failure later never leaves orphaned content.
  const mine = await db().select({ id: notes.id }).from(notes).where(eq(notes.ownerId, user.id));
  for (let i = 0; i < mine.length; i += 10) await Promise.all(mine.slice(i, i + 10).map((n) => deleteNoteFiles(n.id)));
  await db().delete(notes).where(eq(notes.ownerId, user.id));
  await db().delete(userProfiles).where(eq(userProfiles.userId, user.id));

  // 3. The login. Prefer Neon Auth's own endpoint; if account deletion isn't enabled for this
  //    project, remove the user's rows from the neon_auth schema in our own database.
  let removed = false;
  try {
    const res = await auth.deleteUser({});
    removed = !res.error;
  } catch {}
  if (!removed) {
    const uid = user.id;
    for (const stmt of [
      sql`DELETE FROM neon_auth.session WHERE "userId"::text = ${uid}`,
      sql`DELETE FROM neon_auth.account WHERE "userId"::text = ${uid}`,
      sql`DELETE FROM neon_auth.member WHERE "userId"::text = ${uid}`,
      sql`DELETE FROM neon_auth.invitation WHERE "inviterId"::text = ${uid}`,
      sql`DELETE FROM neon_auth.verification WHERE identifier = ${user.email}`,
    ]) {
      try { await db().execute(stmt); } catch {} // tables/columns can differ; the user row below is what matters
    }
    try {
      await db().execute(sql`DELETE FROM neon_auth."user" WHERE id::text = ${uid}`);
    } catch (e) {
      console.error("deleteAccount: could not remove login", e);
      return { ok: false, error: "Your notes were deleted, but we couldn't remove your login. Please try again." };
    }
  }

  try { await auth.signOut(); } catch {}
  redirect("/home?deleted=1");
}
