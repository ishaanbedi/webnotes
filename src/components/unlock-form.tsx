"use client";

import { useActionState } from "react";
import { unlockSharedNote } from "@/app/s/unlock";

export function UnlockForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(unlockSharedNote.bind(null, token), null);
  return (
    <form action={action} className="mx-auto max-w-sm py-24">
      <h1 className="text-2xl font-semibold tracking-tight">This note is protected</h1>
      <p className="mt-2 text-sm text-muted-foreground">Enter the password to read it.</p>
      <input
        name="password" type="password" required autoFocus autoComplete="current-password" aria-label="Password" placeholder="Password"
        className="mt-6 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
      />
      {state?.error && <p role="alert" className="mt-2 text-sm text-destructive">{state.error}</p>}
      <button disabled={pending} className="mt-3 h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60">
        Open note
      </button>
    </form>
  );
}
