"use client";

import { useState, useTransition } from "react";
import { Dialog } from "./ui";

/** A destructive button that asks first. `action` may be a server action or a plain callback. */
export function ConfirmAction({
  children, className, ariaLabel, title, description, confirmLabel, action,
}: {
  children: React.ReactNode;
  className: string;
  ariaLabel?: string;
  title: string;
  description: string;
  confirmLabel: string;
  action: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const close = () => !pending && setOpen(false);

  return (
    <>
      <button type="button" aria-label={ariaLabel} onClick={() => setOpen(true)} className={className}>{children}</button>
      <Dialog open={open} onClose={close} title={title} description={description}>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={close} disabled={pending} className="h-9 rounded-md border px-3.5 text-sm font-medium transition-colors hover:bg-secondary">Cancel</button>
          <button
            type="button" disabled={pending} autoFocus
            onClick={() => start(async () => { await action(); setOpen(false); })}
            className="h-9 rounded-md bg-destructive px-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </Dialog>
    </>
  );
}
