"use client";

import { Check, CloudOff, Loader2, MoreHorizontal, RotateCcw, SmilePlus, Star, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import type { SealedLiveQuery } from "@neon/realtime/client";
import { restoreNote, setFavorite, trashNote } from "@/lib/actions";
import { refreshNote } from "@/lib/live-actions";
import type { LiveNoteRow } from "@/lib/realtime";
import { EMOJIS } from "@/lib/emojis";
import { useAutosave } from "@/lib/use-autosave";
import { cn, timeAgo } from "@/lib/utils";
import { NoteEditor } from "./editor/editor";
import { Live } from "./realtime-gate";
import { ShareDialog } from "./share-dialog";
import { iconBtn, menuItem, Popover } from "./ui";

type NoteData = {
  id: string; title: string; icon: string | null; content: string; isFavorite: boolean;
  trashed: boolean; shareToken: string | null; shareExpiresAt: string | null; hasSharePassword: boolean; updatedAt: string;
};

type ViewProps = {
  note: NoteData;
  sealed: SealedLiveQuery<LiveNoteRow> | null;
  imagesEnabled: boolean;
};

/** Subscribes to this note via Neon Realtime so edits from your other tabs show up live. */
export function NoteView(props: ViewProps) {
  const { note } = props;
  const initial: LiveNoteRow = { id: note.id, title: note.title, icon: note.icon, content: note.content, trashed: note.trashed };
  return (
    <Live sealed={props.sealed} refresh={() => refreshNote(note.id)} initial={[initial]}>
      {(rows) => <NoteBody {...props} remote={rows[0]} />}
    </Live>
  );
}

function NoteBody({ note, imagesEnabled, remote }: ViewProps & { remote?: LiveNoteRow }) {
  const canEdit = !note.trashed;
  const { save, flush, isDirty, status, error } = useAutosave(note.id);
  const [title, setTitle] = useState(note.title);
  const [icon, setIcon] = useState(note.icon);
  const lastTitle = useRef(note.title);

  useEffect(() => {
    if (!remote || isDirty()) return;
    if (remote.title !== lastTitle.current) { lastTitle.current = remote.title; setTitle(remote.title); }
    setIcon((cur) => (remote.icon !== cur ? remote.icon : cur));
  }, [remote, isDirty]);
  const [fav, setFav] = useState(note.isFavorite);
  const [shareOpen, setShareOpen] = useState(false);
  const [, start] = useTransition();
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.title = `${title || "Untitled"} · Webnotes`;
  }, [title]);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "0";
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 flex h-12 items-center justify-between gap-3 border-b bg-background px-4">
        <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <span className="truncate">{icon} {title || "Untitled"}</span>
        </div>
        <div className="flex items-center gap-1">
          <SaveBadge status={status} error={error} onRetry={() => void flush()} readOnly={!canEdit} updatedAt={note.updatedAt} />
          {!note.trashed && (
            <>
              <button
                onClick={() => setShareOpen(true)}
                className="ml-1 flex h-8 items-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Share
              </button>
              <button
                aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                aria-pressed={fav}
                className={iconBtn}
                onClick={() => { setFav(!fav); start(() => setFavorite(note.id, !fav)); }}
              >
                <Star className={cn("size-4", fav && "fill-foreground text-foreground")} />
              </button>
            </>
          )}
          <Popover trigger={({ toggle }) => <button aria-label="More" className={iconBtn} onClick={toggle}><MoreHorizontal className="size-4" /></button>} className="w-48">
            {(close) => (
              <button
                className={cn(menuItem, "text-destructive")}
                onClick={() => { close(); start(() => trashNote(note.id)); }}
                disabled={note.trashed}
              >
                <Trash2 className="size-4" /> Move to trash
              </button>
            )}
          </Popover>
        </div>
      </header>

      {note.trashed && (
        <div className="flex items-center justify-between gap-3 border-b bg-secondary px-4 py-2 text-sm">
          <span>This note is in the trash.</span>
          <button onClick={() => start(() => restoreNote(note.id))} className="flex items-center gap-1.5 font-medium underline-offset-4 hover:underline">
            <RotateCcw className="size-3.5" /> Restore
          </button>
        </div>
      )}

      <main className="mx-auto max-w-3xl px-6 pt-14 pb-10 sm:px-10">
        <div className="mb-2">
          {canEdit ? (
            <Popover
              align="left"
              className="w-72 p-2"
              trigger={({ toggle }) => (
                <button
                  onClick={toggle}
                  aria-label="Change icon"
                  className={cn("grid h-14 min-w-14 place-items-center rounded-lg px-1 text-5xl transition hover:bg-secondary", !icon && "text-base text-muted-foreground")}
                >
                  {icon ?? <span className="flex items-center gap-1.5 px-2"><SmilePlus className="size-4" /> Add icon</span>}
                </button>
              )}
            >
              {(close) => (
                <div>
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJIS.map((e) => (
                      <button key={e} className="grid size-8 place-items-center rounded-md text-xl hover:bg-secondary" onClick={() => { setIcon(e); save({ icon: e }); close(); }}>{e}</button>
                    ))}
                  </div>
                  {icon && (
                    <button className={cn(menuItem, "mt-1 text-muted-foreground")} onClick={() => { setIcon(null); save({ icon: null }); close(); }}>Remove icon</button>
                  )}
                </div>
              )}
            </Popover>
          ) : (
            icon && <div className="grid h-14 place-items-center text-5xl w-fit px-1">{icon}</div>
          )}
        </div>

        <textarea
          ref={titleRef}
          rows={1}
          value={title}
          readOnly={!canEdit}
          maxLength={200}
          placeholder="Untitled"
          aria-label="Note title"
          onChange={(e) => { const v = e.target.value.replace(/\n/g, " "); lastTitle.current = v; setTitle(v); save({ title: v }); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); document.querySelector<HTMLElement>(".note-editor .tiptap")?.focus(); } }}
          className="note-title mb-4 block w-full resize-none overflow-hidden bg-transparent text-4xl leading-tight font-semibold tracking-tight outline-none placeholder:text-muted-foreground/40 sm:text-5xl"
        />

        <NoteEditor
          markdown={note.content}
          editable={canEdit}
          onChange={(content) => save({ content })}
          noteId={note.id}
          imagesEnabled={imagesEnabled && canEdit}
          remote={remote?.content}
          isDirty={isDirty}
        />
      </main>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        noteId={note.id}
        initialToken={note.shareToken}
        initialExpiresAt={note.shareExpiresAt}
        initialHasPassword={note.hasSharePassword}
      />
    </div>
  );
}

function SaveBadge({ status, error, onRetry, readOnly, updatedAt }: { status: string; error: string | null; onRetry: () => void; readOnly: boolean; updatedAt: string }) {
  const base = "flex items-center gap-1.5 px-2 text-xs text-muted-foreground";
  if (readOnly) return <span className={base}>Edited {timeAgo(updatedAt)}</span>;
  if (status === "saving") return <span className={base} role="status"><Loader2 className="size-3 animate-spin" /> Saving…</span>;
  if (status === "error")
    return (
      <span className={cn(base, "text-destructive")} role="alert" title={error ?? undefined}>
        <CloudOff className="size-3.5" /> Not saved
        <button onClick={onRetry} className="font-medium underline underline-offset-2 hover:no-underline">Retry</button>
      </span>
    );
  if (status === "saved") return <span className={base} role="status"><Check className="size-3.5" /> Saved</span>;
  return <span className={base}>Edited {timeAgo(updatedAt)}</span>;
}
