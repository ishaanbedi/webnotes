"use client";

import { BookOpen, Menu, MoreHorizontal, RotateCcw, SmilePlus, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DeveloperLink } from "@/components/developer-link";
import { EMOJIS } from "@/lib/emojis";
import {
  defaultGuestNotes, GUEST_TOUR_KEY, type GuestNote, loadGuest, MAX_GUEST_CHARS, MAX_GUEST_NOTES, newGuestNote, saveGuest,
} from "@/lib/guest-store";
import { cn, timeAgo } from "@/lib/utils";
import { WELCOME_ICON, WELCOME_TITLE, welcomeContent } from "@/lib/welcome";
import { NoteEditor } from "./editor/editor";
import { ConfirmAction } from "./confirm-action";
import { type AccountFeature, NeedAccountDialog } from "./need-account";
import { Onboarding } from "./onboarding";
import { ThemeToggle } from "./theme-toggle";
import { iconBtn, menuItem, Popover } from "./ui";

const WELCOME_ID = "sample-welcome";

/**
 * The whole app, for people without an account. Notes live in this browser's localStorage.
 * Anything that needs our servers (sharing, images) asks the visitor to create an account.
 */
export function GuestWorkspace() {
  const [notes, setNotes] = useState<GuestNote[]>(() => defaultGuestNotes());
  const [active, setActive] = useState(notes[0].id);
  const [view, setView] = useState<"notes" | "trash">("notes");
  const [rev, setRev] = useState(0); // remounts the editor after the stored notes load
  const [ready, setReady] = useState(false);
  const [stored, setStored] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [tour, setTour] = useState(false);
  const [need, setNeed] = useState<AccountFeature | null>(null);
  const [q, setQ] = useState("");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const saved = loadGuest();
    if (saved) {
      setNotes(saved.notes);
      setActive(saved.active);
      setRev((r) => r + 1);
    }
    try { if (!localStorage.getItem(GUEST_TOUR_KEY)) setTour(true); } catch {}
    setReady(true);
  }, []);

  const latest = useRef({ notes, active });
  latest.current = { notes, active };
  const persist = useCallback(() => setStored(saveGuest(latest.current)), []);

  useEffect(() => {
    if (!ready) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(persist, 300);
    return () => clearTimeout(timer.current);
  }, [notes, active, ready, persist]);

  useEffect(() => {
    const flush = () => ready && persist();
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => { window.removeEventListener("pagehide", flush); document.removeEventListener("visibilitychange", flush); };
  }, [ready, persist]);

  const live = useMemo(() => notes.filter((n) => !n.trashedAt).sort((a, b) => b.updatedAt - a.updatedAt), [notes]);
  const trashed = useMemo(() => notes.filter((n) => n.trashedAt).sort((a, b) => b.trashedAt! - a.trashedAt!), [notes]);
  const note = notes.find((n) => n.id === active && !n.trashedAt) ?? live[0];

  const needle = q.trim().toLowerCase();
  const match = (n: GuestNote) => (n.title || "Untitled").toLowerCase().includes(needle);
  const shown = live.filter(match);
  const favorites = shown.filter((n) => n.isFavorite);

  const patch = useCallback((id: string, p: Partial<GuestNote>) =>
    setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, ...p, updatedAt: Date.now() } : n))), []);

  const create = useCallback(() => {
    if (notes.length >= MAX_GUEST_NOTES) return;
    const n = newGuestNote();
    setNotes((ns) => [n, ...ns]);
    setActive(n.id);
    setView("notes");
    setDrawer(false);
  }, [notes.length]);

  // Opens the Welcome note, restoring or recreating it if it was removed.
  const openWelcome = () => {
    const w = notes.find((n) => n.id === WELCOME_ID);
    if (w) {
      if (w.trashedAt) setNotes((ns) => ns.map((n) => (n.id === WELCOME_ID ? { ...n, trashedAt: null } : n)));
    } else {
      setNotes((ns) => [{ ...newGuestNote(), id: WELCOME_ID, title: WELCOME_TITLE, icon: WELCOME_ICON, content: welcomeContent(false) }, ...ns]);
    }
    setActive(WELCOME_ID);
    setView("notes");
    setRev((r) => r + 1);
  };

  const open = (id: string) => { setActive(id); setView("notes"); setDrawer(false); };
  const trash = (id: string) => setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, trashedAt: Date.now() } : n)));
  const restore = (id: string) => { setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, trashedAt: null } : n))); setActive(id); };
  const removeForever = (id: string) => setNotes((ns) => ns.filter((n) => n.id !== id));

  // Keep at least one editable note around.
  useEffect(() => {
    if (ready && !live.length && view === "notes") create();
  }, [ready, live.length, view, create]);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "0";
    el.style.height = `${el.scrollHeight}px`;
  }, [note?.title, note?.id]);

  useEffect(() => {
    if (note) document.title = `${note.title || "Untitled"} · Webnotes`;
  }, [note]);

  const finishTour = () => { try { localStorage.setItem(GUEST_TOUR_KEY, "1"); } catch {} };

  return (
    <div className="h-dvh">
      <header className="fixed inset-x-0 top-0 z-50 flex h-[calc(3rem+env(safe-area-inset-top))] items-center justify-between border-b bg-background px-3 pt-[env(safe-area-inset-top)] pr-[max(0.75rem,env(safe-area-inset-right))] pl-[max(0.75rem,env(safe-area-inset-left))]">
        <div className="flex items-center gap-1">
          <button onClick={() => setDrawer((d) => !d)} aria-label="Toggle notes list" aria-expanded={drawer} className={`${iconBtn} md:hidden`}><Menu className="size-4" /></button>
          <Link href="/" className="px-1.5 font-semibold tracking-tight">Webnotes</Link>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setTour(true)} className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <BookOpen className="size-4" /> <span className="hidden sm:inline">Guide</span>
          </button>
          <ThemeToggle />
          <Link href="/auth" className="flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90">Sign in</Link>
        </div>
      </header>

      <div className="flex h-full pt-[calc(3rem+env(safe-area-inset-top))]">
        {drawer && <div className="fixed inset-x-0 top-[calc(3rem+env(safe-area-inset-top))] bottom-0 z-30 bg-black/50 md:hidden" onClick={() => setDrawer(false)} />}
        <aside
          aria-label="Notes"
          className={cn(
            "fixed bottom-0 left-0 z-40 flex w-72 flex-col border-r bg-sidebar pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] transition-transform duration-200",
            "top-[calc(3rem+env(safe-area-inset-top))] md:static md:z-auto md:translate-x-0 md:p-0",
            drawer ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="space-y-2 p-3">
            <input
              value={q} onChange={(e) => setQ(e.target.value)} type="search" enterKeyHint="search" autoCapitalize="none" autoCorrect="off"
              placeholder="Search notes" aria-label="Search notes"
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            <button onClick={create} className="flex h-9 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:opacity-90">New note</button>
          </div>
          <nav className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-2 pb-3">
            {favorites.length > 0 && <List label="Favorites" notes={favorites} active={view === "notes" ? note?.id : undefined} onOpen={open} />}
            <List label="Notes" notes={shown} active={view === "notes" ? note?.id : undefined} onOpen={open} empty={q ? "No matches" : "No notes yet"} />
          </nav>
          <div className="space-y-2 border-t px-3 py-2.5 text-xs text-muted-foreground">
            <p>Saved on this device. <Link href="/auth" className="text-foreground underline-offset-4 hover:underline">Sign in</Link> to keep your notes anywhere.</p>
            <div className="flex items-center justify-between">
              <span>Webnotes by <DeveloperLink /></span>
              <button
                onClick={() => { setView("trash"); setDrawer(false); }} aria-label="Trash" title="Trash"
                className={cn("flex h-8 items-center gap-1.5 rounded-md px-2 transition-colors hover:bg-secondary hover:text-foreground", view === "trash" && "bg-secondary text-foreground")}
              >
                <Trash2 className="size-4" />{trashed.length > 0 && <span>{trashed.length}</span>}
              </button>
            </div>
          </div>
        </aside>

        <main id="main" className="min-w-0 flex-1 overflow-y-auto overscroll-contain">
          {view === "trash" ? (
            <div className="mx-auto max-w-2xl px-6 py-14">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Trash</h1>
                  <p className="text-sm text-muted-foreground">Restore notes or delete them permanently.</p>
                </div>
                {trashed.length > 0 && (
                  <ConfirmAction
                    className="rounded-md border px-3 py-1.5 text-sm text-destructive transition-colors hover:bg-secondary"
                    title="Empty trash?"
                    description={`${trashed.length} ${trashed.length === 1 ? "note" : "notes"} will be deleted permanently. This can't be undone.`}
                    confirmLabel="Empty trash"
                    action={() => setNotes((ns) => ns.filter((n) => !n.trashedAt))}
                  >
                    Empty trash
                  </ConfirmAction>
                )}
              </div>
              {trashed.length === 0 ? (
                <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">Trash is empty.</div>
              ) : (
                <ul className="divide-y rounded-lg border">
                  {trashed.map((n) => (
                    <li key={n.id} className="flex items-center gap-3 px-4 py-3">
                      {n.icon && <span className="w-6 text-center">{n.icon}</span>}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{n.title || "Untitled"}</p>
                        <p className="text-xs text-muted-foreground">Deleted {timeAgo(new Date(n.trashedAt!))}</p>
                      </div>
                      <button onClick={() => { restore(n.id); setView("notes"); }} className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm hover:bg-secondary"><RotateCcw className="size-3.5" /> Restore</button>
                      <ConfirmAction
                        ariaLabel="Delete forever"
                        className="grid size-8 place-items-center rounded-md text-destructive hover:bg-secondary"
                        title="Delete forever?"
                        description={`"${n.title || "Untitled"}" will be deleted permanently. This can't be undone.`}
                        confirmLabel="Delete forever"
                        action={() => removeForever(n.id)}
                      >
                        <Trash2 className="size-4" />
                      </ConfirmAction>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : note ? (
            <div className="min-h-full">
              <div className="sticky top-0 z-20 flex h-12 items-center justify-between gap-3 border-b bg-background px-4">
                <span className="truncate text-sm text-muted-foreground">{note.icon} {note.title || "Untitled"}</span>
                <div className="flex items-center gap-1">
                  <span className={cn("whitespace-nowrap px-2 text-xs text-muted-foreground", !stored && "text-destructive")}>{stored ? <>Saved<span className="hidden sm:inline"> on this device</span></> : "Not saved (storage blocked)"}</span>
                  <button onClick={() => setNeed("share")} className="ml-1 flex h-8 items-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-secondary">Share</button>
                  <button aria-label={note.isFavorite ? "Remove from favorites" : "Add to favorites"} aria-pressed={note.isFavorite} className={iconBtn} onClick={() => patch(note.id, { isFavorite: !note.isFavorite })}>
                    <Star className={cn("size-4", note.isFavorite && "fill-foreground text-foreground")} />
                  </button>
                  <Popover trigger={({ toggle }) => <button aria-label="More" className={iconBtn} onClick={toggle}><MoreHorizontal className="size-4" /></button>} className="w-48">
                    {(close) => (
                      <button className={cn(menuItem, "text-destructive")} onClick={() => { close(); trash(note.id); }}>
                        <Trash2 className="size-4" /> Move to trash
                      </button>
                    )}
                  </Popover>
                </div>
              </div>

              <div className="mx-auto max-w-3xl px-6 pt-14 pb-10 sm:px-10">
                <div className="mb-2">
                  <Popover
                    align="left" className="w-72 p-2"
                    trigger={({ toggle }) => (
                      <button onClick={toggle} aria-label="Change icon" className={cn("grid h-14 min-w-14 place-items-center rounded-lg px-1 text-5xl transition hover:bg-secondary", !note.icon && "text-base text-muted-foreground")}>
                        {note.icon ?? <span className="flex items-center gap-1.5 px-2"><SmilePlus className="size-4" /> Add icon</span>}
                      </button>
                    )}
                  >
                    {(close) => (
                      <div>
                        <div className="grid grid-cols-8 gap-1">
                          {EMOJIS.map((e) => (
                            <button key={e} className="grid size-8 place-items-center rounded-md text-xl hover:bg-secondary" onClick={() => { patch(note.id, { icon: e }); close(); }}>{e}</button>
                          ))}
                        </div>
                        {note.icon && <button className={cn(menuItem, "mt-1 text-muted-foreground")} onClick={() => { patch(note.id, { icon: null }); close(); }}>Remove icon</button>}
                      </div>
                    )}
                  </Popover>
                </div>
                <textarea
                  ref={titleRef} rows={1} value={note.title} maxLength={200} placeholder="Untitled" aria-label="Note title"
                  onChange={(e) => patch(note.id, { title: e.target.value.replace(/\n/g, " ") })}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); document.querySelector<HTMLElement>(".note-editor .tiptap")?.focus(); } }}
                  className="note-title mb-4 block w-full resize-none overflow-hidden bg-transparent text-4xl leading-tight font-semibold tracking-tight outline-none placeholder:text-muted-foreground/40 sm:text-5xl"
                />
                <NoteEditor
                  key={`${note.id}:${rev}`}
                  markdown={note.content}
                  editable
                  onChange={(md) => patch(note.id, { content: md.slice(0, MAX_GUEST_CHARS) })}
                  onNeedAccount={setNeed}
                />
              </div>
            </div>
          ) : null}
        </main>
      </div>

      <NeedAccountDialog feature={need} onClose={() => setNeed(null)} />
      {tour && <Onboarding guest imagesEnabled onFinish={finishTour} onOpenWelcome={openWelcome} onClose={() => setTour(false)} />}
    </div>
  );
}

function List({ label, notes, active, onOpen, empty }: { label: string; notes: GuestNote[]; active?: string; onOpen: (id: string) => void; empty?: string }) {
  return (
    <div>
      <h3 className="mb-1 px-2 text-xs text-muted-foreground">{label}</h3>
      {notes.length === 0 && empty && <p className="px-2 py-1 text-sm text-muted-foreground">{empty}</p>}
      <ul className="space-y-0.5">
        {notes.map((n) => (
          <li key={n.id}>
            <button
              onClick={() => onOpen(n.id)} aria-current={n.id === active ? "page" : undefined}
              className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-secondary", n.id === active && "bg-accent font-medium hover:bg-accent")}
            >
              {n.icon && <span className="w-5 shrink-0 text-center">{n.icon}</span>}
              <span className="truncate">{n.title || "Untitled"}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
