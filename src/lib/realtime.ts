import "server-only";
import { createRealtime, rawSql } from "@neon/realtime/server";

export type SidebarRow = { id: string; title: string; icon: string | null; isFavorite: boolean };
export type LiveNoteRow = { id: string; title: string; icon: string | null; content: string; trashed: boolean };

export function realtimeEnabled() {
  return !!(process.env.NEON_REALTIME_SECRET && process.env.NEON_REALTIME_URL);
}

let instance: ReturnType<typeof createRealtime> | undefined;
function realtime() {
  return (instance ??= createRealtime({
    secret: process.env.NEON_REALTIME_SECRET!,
    db: process.env.NEON_REALTIME_DB ?? "neondb",
  }));
}

// Queries are sealed server-side with the *verified* user id, so the browser can subscribe
// but can never alter what the query returns. Sealed queries expire after ~60s and are renewed.

export const sealMine = (userId: string) =>
  realtime().seal({
    query: rawSql<SidebarRow>(
      `SELECT id, title, icon, is_favorite AS "isFavorite" FROM notes
       WHERE owner_id = $1 AND trashed_at IS NULL ORDER BY updated_at DESC LIMIT 500`,
      [userId],
    ),
  });

export const sealNote = (noteId: string) =>
  realtime().seal({
    query: rawSql<LiveNoteRow>(
      `SELECT id, title, icon, content, (trashed_at IS NOT NULL) AS trashed FROM notes WHERE id = $1`,
      [noteId],
    ),
  });

export const sealPublicNote = (token: string) =>
  realtime().seal({
    query: rawSql<LiveNoteRow>(
      `SELECT id, title, icon, content, false AS trashed FROM notes WHERE share_token = $1 AND trashed_at IS NULL AND (share_expires_at IS NULL OR share_expires_at > now())`,
      [token],
    ),
  });
