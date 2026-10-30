"use client";

import { Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { DeveloperLink } from "@/components/developer-link";
import { createNote } from "@/lib/actions";
import { NewNoteButton } from "./new-note-button";
import { cn } from "@/lib/utils";

export type SidebarNote = { id: string; title: string; icon: string | null; isFavorite: boolean };

/** Note lists. Data arrives already live (see AppShell); the drawer's open state lives in the shell. */
export function Sidebar({ mine, open, onClose }: { mine: SidebarNote[]; open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [q, setQ] = useState("");

  const needle = q.trim().toLowerCase();
  const match = (n: SidebarNote) => (n.title || "Untitled").toLowerCase().includes(needle);
  const filtered = useMemo(() => mine.filter(match), [mine, needle]); // eslint-disable-line react-hooks/exhaustive-deps
  const favorites = filtered.filter((n) => n.isFavorite);

  return (
    <>
      {open && <div className="fixed inset-x-0 top-[calc(3rem+env(safe-area-inset-top))] bottom-0 z-30 bg-black/50 md:hidden" onClick={onClose} />}

      <aside
        aria-label="Notes"
        className={cn(
          "fixed bottom-0 left-0 z-40 flex w-72 flex-col border-r bg-sidebar pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] transition-transform duration-200",
          "top-[calc(3rem+env(safe-area-inset-top))] md:static md:z-auto md:translate-x-0 md:p-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="space-y-2 p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              enterKeyHint="search"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="Search notes"
              aria-label="Search notes"
              className="h-9 w-full rounded-md border bg-background pr-2 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </div>
          <form action={createNote}>
            <NewNoteButton className="h-9 w-full rounded-md text-sm" />
          </form>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-2 pb-3">
          {favorites.length > 0 && <Section label="Favorites" notes={favorites} active={pathname} />}
          <Section label="Notes" notes={filtered} active={pathname} empty={q ? "No matches" : "No notes yet"} />
        </nav>

        <div className="flex items-center justify-between border-t px-3 py-2.5 text-xs text-muted-foreground">
          <span>Webnotes by <DeveloperLink /></span>
          <Link
            href="/notes/trash"
            aria-label="Trash"
            title="Trash"
            className={cn("grid size-8 place-items-center rounded-md transition-colors hover:bg-secondary hover:text-foreground", pathname === "/notes/trash" && "bg-secondary text-foreground")}
          >
            <Trash2 className="size-4" />
          </Link>
        </div>
      </aside>
    </>
  );
}

function Section({ label, notes, active, empty }: { label: string; notes: SidebarNote[]; active: string; empty?: string }) {
  return (
    <div>
      <h3 className="mb-1 px-2 text-xs text-muted-foreground">{label}</h3>
      {notes.length === 0 && empty && <p className="px-2 py-1 text-sm text-muted-foreground">{empty}</p>}
      <ul className="space-y-0.5">
        {notes.map((n) => {
          const isActive = active === `/notes/${n.id}`;
          return (
            <li key={n.id}>
              <Link
                href={`/notes/${n.id}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition hover:bg-secondary",
                  isActive && "bg-accent font-medium hover:bg-accent",
                )}
              >
                {n.icon && <span className="w-5 shrink-0 text-center">{n.icon}</span>}
                <span className="truncate">{n.title || "Untitled"}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
