"use client";

import Link from "next/link";
import { Dialog } from "./ui";

export type AccountFeature = "share" | "images";

const COPY: Record<AccountFeature, { title: string; body: string }> = {
  share: {
    title: "Sharing needs an account",
    body: "A shared note has to live on our servers so other people can open it. Create a free account and the notes on this device can come with you.",
  },
  images: {
    title: "Images need an account",
    body: "Pictures are stored on our servers. Create a free account to add them. Your notes on this device stay as they are.",
  },
};

/** Shown when a guest reaches for something that needs the backend. */
export function NeedAccountDialog({ feature, onClose }: { feature: AccountFeature | null; onClose: () => void }) {
  const c = feature ? COPY[feature] : COPY.share;
  return (
    <Dialog open={!!feature} onClose={onClose} title={c.title} description={c.body}>
      <div className="flex flex-wrap justify-end gap-2">
        <button onClick={onClose} className="h-9 rounded-md border px-3.5 text-sm font-medium transition-colors hover:bg-secondary">Not now</button>
        <Link href="/auth" className="inline-flex h-9 items-center rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90">Continue with email</Link>
      </div>
    </Dialog>
  );
}
