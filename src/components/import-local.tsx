"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { importNotes } from "@/lib/actions";
import { GUEST_KEY, importableNotes, loadGuest, MAX_GUEST_CHARS } from "@/lib/guest-store";

const DISMISSED = "webnotes:import-dismissed";

/** After sign-up: offers to move notes written as a guest (kept in this browser) into the account. */
export function ImportLocal() {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [pending, start] = useTransition();

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISSED)) return;
    } catch {}
    const g = loadGuest();
    setCount(g ? importableNotes(g.notes).length : 0);
  }, []);

  if (!count) return null;

  const run = () =>
    start(async () => {
      const g = loadGuest();
      const items = g ? importableNotes(g.notes).map((n) => ({
        title: n.title.slice(0, 200), icon: n.icon, content: n.content.slice(0, MAX_GUEST_CHARS), isFavorite: n.isFavorite,
      })) : [];
      if (!items.length) return void setCount(0);
      const res = await importNotes(items);
      if (!res.ok) return void toast.error(res.error);
      try { localStorage.removeItem(GUEST_KEY); } catch {}
      setCount(0);
      toast.success(`Added ${res.count} ${res.count === 1 ? "note" : "notes"} to your account`);
      router.refresh();
    });

  const later = () => {
    try { sessionStorage.setItem(DISMISSED, "1"); } catch {}
    setCount(0);
  };

  return (
    <div role="region" aria-label="Import notes" className="flex flex-wrap items-center justify-between gap-3 border-b bg-secondary px-4 py-2.5 text-sm">
      <span>You have {count} {count === 1 ? "note" : "notes"} on this device. Add {count === 1 ? "it" : "them"} to your account?</span>
      <span className="flex gap-2">
        <button onClick={later} disabled={pending} className="h-8 rounded-md border bg-background px-3 font-medium transition-colors hover:bg-accent">Not now</button>
        <button onClick={run} disabled={pending} className="h-8 rounded-md bg-primary px-3 font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60">
          {pending ? "Adding…" : "Add notes"}
        </button>
      </span>
    </div>
  );
}
