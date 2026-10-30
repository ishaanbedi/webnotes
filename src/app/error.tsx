"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6">
      <div className="max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your notes are safe. This can happen if the note was changed in another tab, or your session ended.</p>
        <div className="mt-5 flex items-center gap-3">
          <button onClick={reset} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90">Try again</button>
          <Link href="/notes" className="text-sm font-medium hover:underline">Back to notes</Link>
        </div>
      </div>
    </main>
  );
}
