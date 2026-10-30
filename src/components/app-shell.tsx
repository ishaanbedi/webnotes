"use client";

import type { SealedLiveQuery } from "@neon/realtime/client";
import { BookOpen, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOutAction } from "@/app/auth/actions";
import { completeOnboarding, openWelcomeNote } from "@/lib/actions";
import { refreshMine } from "@/lib/live-actions";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { ImportLocal } from "./import-local";
import { Onboarding } from "./onboarding";
import { Live } from "./realtime-gate";
import { Sidebar, type SidebarNote } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { iconBtn, menuItem, Popover } from "./ui";

type Props = {
  mine: SidebarNote[];
  sealedMine: SealedLiveQuery<SidebarNote> | null;
  user: { name: string; email: string };
  onboarded: boolean;
  imagesEnabled: boolean;
  children: React.ReactNode;
};

/**
 * App chrome: a fixed navbar, the note list (a Neon Realtime live query, so it updates across
 * tabs) and the welcome tour for new users.
 */
export function AppShell({ mine, sealedMine, user, onboarded, imagesEnabled, children }: Props) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [tour, setTour] = useState(!onboarded);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => setDrawer(false), [pathname]);

  return (
    <div className="h-dvh">
      <header className="fixed inset-x-0 top-0 z-50 flex h-[calc(3rem+env(safe-area-inset-top))] items-center justify-between border-b bg-background px-3 pt-[env(safe-area-inset-top)] pr-[max(0.75rem,env(safe-area-inset-right))] pl-[max(0.75rem,env(safe-area-inset-left))]">
        <div className="flex items-center gap-1">
          <button onClick={() => setDrawer((d) => !d)} aria-label="Toggle notes list" aria-expanded={drawer} className={`${iconBtn} md:hidden`}>
            <Menu className="size-4" />
          </button>
          <Link href="/notes" className="px-1.5 font-semibold tracking-tight">Webnotes</Link>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setTour(true)} className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <BookOpen className="size-4" /> <span className="hidden sm:inline">Guide</span>
          </button>
          <ThemeToggle />
          <Popover
            className="w-64"
            trigger={({ toggle }) => (
              <button onClick={toggle} aria-label="Account" className="flex h-8 max-w-40 items-center rounded-md px-2.5 text-sm transition-colors hover:bg-secondary">
                <span className="truncate">{user.name || user.email}</span>
              </button>
            )}
          >
            {(close) => (
              <div>
                <div className="px-2.5 py-2">
                  <p className="truncate text-sm font-medium">{user.name || "Account"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="my-1 border-t" />
                <Link href="/notes/trash" onClick={close} className={menuItem}>Trash</Link>
                <button className={menuItem} onClick={() => { close(); setTour(true); }}>Take the tour again</button>
                <form action={signOutAction}>
                  <button className={menuItem}>Sign out</button>
                </form>
                <div className="my-1 border-t" />
                <button className={`${menuItem} text-destructive`} onClick={() => { close(); setDeleting(true); }}>Delete account</button>
              </div>
            )}
          </Popover>
        </div>
      </header>

      <div className="flex h-full pt-[calc(3rem+env(safe-area-inset-top))]">
        <Live sealed={sealedMine} refresh={refreshMine} initial={mine}>
          {(m) => <Sidebar mine={m as SidebarNote[]} open={drawer} onClose={() => setDrawer(false)} />}
        </Live>
        <main id="main" className="min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <ImportLocal />
          {children}
        </main>
      </div>

      <DeleteAccountDialog open={deleting} onClose={() => setDeleting(false)} email={user.email} />
      {tour && <Onboarding imagesEnabled={imagesEnabled} onFinish={completeOnboarding} onOpenWelcome={openWelcomeNote} onClose={() => setTour(false)} />}
    </div>
  );
}
