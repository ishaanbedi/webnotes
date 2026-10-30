import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notes, type Note } from "@/db/schema";
import { getSessionUser } from "@/lib/auth/server";

export async function requireUserId() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

/**
 * Single choke point for note authorization: notes are private to their owner.
 * Returns null both when the note doesn't exist and when it isn't yours, so callers can't
 * leak existence. (Public links are handled separately in `lib/public.ts`.)
 */
export async function getAccess(noteId: string, userId: string): Promise<{ note: Note; role: "owner" } | null> {
  const [note] = await db().select().from(notes).where(eq(notes.id, noteId)).limit(1);
  if (!note || note.ownerId !== userId) return null;
  return { note, role: "owner" };
}
