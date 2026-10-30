"use client";

import type { SealedLiveQuery } from "@neon/realtime/client";
import { refreshPublicNote } from "@/lib/live-actions";
import { withShareToken } from "@/lib/files";
import type { LiveNoteRow } from "@/lib/realtime";
import { NoteEditor } from "./editor/editor";
import { Live } from "./realtime-gate";

/** Public read-only view; follows the note live through Neon Realtime. */
export function SharedNote({ token, initial, sealed }: { token: string; initial: LiveNoteRow; sealed: SealedLiveQuery<LiveNoteRow> | null }) {
  return (
    <Live sealed={sealed} refresh={() => refreshPublicNote(token)} initial={[initial]}>
      {(rows) => {
        // Live query returns no rows once the link is revoked or the note is trashed.
        const n = rows[0];
        if (!n) return <p className="py-20 text-center text-muted-foreground">This note is no longer shared.</p>;
        return (
          <>
            {n.icon && <div className="mb-2 text-6xl">{n.icon}</div>}
            <h1 className="mb-6 text-4xl leading-tight font-semibold tracking-tight break-words sm:text-5xl">{n.title || "Untitled"}</h1>
            <NoteEditor markdown={initial.content} remote={withShareToken(n.content, token)} editable={false} />
          </>
        );
      }}
    </Live>
  );
}
