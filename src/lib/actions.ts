"use server";

import { randomBytes } from "node:crypto";
import { and, eq, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { notes, userProfiles } from "@/db/schema";
import { getAccess, requireUserId } from "@/lib/access";
import { rateLimit } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/public";
import { WELCOME_ICON, WELCOME_TITLE, welcomeContent } from "@/lib/welcome";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/files";
import { deleteNoteFiles, noteKey, presignUpload, storageEnabled } from "@/lib/storage";
import { randomUUID } from "node:crypto";

const id = z.string().uuid();
const MAX_CONTENT = 1_000_000;

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function owned(noteId: string, userId: string) {
  const a = await getAccess(id.parse(noteId), userId);
  if (!a || a.role !== "owner") throw new Error("Not found");
  return a.note;
}

export async function createNote(): Promise<never> {
  const userId = await requireUserId();
  const [note] = await db().insert(notes).values({ ownerId: userId }).returning({ id: notes.id });
  revalidatePath("/notes", "layout");
  redirect(`/notes/${note.id}`);
}

const updateSchema = z.object({
  title: z.string().max(200).optional(),
  icon: z.string().max(16).nullable().optional(),
  content: z.string().max(MAX_CONTENT).optional(),
});

export async function updateNote(noteId: string, input: z.input<typeof updateSchema>): Promise<Result> {
  const userId = await requireUserId();
  const data = updateSchema.safeParse(input);
  if (!data.success) return { ok: false, error: "Invalid input" };
  const a = await getAccess(id.parse(noteId), userId);
  if (!a) return { ok: false, error: "You don't have permission to edit this note" };
  await db()
    .update(notes)
    .set({ ...data.data, updatedAt: new Date() })
    .where(eq(notes.id, a.note.id));
  if (data.data.title !== undefined || data.data.icon !== undefined) revalidatePath("/notes", "layout");
  return { ok: true };
}

/** Sets (not toggles) the flag, so a double click or a retry can't flip it back. */
export async function setFavorite(noteId: string, isFavorite: boolean) {
  const userId = await requireUserId();
  const note = await owned(noteId, userId);
  await db().update(notes).set({ isFavorite }).where(eq(notes.id, note.id));
  revalidatePath("/notes", "layout");
}

export async function trashNote(noteId: string) {
  const userId = await requireUserId();
  const note = await owned(noteId, userId);
  // Trashing also revokes the public link and its settings.
  await db()
    .update(notes)
    .set({ trashedAt: new Date(), shareToken: null, shareExpiresAt: null, sharePasswordHash: null })
    .where(eq(notes.id, note.id));
  revalidatePath("/notes", "layout");
  redirect("/notes");
}

export async function restoreNote(noteId: string) {
  const userId = await requireUserId();
  const note = await owned(noteId, userId);
  await db().update(notes).set({ trashedAt: null }).where(eq(notes.id, note.id));
  revalidatePath("/notes", "layout");
  redirect(`/notes/${note.id}`);
}

export async function deleteNoteForever(noteId: string) {
  const userId = await requireUserId();
  const note = await owned(noteId, userId);
  if (!note.trashedAt) throw new Error("Move the note to trash first");
  await db().delete(notes).where(eq(notes.id, note.id));
  await deleteNoteFiles(note.id);
  revalidatePath("/notes", "layout");
  redirect("/notes");
}

export async function emptyTrash() {
  const userId = await requireUserId();
  const gone = await db()
    .delete(notes)
    .where(and(eq(notes.ownerId, userId), isNotNull(notes.trashedAt)))
    .returning({ id: notes.id });
  await Promise.all(gone.map((n) => deleteNoteFiles(n.id)));
  revalidatePath("/notes", "layout");
}

// ---------- images (Neon Object Storage) ----------

export async function createImageUpload(
  noteId: string,
  file: { type: string; size: number },
): Promise<Result<{ uploadUrl: string; src: string }>> {
  const userId = await requireUserId();
  if (!storageEnabled()) return { ok: false, error: "Image uploads aren't configured" };
  if (!rateLimit(`upload:${userId}`, 30)) return { ok: false, error: "Too many uploads, slow down" };
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return { ok: false, error: "Only PNG, JPEG, WebP or GIF images are allowed" };
  if (!Number.isInteger(file.size) || file.size <= 0 || file.size > MAX_IMAGE_BYTES)
    return { ok: false, error: "Images must be under 8 MB" };
  const a = await getAccess(id.parse(noteId), userId);
  if (!a || a.note.trashedAt) return { ok: false, error: "You can't edit this note" };

  const name = `${randomUUID()}.${ext}`;
  const uploadUrl = await presignUpload(noteKey(a.note.id, name), file.type, file.size);
  return { ok: true, uploadUrl, src: `/api/files/${a.note.id}/${name}` };
}

// ---------- sharing ----------

export async function setPublicLink(noteId: string, enabled: boolean): Promise<Result<{ token: string | null }>> {
  const userId = await requireUserId();
  if (!rateLimit(`share:${userId}`)) return { ok: false, error: "Too many requests, slow down" };
  const note = await owned(noteId, userId);
  if (enabled && note.trashedAt) return { ok: false, error: "Restore the note before sharing it" };
  const token = enabled ? (note.shareToken ?? randomBytes(24).toString("base64url")) : null;
  // Turning the link off also clears its expiry and password, so a later re-share starts clean.
  await db()
    .update(notes)
    .set(enabled ? { shareToken: token } : { shareToken: null, shareExpiresAt: null, sharePasswordHash: null })
    .where(eq(notes.id, note.id));
  revalidatePath(`/notes/${note.id}`);
  return { ok: true, token };
}

export async function regeneratePublicLink(noteId: string): Promise<Result<{ token: string }>> {
  const userId = await requireUserId();
  if (!rateLimit(`share:${userId}`)) return { ok: false, error: "Too many requests, slow down" };
  const note = await owned(noteId, userId);
  if (!note.shareToken) return { ok: false, error: "Turn on the public link first" };
  const token = randomBytes(24).toString("base64url");
  await db().update(notes).set({ shareToken: token }).where(eq(notes.id, note.id));
  revalidatePath(`/notes/${note.id}`);
  return { ok: true, token };
}

const EXPIRY_MS = { "1h": 3_600_000, "1d": 86_400_000, "7d": 7 * 86_400_000, "30d": 30 * 86_400_000 } as const;

const shareSettings = z.object({
  /** Omit to leave unchanged. "never" clears the expiry. */
  expires: z.enum(["never", "1h", "1d", "7d", "30d"]).optional(),
  /** Omit to leave unchanged. null removes the password. */
  password: z.string().min(4, "Use at least 4 characters").max(128).nullable().optional(),
});

export async function updateShareSettings(
  noteId: string,
  input: z.input<typeof shareSettings>,
): Promise<Result<{ expiresAt: string | null; hasPassword: boolean }>> {
  const userId = await requireUserId();
  if (!rateLimit(`share:${userId}`)) return { ok: false, error: "Too many requests, slow down" };
  const parsed = shareSettings.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const note = await owned(noteId, userId);
  if (!note.shareToken) return { ok: false, error: "Turn on the public link first" };

  const set: Partial<typeof notes.$inferInsert> = {};
  if (parsed.data.expires !== undefined)
    set.shareExpiresAt = parsed.data.expires === "never" ? null : new Date(Date.now() + EXPIRY_MS[parsed.data.expires]);
  if (parsed.data.password !== undefined)
    set.sharePasswordHash = parsed.data.password === null ? null : hashPassword(parsed.data.password);

  const [row] = await db().update(notes).set(set).where(eq(notes.id, note.id)).returning({
    expiresAt: notes.shareExpiresAt,
    hash: notes.sharePasswordHash,
  });
  revalidatePath(`/notes/${note.id}`);
  return { ok: true, expiresAt: row.expiresAt?.toISOString() ?? null, hasPassword: !!row.hash };
}

// ---------- import from guest mode ----------

const importSchema = z
  .array(
    z.object({
      title: z.string().max(200),
      icon: z.string().max(16).nullable(),
      content: z.string().max(200_000),
      isFavorite: z.boolean(),
    }),
  )
  .min(1)
  .max(100);

/** Copies notes written before sign-up (kept in the browser) into the new account. */
export async function importNotes(input: z.input<typeof importSchema>): Promise<Result<{ count: number }>> {
  const userId = await requireUserId();
  if (!rateLimit(`import:${userId}`, 5)) return { ok: false, error: "Too many requests, try again in a minute" };
  const parsed = importSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Those notes couldn't be imported" };
  await db().insert(notes).values(parsed.data.map((n) => ({ ...n, ownerId: userId })));
  revalidatePath("/notes", "layout");
  return { ok: true, count: parsed.data.length };
}

/** Opens the user's Welcome note (restoring or recreating it if they removed it). */
export async function openWelcomeNote(): Promise<never> {
  const userId = await requireUserId();
  const [existing] = await db()
    .select({ id: notes.id, trashedAt: notes.trashedAt })
    .from(notes)
    .where(and(eq(notes.ownerId, userId), eq(notes.title, WELCOME_TITLE)))
    .orderBy(notes.createdAt)
    .limit(1);
  let noteId = existing?.id;
  if (existing?.trashedAt) await db().update(notes).set({ trashedAt: null }).where(eq(notes.id, existing.id));
  if (!noteId) {
    const [row] = await db()
      .insert(notes)
      .values({ ownerId: userId, title: WELCOME_TITLE, icon: WELCOME_ICON, content: welcomeContent(true) })
      .returning({ id: notes.id });
    noteId = row.id;
  }
  revalidatePath("/notes", "layout");
  redirect(`/notes/${noteId}`);
}

// ---------- onboarding ----------

/** Marks the welcome tour as done for the current user (also used when they skip it). */
export async function completeOnboarding() {
  const userId = await requireUserId();
  const now = new Date();
  await db()
    .insert(userProfiles)
    .values({ userId, onboarded: true, onboardedAt: now })
    .onConflictDoUpdate({ target: userProfiles.userId, set: { onboarded: true, onboardedAt: now } });
}
