import { and, desc, eq, isNotNull } from "drizzle-orm";
import { FileText, RotateCcw, Trash2 } from "lucide-react";
import { ConfirmAction } from "@/components/confirm-action";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { requireUserId } from "@/lib/access";
import { deleteNoteForever, emptyTrash, restoreNote } from "@/lib/actions";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Trash" };

export default async function TrashPage() {
  const userId = await requireUserId();
  const rows = await db()
    .select({ id: notes.id, title: notes.title, icon: notes.icon, trashedAt: notes.trashedAt })
    .from(notes)
    .where(and(eq(notes.ownerId, userId), isNotNull(notes.trashedAt)))
    .orderBy(desc(notes.trashedAt));

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trash</h1>
          <p className="text-sm text-muted-foreground">Restore notes or delete them permanently.</p>
        </div>
        {rows.length > 0 && (
          <ConfirmAction
            className="rounded-md border px-3 py-1.5 text-sm text-destructive transition hover:bg-destructive/10"
            title="Empty trash?"
            description={`${rows.length} ${rows.length === 1 ? "note" : "notes"} and their images will be deleted permanently. This can't be undone.`}
            confirmLabel="Empty trash"
            action={emptyTrash}
          >
            Empty trash
          </ConfirmAction>
        )}
      </div>
      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">Trash is empty.</div>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {rows.map((n) => (
            <li key={n.id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-6 text-center">{n.icon ?? <FileText className="mx-auto size-4 text-muted-foreground" />}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{n.title || "Untitled"}</p>
                <p className="text-xs text-muted-foreground">Deleted {timeAgo(n.trashedAt!)}</p>
              </div>
              <form action={restoreNote.bind(null, n.id)}>
                <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm hover:bg-secondary"><RotateCcw className="size-3.5" /> Restore</button>
              </form>
              <ConfirmAction
                ariaLabel="Delete forever"
                className="grid size-8 place-items-center rounded-md text-destructive hover:bg-destructive/10"
                title="Delete forever?"
                description={`"${n.title || "Untitled"}" will be deleted permanently. This can't be undone.`}
                confirmLabel="Delete forever"
                action={deleteNoteForever.bind(null, n.id)}
              >
                <Trash2 className="size-4" />
              </ConfirmAction>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
