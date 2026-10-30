"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/lib/account-actions";
import { Dialog } from "./ui";

const field = "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/30";

export function DeleteAccountDialog({ open, onClose, email }: { open: boolean; onClose: () => void; email: string }) {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const ready = typed.trim().toLowerCase() === email.toLowerCase();

  const close = () => { if (pending) return; setTyped(""); setError(null); onClose(); };

  return (
    <Dialog open={open} onClose={close} title="Delete your account" description="This can't be undone.">
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        <li>All your notes, favorites and trash are deleted.</li>
        <li>Uploaded images are deleted, and any shared links stop working.</li>
        <li>Your login ({email}) is removed. You can sign up again later as a new user.</li>
      </ul>

      <form
        className="mt-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          start(async () => {
            const res = await deleteAccount(typed); // redirects home on success
            if (res && !res.ok) setError(res.error);
          });
        }}
      >
        <div>
          <label htmlFor="del-confirm" className="mb-1 block text-sm font-medium">Type your email to confirm</label>
          <input id="del-confirm" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" autoCapitalize="none" autoCorrect="off" inputMode="email" placeholder={email} className={field} />
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={close} disabled={pending} className="h-9 rounded-md border px-3.5 text-sm font-medium transition-colors hover:bg-secondary">Cancel</button>
          <button disabled={!ready || pending} className="h-9 rounded-md bg-destructive px-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40">
            {pending ? "Deleting…" : "Delete account permanently"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
