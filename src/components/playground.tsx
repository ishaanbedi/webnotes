"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { defaultGuestNotes, type GuestNote, loadGuest, MAX_GUEST_CHARS, MAX_GUEST_NOTES, newGuestNote, saveGuest } from "@/lib/guest-store";
import { cn } from "@/lib/utils";
import { NoteEditor } from "./editor/editor";

/**
 * Interactive preview on the homepage. It uses the same on-device store as the app itself, so
 * anything written here is already there when you open Webnotes. Nothing is sent to a server.
 */
export function Playground() {
  const [notes, setNotes] = useState<GuestNote[]>(() => defaultGuestNotes());
  const [active, setActive] = useState(notes[0].id);
  const [rev, setRev] = useState(0); // remounts the editor once stored notes load
  const [ready, setReady] = useState(false);
  const [stored, setStored] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const saved = loadGuest();
    if (saved) {
      setNotes(saved.notes);
      setActive(saved.active);
      setRev((r) => r + 1);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStored(saveGuest({ notes, active })), 300);
    return () => clearTimeout(timer.current);
  }, [notes, active, ready]);

  const live = notes.filter((n) => !n.trashedAt).sort((a, b) => b.updatedAt - a.updatedAt);
  const note = live.find((n) => n.id === active) ?? live[0];
  const patch = useCallback((id: string, p: Partial<GuestNote>) => setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, ...p, updatedAt: Date.now() } : n))), []);

  const create = () => {
    if (notes.length >= MAX_GUEST_NOTES) return;
    const n = newGuestNote();
    setNotes((ns) => [n, ...ns]);
    setActive(n.id);
  };

  // Deleting only moves a note to the app's Trash, so nothing is lost by accident.
  const remove = () => {
    if (live.length <= 1) return;
    patch(note.id, { trashedAt: Date.now() });
    setActive(live.find((n) => n.id !== note.id)!.id);
  };

  if (!note) return null;

  return (
    <div>
      <div className="overflow-hidden rounded-lg border bg-background">
        <div className="flex min-h-[28rem]">
          <aside className="hidden w-56 shrink-0 flex-col border-r bg-sidebar p-3 md:flex">
            <p className="px-2 pb-3 text-sm font-semibold tracking-tight">Webnotes</p>
            <button onClick={create} className="mb-3 flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90">New note</button>
            <ul className="space-y-0.5 overflow-y-auto text-sm">
              {live.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => setActive(n.id)} aria-current={n.id === note.id ? "true" : undefined}
                    className={cn("w-full truncate rounded-md px-2 py-1.5 text-left transition-colors", n.id === note.id ? "bg-accent font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
                  >
                    {n.title || "Untitled"}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-11 items-center justify-between gap-3 border-b px-4 text-sm text-muted-foreground sm:px-5">
              <div className="flex items-center gap-2 md:hidden">
                <select aria-label="Choose a note" value={note.id} onChange={(e) => setActive(e.target.value)} className="h-8 max-w-40 rounded-md border bg-background px-2 text-sm text-foreground">
                  {live.map((n) => <option key={n.id} value={n.id}>{n.title || "Untitled"}</option>)}
                </select>
                <button onClick={create} className="h-8 rounded-md border px-2.5 text-foreground">New</button>
              </div>
              <span className="hidden truncate md:block">{note.title || "Untitled"}</span>
              <div className="flex items-center gap-3">
                <span>{stored ? "Saved on this device" : "Not saved (storage blocked)"}</span>
                {live.length > 1 && <button onClick={remove} className="transition-colors hover:text-foreground">Delete</button>}
              </div>
            </div>

            <div className="flex-1 px-5 py-8 sm:px-10">
              <input
                value={note.title} onChange={(e) => patch(note.id, { title: e.target.value.slice(0, 120) })}
                placeholder="Untitled" aria-label="Note title"
                className="note-title mb-4 block w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/40"
              />
              <NoteEditor key={`${note.id}:${rev}`} markdown={note.content} editable compact onChange={(md) => patch(note.id, { content: md.slice(0, MAX_GUEST_CHARS) })} />
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>Try it. These notes stay in this browser.</span>
        <Link href="/notes" className="transition-colors hover:text-foreground">Open all your notes</Link>
      </p>
    </div>
  );
}
