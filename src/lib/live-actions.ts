"use server";

import { z } from "zod";
import { getAccess, requireUserId } from "@/lib/access";
import { rateLimit } from "@/lib/rate-limit";
import { realtimeEnabled, sealMine, sealNote, sealPublicNote } from "@/lib/realtime";
import { getPublicNote, isUnlocked } from "@/lib/public";

// Thin wrappers used by the browser to renew short-lived sealed queries.
// Every one re-verifies identity/authorization before sealing.

export async function refreshMine() {
  return sealMine(await requireUserId());
}

export async function refreshNote(noteId: string) {
  const userId = await requireUserId();
  const a = await getAccess(z.string().uuid().parse(noteId), userId);
  if (!a) throw new Error("Not found");
  return sealNote(a.note.id);
}

export async function refreshPublicNote(token: string) {
  if (!rateLimit(`pub:${token.slice(0, 12)}`, 30)) throw new Error("Slow down");
  const n = await getPublicNote(token);
  // Password-protected links only stream to browsers that unlocked them.
  if (!n || !(await isUnlocked(token, n.sharePasswordHash))) throw new Error("Not found");
  return sealPublicNote(token);
}

export async function liveAvailable() {
  return realtimeEnabled();
}
